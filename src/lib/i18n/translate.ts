import { prisma } from "@/lib/db";
import { sourceLocale, type Locale } from "./config";
import { sourceHash } from "./hash";

const TIMEOUT_MS = 8_000;
const SOURCE_TEXT_MAX = 4_000;
/** Cap concurrent Gemini+DB translation work to protect Supabase session pool. */
const TRANSLATE_CONCURRENCY = 2;

type TranslateOptions = {
  html?: boolean;
  /** Request-scoped memo map to dedupe identical strings. */
  memo?: Map<string, Promise<string>>;
};

let active = 0;
const waitQueue: Array<() => void> = [];

async function withTranslateSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= TRANSLATE_CONCURRENCY) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }
  active += 1;
  try {
    return await fn();
  } finally {
    active -= 1;
    waitQueue.shift()?.();
  }
}

function getModel() {
  return process.env.GEMINI_TRANSLATE_MODEL?.trim() || "gemini-2.0-flash";
}

function truncateSource(text: string) {
  if (text.length <= SOURCE_TEXT_MAX) return text;
  return `${text.slice(0, SOURCE_TEXT_MAX)}…`;
}

async function callGemini(
  text: string,
  targetLang: Locale,
  html: boolean,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = getModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const targetName = targetLang === "en" ? "English" : "Korean";
  const htmlHint = html
    ? " Preserve all HTML tags and attributes exactly; only translate human-readable text nodes."
    : " Return plain text only.";

  const prompt = [
    `Translate the following text from Korean to ${targetName}.`,
    "Output only the translation — no quotes, labels, or explanations.",
    htmlHint,
    "",
    text,
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(
        "[i18n] Gemini HTTP",
        res.status,
        await res.text().catch(() => ""),
      );
      return null;
    }
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const out = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("")
      .trim();
    return out || null;
  } catch (err) {
    console.error("[i18n] Gemini error", err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Translate `text` into `targetLang` with DB cache. Falls back to source on any failure.
 * Server-only — never import from client components.
 */
export async function translateCached(
  text: string,
  targetLang: Locale,
  opts: TranslateOptions = {},
): Promise<string> {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) return text ?? "";
  if (targetLang === "ko" || targetLang === sourceLocale) return text;

  const hash = sourceHash(trimmed);
  const memoKey = `${hash}:${targetLang}:${opts.html ? "html" : "text"}`;
  if (opts.memo?.has(memoKey)) {
    return opts.memo.get(memoKey)!;
  }

  const run = withTranslateSlot(async () => {
    try {
      const cached = await prisma.translationCache.findUnique({
        where: {
          sourceHash_targetLang: { sourceHash: hash, targetLang },
        },
      });
      if (cached?.translatedText) return cached.translatedText;
    } catch (err) {
      console.error("[i18n] cache read failed", err);
    }

    const translated = await callGemini(trimmed, targetLang, Boolean(opts.html));
    if (!translated) return text;

    try {
      await prisma.translationCache.upsert({
        where: {
          sourceHash_targetLang: { sourceHash: hash, targetLang },
        },
        create: {
          sourceHash: hash,
          sourceLang: sourceLocale,
          targetLang,
          sourceText: truncateSource(trimmed),
          translatedText: translated,
          provider: "gemini",
        },
        update: {
          translatedText: translated,
          sourceText: truncateSource(trimmed),
          provider: "gemini",
        },
      });
    } catch (err) {
      console.error("[i18n] cache write failed", err);
    }

    return translated;
  });

  opts.memo?.set(memoKey, run);
  return run;
}

export async function translateMany(
  texts: string[],
  targetLang: Locale,
  opts: TranslateOptions = {},
): Promise<string[]> {
  const memo = opts.memo ?? new Map<string, Promise<string>>();
  return Promise.all(
    texts.map((t) => translateCached(t, targetLang, { ...opts, memo })),
  );
}
