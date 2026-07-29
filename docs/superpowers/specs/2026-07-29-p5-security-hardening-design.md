# P5 Security Hardening Design

- Date: 2026-07-29
- Status: approved (design dialogue)
- Scope choice: **B** (P5 launch hardening) with bot defense path **C** (app-only now; external upgrade later)
- Approach: **1 — minimal app-level hardening**

## Goal

Ship production-ready security hardening for the AIC Seoul soft launch without new SaaS (Turnstile, Redis, BotID). Document a clear upgrade path for gaps.

## In scope

| Area | Behavior |
|---|---|
| HTTP security headers | Via `next.config` `headers()` for all routes |
| Rate limiting | In-memory sliding window on Contact submit, login, signup, admin upload |
| Upload validation | Shared mime/size assert used by local and Cloudinary uploaders |
| Seed / ops | Stronger production seed password rules + checklist / `.env.example` notes |
| Docs | P5 smoke security items + explicit “next stage gaps” backlog |

## Out of scope (this change)

- Cloudflare Turnstile / reCAPTCHA / Vercel BotID
- Redis or other distributed rate limits
- Custom-domain HSTS (defer until DNS is fixed)
- CSP nonce / `strict-dynamic` (no Next script pipeline refactor)
- Deep magic-byte malware scanning beyond sharp + Cloudinary `resource_type: image`
- Vercel / Supabase dashboard-only configuration (tracked as next-stage item)

## Architecture

```
src/lib/security/
  rate-limit.ts      # in-memory Map + TTL; checkRateLimit(key, limit, windowMs)
  upload.ts          # assertImageUpload(file) — mime set + 8MB
  headers.ts         # optional shared header name/value constants (or inline in next.config)
  client-ip.ts       # x-forwarded-for first hop, else "unknown"

Wiring:
  submitContactAction → rate limit + existing honeypot
  loginAction / signupAction → rate limit
  POST /api/admin/upload → rate limit + existing auth/perm
  localDiskUploader + cloudinaryUploader → assertImageUpload first
  next.config.ts → security headers including modest CSP
```

Auth gate in `src/proxy.ts` remains the source of truth for `/admin` session redirects.

## Rate limits

| Surface | Limit | Key | On exceed |
|---|---|---|---|
| Contact submit | 5 / 10 min | `contact:{ip}` | Soft error message (Korean) |
| Login | 10 / 15 min | `login:{ip}:{email}` | Generic failure message (no account oracle) |
| Signup | 5 / 1 hour | `signup:{ip}` | Soft error message |
| Admin upload | 30 / 10 min | `upload:{ip}:{userId}` | HTTP 429 JSON |

Notes:

- Process memory only. Valid under Fluid Compute instance reuse; weaker across multiple instances — accepted for launch.
- Do not log raw emails in rate-limit diagnostics; omit or hash if logging keys.

## Security headers

Apply to all matched routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Content-Security-Policy (enforce, modest):
  - `default-src 'self'`
  - `img-src 'self' data: blob: https://res.cloudinary.com`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` (Next compatibility)
  - `style-src 'self' 'unsafe-inline'`
  - `font-src 'self' data:`
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co`
  - `frame-ancestors 'none'`
  - `base-uri 'self'`
  - `form-action 'self'`
- HSTS: omit until custom domain is confirmed

## Upload validation

Shared `assertImageUpload(file)`:

- Allowed MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Max size: 8MB
- Call before local sharp pipeline and before Cloudinary upload stream
- Local path continues to re-encode to WebP via sharp (malformed images fail there)

## Seed and production ops

- `prisma/seed-production.ts`: require `SUPERADMIN_SEED_PASSWORD` (already), raise minimum to **12** characters, reject known-weak values (`ChangeMeNow!1`, `password`, `12345678`, etc.).
- Runtime: if `NODE_ENV === "production"` and seed password env is present and equals a known-weak value, `console.warn` only (do not crash boot — seed env may be absent at runtime).
- `.env.example` + P5 docs: strong seed password, change password after seed, remove seed password from long-lived env when possible.
- Keep existing P5 smoke items: `/admin` unauthenticated redirect, pending user blocked, seed password not left as default in production.

## Error handling

- Rate limit: user-facing generic Korean message; no stack traces to client.
- Upload validation: existing 400 JSON with message.
- Honeypot: keep silent success (`ok: true`) when `website` is filled.

## Testing / verification

- Unit: rate-limit window allow/deny; `assertImageUpload` reject oversized / wrong mime.
- Manual: honeypot, admin redirect, `curl -I` headers, upload happy path + oversize.
- `pnpm build` must pass.

## Next-stage gaps (after this ships)

Tell the operator explicitly after implementation:

1. Turnstile / BotID when spam appears
2. Distributed rate limit (e.g. Upstash Redis)
3. Custom-domain HSTS
4. CSP without `'unsafe-inline'` / `'unsafe-eval'` (nonce or strict-dynamic)
5. Stronger pre-Cloudinary magic-byte checks
6. Vercel / Supabase dashboard security review (platform track C)

## Approval

- §1 scope/architecture: approved
- §2 rate limit + headers: approved
- §3 seed, verification, backlog: approved
- Full design: approved (chat, 2026-07-29)
