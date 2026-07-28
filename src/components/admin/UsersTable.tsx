"use client";

import { useTransition } from "react";
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

export function UsersTable({ users }: { users: UserRow[] }) {
  const [pending, start] = useTransition();

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
          {users.map((user) => (
            <tr key={user.id} className="align-top">
              <td className={tdClass}>
                <div className="font-medium text-[var(--color-ink)]">
                  {user.name ?? "이름 없음"}
                </div>
                <div className="text-[var(--color-ink-muted)]">{user.email}</div>
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
                {user.role === "superadmin" ? (
                  <span className="text-[var(--color-ink-muted)]">전체</span>
                ) : (
                  <form
                    className="flex flex-col gap-2"
                    action={(fd) => {
                      start(async () => {
                        await updateUserPermissions(user.id, {
                          permPeople: fd.get("permPeople") === "on",
                          permMeetups: fd.get("permMeetups") === "on",
                          permInsights: fd.get("permInsights") === "on",
                          permContact: fd.get("permContact") === "on",
                          permSettings: fd.get("permSettings") === "on",
                        });
                      });
                    }}
                  >
                    {(
                      [
                        ["permPeople", "People"],
                        ["permMeetups", "Meetups"],
                        ["permInsights", "Insights"],
                        ["permContact", "Contact"],
                        ["permSettings", "Settings"],
                      ] as const
                    ).map(([name, label]) => (
                      <label key={name} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          name={name}
                          defaultChecked={user[name]}
                          className="accent-[var(--color-cta)]"
                        />
                        {label}
                      </label>
                    ))}
                    <button
                      type="submit"
                      disabled={pending}
                      className={`${btnGhostClass} mt-1 w-fit text-xs text-[var(--color-cta)]`}
                    >
                      권한 저장
                    </button>
                  </form>
                )}
              </td>
              <td className={tdClass}>
                <div className="flex flex-col gap-2">
                  {user.status === "pending" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-xs font-medium text-[var(--color-cta)]"
                      onClick={() => start(() => approveUser(user.id))}
                    >
                      승인
                    </button>
                  ) : null}
                  {user.status !== "disabled" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className={`${btnDangerGhostClass} text-left text-xs`}
                      onClick={() => start(() => disableUser(user.id))}
                    >
                      비활성
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
