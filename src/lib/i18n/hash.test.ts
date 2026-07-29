import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sourceHash } from "./hash";

describe("sourceHash", () => {
  it("is stable for equivalent whitespace", () => {
    assert.equal(sourceHash("hello  world"), sourceHash("hello world"));
    assert.equal(sourceHash("  a\n b  "), sourceHash("a b"));
  });

  it("differs for different text", () => {
    assert.notEqual(sourceHash("안녕"), sourceHash("hello"));
  });
});
