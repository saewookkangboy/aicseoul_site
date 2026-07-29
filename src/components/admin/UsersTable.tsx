"use client";

import { useState, useTransition } from "react";
import {
  approveUser,
  disableUser,
  updateUserPermissions,
} from "@/lib/actions/users";
import {
  AdminBadge,
  btnDangerGhostClass,
  btnGhostClass,
  tableClass,
  tableWrapClass,
  tdClass,
  thClass,
} from "@/components/admin/ui";

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

            return (
              <tr key={user.id} className="align-top">
                <td className={tdClass}>
                  <div className="font-medium text-[var(--color-ink)]">
                    {user.name ?? "이름 없음"}
                  </div>
                  <div className="text-[var(--color-ink-muted)]">
                    {user.email}
                  </div>
                  <div className="mt-2">
                    <AdminBadge tone="gold">{user.role}</AdminBadge>
                  </div>
                </td>
                <td className={tdClass}>
                  <AdminBadge tone={statusTone(user.status)}>
                    {user.status}
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
                      <div
                        key={`${user.id}-${isSuper}`}
                        className="flex flex-col gap-2"
                      >
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
                      </div>
                      <button
                        type="submit"
                        disabled={pending}
                        className={`${btnGhostClass} mt-1 w-fit text-xs text-[var(--color-cta)]`}
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
                <td className={tdClass}>
                  <div className="flex flex-col gap-2">
                    {user.status === "pending" ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className="text-left text-xs font-medium text-[var(--color-cta)]"
                        onClick={() => start(() => approveUser(user.id))}
                      >
                        승인
                      </button>
                    ) : null}
                    {user.status !== "disabled" ? (
                      <button
                        type="button"
                        disabled={pending || isSelf}
                        className={`${btnDangerGhostClass} text-left text-xs`}
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
