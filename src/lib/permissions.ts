import type { User, UserRole, UserStatus } from "@prisma/client";

export type PermissionModule =
  | "people"
  | "meetups"
  | "insights"
  | "contact"
  | "settings"
  | "users";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  permPeople: boolean;
  permMeetups: boolean;
  permInsights: boolean;
  permContact: boolean;
  permSettings: boolean;
};

export function toSessionUser(user: User): SessionUser {
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
  };
}

export function isSuperAdmin(user: Pick<SessionUser, "role">): boolean {
  return user.role === "superadmin";
}

export function canAccessModule(
  user: SessionUser,
  module: PermissionModule,
): boolean {
  if (user.status !== "active") return false;
  if (isSuperAdmin(user)) return true;

  switch (module) {
    case "people":
      return user.permPeople;
    case "meetups":
      return user.permMeetups;
    case "insights":
      return user.permInsights;
    case "contact":
      return user.permContact;
    case "settings":
      return user.permSettings;
    case "users":
      return false;
    default: {
      const _exhaustive: never = module;
      return _exhaustive;
    }
  }
}

export function parseSuperAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);
}
