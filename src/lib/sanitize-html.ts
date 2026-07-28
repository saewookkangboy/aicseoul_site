import DOMPurify from "isomorphic-dompurify";

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

const ALLOWED_ATTR = ["href", "target", "rel", "class"];

/** TipTap / HTML 본문 살균 */
export function sanitizeInsightHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

/** HTML로 보이는지 (기존 마크다운 시드와 구분) */
export function looksLikeHtml(value: string): boolean {
  const trimmed = value.trim();
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}
