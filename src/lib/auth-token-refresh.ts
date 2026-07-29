import type { SessionUser } from "@/lib/permissions";

/** Re-read permissions from DB at most this often (ms). */
export const JWT_PERM_REFRESH_MS = 60_000;

type TokenPerms = {
  permsCheckedAt?: unknown;
};

export function shouldRefreshJwtPerms(
  token: TokenPerms,
  now = Date.now(),
): boolean {
  const last = Number(token.permsCheckedAt ?? 0);
  if (!Number.isFinite(last) || last <= 0) return true;
  return now - last >= JWT_PERM_REFRESH_MS;
}

export function sessionFieldsFromUser(user: SessionUser, now = Date.now()) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    permPeople: user.permPeople,
    permMeetups: user.permMeetups,
    permInsights: user.permInsights,
    permContact: user.permContact,
    permSettings: user.permSettings,
    permsCheckedAt: now,
  };
}
