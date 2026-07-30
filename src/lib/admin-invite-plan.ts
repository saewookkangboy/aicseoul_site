import type { ModulePerms } from "@/lib/user-permission-update";

export type InviteStatus = "pending" | "accepted" | "cancelled" | "expired";
export type InviteRole = "superadmin" | "operator";

export function canCreateSuperadminInvite(
  superadminUsers: number,
  pendingSuperInvites: number,
): boolean {
  return superadminUsers + pendingSuperInvites < 3;
}

/** Seat check when consuming a pending superadmin invite (pending drops by one). */
export function planSuperadminSeatOnAccept(superadminUsers: number):
  | { ok: true }
  | { ok: false; error: string } {
  if (!canCreateSuperadminInvite(superadminUsers, 0)) {
    return { ok: false, error: "SuperAdmin은 최대 3명입니다." };
  }
  return { ok: true };
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
