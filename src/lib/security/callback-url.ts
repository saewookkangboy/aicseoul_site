/**
 * Allow only same-origin relative Admin paths as post-login redirects.
 * Rejects protocol-relative, absolute, and non-/admin targets.
 */
export function safeAdminCallbackUrl(
  raw: FormDataEntryValue | string | null | undefined,
  fallback = "/admin",
): string {
  if (typeof raw !== "string") return fallback;
  const value = raw.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (!value.startsWith("/admin")) return fallback;
  return value;
}
