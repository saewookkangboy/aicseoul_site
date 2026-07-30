import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isInsightBodyEmpty } from "./body-empty";

describe("isInsightBodyEmpty", () => {
  it("treats blank and empty paragraphs as empty", () => {
    assert.equal(isInsightBodyEmpty(""), true);
    assert.equal(isInsightBodyEmpty("   "), true);
    assert.equal(isInsightBodyEmpty("<p></p>"), true);
    assert.equal(isInsightBodyEmpty("<p><br></p>"), true);
    assert.equal(isInsightBodyEmpty("<p><br/></p>"), true);
  });

  it("treats real content as non-empty", () => {
    assert.equal(isInsightBodyEmpty("<p>hello</p>"), false);
    assert.equal(isInsightBodyEmpty("<h2>Title</h2><p>x</p>"), false);
  });
});
