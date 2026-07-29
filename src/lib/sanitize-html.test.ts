import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { looksLikeHtml, sanitizeInsightHtml } from "./sanitize-html";

describe("sanitizeInsightHtml", () => {
  it("keeps allowed markup", () => {
    const out = sanitizeInsightHtml('<p>Hello <strong>world</strong></p>');
    assert.match(out, /<p>/);
    assert.match(out, /<strong>/);
  });

  it("strips script tags", () => {
    const out = sanitizeInsightHtml('<p>x</p><script>alert(1)</script>');
    assert.equal(out.includes("script"), false);
    assert.match(out, /<p>x<\/p>/);
  });

  it("strips event handlers", () => {
    const out = sanitizeInsightHtml('<p onclick="alert(1)">hi</p>');
    assert.equal(out.includes("onclick"), false);
  });
});

describe("looksLikeHtml", () => {
  it("detects tags", () => {
    assert.equal(looksLikeHtml("<p>hi</p>"), true);
    assert.equal(looksLikeHtml("plain text"), false);
  });
});
