export type PlanResult<T> = { ok: true } & T | { ok: false; error: string };

export function planChangePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): PlanResult<{ newPassword: string }> {
  if (!input.currentPassword) {
    return { ok: false, error: "현재 비밀번호를 입력해 주세요." };
  }
  if (input.newPassword.length < 8 || input.newPassword.length > 128) {
    return { ok: false, error: "새 비밀번호는 8자 이상이어야 합니다." };
  }
  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "새 비밀번호 확인이 일치하지 않습니다." };
  }
  return { ok: true, newPassword: input.newPassword };
}

export function planUpdateAccountName(input: {
  name: string;
}): PlanResult<{ name: string }> {
  const name = input.name.trim();
  if (!name || name.length > 80) {
    return { ok: false, error: "이름을 확인해 주세요." };
  }
  return { ok: true, name };
}

export function planLinkUserMember(input: {
  userId: string;
  memberId: string;
  existingOwnerUserId: string | null;
}): PlanResult<{ linked: true }> {
  if (
    input.existingOwnerUserId &&
    input.existingOwnerUserId !== input.userId
  ) {
    return {
      ok: false,
      error: "이미 다른 계정에 연결된 멤버입니다.",
    };
  }
  if (!input.memberId.trim()) {
    return { ok: false, error: "멤버를 선택해 주세요." };
  }
  return { ok: true, linked: true };
}

export function planUnlinkUserMember(input: {
  userId: string;
  currentMemberId: string | null;
}): PlanResult<{ unlinked: true }> {
  if (!input.currentMemberId) {
    return { ok: false, error: "연결된 멤버가 없습니다." };
  }
  return { ok: true, unlinked: true };
}

export function assertLinkedMemberOwnership(input: {
  sessionUserId: string;
  userMemberId: string | null;
}): PlanResult<{ memberId: string }> {
  if (!input.userMemberId) {
    return {
      ok: false,
      error: "People 프로필이 연결되지 않았습니다. SuperAdmin에게 문의해 주세요.",
    };
  }
  return { ok: true, memberId: input.userMemberId };
}
