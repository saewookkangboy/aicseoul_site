# P5 Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soft-launch security hardening — HTTP headers, in-memory rate limits, shared image upload validation, stronger production seed password rules, and documented next-stage gaps.

**Architecture:** Add `src/lib/security/` helpers (rate limit, client IP, upload assert, header constants, weak-seed warn). Wire into Contact/auth actions and upload API. Apply headers via `next.config.ts`. No new SaaS.

**Tech Stack:** Next.js 16 (`next.config` headers), NextAuth credentials actions, Prisma seed scripts, Node built-in `node:test` + `tsx` (no Vitest yet).

**Spec:** `docs/superpowers/specs/2026-07-29-p5-security-hardening-design.md`

## Global Constraints

- No Turnstile / BotID / Redis in this plan (path C — upgrade later).
- Rate limits are process-memory only; multi-instance dilution is accepted.
- CSP stays modest: keep `'unsafe-inline'` / `'unsafe-eval'` for Next compatibility.
- Omit HSTS until custom domain is confirmed.
- User-facing rate-limit messages in Korean; do not reveal whether an account exists.
- Upload MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`; max **8MB**.
- Production seed password: min **12** chars; reject known-weak list.
- Prefer feature branch + PR for shipping (`finishing-a-development-branch`); do not treat WIP on an unrelated long-lived branch as done.
- Exact rate limits from spec: Contact 5/10m, Login 10/15m, Signup 5/1h, Upload 30/10m.

## File map

| File | Responsibility |
|---|---|
| `src/lib/security/rate-limit.ts` | In-memory sliding window `checkRateLimit` |
| `src/lib/security/client-ip.ts` | Resolve client IP from request headers |
| `src/lib/security/upload.ts` | `assertImageUpload(file)` |
| `src/lib/security/headers.ts` | Shared security header key/value list + CSP string |
| `src/lib/security/weak-seed.ts` | Weak password detection + optional boot warn |
| `src/lib/security/rate-limit.test.ts` | Unit tests for rate limit |
| `src/lib/security/upload.test.ts` | Unit tests for upload assert |
| `next.config.ts` | Attach security headers to all routes |
| `src/lib/actions/contact.ts` | Rate limit before honeypot/DB |
| `src/lib/actions/auth.ts` | Rate limit login + signup |
| `src/app/api/admin/upload/route.ts` | Rate limit after auth |
| `src/lib/media/local.ts` | Call `assertImageUpload` (replace duplicated checks) |
| `src/lib/media/cloudinary.ts` | Call `assertImageUpload` before upload |
| `prisma/seed-production.ts` | Stronger password rules |
| `src/lib/security/boot-warn.ts` or call from `src/lib/db.ts` / small import in `src/app/layout.tsx` server | Production weak-seed `console.warn` once |
| `.env.example` | Security comments |
| `docs/gates/P5-plan.md` | Expand smoke security checklist |
| `package.json` | Add `"test": "tsx --test src/lib/security/*.test.ts"` |

---

### Task 1: Rate limit + client IP (TDD)

**Files:**
- Create: `src/lib/security/rate-limit.ts`
- Create: `src/lib/security/client-ip.ts`
- Create: `src/lib/security/rate-limit.test.ts`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Produces:
  - `checkRateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfterSec: number }`
  - `resetRateLimitStoreForTests(): void` (test-only clear)
  - `getClientIpFromHeaders(h: Headers | { get(name: string): string | null }): string`

- [ ] **Step 1: Add test script**

In `package.json` scripts:

```json
"test": "tsx --test src/lib/security/*.test.ts"
```

- [ ] **Step 2: Write failing rate-limit tests**

Create `src/lib/security/rate-limit.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  checkRateLimit,
  resetRateLimitStoreForTests,
} from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it("allows up to limit within window", () => {
    for (let i = 0; i < 3; i++) {
      assert.equal(checkRateLimit("t:a", 3, 60_000).ok, true);
    }
    assert.equal(checkRateLimit("t:a", 3, 60_000).ok, false);
  });

  it("isolates keys", () => {
    assert.equal(checkRateLimit("t:a", 1, 60_000).ok, true);
    assert.equal(checkRateLimit("t:b", 1, 60_000).ok, true);
    assert.equal(checkRateLimit("t:a", 1, 60_000).ok, false);
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

Run: `pnpm test`

Expected: FAIL (module not found / export missing).

- [ ] **Step 4: Implement rate-limit + client-ip**

`src/lib/security/rate-limit.ts`:

```ts
type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export function resetRateLimitStoreForTests() {
  store.clear();
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    store.set(key, bucket);
    return { ok: false, retryAfterSec };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { ok: true };
}
```

`src/lib/security/client-ip.ts`:

```ts
export function getClientIpFromHeaders(
  h: { get(name: string): string | null },
): string {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
```

- [ ] **Step 5: Run tests — expect PASS**

Run: `pnpm test`

Expected: PASS for rate-limit tests.

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/security/rate-limit.ts src/lib/security/client-ip.ts src/lib/security/rate-limit.test.ts
git commit -m "$(cat <<'EOF'
feat: add in-memory rate limit helper for security hardening

EOF
)"
```

---

### Task 2: Shared upload assert (TDD)

**Files:**
- Create: `src/lib/security/upload.ts`
- Create: `src/lib/security/upload.test.ts`
- Modify: `src/lib/media/local.ts`
- Modify: `src/lib/media/cloudinary.ts`

**Interfaces:**
- Consumes: none from Task 1
- Produces: `assertImageUpload(file: { type: string; size: number }): void` (throws `Error` with Korean message)

- [ ] **Step 1: Write failing upload tests**

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertImageUpload } from "./upload";

describe("assertImageUpload", () => {
  it("accepts jpeg under 8MB", () => {
    assert.doesNotThrow(() =>
      assertImageUpload({ type: "image/jpeg", size: 1024 }),
    );
  });

  it("rejects wrong mime", () => {
    assert.throws(
      () => assertImageUpload({ type: "application/pdf", size: 100 }),
      /이미지/,
    );
  });

  it("rejects oversize", () => {
    assert.throws(
      () => assertImageUpload({ type: "image/png", size: 9 * 1024 * 1024 }),
      /8MB/,
    );
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm test`

Expected: FAIL on missing `./upload`.

- [ ] **Step 3: Implement `assertImageUpload`**

```ts
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function assertImageUpload(file: { type: string; size: number }) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("이미지만 업로드할 수 있습니다.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("파일 크기는 8MB 이하여야 합니다.");
  }
}
```

- [ ] **Step 4: Wire local + cloudinary**

In `src/lib/media/local.ts`: remove local `ALLOWED` / `MAX_BYTES` checks; at start of `saveLocalUpload`:

```ts
import { assertImageUpload } from "@/lib/security/upload";
// ...
assertImageUpload(file);
```

In `src/lib/media/cloudinary.ts` `upload` method, immediately after `configured()` check / before buffer read:

```ts
import { assertImageUpload } from "@/lib/security/upload";
assertImageUpload(file);
```

- [ ] **Step 5: Run tests — PASS**

Run: `pnpm test`

Expected: all security unit tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/security/upload.ts src/lib/security/upload.test.ts src/lib/media/local.ts src/lib/media/cloudinary.ts
git commit -m "$(cat <<'EOF'
feat: share image upload mime/size validation across uploaders

EOF
)"
```

---

### Task 3: Security headers via next.config

**Files:**
- Create: `src/lib/security/headers.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `export const SECURITY_HEADERS: { key: string; value: string }[]`
- Consumes: none

- [ ] **Step 1: Create header constants**

`src/lib/security/headers.ts`:

```ts
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
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
```

(Note: Vercel Analytics script/connect hosts included so CSP does not break `@vercel/analytics`.)

- [ ] **Step 2: Wire `next.config.ts`**

```ts
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { SECURITY_HEADERS } from "./src/lib/security/headers";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify headers (dev or build)**

Run: `pnpm build` (or start `pnpm dev` and)

```bash
curl -sI http://localhost:3000/ | grep -iE 'x-frame|content-security|x-content-type|referrer-policy|permissions-policy'
```

Expected: all five header families present.

- [ ] **Step 4: Commit**

```bash
git add src/lib/security/headers.ts next.config.ts
git commit -m "$(cat <<'EOF'
feat: add security HTTP headers including modest CSP

EOF
)"
```

---

### Task 4: Wire rate limits into Contact, auth, upload

**Files:**
- Modify: `src/lib/actions/contact.ts`
- Modify: `src/lib/actions/auth.ts`
- Modify: `src/app/api/admin/upload/route.ts`

**Interfaces:**
- Consumes: `checkRateLimit`, `getClientIpFromHeaders`
- Produces: rate-limited server actions / upload route

Constants (inline in each file or a tiny `src/lib/security/limits.ts` if preferred — either is fine; prefer one shared constants file to avoid drift):

```ts
// src/lib/security/limits.ts
export const RATE = {
  contact: { limit: 5, windowMs: 10 * 60_000 },
  login: { limit: 10, windowMs: 15 * 60_000 },
  signup: { limit: 5, windowMs: 60 * 60_000 },
  upload: { limit: 30, windowMs: 10 * 60_000 },
} as const;

export const RATE_LIMIT_MESSAGE = "잠시 후 다시 시도해 주세요.";
```

- [ ] **Step 1: Add `limits.ts`**

Create file with constants above.

- [ ] **Step 2: Contact action**

At top of `submitContactAction`, before honeypot:

```ts
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";

const h = await headers();
const ip = getClientIpFromHeaders(h);
const limited = checkRateLimit(
  `contact:${ip}`,
  RATE.contact.limit,
  RATE.contact.windowMs,
);
if (!limited.ok) {
  return { error: RATE_LIMIT_MESSAGE };
}
```

Keep existing honeypot silent-success behavior after this check.

- [ ] **Step 3: Auth login + signup**

In `signupAction` after parse success (or before DB work), and in `loginAction` after parse success:

```ts
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";

const h = await headers();
const ip = getClientIpFromHeaders(h);
```

Signup:

```ts
const limited = checkRateLimit(
  `signup:${ip}`,
  RATE.signup.limit,
  RATE.signup.windowMs,
);
if (!limited.ok) return { error: RATE_LIMIT_MESSAGE };
```

Login (use lowercased email in key; do not log the key with raw email in production logs):

```ts
const email = parsed.data.email.toLowerCase();
const limited = checkRateLimit(
  `login:${ip}:${email}`,
  RATE.login.limit,
  RATE.login.windowMs,
);
if (!limited.ok) return { error: RATE_LIMIT_MESSAGE };
```

Then proceed with existing `signIn` flow. Keep generic AuthError messages.

- [ ] **Step 4: Upload route**

After session auth succeeds and before `formData` processing completes upload:

```ts
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE } from "@/lib/security/limits";

const ip = getClientIpFromHeaders(req.headers);
const limited = checkRateLimit(
  `upload:${ip}:${session.user.id}`,
  RATE.upload.limit,
  RATE.upload.windowMs,
);
if (!limited.ok) {
  return NextResponse.json(
    { error: "잠시 후 다시 시도해 주세요." },
    {
      status: 429,
      headers: { "Retry-After": String(limited.retryAfterSec) },
    },
  );
}
```

Confirm `session.user.id` exists on the typed session; if the project uses `session.user.email` only, use email in the key instead (same pattern as login). Prefer stable user id if present on JWT.

- [ ] **Step 5: Smoke sanity**

Run: `pnpm lint` (or typecheck via `pnpm build` if preferred).

Expected: no type errors on new imports.

- [ ] **Step 6: Commit**

```bash
git add src/lib/security/limits.ts src/lib/actions/contact.ts src/lib/actions/auth.ts src/app/api/admin/upload/route.ts
git commit -m "$(cat <<'EOF'
feat: rate-limit contact, auth, and admin upload endpoints

EOF
)"
```

---

### Task 5: Seed password hardening + boot warn + docs

**Files:**
- Create: `src/lib/security/weak-seed.ts`
- Modify: `prisma/seed-production.ts`
- Modify: `src/app/layout.tsx` (or `src/lib/db.ts`) — call warn once on server
- Modify: `.env.example`
- Modify: `docs/gates/P5-plan.md` (security smoke section)

**Interfaces:**
- Produces:
  - `isWeakSeedPassword(password: string): boolean`
  - `assertStrongSeedPassword(password: string): void` (throws)
  - `warnIfWeakSeedPasswordInProduction(): void`

- [ ] **Step 1: Implement weak-seed helpers**

```ts
const WEAK = new Set([
  "ChangeMeNow!1",
  "password",
  "Password1!",
  "12345678",
  "123456789012",
  "adminadmin12",
]);

export function isWeakSeedPassword(password: string): boolean {
  if (password.length < 12) return true;
  return WEAK.has(password);
}

export function assertStrongSeedPassword(password: string): void {
  if (isWeakSeedPassword(password)) {
    throw new Error(
      "SUPERADMIN_SEED_PASSWORD must be at least 12 chars and not a known-weak value",
    );
  }
}

export function warnIfWeakSeedPasswordInProduction(): void {
  if (process.env.NODE_ENV !== "production") return;
  const pwd = process.env.SUPERADMIN_SEED_PASSWORD;
  if (!pwd) return;
  if (isWeakSeedPassword(pwd)) {
    console.warn(
      "[security] SUPERADMIN_SEED_PASSWORD looks weak or too short; rotate SuperAdmin passwords and remove seed secret from long-lived env.",
    );
  }
}
```

- [ ] **Step 2: Update `prisma/seed-production.ts`**

Replace min-10 check with:

```ts
import { assertStrongSeedPassword } from "../src/lib/security/weak-seed";

const defaultPassword = process.env.SUPERADMIN_SEED_PASSWORD;
if (!defaultPassword) {
  throw new Error("SUPERADMIN_SEED_PASSWORD is required");
}
assertStrongSeedPassword(defaultPassword);
```

(If importing from `src/` in prisma is awkward for path resolution, duplicate the weak list in the seed file OR use relative import `../src/lib/security/weak-seed` — relative import is preferred to keep one source of truth.)

- [ ] **Step 3: Boot warn**

At top of root layout server component body (or once in `src/lib/db.ts` module scope):

```ts
import { warnIfWeakSeedPasswordInProduction } from "@/lib/security/weak-seed";
warnIfWeakSeedPasswordInProduction();
```

- [ ] **Step 4: `.env.example` comments**

After `SUPERADMIN_SEED_PASSWORD` line, add:

```
# Production seed: min 12 chars, not ChangeMeNow!1. Change SuperAdmin password after seed; prefer removing this env from long-lived Production.
```

- [ ] **Step 5: Expand P5 security smoke checklist**

In `docs/gates/P5-plan.md` 보안 section, add:

```markdown
- [ ] Contact honeypot + rate limit (반복 제출 시 제한 메시지)
- [ ] Admin 로그인 rate limit
- [ ] 응답 보안 헤더 (`X-Frame-Options`, `CSP` 등) — `curl -sI`
- [ ] 업로드 mime/size 거절
- [ ] (다음 단계) Turnstile/BotID, Redis rate limit, 커스텀 도메인 HSTS, CSP nonce, 플랫폼 대시보드 점검
```

Keep existing three bullets.

- [ ] **Step 6: Full verify**

Run:

```bash
pnpm test
pnpm build
```

Expected: tests PASS; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/lib/security/weak-seed.ts prisma/seed-production.ts src/app/layout.tsx .env.example docs/gates/P5-plan.md
git commit -m "$(cat <<'EOF'
feat: harden production seed password rules and document security smoke

EOF
)"
```

---

### Task 6: Verification handoff + next-stage gaps report

**Files:** none required (operator-facing summary in chat / optional note in PR body)

- [ ] **Step 1: Re-run verification**

```bash
pnpm test && pnpm build
```

Expected: PASS.

- [ ] **Step 2: Manual checklist (local)**

- Contact honeypot still returns success when `website` filled
- Unauthenticated `/admin` → login redirect
- `curl -sI http://localhost:3000/` shows security headers

- [ ] **Step 3: After implementation, tell the user these remaining gaps (from spec)**

1. Turnstile / BotID when spam appears  
2. Distributed rate limit (e.g. Upstash Redis)  
3. Custom-domain HSTS  
4. CSP without `'unsafe-inline'` / `'unsafe-eval'`  
5. Stronger pre-Cloudinary magic-byte checks  
6. Vercel / Supabase dashboard security review  

- [ ] **Step 4: Ship via feature branch + PR** using `finishing-a-development-branch` (do not merge to `main` without PR). Prefer a dedicated branch such as `feat/p5-security-hardening` if current branch is unrelated.

---

## Plan self-review

| Spec requirement | Task |
|---|---|
| HTTP security headers + modest CSP | Task 3 |
| Rate limits Contact/login/signup/upload | Tasks 1, 4 |
| Shared upload mime/size | Task 2 |
| Seed password hardening + warn + docs | Task 5 |
| Unit + build verification | Tasks 1–2, 5–6 |
| Next-stage gaps communicated | Task 6 |
| No Turnstile/Redis/HSTS now | Global Constraints |

No TBD placeholders. Interface names: `checkRateLimit`, `assertImageUpload`, `getClientIpFromHeaders`, `SECURITY_HEADERS`, `assertStrongSeedPassword` — consistent across tasks.
