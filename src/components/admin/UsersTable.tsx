"use client";

import { useState, useTransition } from "react";
import {
  approveUser,
  approveUserWithInvitePermissions,
  disableUser,
  linkUserMember,
  unlinkUserMember,
  updateUserPermissions,
} from "@/lib/actions/users";
import {
  applyPermissionPreset,
  type PermissionPresetId,
} from "@/lib/permission-presets";
import type { ModulePerms } from "@/lib/user-permission-update";
import {
  AdminBadge,
  btnDangerGhostClass,
  btnGhostClass,
  btnSecondaryClass,
  errorTextClass,
  fieldClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";

type MemberOption = {
  id: string;
  nameKr: string;
  nameEn: string;
};

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  memberId: string | null;
  member?: MemberOption | null;
  permPeople: boolean;
  permMeetups: boolean;
  permInsights: boolean;
  permContact: boolean;
  permSettings: boolean;
  invitePerms?: ModulePerms | null;
};

const MODULE_FIELDS = [
  ["permPeople", "멤버"],
  ["permMeetups", "밋업"],
  ["permInsights", "인사이트"],
  ["permContact", "문의"],
  ["permSettings", "설정"],
] as const satisfies ReadonlyArray<[keyof ModulePerms, string]>;

const PRESET_BUTTONS = [
  { id: "content" as const, label: "콘텐츠만" },
  { id: "fullOps" as const, label: "전체 운영" },
  { id: "contactSettings" as const, label: "문의·설정" },
] satisfies ReadonlyArray<{ id: PermissionPresetId; label: string }>;

const actionBtnClass =
  "inline-flex min-h-10 items-center justify-start rounded-lg px-2 text-left text-sm font-medium outline-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-gold)_28%,transparent)]";

const presetBtnClass = `${btnSecondaryClass} min-h-8 px-3 py-1.5 text-xs`;

function userModulePerms(user: UserRow): ModulePerms {
  return {
    permPeople: user.permPeople,
    permMeetups: user.permMeetups,
    permInsights: user.permInsights,
    permContact: user.permContact,
    permSettings: user.permSettings,
  };
}

function statusTone(status: string) {
  switch (status) {
    case "pending":
      return "warn" as const;
    case "active":
      return "success" as const;
    case "disabled":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "대기";
    case "active":
      return "활성";
    case "disabled":
      return "비활성";
    default:
      return status;
  }
}

function roleLabel(role: string) {
  switch (role) {
    case "superadmin":
      return "슈퍼관리자";
    case "operator":
      return "운영자";
    default:
      return role;
  }
}

export function UsersTable({
  users,
  currentUserId,
  members,
  linkedMemberIds,
}: {
  users: UserRow[];
  currentUserId: string;
  members: MemberOption[];
  linkedMemberIds: string[];
}) {
  const [pending, start] = useTransition();
  const [errorById, setErrorById] = useState<Record<string, string>>({});
  const [confirmDisableId, setConfirmDisableId] = useState<string | null>(null);
  const [selectedMemberById, setSelectedMemberById] = useState<
    Record<string, string>
  >({});
  const [superById, setSuperById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.role === "superadmin"])),
  );
  const [permsById, setPermsById] = useState<Record<string, ModulePerms>>(() =>
    Object.fromEntries(users.map((u) => [u.id, userModulePerms(u)])),
  );

  const clearRowError = (userId: string) => {
    setErrorById((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const setRowError = (userId: string, message: string) => {
    setErrorById((prev) => ({ ...prev, [userId]: message }));
  };

  return (
    <div className={tableWrapClass}>
      <table className={`${tableClass} min-w-[720px]`}>
        <thead>
          <tr>
            <th className={thClass}>사용자</th>
            <th className={thClass}>상태</th>
            <th className={thClass}>권한</th>
            <th className={thClass}>액션</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const isSuper = superById[user.id] ?? user.role === "superadmin";
            const rowError = errorById[user.id];
            const confirmingDisable = confirmDisableId === user.id;
            const rowPerms = permsById[user.id] ?? userModulePerms(user);

            return (
              <tr id={`user-${user.id}`} key={user.id} className="align-top">
                <td className={tdClass}>
                  <div className="font-medium text-[var(--color-ink)]">
                    {user.name ?? "이름 없음"}
                  </div>
                  <div className="text-[var(--color-ink-muted)]">
                    {user.email}
                  </div>
                  <div className="mt-2">
                    <AdminBadge tone="gold">{roleLabel(user.role)}</AdminBadge>
                  </div>
                  <div className="mt-3 flex flex-col gap-1.5">
                    {user.memberId && user.member ? (
                      <>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          People: {user.member.nameKr}
                        </p>
                        <button
                          type="button"
                          disabled={pending}
                          className={`${btnDangerGhostClass} ${actionBtnClass} w-fit`}
                          onClick={() =>
                            start(async () => {
                              clearRowError(user.id);
                              try {
                                await unlinkUserMember(user.id);
                              } catch (err) {
                                const message =
                                  err instanceof Error
                                    ? err.message
                                    : "연결 해제에 실패했습니다. 다시 시도해 주세요.";
                                setRowError(user.id, message);
                              }
                            })
                          }
                        >
                          연결 해제
                        </button>
                      </>
                    ) : (
                      <>
                        <select
                          value={selectedMemberById[user.id] ?? ""}
                          disabled={pending}
                          className={`${fieldClass} py-1.5 text-xs`}
                          onChange={(e) =>
                            setSelectedMemberById((prev) => ({
                              ...prev,
                              [user.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">멤버 선택</option>
                          {members
                            .filter(
                              (m) =>
                                !linkedMemberIds.includes(m.id) ||
                                m.id === user.memberId,
                            )
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nameKr}
                                {m.nameEn ? ` (${m.nameEn})` : ""}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          disabled={
                            pending || !(selectedMemberById[user.id] ?? "")
                          }
                          className={`${btnGhostClass} ${actionBtnClass} w-fit text-[var(--color-cta)]`}
                          onClick={() => {
                            const memberId = selectedMemberById[user.id] ?? "";
                            if (!memberId) return;
                            start(async () => {
                              clearRowError(user.id);
                              try {
                                await linkUserMember(user.id, memberId);
                              } catch (err) {
                                const message =
                                  err instanceof Error
                                    ? err.message
                                    : "연결에 실패했습니다. 다시 시도해 주세요.";
                                setRowError(user.id, message);
                              }
                            });
                          }}
                        >
                          연결
                        </button>
                      </>
                    )}
                    {isSelf && rowError ? (
                      <p className={`text-xs ${errorTextClass}`} role="alert">
                        {rowError}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className={tdClass}>
                  <AdminBadge tone={statusTone(user.status)}>
                    {statusLabel(user.status)}
                  </AdminBadge>
                </td>
                <td className={tdClass}>
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
                          clearRowError(user.id);
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
                                : "저장에 실패했습니다. 다시 시도해 주세요.";
                            setRowError(user.id, message);
                          }
                        });
                      }}
                    >
                      <label className="flex min-h-10 items-center gap-2 text-xs font-medium">
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
                          className="size-4 accent-[var(--color-cta)]"
                        />
                        슈퍼관리자
                      </label>
                      {!isSuper ? (
                        <div className="flex flex-wrap gap-1">
                          {PRESET_BUTTONS.map(({ id, label }) => (
                            <button
                              key={id}
                              type="button"
                              disabled={pending}
                              className={presetBtnClass}
                              onClick={() =>
                                setPermsById((prev) => ({
                                  ...prev,
                                  [user.id]: applyPermissionPreset(id),
                                }))
                              }
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-1">
                        {MODULE_FIELDS.map(([name, label]) => (
                          <label
                            key={name}
                            className="flex min-h-10 items-center gap-2 text-xs"
                          >
                            <input
                              type="checkbox"
                              name={name}
                              checked={isSuper ? true : rowPerms[name]}
                              disabled={isSuper}
                              onChange={(e) =>
                                setPermsById((prev) => ({
                                  ...prev,
                                  [user.id]: {
                                    ...rowPerms,
                                    [name]: e.target.checked,
                                  },
                                }))
                              }
                              className="size-4 accent-[var(--color-cta)]"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                      <button
                        type="submit"
                        disabled={pending}
                        className={`${btnGhostClass} ${actionBtnClass} mt-1 w-fit text-[var(--color-cta)]`}
                      >
                        권한 저장
                      </button>
                      {rowError ? (
                        <p className={`text-xs ${errorTextClass}`} role="alert">
                          {rowError}
                        </p>
                      ) : null}
                    </form>
                  )}
                </td>
                <td className={tdClass}>
                  <div className="flex flex-col gap-1">
                    {user.status === "pending" && user.invitePerms ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className={`${actionBtnClass} text-[var(--color-cta)]`}
                        onClick={() =>
                          start(async () => {
                            clearRowError(user.id);
                            try {
                              await approveUserWithInvitePermissions(user.id);
                            } catch (err) {
                              const message =
                                err instanceof Error
                                  ? err.message
                                  : "승인에 실패했습니다. 다시 시도해 주세요.";
                              setRowError(user.id, message);
                            }
                          })
                        }
                      >
                        초대 권한으로 승인
                      </button>
                    ) : null}
                    {user.status === "pending" && !user.invitePerms ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className={`${actionBtnClass} text-[var(--color-cta)]`}
                        onClick={() =>
                          start(async () => {
                            clearRowError(user.id);
                            try {
                              await approveUser(user.id);
                            } catch (err) {
                              const message =
                                err instanceof Error
                                  ? err.message
                                  : "승인에 실패했습니다. 다시 시도해 주세요.";
                              setRowError(user.id, message);
                            }
                          })
                        }
                      >
                        승인
                      </button>
                    ) : null}
                    {user.status !== "disabled" ? (
                      confirmingDisable ? (
                        <div className="flex flex-col gap-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-cream)]/50 p-2">
                          <p className="text-xs text-[var(--color-ink)]">
                            이 계정을 비활성할까요?
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              disabled={pending || isSelf}
                              className={`${actionBtnClass} text-[var(--color-danger)]`}
                              onClick={() => {
                                start(async () => {
                                  await disableUser(user.id);
                                  setConfirmDisableId(null);
                                });
                              }}
                            >
                              비활성 확인
                            </button>
                            <button
                              type="button"
                              className={`${btnDangerGhostClass} ${actionBtnClass}`}
                              onClick={() => setConfirmDisableId(null)}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={pending || isSelf}
                          className={`${btnDangerGhostClass} ${actionBtnClass}`}
                          onClick={() => setConfirmDisableId(user.id)}
                        >
                          비활성
                        </button>
                      )
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
