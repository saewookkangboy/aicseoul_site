import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  JWT_PERM_REFRESH_MS,
  shouldRefreshJwtPerms,
  sessionFieldsFromUser,
} from "./auth-token-refresh";
import type { SessionUser } from "./permissions";

const sample: SessionUser = {
  id: "u1",
  email: "a@b.co",
  name: "A",
  role: "operator",
  status: "active",
  permPeople: true,
  permMeetups: false,
  permInsights: false,
  permContact: false,
  permSettings: false,
};

describe("shouldRefreshJwtPerms", () => {
  it("refreshes when never checked", () => {
    assert.equal(shouldRefreshJwtPerms({}), true);
  });

  it("skips inside window", () => {
    const now = 1_000_000;
    assert.equal(
      shouldRefreshJwtPerms({ permsCheckedAt: now - 1_000 }, now),
      false,
    );
  });

  it("refreshes after window", () => {
    const now = 1_000_000;
    assert.equal(
      shouldRefreshJwtPerms(
        { permsCheckedAt: now - JWT_PERM_REFRESH_MS },
        now,
      ),
      true,
    );
  });
});

describe("sessionFieldsFromUser", () => {
  it("copies perms and stamps checkedAt", () => {
    const now = 42;
    const fields = sessionFieldsFromUser(sample, now);
    assert.equal(fields.permPeople, true);
    assert.equal(fields.permMeetups, false);
    assert.equal(fields.permsCheckedAt, now);
  });
});
