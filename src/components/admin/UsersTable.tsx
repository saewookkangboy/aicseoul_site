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
