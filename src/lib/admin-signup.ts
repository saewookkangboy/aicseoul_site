/** When set, signup requires matching invite code (anti open-registration). */
export function getAdminSignupInviteCode(): string | undefined {
  const raw = process.env.ADMIN_SIGNUP_INVITE_CODE?.trim();
  return raw || undefined;
}

export type SharedSignupAccessResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Shared-code / open-pending signup gate (email `?token=` invites bypass this).
 *
 * - Invite code unset → open signup allowed (caller creates pending operators).
 * - Invite code set → provided code must match.
 * - Production does not fail-closed when the code is unset; SuperAdmin approval
 *   remains the access control for operators.
 */
export function planSharedSignupAccess(args: {
  requiredInviteCode: string | undefined;
  providedInviteCode: string | undefined;
  /** Reserved for callers/tests; does not disable open signup when unset. */
  isProduction?: boolean;
}): SharedSignupAccessResult {
  void args.isProduction;
  if (!args.requiredInviteCode) {
    return { ok: true };
  }
  if (args.providedInviteCode !== args.requiredInviteCode) {
    return { ok: false, error: "초대 코드가 올바르지 않습니다." };
  }
  return { ok: true };
}
