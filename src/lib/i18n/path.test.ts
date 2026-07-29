import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasLocalePrefix,
  localeFromPathname,
  localizedPath,
  stripLocalePath,
  swapLocalePath,
} from "./path";

describe("stripLocalePath", () => {
  it("strips known locale prefix", () => {
    assert.equal(stripLocalePath("/ko/meetups"), "/meetups");
    assert.equal(stripLocalePath("/en"), "/");
    assert.equal(stripLocalePath("/en/insights/abc"), "/insights/abc");
  });

  it("leaves unprefixed paths", () => {
    assert.equal(stripLocalePath("/meetups"), "/meetups");
    assert.equal(stripLocalePath("/"), "/");
  });
});

describe("swapLocalePath", () => {
  it("swaps locale segment", () => {
    assert.equal(swapLocalePath("/ko/meetups", "en"), "/en/meetups");
    assert.equal(swapLocalePath("/en/people", "ko"), "/ko/people");
    assert.equal(swapLocalePath("/ko", "en"), "/en");
  });
});

describe("localizedPath", () => {
  it("prefixes relative paths", () => {
    assert.equal(localizedPath("en", "/meetups"), "/en/meetups");
    assert.equal(localizedPath("ko", "/"), "/ko");
    assert.equal(localizedPath("en", "https://x.com"), "https://x.com");
  });
});

describe("localeFromPathname / hasLocalePrefix", () => {
  it("detects locale", () => {
    assert.equal(localeFromPathname("/en/contact"), "en");
    assert.equal(localeFromPathname("/meetups"), "ko");
    assert.equal(hasLocalePrefix("/ko/x"), true);
    assert.equal(hasLocalePrefix("/admin"), false);
  });
});
