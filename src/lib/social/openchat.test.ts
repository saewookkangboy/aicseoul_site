import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CHAPTER_OPENCHAT_URL,
  resolveChapterOpenchatUrl,
} from "./openchat";

describe("resolveChapterOpenchatUrl", () => {
  it("falls back to chapter default", () => {
    assert.equal(resolveChapterOpenchatUrl(undefined), CHAPTER_OPENCHAT_URL);
    assert.equal(resolveChapterOpenchatUrl(null), CHAPTER_OPENCHAT_URL);
    assert.equal(resolveChapterOpenchatUrl(""), CHAPTER_OPENCHAT_URL);
    assert.equal(resolveChapterOpenchatUrl("  "), CHAPTER_OPENCHAT_URL);
  });

  it("accepts https openchat urls", () => {
    const url = "https://open.kakao.com/o/custom";
    assert.equal(resolveChapterOpenchatUrl(url), url);
  });

  it("rejects non-http protocols", () => {
    assert.equal(
      resolveChapterOpenchatUrl("javascript:alert(1)"),
      CHAPTER_OPENCHAT_URL,
    );
  });
});
