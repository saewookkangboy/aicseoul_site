// Read NODE_ENV directly (no `@/` import): this module is loaded transitively by
// next.config.ts, where the tsconfig path alias may not resolve.
const isProd = process.env.NODE_ENV === "production";

// `unsafe-eval` is required by Next's dev server (react-refresh / eval source maps),
// and these headers apply in dev too (next.config.ts `headers()`), so keep it in dev
// but drop it in production for real XSS hardening.
// `unsafe-inline` stays for now — removing it requires per-request nonce plumbing
// (+ runtime verification), which is the next step in the CSP tightening.
const scriptSrc = [
  "script-src",
  "'self'",
  "'unsafe-inline'",
  ...(isProd ? [] : ["'unsafe-eval'"]),
  "https://va.vercel-scripts.com",
].join(" ");

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];
