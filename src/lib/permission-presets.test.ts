import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyPermissionPreset } from "./permission-presets";

describe("applyPermissionPreset", () => {
  it("content = meetups + insights only", () => {
    const p = applyPermissionPreset("content");
    assert.deepEqual(p, {
      permPeople: false,
      permMeetups: true,
      permInsights: true,
      permContact: false,
      permSettings: false,
    });
  });

  it("fullOps = all true", () => {
    const p = applyPermissionPreset("fullOps");
    assert.equal(Object.values(p).every(Boolean), true);
  });

  it("contactSettings = contact + settings", () => {
    const p = applyPermissionPreset("contactSettings");
    assert.deepEqual(p, {
      permPeople: false,
      permMeetups: false,
      permInsights: false,
      permContact: true,
      permSettings: true,
    });
  });
});
