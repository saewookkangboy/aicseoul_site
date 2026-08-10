import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAllowedMediaUrl, sanitizeUploadFolder } from "./media-url";

describe("isAllowedMediaUrl", () => {
  it("allows Cloudinary HTTPS URLs", () => {
    assert.equal(
      isAllowedMediaUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/aic-seoul/people/x.webp",
      ),
      true,
    );
  });

  it("allows local uploads and placeholders", () => {
    assert.equal(isAllowedMediaUrl("/uploads/2026/people/ab-image.webp"), true);
    assert.equal(isAllowedMediaUrl("/placeholders/p1.jpg"), true);
  });

  it("rejects external hosts and path traversal", () => {
    assert.equal(isAllowedMediaUrl("https://evil.example/x.jpg"), false);
    assert.equal(isAllowedMediaUrl("/uploads/../secret"), false);
    assert.equal(isAllowedMediaUrl("javascript:alert(1)"), false);
    assert.equal(isAllowedMediaUrl("//res.cloudinary.com/x"), false);
  });
});

describe("sanitizeUploadFolder", () => {
  it("keeps safe folder names", () => {
    assert.equal(sanitizeUploadFolder("people"), "people");
    assert.equal(sanitizeUploadFolder("archive_2026"), "archive_2026");
  });

  it("strips traversal and unsafe characters", () => {
    assert.equal(sanitizeUploadFolder("../../etc"), "etc");
    assert.equal(sanitizeUploadFolder("people/../x"), "peoplex");
    assert.equal(sanitizeUploadFolder(""), "general");
  });
});
