import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertImageUpload, MAX_UPLOAD_BYTES } from "./upload";

describe("assertImageUpload", () => {
  it("accepts jpeg under 5MB", () => {
    assert.doesNotThrow(() =>
      assertImageUpload({ type: "image/jpeg", size: 1024 }),
    );
  });

  it("accepts png at exactly 5MB", () => {
    assert.doesNotThrow(() =>
      assertImageUpload({ type: "image/png", size: MAX_UPLOAD_BYTES }),
    );
  });

  it("rejects webp", () => {
    assert.throws(
      () => assertImageUpload({ type: "image/webp", size: 100 }),
      /JPG 또는 PNG/,
    );
  });

  it("rejects gif", () => {
    assert.throws(
      () => assertImageUpload({ type: "image/gif", size: 100 }),
      /JPG 또는 PNG/,
    );
  });

  it("rejects wrong mime", () => {
    assert.throws(
      () => assertImageUpload({ type: "application/pdf", size: 100 }),
      /JPG 또는 PNG/,
    );
  });

  it("rejects oversize", () => {
    assert.throws(
      () =>
        assertImageUpload({
          type: "image/png",
          size: MAX_UPLOAD_BYTES + 1,
        }),
      /5MB/,
    );
  });
});
