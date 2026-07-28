# SuperAdmin 역할 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/admin/users`에서 SuperAdmin이 다른 사용자를 SuperAdmin ↔ Operator로 승격·강등하고, 강등 시 모듈 권한을 같은 폼에서 지정할 수 있게 한다.

**Architecture:** 역할·권한 결정 로직을 순수 함수 `planUserPermissionUpdate`로 분리해 `node:test`로 검증한 뒤, `updateUserPermissions` 서버 액션이 그 결과를 Prisma에 적용한다. `UsersTable`에 SuperAdmin 체크박스와 행 단위 에러 표시를 추가한다.

**Tech Stack:** Next.js 16 App Router · Server Actions · Prisma `UserRole` · React client form · Node.js built-in test (`node:test`)

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-29-superadmin-role-ui-design.md` (**approved**)
- 접근안 **1**: 기존 `updateUserPermissions` 확장 (역할 전용 액션·모달 금지)
- SuperAdmin 최대 **3**명 · 최소 **1**명
- 본인 `userId`에 대한 권한/역할 변경 **거부**
- 강등 시 모듈 권한은 제출 값으로 저장
- Prisma 스키마·`SUPERADMIN_EMAILS`·세션 강제 무효화 **비범위**
- 출하: feature 브랜치 + PR (`finishing-a-development-branch`)
- 브랜치: `feat/superadmin-role-ui` · base: `main`

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/lib/user-permission-update.ts` | 순수 함수: 가드 + 승격/강등 + 저장할 role/status/perms 계산 |
| `src/lib/user-permission-update.test.ts` | `node:test` 단위 테스트 (스펙 §8) |
| `src/lib/actions/users.ts` | 세션·Prisma 조회 후 `planUserPermissionUpdate` 적용 |
| `src/components/admin/UsersTable.tsx` | SuperAdmin 토글 UI · 본인 읽기전용 · 에러 문구 |
| `src/app/admin/(console)/users/page.tsx` | `currentUserId` 전달 · 안내 문구 |
| `docs/superpowers/specs/2026-07-29-superadmin-role-ui-design.md` | 상태 `approved`로 갱신 |
| `docs/superpowers/plans/2026-07-29-superadmin-role-ui.md` | 이 플랜 |

---

### Task 1: Feature 브랜치 + 스펙 상태 + 플랜 커밋

**Files:**
- Modify: `docs/superpowers/specs/2026-07-29-superadmin-role-ui-design.md` (상태 줄)
- Create: `docs/superpowers/plans/2026-07-29-superadmin-role-ui.md` (이 플랜)

**Interfaces:**
- Consumes: approved design decisions
- Produces: 브랜치 `feat/superadmin-role-ui`

- [ ] **Step 1: 브랜치 생성**

```bash
cd /Users/chunghyo/aic_website
git checkout main
git pull --ff-only
git checkout -b feat/superadmin-role-ui
```

Expected: `Switched to a new branch 'feat/superadmin-role-ui'`

- [ ] **Step 2: 스펙 상태를 approved로 변경**

`docs/superpowers/specs/2026-07-29-superadmin-role-ui-design.md` 상단:

```markdown
- 상태: **approved** (2026-07-29 사용자 승인)
```

- [ ] **Step 3: 스펙·플랜 커밋**

```bash
git add docs/superpowers/specs/2026-07-29-superadmin-role-ui-design.md \
  docs/superpowers/plans/2026-07-29-superadmin-role-ui.md
git commit -m "$(cat <<'EOF'
docs: SuperAdmin 역할 UI 구현 플랜

스펙을 approved로 고정하고 task-by-task 구현 플랜을 추가한다.
EOF
)"
```

Expected: 커밋 성공

---

### Task 2: `planUserPermissionUpdate` 순수 함수 + 테스트 (TDD)

**Files:**
- Create: `src/lib/user-permission-update.ts`
- Create: `src/lib/user-permission-update.test.ts`
- Test: `src/lib/user-permission-update.test.ts`

**Interfaces:**
- Consumes: 없음 (순수)
- Produces:

```ts
export type ModulePerms = {
  permPeople: boolean;
  permMeetups: boolean;
  permInsights: boolean;
  permContact: boolean;
  permSettings: boolean;
};

export type PlanUserPermissionInput = {
  actorId: string;
  targetId: string;
  targetRole: "superadmin" | "operator";
  targetStatus: "pending" | "active" | "disabled";
  superadminCount: number;
  perms: ModulePerms & {
    promoteSuperadmin?: boolean;
    demoteSuperadmin?: boolean;
  };
};

export type PlanUserPermissionSuccess = {
  ok: true;
  data: {
    role: "superadmin" | "operator";
    status: "pending" | "active" | "disabled";
    permPeople: boolean;
    permMeetups: boolean;
    permInsights: boolean;
    permContact: boolean;
    permSettings: boolean;
  };
};

export type PlanUserPermissionFailure = {
  ok: false;
  error: string;
};

export type PlanUserPermissionResult =
  | PlanUserPermissionSuccess
  | PlanUserPermissionFailure;

export function planUserPermissionUpdate(
  input: PlanUserPermissionInput,
): PlanUserPermissionResult;
```

에러 문자열(정확 일치):

| 조건 | `error` |
|---|---|
| 본인 | `본인 역할은 변경할 수 없습니다` |
| 승격·강등 동시 | `잘못된 요청` |
| 승격 시 count ≥ 3 | `SuperAdmin은 최대 3명입니다` |
| 강등 시 count ≤ 1 | `최소 1명의 SuperAdmin이 필요합니다` |

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/lib/user-permission-update.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planUserPermissionUpdate } from "./user-permission-update";

const basePerms = {
  permPeople: true,
  permMeetups: false,
  permInsights: false,
  permContact: false,
  permSettings: false,
};

describe("planUserPermissionUpdate", () => {
  it("rejects changing own account", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "a1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "본인 역할은 변경할 수 없습니다");
    }
  });

  it("rejects promote and demote together", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: {
        ...basePerms,
        promoteSuperadmin: true,
        demoteSuperadmin: true,
      },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "잘못된 요청");
  });

  it("promotes operator when under cap", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "pending",
      superadminCount: 2,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "superadmin");
      assert.equal(result.data.status, "active");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, true);
      assert.equal(result.data.permContact, true);
      assert.equal(result.data.permSettings, true);
    }
  });

  it("rejects promote when already 3 superadmins", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 3,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "SuperAdmin은 최대 3명입니다");
    }
  });

  it("demotes superadmin with submitted module perms", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 2,
      perms: {
        permPeople: true,
        permMeetups: true,
        permInsights: false,
        permContact: false,
        permSettings: false,
        demoteSuperadmin: true,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "operator");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, false);
      assert.equal(result.data.permContact, false);
      assert.equal(result.data.permSettings, false);
    }
  });

  it("rejects demote when last superadmin", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 1,
      perms: { ...basePerms, demoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "최소 1명의 SuperAdmin이 필요합니다");
    }
  });

  it("updates operator module perms without role change", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: {
        permPeople: false,
        permMeetups: true,
        permInsights: true,
        permContact: false,
        permSettings: false,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "operator");
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, true);
      assert.equal(result.data.permPeople, false);
    }
  });

  it("keeps all perms true when superadmin stays superadmin", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 2,
      perms: {
        permPeople: false,
        permMeetups: false,
        permInsights: false,
        permContact: false,
        permSettings: false,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "superadmin");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permSettings, true);
    }
  });
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

```bash
cd /Users/chunghyo/aic_website
node --import tsx --test src/lib/user-permission-update.test.ts
```

Expected: FAIL (module not found / export missing)

- [ ] **Step 3: 최소 구현**

```ts
// src/lib/user-permission-update.ts
export type ModulePerms = {
  permPeople: boolean;
  permMeetups: boolean;
  permInsights: boolean;
  permContact: boolean;
  permSettings: boolean;
};

export type PlanUserPermissionInput = {
  actorId: string;
  targetId: string;
  targetRole: "superadmin" | "operator";
  targetStatus: "pending" | "active" | "disabled";
  superadminCount: number;
  perms: ModulePerms & {
    promoteSuperadmin?: boolean;
    demoteSuperadmin?: boolean;
  };
};

export type PlanUserPermissionSuccess = {
  ok: true;
  data: {
    role: "superadmin" | "operator";
    status: "pending" | "active" | "disabled";
    permPeople: boolean;
    permMeetups: boolean;
    permInsights: boolean;
    permContact: boolean;
    permSettings: boolean;
  };
};

export type PlanUserPermissionFailure = {
  ok: false;
  error: string;
};

export type PlanUserPermissionResult =
  | PlanUserPermissionSuccess
  | PlanUserPermissionFailure;

const ALL_PERMS: ModulePerms = {
  permPeople: true,
  permMeetups: true,
  permInsights: true,
  permContact: true,
  permSettings: true,
};

export function planUserPermissionUpdate(
  input: PlanUserPermissionInput,
): PlanUserPermissionResult {
  if (input.actorId === input.targetId) {
    return { ok: false, error: "본인 역할은 변경할 수 없습니다" };
  }

  const promote = Boolean(input.perms.promoteSuperadmin);
  const demote = Boolean(input.perms.demoteSuperadmin);

  if (promote && demote) {
    return { ok: false, error: "잘못된 요청" };
  }

  let role = input.targetRole;

  if (promote) {
    if (input.targetRole === "superadmin") {
      // already superadmin — no-op on role
    } else if (input.superadminCount >= 3) {
      return { ok: false, error: "SuperAdmin은 최대 3명입니다" };
    } else {
      role = "superadmin";
    }
  }

  if (demote) {
    if (input.targetRole !== "superadmin") {
      // not superadmin — ignore demote flag for role
    } else if (input.superadminCount <= 1) {
      return { ok: false, error: "최소 1명의 SuperAdmin이 필요합니다" };
    } else {
      role = "operator";
    }
  }

  const status =
    input.targetStatus === "pending" ? "active" : input.targetStatus;

  const modulePerms: ModulePerms =
    role === "superadmin"
      ? ALL_PERMS
      : {
          permPeople: input.perms.permPeople,
          permMeetups: input.perms.permMeetups,
          permInsights: input.perms.permInsights,
          permContact: input.perms.permContact,
          permSettings: input.perms.permSettings,
        };

  return {
    ok: true,
    data: {
      role,
      status,
      ...modulePerms,
    },
  };
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
node --import tsx --test src/lib/user-permission-update.test.ts
```

Expected: 모든 테스트 PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/user-permission-update.ts src/lib/user-permission-update.test.ts
git commit -m "$(cat <<'EOF'
feat: SuperAdmin 승격·강등 결정 로직과 단위 테스트

본인 변경 금지·최대 3·최소 1 가드를 순수 함수로 고정한다.
EOF
)"
```

---

### Task 3: `updateUserPermissions`에 플래너 연결

**Files:**
- Modify: `src/lib/actions/users.ts`

**Interfaces:**
- Consumes: `planUserPermissionUpdate` from `@/lib/user-permission-update`
- Produces: `updateUserPermissions(userId, perms)` — `demoteSuperadmin?: boolean` 추가; 실패 시 `throw new Error(result.error)`

- [ ] **Step 1: `updateUserPermissions` 교체**

`src/lib/actions/users.ts`의 `updateUserPermissions`를 아래로 교체 (파일 상단 import에 `planUserPermissionUpdate` 추가):

```ts
import { planUserPermissionUpdate } from "@/lib/user-permission-update";

export async function updateUserPermissions(
  userId: string,
  perms: {
    permPeople: boolean;
    permMeetups: boolean;
    permInsights: boolean;
    permContact: boolean;
    permSettings: boolean;
    promoteSuperadmin?: boolean;
    demoteSuperadmin?: boolean;
  },
) {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    throw new Error("Forbidden");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("User not found");

  const superadminCount = await prisma.user.count({
    where: { role: "superadmin" },
  });

  const planned = planUserPermissionUpdate({
    actorId: session.user.id,
    targetId: userId,
    targetRole: target.role,
    targetStatus: target.status,
    superadminCount,
    perms,
  });

  if (!planned.ok) {
    throw new Error(planned.error);
  }

  await prisma.user.update({
    where: { id: userId },
    data: planned.data,
  });

  revalidatePath("/admin/users");
}
```

- [ ] **Step 2: 타입체크**

```bash
cd /Users/chunghyo/aic_website
pnpm exec tsc --noEmit
```

Expected: exit 0 (또는 기존과 무관한 오류 없음)

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/users.ts
git commit -m "$(cat <<'EOF'
feat: updateUserPermissions에 승격·강등 플래너 연결

EOF
)"
```

---

### Task 4: `UsersTable` UI — SuperAdmin 토글 · 본인 읽기전용 · 에러

**Files:**
- Modify: `src/components/admin/UsersTable.tsx` (전체 교체 가능)

**Interfaces:**
- Consumes: `updateUserPermissions`, `approveUser`, `disableUser`
- Produces: `UsersTable({ users, currentUserId }: { users: UserRow[]; currentUserId: string })`

- [ ] **Step 1: `UsersTable` 구현**

핵심 동작:

1. `currentUserId === user.id` → 권한 칸 읽기전용 + “본인 역할은 변경할 수 없습니다.”
2. 타인: controlled/ uncontrolled 혼합 — SuperAdmin 체크는 `useState`로 행별 추적해 모듈 체크 disabled 토글
3. 제출 시:
   - `wantSuper = fd.get("isSuperadmin") === "on"` (또는 state)
   - `promoteSuperadmin: wantSuper && user.role !== "superadmin"`
   - `demoteSuperadmin: !wantSuper && user.role === "superadmin"`
4. `try/catch`로 `Error.message`를 해당 행 `errorById` state에 표시 (`text-[var(--color-cta)] text-xs`)

전체 파일:

```tsx
"use client";

import { useState, useTransition } from "react";
import {
  approveUser,
  disableUser,
  updateUserPermissions,
} from "@/lib/actions/users";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  permPeople: boolean;
  permMeetups: boolean;
  permInsights: boolean;
  permContact: boolean;
  permSettings: boolean;
};

const MODULE_FIELDS = [
  ["permPeople", "People"],
  ["permMeetups", "Meetups"],
  ["permInsights", "Insights"],
  ["permContact", "Contact"],
  ["permSettings", "Settings"],
] as const;

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [pending, start] = useTransition();
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [superById, setSuperById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.role === "superadmin"])),
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-ink-muted)]">
            <th className="py-3 pr-4 font-medium">사용자</th>
            <th className="py-3 pr-4 font-medium">상태</th>
            <th className="py-3 pr-4 font-medium">권한</th>
            <th className="py-3 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isSuper = superById[user.id] ?? user.role === "superadmin";
            const rowError = errorById[user.id];

            return (
              <tr
                key={user.id}
                className="border-b border-[var(--color-border)] align-top"
              >
                <td className="py-4 pr-4">
                  <div className="font-medium text-[var(--color-ink)]">
                    {user.name ?? "—"}
                  </div>
                  <div className="text-[var(--color-ink-muted)]">
                    {user.email}
                  </div>
                  <div className="mt-1 font-[family-name:var(--font-space-grotesk)] text-xs tracking-wide text-[var(--color-gold)]">
                    {user.role}
                  </div>
                </td>
                <td className="py-4 pr-4">{user.status}</td>
                <td className="py-4 pr-4">
                  {isSelf ? (
                    <div className="flex flex-col gap-1 text-xs text-[var(--color-ink-muted)]">
                      <span>
                        {user.role === "superadmin" ? "전체" : "모듈 권한 보유"}
                      </span>
                      <span>본인 역할은 변경할 수 없습니다.</span>
                    </div>
                  ) : (
                    <form
                      className="flex flex-col gap-2"
                      action={(fd) => {
                        start(async () => {
                          setErrorById((prev) => {
                            const next = { ...prev };
                            delete next[user.id];
                            return next;
                          });
                          const wantSuper = fd.get("isSuperadmin") === "on";
                          try {
                            await updateUserPermissions(user.id, {
                              permPeople:
                                wantSuper || fd.get("permPeople") === "on",
                              permMeetups:
                                wantSuper || fd.get("permMeetups") === "on",
                              permInsights:
                                wantSuper || fd.get("permInsights") === "on",
                              permContact:
                                wantSuper || fd.get("permContact") === "on",
                              permSettings:
                                wantSuper || fd.get("permSettings") === "on",
                              promoteSuperadmin:
                                wantSuper && user.role !== "superadmin",
                              demoteSuperadmin:
                                !wantSuper && user.role === "superadmin",
                            });
                          } catch (err) {
                            const message =
                              err instanceof Error
                                ? err.message
                                : "저장에 실패했습니다";
                            setErrorById((prev) => ({
                              ...prev,
                              [user.id]: message,
                            }));
                          }
                        });
                      }}
                    >
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <input
                          type="checkbox"
                          name="isSuperadmin"
                          checked={isSuper}
                          onChange={(e) =>
                            setSuperById((prev) => ({
                              ...prev,
                              [user.id]: e.target.checked,
                            }))
                          }
                          className="accent-[var(--color-cta)]"
                        />
                        SuperAdmin
                      </label>
                      {MODULE_FIELDS.map(([name, label]) => (
                        <label
                          key={name}
                          className="flex items-center gap-2 text-xs"
                        >
                          <input
                            type="checkbox"
                            name={name}
                            defaultChecked={isSuper ? true : user[name]}
                            disabled={isSuper}
                            className="accent-[var(--color-cta)]"
                          />
                          {label}
                        </label>
                      ))}
                      <button
                        type="submit"
                        disabled={pending}
                        className="mt-1 w-fit text-xs text-[var(--color-cta)] underline"
                      >
                        권한 저장
                      </button>
                      {rowError ? (
                        <p
                          className="text-xs text-[var(--color-cta)]"
                          role="alert"
                        >
                          {rowError}
                        </p>
                      ) : null}
                    </form>
                  )}
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-2">
                    {user.status === "pending" ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className="text-left text-xs text-[var(--color-cta)] underline"
                        onClick={() => start(() => approveUser(user.id))}
                      >
                        승인
                      </button>
                    ) : null}
                    {user.status !== "disabled" ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className="text-left text-xs text-[var(--color-ink-muted)] underline"
                        onClick={() => start(() => disableUser(user.id))}
                      >
                        비활성
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

참고: SuperAdmin 체크를 끄면 `disabled`가 풀리지만 `defaultChecked`는 마운트 시 값이라, 강등 직전 모듈을 고르려면 **체크 해제 후** 모듈을 조정한 뒤 저장하면 된다. SuperAdmin이었다가 해제하면 모듈 input이 다시 활성화된다. `key={`${user.id}-${isSuper}`}`를 모듈 그룹에 두면 토글 시 defaultChecked가 리셋된다 — 구현 시 모듈 map을 감싸는 `div`에 `key={\`${user.id}-${isSuper}\`}`를 추가한다.

- [ ] **Step 2: 모듈 그룹에 key 추가 (토글 시 체크 상태 리셋)**

`MODULE_FIELDS.map`를 감싸는 요소:

```tsx
<div key={`${user.id}-${isSuper}`} className="flex flex-col gap-2">
  {MODULE_FIELDS.map(([name, label]) => (
    // ... same labels
  ))}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/UsersTable.tsx
git commit -m "$(cat <<'EOF'
feat: UsersTable에 SuperAdmin 승격·강등 UI 추가

EOF
)"
```

---

### Task 5: Users 페이지 — `currentUserId` · 안내 문구

**Files:**
- Modify: `src/app/admin/(console)/users/page.tsx`

**Interfaces:**
- Consumes: `UsersTable`의 `currentUserId` prop
- Produces: 안내 문구에 승격/강등·최대 3·본인 불가·역할 변경 후 재로그인 안내

- [ ] **Step 1: 페이지 수정**

```tsx
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/UsersTable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/permissions";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user)) {
    redirect("/admin");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      permPeople: true,
      permMeetups: true,
      permInsights: true,
      permContact: true,
      permSettings: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">사용자·권한</h1>
        <p className="mt-2 max-w-[60ch] text-sm text-[var(--color-ink-muted)]">
          SuperAdmin(최대 3명, 최소 1명)만 접근합니다. pending 승인, 모듈
          권한, SuperAdmin 승격·강등이 가능합니다. 본인 역할은 변경할 수
          없습니다. 역할이 바뀐 사용자는 재로그인 후 권한이 반영됩니다.
        </p>
      </div>
      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  );
}
```

- [ ] **Step 2: lint**

```bash
pnpm lint
```

Expected: UsersTable / users page / user-permission-update 관련 오류 없음

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/\(console\)/users/page.tsx
git commit -m "$(cat <<'EOF'
feat: Users 페이지에 currentUserId와 SuperAdmin 안내 추가

EOF
)"
```

---

### Task 6: 수동 스모크 + 최종 검증

**Files:**
- 없음 (검증만)

**Interfaces:**
- Consumes: 로컬 Admin (`pnpm dev`), 시드 SuperAdmin

- [ ] **Step 1: 단위 테스트 재실행**

```bash
node --import tsx --test src/lib/user-permission-update.test.ts
```

Expected: PASS

- [ ] **Step 2: 수동 스모크 (로컬)**

1. SuperAdmin으로 `/admin/users` 로그인
2. 본인 행: 편집 폼 없음, 안내 문구 표시
3. operator에 SuperAdmin 체크 → 저장 → role `superadmin`, 권한 “전체” (현재 수 &lt; 3일 때)
4. SuperAdmin 체크 해제 + 모듈 일부만 체크 → 저장 → `operator` + 해당 모듈만
5. SuperAdmin 3명일 때 추가 승격 → 에러 “SuperAdmin은 최대 3명입니다”
6. SuperAdmin 1명만 남기고 강등 시도 → “최소 1명의 SuperAdmin이 필요합니다”

- [ ] **Step 3: 완료 표시**

플랜 체크박스 모두 채운 뒤 `finishing-a-development-branch`로 PR 생성 (별도 요청 시).

---

## Spec coverage (self-review)

| Spec 요구 | Task |
|---|---|
| 승격 UI + 서버 | Task 2–4 |
| 강등 + 모듈 동시 지정 | Task 2, 4 |
| 본인 변경 불가 | Task 2, 4 |
| 최대 3 / 최소 1 | Task 2 |
| 승격·강등 동시 거부 | Task 2 |
| 행 단위 에러 | Task 4 |
| 안내 문구 · currentUserId | Task 5 |
| 테스트 §8 | Task 2, 6 |
| 스키마/env/세션 무효화 비범위 | 준수 |
| feature branch + PR | Task 1, 6 |

Placeholder / 타입 일관성: `planUserPermissionUpdate` 시그니처가 Task 2·3에서 동일. 에러 문자열 스펙과 일치.
