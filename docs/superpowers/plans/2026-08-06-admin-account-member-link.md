# Admin Account + Member Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Active admins can change their display name and password on `/admin/account`, and—when SuperAdmin links their User to a Member—edit their public People profile fields from the same page.

**Architecture:** Add optional unique `User.memberId` → `Member`. Pure planners validate password change and Member link/unlink. Server actions in `account.ts` (session user only) and `users.ts` (SuperAdmin link). Upload route gains an `account` path so Operators without `permPeople` can still upload their own photo. Nav gets「내 계정」; users table gets Member connect UI.

**Tech Stack:** Next.js App Router, Prisma/PostgreSQL, Auth.js JWT credentials, bcryptjs, Zod, `node:test` via `pnpm test`.

**Spec:** `docs/superpowers/specs/2026-08-06-admin-account-member-link-design.md`

## Global Constraints

- Account actions target **only** `auth()` session `user.id` — never trust form `userId` / `memberId` for ownership.
- Password: verify current with `compare`; new password min **8** / max **128** (signup parity); confirm must match; on current mismatch return generic Korean error (do not reveal which field failed beyond “현재 비밀번호가 올바르지 않습니다”).
- Member self-edit fields only: `nameKr`, `nameEn`, `bio`, `photoUrl`, `photoAssetId`, `linkedinUrl`, `websiteUrl`. Never let account actions set `isVisible` / `isFounder` / `sortOrder`.
- One Member ↔ one User (`User.memberId` `@unique`); link rejects already-linked Member.
- `onDelete: SetNull` on Member delete.
- Upload: active session may use module **`account`** (folder `people`); do not require `permPeople`.
- Email change / forgot-password mail: **out of scope**.
- Prefer feature branch + PR (`finishing-a-development-branch`); Korean UI copy; existing admin UI tokens (`btnPrimaryClass`, `AdminPanel`, etc.).
- Tests: `*.test.ts` under `src/` picked by `pnpm test`.

## File map

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | `User.memberId` + `Member.linkedUser` |
| `prisma/migrations/...` | Generated migration |
| `src/lib/account-plan.ts` | Pure: password change + profile name + member link planners |
| `src/lib/account-plan.test.ts` | Unit tests |
| `src/lib/actions/account.ts` | `updateAccountProfile`, `changePassword`, `updateLinkedMemberProfile` |
| `src/lib/actions/users.ts` | `linkUserMember`, `unlinkUserMember` |
| `src/lib/security/limits.ts` | `RATE.passwordChange` |
| `src/app/api/admin/upload/route.ts` | Allow `module=account` for active users |
| `src/lib/media/upload-client.ts` | Type union includes `"account"` |
| `src/components/admin/ImageUploadField.tsx` | Prop type includes `"account"` |
| `src/components/admin/AccountForms.tsx` | Client forms: name, password, linked Member |
| `src/app/admin/(console)/account/page.tsx` | Load user + optional Member; render forms |
| `src/components/admin/AdminNav.tsx` | 「내 계정」 link near logout |
| `src/components/admin/UsersTable.tsx` | Member link/unlink UI |
| `src/app/admin/(console)/users/page.tsx` | Pass members + `memberId` into table |
| `docs/gates/P5-security-ops-checklist.md` | Point password change to `/admin/account` |

---

### Task 1: Pure account planners (TDD)

**Files:**
- Create: `src/lib/account-plan.ts`
- Create: `src/lib/account-plan.test.ts`

**Interfaces:**
- Produces:
  - `planChangePassword(input: { currentPassword: string; newPassword: string; confirmPassword: string }): { ok: true; newPassword: string } | { ok: false; error: string }`
  - `planUpdateAccountName(input: { name: string }): { ok: true; name: string } | { ok: false; error: string }`
  - `planLinkUserMember(input: { userId: string; memberId: string; existingOwnerUserId: string | null }): { ok: true } | { ok: false; error: string }`
  - `planUnlinkUserMember(input: { userId: string; currentMemberId: string | null }): { ok: true } | { ok: false; error: string }`
  - `assertLinkedMemberOwnership(input: { sessionUserId: string; userMemberId: string | null }): { ok: true; memberId: string } | { ok: false; error: string }`

- [ ] **Step 1: Write failing tests**

`src/lib/account-plan.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertLinkedMemberOwnership,
  planChangePassword,
  planLinkUserMember,
  planUnlinkUserMember,
  planUpdateAccountName,
} from "./account-plan";

describe("planChangePassword", () => {
  it("rejects short new password", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "short",
      confirmPassword: "short",
    });
    assert.equal(r.ok, false);
  });

  it("rejects confirm mismatch", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-99",
    });
    assert.equal(r.ok, false);
  });

  it("rejects empty current", () => {
    const r = planChangePassword({
      currentPassword: "",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-12",
    });
    assert.equal(r.ok, false);
  });

  it("accepts valid shape (hash verify is action-layer)", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-12",
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.newPassword, "new-pass-12");
  });
});

describe("planUpdateAccountName", () => {
  it("trims and rejects empty", () => {
    assert.equal(planUpdateAccountName({ name: "   " }).ok, false);
  });

  it("accepts 1–80 chars", () => {
    const r = planUpdateAccountName({ name: "  홍길동  " });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.name, "홍길동");
  });
});

describe("planLinkUserMember", () => {
  it("rejects when member already linked to another user", () => {
    const r = planLinkUserMember({
      userId: "u1",
      memberId: "m1",
      existingOwnerUserId: "u2",
    });
    assert.equal(r.ok, false);
  });

  it("allows when unlinked or same user", () => {
    assert.equal(
      planLinkUserMember({
        userId: "u1",
        memberId: "m1",
        existingOwnerUserId: null,
      }).ok,
      true,
    );
    assert.equal(
      planLinkUserMember({
        userId: "u1",
        memberId: "m1",
        existingOwnerUserId: "u1",
      }).ok,
      true,
    );
  });
});

describe("planUnlinkUserMember", () => {
  it("rejects when already unlinked", () => {
    assert.equal(
      planUnlinkUserMember({ userId: "u1", currentMemberId: null }).ok,
      false,
    );
  });
});

describe("assertLinkedMemberOwnership", () => {
  it("rejects null memberId", () => {
    assert.equal(
      assertLinkedMemberOwnership({
        sessionUserId: "u1",
        userMemberId: null,
      }).ok,
      false,
    );
  });

  it("returns memberId when linked", () => {
    const r = assertLinkedMemberOwnership({
      sessionUserId: "u1",
      userMemberId: "m1",
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.memberId, "m1");
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
pnpm test -- src/lib/account-plan.test.ts
```

Expected: FAIL (module not found / export missing).

- [ ] **Step 3: Implement planners**

`src/lib/account-plan.ts`:

```ts
export type PlanResult<T> = { ok: true } & T | { ok: false; error: string };

export function planChangePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): PlanResult<{ newPassword: string }> {
  if (!input.currentPassword) {
    return { ok: false, error: "현재 비밀번호를 입력해 주세요." };
  }
  if (input.newPassword.length < 8 || input.newPassword.length > 128) {
    return { ok: false, error: "새 비밀번호는 8자 이상이어야 합니다." };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "새 비밀번호 확인이 일치하지 않습니다." };
  }
  return { ok: true, newPassword: input.newPassword };
}

export function planUpdateAccountName(input: {
  name: string;
}): PlanResult<{ name: string }> {
  const name = input.name.trim();
  if (!name || name.length > 80) {
    return { ok: false, error: "이름을 확인해 주세요." };
  }
  return { ok: true, name };
}

export function planLinkUserMember(input: {
  userId: string;
  memberId: string;
  existingOwnerUserId: string | null;
}): PlanResult<Record<string, never>> {
  if (
    input.existingOwnerUserId &&
    input.existingOwnerUserId !== input.userId
  ) {
    return {
      ok: false,
      error: "이미 다른 계정에 연결된 멤버입니다.",
    };
  }
  if (!input.memberId.trim()) {
    return { ok: false, error: "멤버를 선택해 주세요." };
  }
  return { ok: true };
}

export function planUnlinkUserMember(input: {
  userId: string;
  currentMemberId: string | null;
}): PlanResult<Record<string, never>> {
  if (!input.currentMemberId) {
    return { ok: false, error: "연결된 멤버가 없습니다." };
  }
  return { ok: true };
}

export function assertLinkedMemberOwnership(input: {
  sessionUserId: string;
  userMemberId: string | null;
}): PlanResult<{ memberId: string }> {
  if (!input.userMemberId) {
    return {
      ok: false,
      error: "People 프로필이 연결되지 않았습니다. SuperAdmin에게 문의해 주세요.",
    };
  }
  return { ok: true, memberId: input.userMemberId };
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
pnpm test -- src/lib/account-plan.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/account-plan.ts src/lib/account-plan.test.ts
git commit -m "feat: add account password and member-link planners"
```

---

### Task 2: Prisma `User.memberId`

**Files:**
- Modify: `prisma/schema.prisma` (`User`, `Member`)
- Create: migration via Prisma CLI

**Interfaces:**
- Produces: `User.memberId: string | null` unique FK; `User.member`; `Member.linkedUser`

- [ ] **Step 1: Update schema**

On `User`, after `lastLoginAt` (before invite relations):

```prisma
  memberId String? @unique
  member   Member? @relation(fields: [memberId], references: [id], onDelete: SetNull)
```

On `Member`, after `updatedAt`:

```prisma
  linkedUser User?
```

- [ ] **Step 2: Create migration**

```bash
pnpm exec prisma migrate dev --name user_member_link
pnpm exec prisma generate
```

Expected: migration applies; client types include `memberId`.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add User.memberId unique FK to Member"
```

---

### Task 3: Account server actions + rate limit

**Files:**
- Modify: `src/lib/security/limits.ts` — add `passwordChange`
- Create: `src/lib/actions/account.ts`

**Interfaces:**
- Consumes: planners from Task 1; Prisma `memberId` from Task 2
- Produces:
  - `updateAccountProfile(formData): Promise<{ ok: true } | { ok: false; error: string }>`
  - `changePassword(formData): Promise<{ ok: true } | { ok: false; error: string }>`
  - `updateLinkedMemberProfile(formData): Promise<{ ok: true } | { ok: false; error: string }>`

- [ ] **Step 1: Add rate limit key**

In `RATE`:

```ts
  passwordChange: { limit: 10, windowMs: 15 * 60_000 },
```

- [ ] **Step 2: Implement `account.ts`**

```ts
"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assertLinkedMemberOwnership,
  planChangePassword,
  planUpdateAccountName,
} from "@/lib/account-plan";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getClientIpFromHeaders } from "@/lib/security/client-ip";
import { RATE, RATE_LIMIT_MESSAGE } from "@/lib/security/limits";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

const memberSelfSchema = z.object({
  nameKr: z.string().trim().min(1).max(40),
  nameEn: z.string().trim().min(1).max(80),
  bio: z.string().trim().min(1).max(80),
  photoUrl: z.string().optional(),
  photoAssetId: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

function emptyToUndef(v: FormDataEntryValue | null) {
  const s = String(v ?? "").trim();
  return s || undefined;
}

async function requireActiveSession() {
  const session = await auth();
  if (!session?.user || session.user.status !== "active") {
    return null;
  }
  return session.user;
}

export async function updateAccountProfile(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const planned = planUpdateAccountName({
    name: String(formData.get("name") ?? ""),
  });
  if (!planned.ok) return planned;

  await prisma.user.update({
    where: { id: user.id },
    data: { name: planned.name },
  });
  revalidatePath("/admin/account");
  return { ok: true as const };
}

export async function changePassword(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const h = await headers();
  const ip = getClientIpFromHeaders(h);
  const limited = await checkRateLimit(
    `passwordChange:${ip}:${user.id}`,
    RATE.passwordChange.limit,
    RATE.passwordChange.windowMs,
  );
  if (!limited.ok) {
    return { ok: false as const, error: RATE_LIMIT_MESSAGE };
  }

  const planned = planChangePassword({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!planned.ok) return planned;

  const row = await prisma.user.findUnique({ where: { id: user.id } });
  if (!row) return { ok: false as const, error: "사용자를 찾을 수 없습니다." };

  const current = String(formData.get("currentPassword") ?? "");
  const okCurrent = await compare(current, row.passwordHash);
  if (!okCurrent) {
    return { ok: false as const, error: "현재 비밀번호가 올바르지 않습니다." };
  }

  const passwordHash = await hash(planned.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  revalidatePath("/admin/account");
  return { ok: true as const };
}

export async function updateLinkedMemberProfile(formData: FormData) {
  const user = await requireActiveSession();
  if (!user) return { ok: false as const, error: "로그인이 필요합니다." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { memberId: true },
  });
  const owned = assertLinkedMemberOwnership({
    sessionUserId: user.id,
    userMemberId: dbUser?.memberId ?? null,
  });
  if (!owned.ok) return owned;

  const parsed = memberSelfSchema.safeParse({
    nameKr: formData.get("nameKr"),
    nameEn: formData.get("nameEn"),
    bio: formData.get("bio"),
    photoUrl: emptyToUndef(formData.get("photoUrl")),
    photoAssetId: emptyToUndef(formData.get("photoAssetId")),
    linkedinUrl: emptyToUndef(formData.get("linkedinUrl")) ?? "",
    websiteUrl: emptyToUndef(formData.get("websiteUrl")) ?? "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: "입력값을 확인해 주세요." };
  }

  await prisma.member.update({
    where: { id: owned.memberId },
    data: {
      nameKr: parsed.data.nameKr,
      nameEn: parsed.data.nameEn,
      bio: parsed.data.bio,
      photoUrl: parsed.data.photoUrl ?? null,
      photoAssetId: parsed.data.photoAssetId ?? null,
      linkedinUrl: parsed.data.linkedinUrl || null,
      websiteUrl: parsed.data.websiteUrl || null,
    },
  });
  revalidatePath("/admin/account");
  revalidatePath("/admin/people");
  return { ok: true as const };
}
```

- [ ] **Step 3: Smoke-check TypeScript**

```bash
pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | head -40
```

Expected: no errors in `account.ts` / `limits.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/account.ts src/lib/security/limits.ts
git commit -m "feat: add account profile and password server actions"
```

---

### Task 4: Upload `account` module for self photo

**Files:**
- Modify: `src/app/api/admin/upload/route.ts`
- Modify: `src/lib/media/upload-client.ts` (`UploadAdminImageOptions.module`)
- Modify: `src/components/admin/ImageUploadField.tsx` (`Props.module`)

**Interfaces:**
- Produces: active users can `POST` with `module=account` without `permPeople`

- [ ] **Step 1: Extend client types**

In `upload-client.ts` and `ImageUploadField.tsx`, change module union to:

```ts
"people" | "meetups" | "insights" | "settings" | "account"
```

- [ ] **Step 2: Update upload route**

Replace the permission check block with:

```ts
  const permissionModule = String(form.get("module") ?? "");
  const folder = String(form.get("folder") || permissionModule || "general");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const isAccountSelfUpload = permissionModule === "account";
  if (isAccountSelfUpload) {
    // active session already verified above
  } else if (
    !MODULES.has(permissionModule as PermissionModule) ||
    !canAccessModule(session.user, permissionModule as PermissionModule)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // when creating MediaAsset, store module: isAccountSelfUpload ? "account" : permissionModule
```

Keep `MODULES` as CMS modules only (`people` | `meetups` | `insights` | `settings`). Do **not** add `account` to `PermissionModule` / `canAccessModule`.

Use `folder` default `"people"` from the Account form’s `ImageUploadField` (`module="account" folder="people"`).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/upload/route.ts src/lib/media/upload-client.ts src/components/admin/ImageUploadField.tsx
git commit -m "feat: allow active admins to upload account profile photos"
```

---

### Task 5: `/admin/account` page + Nav

**Files:**
- Create: `src/components/admin/AccountForms.tsx`
- Create: `src/app/admin/(console)/account/page.tsx`
- Modify: `src/components/admin/AdminNav.tsx`

**Interfaces:**
- Consumes: account actions (Task 3), upload `account` (Task 4)

- [ ] **Step 1: Account forms component**

Create client component with three sections (separate forms):

1. **계정** — email `readOnly` input; name; submit → `updateAccountProfile`; show `{error}` / success.
2. **비밀번호** — current / new / confirm; submit → `changePassword`.
3. **People 소개** — if `member` prop: fields mirroring MemberForm intro fields + `ImageUploadField module="account" folder="people" cropMode="face-3x4"`; submit → `updateLinkedMemberProfile`. If `member === null`: muted text: `People 프로필이 연결되지 않았습니다. SuperAdmin에게 문의해 주세요.`

Reuse `AdminPanel`, `fieldClass`, `labelClass`, `btnPrimaryClass`, `errorTextClass` from `@/components/admin/ui`.

Use `useTransition` + local state for action results (same pattern as `UsersTable`).

Props:

```ts
type AccountFormsProps = {
  email: string;
  name: string | null;
  member: {
    nameKr: string;
    nameEn: string;
    bio: string;
    photoUrl: string | null;
    photoAssetId: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  } | null;
};
```

- [ ] **Step 2: Page**

`src/app/admin/(console)/account/page.tsx`:

```tsx
import { AccountForms } from "@/components/admin/AccountForms";
import { AdminPageHeader } from "@/components/admin/ui";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      name: true,
      member: {
        select: {
          nameKr: true,
          nameEn: true,
          bio: true,
          photoUrl: true,
          photoAssetId: true,
          linkedinUrl: true,
          websiteUrl: true,
        },
      },
    },
  });
  if (!user) redirect("/admin/login");

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="내 계정"
        description="표시 이름·비밀번호와 연결된 People 소개를 관리합니다."
      />
      <AccountForms
        email={user.email}
        name={user.name}
        member={user.member}
      />
    </div>
  );
}
```

(Console layout already gates `active`.)

- [ ] **Step 3: Nav link**

In `AdminNav` footer (above「공개 사이트」), add:

```tsx
import { UserCircle } from "@phosphor-icons/react";
// ...
<Link
  href="/admin/account"
  style={whiteStyle}
  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white/6 ${focusRing} ${
    isActive(pathname, "/admin/account") ? "bg-white/12" : ""
  }`}
>
  <UserCircle className="size-3.5" aria-hidden />
  <span style={whiteStyle}>내 계정</span>
</Link>
```

Do **not** add to `NAV` module list (always visible for active console users).

- [ ] **Step 4: Manual sanity**

```bash
pnpm dev
```

Open `/admin/account` while logged in: three sections render; unlinked user sees notice.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AccountForms.tsx src/app/admin/\(console\)/account/page.tsx src/components/admin/AdminNav.tsx
git commit -m "feat: add /admin/account page and nav link"
```

---

### Task 6: SuperAdmin Member link UI

**Files:**
- Modify: `src/lib/actions/users.ts` — `linkUserMember`, `unlinkUserMember`
- Modify: `src/app/admin/(console)/users/page.tsx`
- Modify: `src/components/admin/UsersTable.tsx`

**Interfaces:**
- Consumes: `planLinkUserMember` / `planUnlinkUserMember`
- Produces: SuperAdmin can set/clear `User.memberId`

- [ ] **Step 1: Actions**

Append to `users.ts`:

```ts
import {
  planLinkUserMember,
  planUnlinkUserMember,
} from "@/lib/account-plan";

export async function linkUserMember(userId: string, memberId: string) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const owner = await prisma.user.findFirst({
    where: { memberId },
    select: { id: true },
  });
  const planned = planLinkUserMember({
    userId,
    memberId,
    existingOwnerUserId: owner?.id ?? null,
  });
  if (!planned.ok) throw new Error(planned.error);

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new Error("멤버를 찾을 수 없습니다.");

  await prisma.user.update({
    where: { id: userId },
    data: { memberId },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/account");
}

export async function unlinkUserMember(userId: string) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { memberId: true },
  });
  const planned = planUnlinkUserMember({
    userId,
    currentMemberId: target?.memberId ?? null,
  });
  if (!planned.ok) throw new Error(planned.error);

  await prisma.user.update({
    where: { id: userId },
    data: { memberId: null },
  });
  revalidatePath("/admin/users");
  revalidatePath("/admin/account");
}
```

- [ ] **Step 2: Load members on users page**

Extend user `select` with `memberId: true` and `member: { select: { id: true, nameKr: true, nameEn: true } }`.

Load:

```ts
  const members = await prisma.member.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameKr: "asc" }],
    select: { id: true, nameKr: true, nameEn: true },
  });
  const linkedMemberIds = new Set(
    users.filter((u) => u.memberId).map((u) => u.memberId as string),
  );
```

Pass to `UsersTable`:

```tsx
<UsersTable
  users={usersWithInvitePerms}
  members={members}
  linkedMemberIds={[...linkedMemberIds]}
/>
```

- [ ] **Step 3: UsersTable UI**

Extend `UserRow` with `memberId: string | null` and optional `member: { id: string; nameKr: string; nameEn: string } | null`.

Props: `members: { id: string; nameKr: string; nameEn: string }[]`, `linkedMemberIds: string[]`.

Per row, under email/name, add:

- If linked: show `nameKr` + button「연결 해제」→ `unlinkUserMember(user.id)`.
- Else: `<select>` of members where `!linkedMemberIds.includes(id)` (or include current), + button「연결」→ `linkUserMember(user.id, selectedId)`.

Disable controls while `isPending`. Surface thrown errors via existing error state pattern.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/users.ts src/app/admin/\(console\)/users/page.tsx src/components/admin/UsersTable.tsx
git commit -m "feat: SuperAdmin link User to Member on users page"
```

---

### Task 7: Docs + full test pass + PR prep

**Files:**
- Modify: `docs/gates/P5-security-ops-checklist.md` (password change bullet)
- Optionally: `docs/gates/P5-plan.md` / `P5-content-guide.md` one-liners if they still say “DB 업데이트·재가입만”

- [ ] **Step 1: Update ops copy**

Replace “비밀번호 변경 (운영 판단)” / DB-only wording with:

> SuperAdmin 로그인 → `/admin/account`에서 비밀번호 변경

- [ ] **Step 2: Run full tests**

```bash
pnpm test
```

Expected: all pass including `account-plan.test.ts`.

- [ ] **Step 3: Commit docs**

```bash
git add docs/gates/P5-security-ops-checklist.md docs/gates/P5-plan.md docs/gates/P5-content-guide.md
git commit -m "docs: point P5 password change to /admin/account"
```

- [ ] **Step 4: Open PR** (when implementing on feature branch)

Use `finishing-a-development-branch` / `gh pr create` with summary of account page + member link + migration.

---

## Spec coverage self-check

| Spec requirement | Task |
|---|---|
| `/admin/account` | 5 |
| `User.memberId` 1:1 | 2, 6 |
| SuperAdmin link UI | 6 |
| Email read-only; `User.name` editable | 3, 5 |
| Password current + new + confirm | 1, 3 |
| Member self fields only | 1, 3, 5 |
| Nav「내 계정」 | 5 |
| Upload without permPeople | 4 |
| Rate limit password | 3 |
| Unit tests planners | 1 |
| P5 password ops note | 7 |
| Email change / forgot mail | Non-goals (no task) |

## Type consistency

- Planners return `{ ok: true, ... } | { ok: false; error: string }` — actions return the same shape for account forms; link/unlink throw `Error` like existing `users.ts` actions.
- Upload module string `"account"` is **not** a `PermissionModule`.
- `assertLinkedMemberOwnership` uses DB `memberId` only (never form member id).
