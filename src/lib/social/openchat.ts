/** Default Kakao Open Chat URL for AIC Seoul chapter. */
export const CHAPTER_OPENCHAT_URL = "https://open.kakao.com/o/gR2bJLdi";

/**
 * Resolve chapter open-chat URL from SiteSetting.
 * Empty / missing → default chapter URL.
 */
export function resolveChapterOpenchatUrl(raw?: string | null): string {
  const v = raw?.trim();
  if (!v) return CHAPTER_OPENCHAT_URL;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return CHAPTER_OPENCHAT_URL;
    }
    return v;
  } catch {
    return CHAPTER_OPENCHAT_URL;
  }
}
