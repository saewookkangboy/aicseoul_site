// src/lib/seo/site.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSiteUrl } from "./site";

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://aic.kr/";
    delete process.env.AUTH_URL;
    assert.equal(getSiteUrl(), "https://aic.kr");
  });

  it("falls back to AUTH_URL", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.AUTH_URL = "https://example.vercel.app";
    assert.equal(getSiteUrl(), "https://example.vercel.app");
  });

  it("defaults to localhost", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.AUTH_URL;
    assert.equal(getSiteUrl(), "http://localhost:3000");
  });
});
