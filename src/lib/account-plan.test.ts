import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertLinkedMemberOwnership,
  planChangePassword,
  planLinkUserMember,
  planUnlinkUserMember,
  planUpdateAccountName,
} from "./account-plan";

describe("planChangePassword", () => {
  it("rejects short new password", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "short",
      confirmPassword: "short",
    });
    assert.equal(r.ok, false);
  });

  it("rejects confirm mismatch", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-99",
    });
    assert.equal(r.ok, false);
  });

  it("rejects empty current", () => {
    const r = planChangePassword({
      currentPassword: "",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-12",
    });
    assert.equal(r.ok, false);
  });

  it("accepts valid shape (hash verify is action-layer)", () => {
    const r = planChangePassword({
      currentPassword: "old-pass-1",
      newPassword: "new-pass-12",
      confirmPassword: "new-pass-12",
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.newPassword, "new-pass-12");
  });
});

describe("planUpdateAccountName", () => {
  it("trims and rejects empty", () => {
    assert.equal(planUpdateAccountName({ name: "   " }).ok, false);
  });

  it("accepts 1–80 chars", () => {
    const r = planUpdateAccountName({ name: "  홍길동  " });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.name, "홍길동");
  });
});

describe("planLinkUserMember", () => {
  it("rejects when member already linked to another user", () => {
    const r = planLinkUserMember({
      userId: "u1",
      memberId: "m1",
      existingOwnerUserId: "u2",
    });
    assert.equal(r.ok, false);
  });

  it("allows when unlinked or same user", () => {
    assert.equal(
      planLinkUserMember({
        userId: "u1",
        memberId: "m1",
        existingOwnerUserId: null,
      }).ok,
      true,
    );
    assert.equal(
      planLinkUserMember({
        userId: "u1",
        memberId: "m1",
        existingOwnerUserId: "u1",
      }).ok,
      true,
    );
  });
});

describe("planUnlinkUserMember", () => {
  it("rejects when already unlinked", () => {
    assert.equal(
      planUnlinkUserMember({ userId: "u1", currentMemberId: null }).ok,
      false,
    );
  });
});

describe("assertLinkedMemberOwnership", () => {
  it("rejects null memberId", () => {
    assert.equal(
      assertLinkedMemberOwnership({
        sessionUserId: "u1",
        userMemberId: null,
      }).ok,
      false,
    );
  });

  it("returns memberId when linked", () => {
    const r = assertLinkedMemberOwnership({
      sessionUserId: "u1",
      userMemberId: "m1",
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.memberId, "m1");
  });
});
