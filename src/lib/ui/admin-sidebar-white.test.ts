import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("admin sidebar white text CSS", () => {
  it("forces white color on .admin-sidebar links against a{color:inherit}", () => {
    const css = readFileSync(
      new URL("../../app/globals.css", import.meta.url),
      "utf8",
    );
    assert.match(css, /\.admin-sidebar,\s*\n\.admin-sidebar a,\s*\n\.admin-sidebar button/);
    assert.match(css, /color:\s*#ffffff\s*!important/);
    assert.match(css, /\.admin-sidebar-gold/);
  });
});
