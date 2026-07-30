/**
 * Options for `getToken` in Edge middleware.
 *
 * Auth.js v5 sets `__Secure-authjs.session-token` on HTTPS (Vercel).
 * Omitting `secureCookie` makes getToken look for `authjs.session-token`,
 * so the JWT is never found → /admin ↔ /admin/login redirect loop.
 */
export function authJwtGetTokenOptions(input: {
  secret: string | undefined;
  /** Prefer request URL protocol; fall back to Vercel/HTTPS env. */
  isHttps: boolean;
}) {
  return {
    secret: input.secret,
    secureCookie: input.isHttps,
  } as const;
}

export function requestIsHttps(req: {
  nextUrl: { protocol: string };
}): boolean {
  if (req.nextUrl.protocol === "https:") return true;
  // Vercel always serves HTTPS; protocol can be wrong in some Edge edge-cases.
  if (process.env.VERCEL === "1") return true;
  return false;
}
