import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planSharedSignupAccess } from "./admin-signup";

describe("planSharedSignupAccess", () => {
  it("allows open signup when invite code is not configured", () => {
    const r = planSharedSignupAccess({
      requiredInviteCode: undefined,
      providedInviteCode: undefined,
    });
    assert.equal(r.ok, true);
  });

  it("allows open signup in production when invite code is not configured", () => {
    // Prod must not fail-closed on unset ADMIN_SIGNUP_INVITE_CODE:
    // operators self-register as pending until SuperAdmin approval.
    const r = planSharedSignupAccess({
      requiredInviteCode: undefined,
      providedInviteCode: undefined,
      isProduction: true,
    });
    assert.equal(r.ok, true);
  });

  it("requires matching invite code when configured", () => {
    const ok = planSharedSignupAccess({
      requiredInviteCode: "secret",
      providedInviteCode: "secret",
    });
    assert.equal(ok.ok, true);

    const bad = planSharedSignupAccess({
      requiredInviteCode: "secret",
      providedInviteCode: "wrong",
    });
    assert.equal(bad.ok, false);
    if (!bad.ok) {
      assert.equal(bad.error, "초대 코드가 올바르지 않습니다.");
    }
  });

  it("rejects missing invite code when configured", () => {
    const r = planSharedSignupAccess({
      requiredInviteCode: "secret",
      providedInviteCode: undefined,
    });
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.error, "초대 코드가 올바르지 않습니다.");
    }
  });
});
