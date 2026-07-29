import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAPTER_LINKEDIN_URL,
  resolveChapterLinkedinUrl,
} from "./linkedin";

describe("resolveChapterLinkedinUrl", () => {
  it("falls back when empty or placeholder", () => {
    assert.equal(resolveChapterLinkedinUrl(undefined), CHAPTER_LINKEDIN_URL);
    assert.equal(resolveChapterLinkedinUrl(null), CHAPTER_LINKEDIN_URL);
    assert.equal(resolveChapterLinkedinUrl(""), CHAPTER_LINKEDIN_URL);
    assert.equal(resolveChapterLinkedinUrl("  "), CHAPTER_LINKEDIN_URL);
    assert.equal(
      resolveChapterLinkedinUrl("https://www.linkedin.com"),
      CHAPTER_LINKEDIN_URL,
    );
  });

  it("keeps a real configured URL", () => {
    const url = "https://www.linkedin.com/company/custom";
    assert.equal(resolveChapterLinkedinUrl(url), url);
  });
});
