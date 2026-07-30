import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  authJwtGetTokenOptions,
  requestIsHttps,
} from "./auth-jwt-edge";

describe("authJwtGetTokenOptions", () => {
  it("enables secureCookie on HTTPS so __Secure-authjs cookies are read", () => {
    const opts = authJwtGetTokenOptions({
      secret: "test-secret",
      isHttps: true,
    });
    assert.equal(opts.secureCookie, true);
    assert.equal(opts.secret, "test-secret");
  });

  it("disables secureCookie on HTTP (local dev)", () => {
    const opts = authJwtGetTokenOptions({
      secret: "test-secret",
      isHttps: false,
    });
    assert.equal(opts.secureCookie, false);
  });
});

describe("requestIsHttps", () => {
  it("detects https protocol", () => {
    assert.equal(
      requestIsHttps({ nextUrl: { protocol: "https:" } }),
      true,
    );
  });

  it("treats http as non-HTTPS when not on Vercel", () => {
    const prev = process.env.VERCEL;
    delete process.env.VERCEL;
    try {
      assert.equal(
        requestIsHttps({ nextUrl: { protocol: "http:" } }),
        false,
      );
    } finally {
      if (prev === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prev;
    }
  });

  it("treats Vercel as HTTPS even if protocol says http", () => {
    const prev = process.env.VERCEL;
    process.env.VERCEL = "1";
    try {
      assert.equal(
        requestIsHttps({ nextUrl: { protocol: "http:" } }),
        true,
      );
    } finally {
      if (prev === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = prev;
    }
  });
});
