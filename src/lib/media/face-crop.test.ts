import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeFaceCenteredCrop } from "./face-crop";

describe("computeFaceCenteredCrop", () => {
  it("uses image center when no face", () => {
    const crop = computeFaceCenteredCrop({ width: 1200, height: 1600 }, null);
    assert.equal(crop.width / crop.height, 0.75);
    assert.equal(crop.x, 0);
    assert.equal(crop.y, 0);
    assert.equal(crop.width, 1200);
    assert.equal(crop.height, 1600);
  });

  it("height-limits wide images to 3:4", () => {
    const crop = computeFaceCenteredCrop({ width: 2000, height: 1000 }, null);
    assert.equal(crop.height, 1000);
    assert.equal(crop.width, 750);
    assert.equal(crop.x, Math.round((2000 - 750) / 2));
    assert.equal(crop.y, 0);
  });

  it("centers on face and clamps to bounds", () => {
    const crop = computeFaceCenteredCrop(
      { width: 1000, height: 1000 },
      { x: 900, y: 50, width: 80, height: 80 },
    );
    assert.equal(crop.width, 750);
    assert.equal(crop.height, 1000);
    assert.equal(crop.x, 250); // clamped: cannot exceed 1000-750
    assert.equal(crop.y, 0);
  });

  it("returns zero rect for invalid image", () => {
    const crop = computeFaceCenteredCrop({ width: 0, height: 100 });
    assert.deepEqual(crop, { x: 0, y: 0, width: 0, height: 0 });
  });
});
