"use client";

import { useTransition } from "react";
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

export function UsersTable({ users }: { users: UserRow[] }) {
  const [pending, start] = useTransition();

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
          {users.map((user) => (
            <tr key={user.id} className="border-b border-[var(--color-border)] align-top">
              <td className="py-4 pr-4">
                <div className="font-medium text-[var(--color-ink)]">
                  {user.name ?? "—"}
                </div>
                <div className="text-[var(--color-ink-muted)]">{user.email}</div>
                <div className="mt-1 font-[family-name:var(--font-space-grotesk)] text-xs tracking-wide text-[var(--color-gold)]">
                  {user.role}
                </div>
              </td>
              <td className="py-4 pr-4">{user.status}</td>
              <td className="py-4 pr-4">
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
                      className="mt-1 w-fit text-xs text-[var(--color-cta)] underline"
                    >
                      권한 저장
                    </button>
                  </form>
                )}
              </td>
              <td className="py-4">
                <div className="flex flex-col gap-2">
                  {user.status === "pending" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-xs text-[var(--color-cta)] underline"
                      onClick={() => start(() => approveUser(user.id))}
                    >
                      승인
                    </button>
                  ) : null}
                  {user.status !== "disabled" ? (
                    <button
                      type="button"
                      disabled={pending}
                      className="text-left text-xs text-[var(--color-ink-muted)] underline"
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
