/** When set, signup requires matching invite code (anti open-registration). */
export function getAdminSignupInviteCode(): string | undefined {
  const raw = process.env.ADMIN_SIGNUP_INVITE_CODE?.trim();
  return raw || undefined;
}
