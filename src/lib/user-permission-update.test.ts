// src/lib/user-permission-update.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planUserPermissionUpdate } from "./user-permission-update";

const basePerms = {
  permPeople: true,
  permMeetups: false,
  permInsights: false,
  permContact: false,
  permSettings: false,
};

describe("planUserPermissionUpdate", () => {
  it("rejects changing own account", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "a1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "본인 역할은 변경할 수 없습니다");
    }
  });

  it("rejects promote and demote together", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: {
        ...basePerms,
        promoteSuperadmin: true,
        demoteSuperadmin: true,
      },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "잘못된 요청");
  });

  it("promotes operator when under cap", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "pending",
      superadminCount: 2,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "superadmin");
      assert.equal(result.data.status, "active");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, true);
      assert.equal(result.data.permContact, true);
      assert.equal(result.data.permSettings, true);
    }
  });

  it("rejects promote when already 3 superadmins", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 3,
      perms: { ...basePerms, promoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "SuperAdmin은 최대 3명입니다");
    }
  });

  it("demotes superadmin with submitted module perms", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 2,
      perms: {
        permPeople: true,
        permMeetups: true,
        permInsights: false,
        permContact: false,
        permSettings: false,
        demoteSuperadmin: true,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "operator");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, false);
      assert.equal(result.data.permContact, false);
      assert.equal(result.data.permSettings, false);
    }
  });

  it("rejects demote when last superadmin", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 1,
      perms: { ...basePerms, demoteSuperadmin: true },
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "최소 1명의 SuperAdmin이 필요합니다");
    }
  });

  it("updates operator module perms without role change", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "operator",
      targetStatus: "active",
      superadminCount: 1,
      perms: {
        permPeople: false,
        permMeetups: true,
        permInsights: true,
        permContact: false,
        permSettings: false,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "operator");
      assert.equal(result.data.permMeetups, true);
      assert.equal(result.data.permInsights, true);
      assert.equal(result.data.permPeople, false);
    }
  });

  it("keeps all perms true when superadmin stays superadmin", () => {
    const result = planUserPermissionUpdate({
      actorId: "a1",
      targetId: "t1",
      targetRole: "superadmin",
      targetStatus: "active",
      superadminCount: 2,
      perms: {
        permPeople: false,
        permMeetups: false,
        permInsights: false,
        permContact: false,
        permSettings: false,
      },
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.role, "superadmin");
      assert.equal(result.data.permPeople, true);
      assert.equal(result.data.permSettings, true);
    }
  });
});
