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
