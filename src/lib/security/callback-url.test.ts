import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeAdminCallbackUrl } from "./callback-url";

describe("safeAdminCallbackUrl", () => {
  it("keeps relative admin paths", () => {
    assert.equal(safeAdminCallbackUrl("/admin"), "/admin");
    assert.equal(safeAdminCallbackUrl("/admin/people"), "/admin/people");
  });

  it("rejects open redirects", () => {
    assert.equal(safeAdminCallbackUrl("https://evil.example"), "/admin");
    assert.equal(safeAdminCallbackUrl("//evil.example"), "/admin");
    assert.equal(safeAdminCallbackUrl("/login"), "/admin");
    assert.equal(safeAdminCallbackUrl(null), "/admin");
  });
});
