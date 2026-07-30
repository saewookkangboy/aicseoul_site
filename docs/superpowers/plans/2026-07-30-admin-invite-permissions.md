# Admin Email Invite + Permission UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SuperAdmin can email-invite SuperAdmin/Operator with tracked invite links (create/resend/cancel/accept), and `/admin/users` gains permission presets plus one-click “approve with invite permissions.”

**Architecture:** Add Prisma `AdminInvite` + pure planners in `src/lib/admin-invite*.ts`. Server actions create/resend/cancel invites (hash-only tokens, Resend + copy URL). Signup accepts `?token=` (invite wins over shared code). Users page layout A: InvitePanel above UsersTable; approve-from-invite applies stored module flags.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, Auth.js credentials, Resend, Zod, `node:test` via `pnpm test` (`scripts/run-tests.mjs`).

**Spec:** `docs/superpowers/specs/2026-07-30-admin-invite-permissions-design.md`

## Global Constraints

- SuperAdmin max **3** = `count(User.role=superadmin) + count(AdminInvite pending AND role=superadmin)`.
- Invite token: store **hash only**; resend **rotates** token (old link invalid).
- SuperAdmin invite accept → `status=active` immediately; Operator → `pending`, modules **false** until approve-from-invite.
- Keep `ADMIN_SIGNUP_INVITE_CODE` path; when `token` present, invite path takes precedence (shared code not required).
- Resend failure must not roll back invite row; UI shows copy link.
- Reject invite create if User with same email already exists.
- Prefer feature branch + PR (`finishing-a-development-branch`); do not leave long-lived WIP only on `main`.
- Korean user-facing errors; follow existing admin UI tokens (`btnPrimaryClass`, etc.).
- Tests: add `*.test.ts` under `src/` (auto-picked by `pnpm test`).

## File map

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | `AdminInviteStatus` enum + `AdminInvite` model; User relations |
| `prisma/migrations/...` | Migration from `pnpm exec prisma migrate dev` |
| `src/lib/admin-invite-token.ts` | `generateInviteToken`, `hashInviteToken` |
| `src/lib/admin-invite-plan.ts` | Pure: seat check, create/resend/cancel/accept/expire planners |
| `src/lib/permission-presets.ts` | Named presets → `ModulePerms` |
| `src/lib/admin-invite-*.test.ts` / `permission-presets.test.ts` | Unit tests |
| `src/lib/email/invite.ts` | `sendAdminInviteEmail` (Resend; skip if no key) |
| `src/lib/actions/invites.ts` | `createInvite`, `resendInvite`, `cancelInvite` |
| `src/lib/actions/auth.ts` | Token signup branch |
| `src/lib/actions/users.ts` | `approveUserWithInvitePermissions` |
| `src/components/admin/InvitePanel.tsx` | Form + list + copy/resend/cancel |
| `src/components/admin/UsersTable.tsx` | Presets + approve-with-invite |
| `src/components/admin/AuthForm.tsx` | Optional locked email + hidden `inviteToken` |
| `src/app/admin/(auth)/signup/page.tsx` | Read `token`, resolve invite preview |
| `src/app/admin/(console)/users/page.tsx` | Load invites; render InvitePanel |

---

### Task 1: Pure invite planners + token helpers (TDD)

**Files:**
- Create: `src/lib/admin-invite-token.ts`
- Create: `src/lib/admin-invite-plan.ts`
- Create: `src/lib/permission-presets.ts`
- Create: `src/lib/admin-invite-plan.test.ts`
- Create: `src/lib/permission-presets.test.ts`

**Interfaces:**
- Produces:
  - `generateInviteToken(): string` — 32+ bytes url-safe
  - `hashInviteToken(token: string): string` — sha256 hex
  - `canCreateSuperadminInvite(superadminUsers: number, pendingSuperInvites: number): boolean`
  - `planExpireInvite(status: InviteStatus, expiresAt: Date, now: Date): { expire: boolean }`
  - `planAcceptInvite(input): { ok: true; user: {...}; inviteUpdate } | { ok: false; error: string }`
  - `PERMISSION_PRESETS: Record<"content" | "fullOps" | "contactSettings", ModulePerms>`
  - `applyPermissionPreset(id: keyof typeof PERMISSION_PRESETS): ModulePerms`

- [ ] **Step 1: Write failing tests**

`src/lib/permission-presets.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyPermissionPreset } from "./permission-presets";

describe("applyPermissionPreset", () => {
  it("content = meetups + insights only", () => {
    const p = applyPermissionPreset("content");
    assert.deepEqual(p, {
      permPeople: false,
      permMeetups: true,
      permInsights: true,
      permContact: false,
      permSettings: false,
    });
  });

  it("fullOps = all true", () => {
    const p = applyPermissionPreset("fullOps");
    assert.equal(Object.values(p).every(Boolean), true);
  });

  it("contactSettings = contact + settings", () => {
    const p = applyPermissionPreset("contactSettings");
    assert.deepEqual(p, {
      permPeople: false,
      permMeetups: false,
      permInsights: false,
      permContact: true,
      permSettings: true,
    });
  });
});
```

`src/lib/admin-invite-plan.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canCreateSuperadminInvite,
  planExpireInvite,
  planAcceptInvite,
} from "./admin-invite-plan";
import { hashInviteToken } from "./admin-invite-token";

describe("canCreateSuperadminInvite", () => {
  it("allows when users+pending < 3", () => {
    assert.equal(canCreateSuperadminInvite(1, 1), true);
  });
  it("blocks at 3", () => {
    assert.equal(canCreateSuperadminInvite(2, 1), false);
    assert.equal(canCreateSuperadminInvite(3, 0), false);
  });
});

describe("planExpireInvite", () => {
  it("marks pending past expiresAt", () => {
    const r = planExpireInvite(
      "pending",
      new Date("2020-01-01"),
      new Date("2020-01-02"),
    );
    assert.equal(r.expire, true);
  });
  it("does not expire accepted", () => {
    const r = planExpireInvite(
      "accepted",
      new Date("2020-01-01"),
      new Date("2020-01-02"),
    );
    assert.equal(r.expire, false);
  });
});

describe("planAcceptInvite", () => {
  const base = {
    inviteStatus: "pending" as const,
    inviteEmail: "a@example.com",
    inviteRole: "operator" as const,
    expiresAt: new Date("2099-01-01"),
    now: new Date("2026-07-30"),
    signupEmail: "a@example.com",
    permsOnInvite: {
      permPeople: true,
      permMeetups: false,
      permInsights: true,
      permContact: false,
      permSettings: false,
    },
  };

  it("operator → pending + all perms false", () => {
    const r = planAcceptInvite(base);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.user.role, "operator");
      assert.equal(r.user.status, "pending");
      assert.equal(r.user.permPeople, false);
      assert.equal(r.inviteUpdate.status, "accepted");
    }
  });

  it("superadmin → active + all perms true", () => {
    const r = planAcceptInvite({ ...base, inviteRole: "superadmin" });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.user.role, "superadmin");
      assert.equal(r.user.status, "active");
      assert.equal(r.user.permPeople, true);
    }
  });

  it("rejects email mismatch", () => {
    const r = planAcceptInvite({ ...base, signupEmail: "b@example.com" });
    assert.equal(r.ok, false);
  });

  it("rejects cancelled", () => {
    const r = planAcceptInvite({ ...base, inviteStatus: "cancelled" });
    assert.equal(r.ok, false);
  });
});

describe("hashInviteToken", () => {
  it("is stable hex", () => {
    const h = hashInviteToken("abc");
    assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(h, hashInviteToken("abc"));
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `pnpm test`

Expected: FAIL (modules not found).

- [ ] **Step 3: Implement**

`src/lib/admin-invite-token.ts`:

```ts
import { createHash, randomBytes } from "node:crypto";

export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
```

`src/lib/permission-presets.ts`:

```ts
import type { ModulePerms } from "@/lib/user-permission-update";

export const PERMISSION_PRESETS = {
  content: {
    permPeople: false,
    permMeetups: true,
    permInsights: true,
    permContact: false,
    permSettings: false,
  },
  fullOps: {
    permPeople: true,
    permMeetups: true,
    permInsights: true,
    permContact: true,
    permSettings: true,
  },
  contactSettings: {
    permPeople: false,
    permMeetups: false,
    permInsights: false,
    permContact: true,
    permSettings: true,
  },
} as const satisfies Record<string, ModulePerms>;

export type PermissionPresetId = keyof typeof PERMISSION_PRESETS;

export function applyPermissionPreset(id: PermissionPresetId): ModulePerms {
  return { ...PERMISSION_PRESETS[id] };
}
```

`src/lib/admin-invite-plan.ts`:

```ts
import type { ModulePerms } from "@/lib/user-permission-update";

export type InviteStatus = "pending" | "accepted" | "cancelled" | "expired";
export type InviteRole = "superadmin" | "operator";

export function canCreateSuperadminInvite(
  superadminUsers: number,
  pendingSuperInvites: number,
): boolean {
  return superadminUsers + pendingSuperInvites < 3;
}

export function planExpireInvite(
  status: InviteStatus,
  expiresAt: Date,
  now: Date,
): { expire: boolean } {
  if (status !== "pending") return { expire: false };
  return { expire: expiresAt.getTime() < now.getTime() };
}

export type PlanAcceptInviteInput = {
  inviteStatus: InviteStatus;
  inviteEmail: string;
  inviteRole: InviteRole;
  expiresAt: Date;
  now: Date;
  signupEmail: string;
  permsOnInvite: ModulePerms;
};

export function planAcceptInvite(input: PlanAcceptInviteInput):
  | {
      ok: true;
      user: {
        role: InviteRole;
        status: "pending" | "active";
      } & ModulePerms;
      inviteUpdate: { status: "accepted" };
    }
  | { ok: false; error: string } {
  if (input.inviteStatus !== "pending") {
    return { ok: false, error: "유효하지 않은 초대입니다." };
  }
  if (planExpireInvite(input.inviteStatus, input.expiresAt, input.now).expire) {
    return { ok: false, error: "초대가 만료되었습니다." };
  }
  const email = input.signupEmail.trim().toLowerCase();
  if (email !== input.inviteEmail.trim().toLowerCase()) {
    return { ok: false, error: "초대된 이메일과 일치하지 않습니다." };
  }
  if (input.inviteRole === "superadmin") {
    return {
      ok: true,
      user: {
        role: "superadmin",
        status: "active",
        permPeople: true,
        permMeetups: true,
        permInsights: true,
        permContact: true,
        permSettings: true,
      },
      inviteUpdate: { status: "accepted" },
    };
  }
  return {
    ok: true,
    user: {
      role: "operator",
      status: "pending",
      permPeople: false,
      permMeetups: false,
      permInsights: false,
      permContact: false,
      permSettings: false,
    },
    inviteUpdate: { status: "accepted" },
  };
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `pnpm test`

Expected: PASS for new tests (existing suite still green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin-invite-token.ts src/lib/admin-invite-plan.ts src/lib/permission-presets.ts src/lib/admin-invite-plan.test.ts src/lib/permission-presets.test.ts
git commit -m "feat(admin): invite planners and permission presets"
```

---

### Task 2: Prisma `AdminInvite` model + migration

**Files:**
- Modify: `prisma/schema.prisma`
- Create: migration via Prisma CLI

**Interfaces:**
- Produces: Prisma model `AdminInvite` + enum `AdminInviteStatus`
- Consumes: existing `User`, `UserRole`

- [ ] **Step 1: Add schema**

Append to `prisma/schema.prisma`:

```prisma
enum AdminInviteStatus {
  pending
  accepted
  cancelled
  expired
}

model AdminInvite {
  id             String            @id @default(cuid())
  email          String
  role           UserRole
  permPeople     Boolean           @default(false)
  permMeetups    Boolean           @default(false)
  permInsights   Boolean           @default(false)
  permContact    Boolean           @default(false)
  permSettings   Boolean           @default(false)
  tokenHash      String            @unique
  status         AdminInviteStatus @default(pending)
  expiresAt      DateTime
  invitedById    String
  invitedBy      User              @relation("InvitesSent", fields: [invitedById], references: [id], onDelete: Cascade)
  acceptedUserId String?
  acceptedUser   User?             @relation("InviteAccepted", fields: [acceptedUserId], references: [id], onDelete: SetNull)
  acceptedAt     DateTime?
  cancelledAt    DateTime?
  lastSentAt     DateTime
  sendCount      Int               @default(1)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([email, status])
  @@index([status, expiresAt])
}
```

On `User` model add:

```prisma
  invitesSent     AdminInvite[] @relation("InvitesSent")
  inviteAccepted  AdminInvite[] @relation("InviteAccepted")
```

- [ ] **Step 2: Migrate**

Run (local Docker Postgres on `DATABASE_URL`):

```bash
pnpm exec prisma migrate dev --name admin_invites
pnpm exec prisma generate
```

Expected: migration applied; client generated.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): add AdminInvite model"
```

---

### Task 3: Invite email helper + server actions

**Files:**
- Create: `src/lib/email/invite.ts`
- Create: `src/lib/actions/invites.ts`

**Interfaces:**
- Consumes: `generateInviteToken`, `hashInviteToken`, `canCreateSuperadminInvite`, `applyPermissionPreset` (UI may pass raw perms), Prisma `AdminInvite`
- Produces:
  - `sendAdminInviteEmail(args: { to; signupUrl; role; expiresAt }): Promise<{ sent: boolean }>`
  - `createInvite(input): Promise<{ ok: true; inviteId; signupUrl; emailSent } | { ok: false; error }>`
  - `resendInvite(inviteId): Promise<{ ok: true; signupUrl; emailSent } | { ok: false; error }>`
  - `cancelInvite(inviteId): Promise<{ ok: true } | { ok: false; error }>`

- [ ] **Step 1: Implement email helper**

`src/lib/email/invite.ts` (mirror `notify.ts` patterns):

```ts
import { Resend } from "resend";

export async function sendAdminInviteEmail(args: {
  to: string;
  signupUrl: string;
  role: "superadmin" | "operator";
  expiresAt: Date;
}): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[invite] RESEND_API_KEY missing — skipped");
    return { sent: false };
  }
  const from =
    process.env.RESEND_FROM ?? "AIC Seoul <onboarding@resend.dev>";
  const roleLabel = args.role === "superadmin" ? "SuperAdmin" : "운영진";
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: args.to,
      subject: `[AIC Seoul] Admin 초대 · ${roleLabel}`,
      text: [
        "AI Collective Seoul Admin 초대입니다.",
        `역할: ${roleLabel}`,
        `만료: ${args.expiresAt.toISOString()}`,
        "",
        `가입 링크: ${args.signupUrl}`,
        "",
        "본인이 요청하지 않았다면 이 메일을 무시하세요.",
      ].join("\n"),
    });
    return { sent: true };
  } catch (err) {
    console.error("[invite] Resend failed", err);
    return { sent: false };
  }
}
```

- [ ] **Step 2: Implement actions**

`src/lib/actions/invites.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";
import {
  canCreateSuperadminInvite,
  planExpireInvite,
} from "@/lib/admin-invite-plan";
import {
  generateInviteToken,
  hashInviteToken,
} from "@/lib/admin-invite-token";
import { sendAdminInviteEmail } from "@/lib/email/invite";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const createSchema = z.object({
  email: z.string().trim().email().max(200),
  role: z.enum(["superadmin", "operator"]),
  permPeople: z.boolean(),
  permMeetups: z.boolean(),
  permInsights: z.boolean(),
  permContact: z.boolean(),
  permSettings: z.boolean(),
});

function appBaseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

function signupUrlForToken(token: string): string {
  return `${appBaseUrl()}/admin/signup?token=${encodeURIComponent(token)}`;
}

async function requireSuper() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    return null;
  }
  return session.user;
}

export async function createInvite(raw: z.infer<typeof createSchema>) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "입력값을 확인해 주세요." };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { ok: false as const, error: "이미 등록된 이메일입니다." };
  }

  const pendingSame = await prisma.adminInvite.findFirst({
    where: { email, status: "pending" },
  });
  if (pendingSame) {
    return {
      ok: false as const,
      error: "이미 대기 중인 초대가 있습니다. 재발송을 사용하세요.",
    };
  }

  if (parsed.data.role === "superadmin") {
    const [superUsers, pendingSuper] = await Promise.all([
      prisma.user.count({ where: { role: "superadmin" } }),
      prisma.adminInvite.count({
        where: { role: "superadmin", status: "pending" },
      }),
    ]);
    if (!canCreateSuperadminInvite(superUsers, pendingSuper)) {
      return { ok: false as const, error: "SuperAdmin은 최대 3명입니다." };
    }
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);

  const perms =
    parsed.data.role === "superadmin"
      ? {
          permPeople: true,
          permMeetups: true,
          permInsights: true,
          permContact: true,
          permSettings: true,
        }
      : {
          permPeople: parsed.data.permPeople,
          permMeetups: parsed.data.permMeetups,
          permInsights: parsed.data.permInsights,
          permContact: parsed.data.permContact,
          permSettings: parsed.data.permSettings,
        };

  const invite = await prisma.adminInvite.create({
    data: {
      email,
      role: parsed.data.role,
      ...perms,
      tokenHash,
      status: "pending",
      expiresAt,
      invitedById: user.id,
      lastSentAt: now,
      sendCount: 1,
    },
  });

  const signupUrl = signupUrlForToken(token);
  const { sent } = await sendAdminInviteEmail({
    to: email,
    signupUrl,
    role: parsed.data.role,
    expiresAt,
  });

  revalidatePath("/admin/users");
  return {
    ok: true as const,
    inviteId: invite.id,
    signupUrl,
    emailSent: sent,
  };
}

export async function resendInvite(inviteId: string) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const invite = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return { ok: false as const, error: "초대를 찾을 수 없습니다." };

  const now = new Date();
  if (planExpireInvite(invite.status, invite.expiresAt, now).expire) {
    await prisma.adminInvite.update({
      where: { id: inviteId },
      data: { status: "expired" },
    });
    revalidatePath("/admin/users");
    return { ok: false as const, error: "만료된 초대입니다. 새로 초대하세요." };
  }
  if (invite.status !== "pending") {
    return { ok: false as const, error: "재발송할 수 없는 상태입니다." };
  }

  const token = generateInviteToken();
  const tokenHash = hashInviteToken(token);
  await prisma.adminInvite.update({
    where: { id: inviteId },
    data: {
      tokenHash,
      lastSentAt: now,
      sendCount: { increment: 1 },
    },
  });

  const signupUrl = signupUrlForToken(token);
  const { sent } = await sendAdminInviteEmail({
    to: invite.email,
    signupUrl,
    role: invite.role,
    expiresAt: invite.expiresAt,
  });

  revalidatePath("/admin/users");
  return { ok: true as const, signupUrl, emailSent: sent };
}

export async function cancelInvite(inviteId: string) {
  const user = await requireSuper();
  if (!user) return { ok: false as const, error: "Forbidden" };

  const invite = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
  });
  if (!invite) return { ok: false as const, error: "초대를 찾을 수 없습니다." };
  if (invite.status !== "pending") {
    return { ok: false as const, error: "취소할 수 없는 상태입니다." };
  }

  await prisma.adminInvite.update({
    where: { id: inviteId },
    data: { status: "cancelled", cancelledAt: new Date() },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
```

- [ ] **Step 3: Typecheck sanity**

Run: `pnpm exec tsc --noEmit` (or project’s usual check)

Expected: no errors in new files.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/invite.ts src/lib/actions/invites.ts
git commit -m "feat(admin): invite create/resend/cancel actions"
```

---

### Task 4: Signup with invite token

**Files:**
- Modify: `src/lib/actions/auth.ts`
- Modify: `src/components/admin/AuthForm.tsx`
- Modify: `src/app/admin/(auth)/signup/page.tsx`

**Interfaces:**
- Consumes: `hashInviteToken`, `planAcceptInvite`, `planExpireInvite`
- Produces: signup accepts optional `inviteToken`; locks email when invite present

- [ ] **Step 1: Extend signup schema + branch**

In `signupSchema` add:

```ts
inviteToken: z.string().trim().min(1).max(200).optional(),
```

Parse `formData.get("inviteToken") || undefined`.

**When `inviteToken` is present** (before shared invite-code checks):

1. `tokenHash = hashInviteToken(inviteToken)`
2. Load `adminInvite` by `tokenHash`
3. If missing → `{ error: "유효하지 않은 초대입니다." }`
4. If `planExpireInvite` → update status `expired`, return expired error
5. `planned = planAcceptInvite({...})`; if `!planned.ok` return error
6. Skip `ADMIN_SIGNUP_INVITE_CODE` requirement for this request
7. Create user with `planned.user` fields + name/passwordHash/email
8. Update invite: `status=accepted`, `acceptedUserId`, `acceptedAt=now`
9. If superadmin → `signIn` + `redirect("/admin")`; else `redirect("/admin/pending")`

Keep existing shared-code path when token absent. Keep `SUPERADMIN_EMAILS` auto-promote only for **non-token** signup (token path uses invite role exclusively).

- [ ] **Step 2: AuthForm props**

Add optional:

```ts
inviteToken?: string;
lockedEmail?: string;
```

When set: hidden `inviteToken`; email input `readOnly`/`defaultValue={lockedEmail}`; hide `requireInvite` field even if code is configured.

- [ ] **Step 3: Signup page**

```tsx
// read searchParams.token
// if token: hash, load pending invite (expire if needed)
// pass inviteToken + lockedEmail={invite.email} to AuthForm
// adjust description copy for invite vs open signup
```

If token invalid/expired, show error banner and still allow shared-code signup without token (or block — prefer show error + link to `/admin/signup` without token).

- [ ] **Step 4: Manual smoke**

1. Create invite via temporary server action call or after Task 5 UI
2. Open signup URL → email locked → Operator lands pending; SuperAdmin lands `/admin`

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/auth.ts src/components/admin/AuthForm.tsx src/app/admin/\(auth\)/signup/page.tsx
git commit -m "feat(admin): signup via email invite token"
```

---

### Task 5: Approve with invite permissions + UsersTable presets

**Files:**
- Modify: `src/lib/actions/users.ts`
- Modify: `src/components/admin/UsersTable.tsx`

**Interfaces:**
- Produces: `approveUserWithInvitePermissions(userId: string): Promise<void>`
- Consumes: accepted `AdminInvite` where `acceptedUserId=userId`

- [ ] **Step 1: Server action**

```ts
export async function approveUserWithInvitePermissions(userId: string) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }
  const invite = await prisma.adminInvite.findFirst({
    where: { acceptedUserId: userId, status: "accepted" },
    orderBy: { acceptedAt: "desc" },
  });
  if (!invite) {
    throw new Error("초대 권한 정보가 없습니다");
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: "active",
      permPeople: invite.permPeople,
      permMeetups: invite.permMeetups,
      permInsights: invite.permInsights,
      permContact: invite.permContact,
      permSettings: invite.permSettings,
    },
  });
  revalidatePath("/admin/users");
}
```

- [ ] **Step 2: UsersTable**

Extend user row type with optional `invitePerms: ModulePerms | null`.

UI additions per editable row:

- Preset buttons: `콘텐츠만` / `전체 운영` / `문의·설정` calling `applyPermissionPreset` into local checkbox state (client).
- If `user.status === "pending" && invitePerms`: button「초대 권한으로 승인」→ `approveUserWithInvitePermissions(user.id)` then refresh.

Keep existing approve/disable/save.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/users.ts src/components/admin/UsersTable.tsx
git commit -m "feat(admin): invite-permission approve and presets"
```

---

### Task 6: InvitePanel + users page layout A

**Files:**
- Create: `src/components/admin/InvitePanel.tsx`
- Modify: `src/app/admin/(console)/users/page.tsx`

**Interfaces:**
- Consumes: `createInvite`, `resendInvite`, `cancelInvite`, `applyPermissionPreset`

- [ ] **Step 1: InvitePanel client component**

Structure:

1. Form: email, role select, if operator → preset buttons + 5 module checkboxes, submit「초대 보내기」
2. On success: show `signupUrl` +「복사」; note if `!emailSent`
3. Table of invites: email, role, status, expiresAt, sendCount, lastSentAt; actions Resend / Cancel for `pending`

Use existing `btnPrimaryClass`, `fieldClass`, `AdminBadge` patterns from UsersTable/ui.

- [ ] **Step 2: users page**

Before rendering table:

```ts
const now = new Date();
const invites = await prisma.adminInvite.findMany({
  orderBy: { createdAt: "desc" },
  take: 50,
});
// Optionally mark expired pending in a loop (updateMany where pending && expiresAt < now)
```

Pass invites to `InvitePanel`.

For users, attach invite perms:

```ts
const acceptedInvites = await prisma.adminInvite.findMany({
  where: {
    status: "accepted",
    acceptedUserId: { in: users.map((u) => u.id) },
  },
});
// map userId → latest invite perms
```

Pass into `UsersTable`.

Update `AdminPageHeader` description to mention email invites.

- [ ] **Step 3: Manual QA checklist**

- [ ] Create operator invite → list pending → copy URL works
- [ ] Resend rotates link; old token fails signup
- [ ] Cancel blocks signup
- [ ] SuperAdmin invite seat limit at 3
- [ ] Operator signup pending → approve with invite perms → modules match
- [ ] Shared invite code signup still works without token
- [ ] Presets fill checkboxes

- [ ] **Step 4: Run full tests**

Run: `pnpm test && pnpm lint`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/InvitePanel.tsx src/app/admin/\(console\)/users/page.tsx src/components/admin/UsersTable.tsx
git commit -m "feat(admin): InvitePanel on users page"
```

---

### Task 7: Ship branch hygiene

**Files:** none (process)

- [ ] **Step 1:** Ensure work is on a feature branch (e.g. `feat/admin-email-invites`), not only commits piled on `main` if local main diverged for this feature.
- [ ] **Step 2:** Open PR with summary + test plan from Task 6 checklist (`finishing-a-development-branch` / `gh pr create`).
- [ ] **Step 3:** Mark spec status **approved / implemented** only after merge if desired.

---

## Spec coverage self-review

| Spec requirement | Task |
|---|---|
| AdminInvite + status tracking | 2, 3, 6 |
| Resend + copy link | 3, 6 |
| Role + module at invite | 3, 6 |
| SuperAdmin immediate active / Operator pending | 1, 4 |
| Approve with invite perms | 5 |
| Permission presets | 1, 5 |
| Shared code coexistence | 4 |
| SuperAdmin seat with pending invites | 1, 3 |
| Cancel / expire / resend rotate | 1, 3, 4 |
| Layout A | 6 |

## Placeholder scan

No TBD/TODO left in task steps; code blocks are concrete.

## Type consistency

- Status union: `pending|accepted|cancelled|expired` matches Prisma enum.
- `ModulePerms` from `user-permission-update.ts` reused in presets + accept planner.
- Action return shapes: `{ ok: true, ... } | { ok: false, error }` for invites; users approve throws like existing actions.
