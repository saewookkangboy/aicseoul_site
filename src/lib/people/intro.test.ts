import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PEOPLE_INTRO,
  parsePeopleIntroJson,
  serializePeopleIntro,
} from "./intro";

describe("parsePeopleIntroJson", () => {
  it("returns defaults for empty input", () => {
    assert.deepEqual(parsePeopleIntroJson(null), DEFAULT_PEOPLE_INTRO);
    assert.deepEqual(parsePeopleIntroJson(""), DEFAULT_PEOPLE_INTRO);
  });

  it("round-trips valid json", () => {
    const raw = serializePeopleIntro(DEFAULT_PEOPLE_INTRO);
    assert.deepEqual(parsePeopleIntroJson(raw), DEFAULT_PEOPLE_INTRO);
  });

  it("falls back on invalid json", () => {
    assert.deepEqual(parsePeopleIntroJson("{"), DEFAULT_PEOPLE_INTRO);
  });
});
