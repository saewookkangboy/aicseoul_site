// src/lib/seo/json-ld.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { articleJsonLd } from "./json-ld";

describe("articleJsonLd", () => {
  it("preserves absolute image URLs unchanged", () => {
    const cloudinaryUrl = "https://res.cloudinary.com/demo/image.jpg";
    const ld = articleJsonLd({
      title: "Test Article",
      description: "Test description",
      path: "/insights/test",
      image: cloudinaryUrl,
    });
    assert.equal(ld.image, cloudinaryUrl);
  });
});
