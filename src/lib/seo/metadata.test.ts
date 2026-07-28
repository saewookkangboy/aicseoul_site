// src/lib/seo/metadata.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("sets canonical and OG url from path", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://aic.kr";
    const m = pageMetadata({
      title: "Meetups",
      description: "모임 설명",
      path: "/meetups",
    });
    assert.equal(m.alternates?.canonical, "https://aic.kr/meetups");
    assert.equal(m.openGraph?.url, "https://aic.kr/meetups");
    assert.equal(m.description, "모임 설명");
  });

  it("uses absolute title when requested", () => {
    const m = pageMetadata({
      title: "AI Collective Seoul",
      description: "x",
      path: "/",
      absoluteTitle: true,
    });
    assert.deepEqual(m.title, { absolute: "AI Collective Seoul" });
  });
});
