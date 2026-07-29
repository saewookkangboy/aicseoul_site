import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "hr",
  "code",
  "pre",
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ["href", "target", "rel", "class"],
  "*": ["class"],
};

/** TipTap / HTML 본문 살균 — jsdom 없이 Node에서 동작 (서버리스 안전) */
export function sanitizeInsightHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTR,
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

/** HTML로 보이는지 (기존 마크다운 시드와 구분) */
export function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}
