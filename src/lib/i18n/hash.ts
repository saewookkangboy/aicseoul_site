import { createHash } from "node:crypto";

/** Normalize whitespace then SHA-256 for TranslationCache keys. */
export function sourceHash(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}
