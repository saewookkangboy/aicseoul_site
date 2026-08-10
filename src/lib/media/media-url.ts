/**
 * Allowed media URL shapes for CMS persistence (next/image remotePatterns + local).
 */
export function isAllowedMediaUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return false;

  if (url.startsWith("/uploads/") || url.startsWith("/placeholders/")) {
    if (url.includes("..") || url.includes("//") || url.includes("\\")) {
      return false;
    }
    return true;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

/** Safe Cloudinary/local folder segment (no path traversal). */
export function sanitizeUploadFolder(folder: string | undefined | null): string {
  const cleaned = String(folder ?? "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
  return cleaned || "general";
}
