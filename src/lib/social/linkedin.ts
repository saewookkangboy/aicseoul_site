/** Official AI Collective Seoul LinkedIn company page. */
export const CHAPTER_LINKEDIN_URL =
  "https://www.linkedin.com/company/117154975";

const PLACEHOLDER_LINKEDIN = new Set([
  "",
  "https://www.linkedin.com",
  "https://www.linkedin.com/",
  "https://linkedin.com",
  "https://linkedin.com/",
]);

/**
 * Resolve chapter LinkedIn URL from SiteSetting.
 * Empty or seed placeholders fall back to the official chapter page
 * so Footer / CTA never disappear because of missing CMS config.
 */
export function resolveChapterLinkedinUrl(raw?: string | null): string {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed || PLACEHOLDER_LINKEDIN.has(trimmed)) {
    return CHAPTER_LINKEDIN_URL;
  }
  return trimmed;
}
