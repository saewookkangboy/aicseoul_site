import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  checkRateLimit,
  getRateLimitStoreSizeForTests,
  resetRateLimitStoreForTests,
} from "./rate-limit";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStoreForTests();
  });

  it("allows up to limit within window", () => {
    for (let i = 0; i < 3; i++) {
      assert.equal(checkRateLimit("t:a", 3, 60_000).ok, true);
    }
    assert.equal(checkRateLimit("t:a", 3, 60_000).ok, false);
  });

  it("isolates keys", () => {
    assert.equal(checkRateLimit("t:a", 1, 60_000).ok, true);
    assert.equal(checkRateLimit("t:b", 1, 60_000).ok, true);
    assert.equal(checkRateLimit("t:a", 1, 60_000).ok, false);
  });

  it("prunes expired buckets instead of retaining stale Map entries", async () => {
    const windowMs = 5;
    assert.equal(checkRateLimit("expire:a", 2, windowMs).ok, true);
    assert.equal(getRateLimitStoreSizeForTests(), 1);

    await sleep(windowMs + 5);

    assert.equal(checkRateLimit("expire:a", 2, windowMs).ok, true);
    assert.equal(getRateLimitStoreSizeForTests(), 1);

    assert.equal(checkRateLimit("expire:b", 1, windowMs).ok, true);
    assert.equal(getRateLimitStoreSizeForTests(), 2);

    await sleep(windowMs + 5);

    assert.equal(checkRateLimit("expire:a", 2, windowMs).ok, true);
    assert.equal(checkRateLimit("expire:b", 1, windowMs).ok, true);
    assert.equal(getRateLimitStoreSizeForTests(), 2);
  });
});
