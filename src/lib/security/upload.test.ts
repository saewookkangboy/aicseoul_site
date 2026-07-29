import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertImageUpload } from "./upload";

describe("assertImageUpload", () => {
  it("accepts jpeg under 8MB", () => {
    assert.doesNotThrow(() =>
      assertImageUpload({ type: "image/jpeg", size: 1024 }),
    );
  });

  it("rejects wrong mime", () => {
    assert.throws(
      () => assertImageUpload({ type: "application/pdf", size: 100 }),
      /이미지/,
    );
  });

  it("rejects oversize", () => {
    assert.throws(
      () => assertImageUpload({ type: "image/png", size: 9 * 1024 * 1024 }),
      /8MB/,
    );
  });
});
