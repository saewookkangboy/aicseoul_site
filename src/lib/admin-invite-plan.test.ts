import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canCreateSuperadminInvite,
  planExpireInvite,
  planAcceptInvite,
  planSuperadminSeatOnAccept,
} from "./admin-invite-plan";
import { hashInviteToken } from "./admin-invite-token";

describe("planSuperadminSeatOnAccept", () => {
  it("allows when fewer than 3 superadmin users", () => {
    assert.equal(planSuperadminSeatOnAccept(2).ok, true);
  });
  it("blocks at 3 superadmin users", () => {
    const r = planSuperadminSeatOnAccept(3);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.error, "SuperAdmin은 최대 3명입니다.");
    }
  });
});

describe("canCreateSuperadminInvite", () => {
  it("allows when users+pending < 3", () => {
    assert.equal(canCreateSuperadminInvite(1, 1), true);
  });
  it("blocks at 3", () => {
    assert.equal(canCreateSuperadminInvite(2, 1), false);
    assert.equal(canCreateSuperadminInvite(3, 0), false);
  });
});

describe("planExpireInvite", () => {
  it("marks pending past expiresAt", () => {
    const r = planExpireInvite(
      "pending",
      new Date("2020-01-01"),
      new Date("2020-01-02"),
    );
    assert.equal(r.expire, true);
  });
  it("does not expire accepted", () => {
    const r = planExpireInvite(
      "accepted",
      new Date("2020-01-01"),
      new Date("2020-01-02"),
    );
    assert.equal(r.expire, false);
  });
});

describe("planAcceptInvite", () => {
  const base = {
    inviteStatus: "pending" as const,
    inviteEmail: "a@example.com",
    inviteRole: "operator" as const,
    expiresAt: new Date("2099-01-01"),
    now: new Date("2026-07-30"),
    signupEmail: "a@example.com",
    permsOnInvite: {
      permPeople: true,
      permMeetups: false,
      permInsights: true,
      permContact: false,
      permSettings: false,
    },
  };

  it("operator → pending + all perms false", () => {
    const r = planAcceptInvite(base);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.user.role, "operator");
      assert.equal(r.user.status, "pending");
      assert.equal(r.user.permPeople, false);
      assert.equal(r.inviteUpdate.status, "accepted");
    }
  });

  it("superadmin → active + all perms true", () => {
    const r = planAcceptInvite({ ...base, inviteRole: "superadmin" });
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.user.role, "superadmin");
      assert.equal(r.user.status, "active");
      assert.equal(r.user.permPeople, true);
    }
  });

  it("rejects email mismatch", () => {
    const r = planAcceptInvite({ ...base, signupEmail: "b@example.com" });
    assert.equal(r.ok, false);
  });

  it("rejects cancelled", () => {
    const r = planAcceptInvite({ ...base, inviteStatus: "cancelled" });
    assert.equal(r.ok, false);
  });
});

describe("hashInviteToken", () => {
  it("is stable hex", () => {
    const h = hashInviteToken("abc");
    assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(h, hashInviteToken("abc"));
  });
});
