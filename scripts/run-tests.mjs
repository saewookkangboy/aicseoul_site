import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function collect(dir, out = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) collect(p, out);
    else if (ent.name.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

const files = collect(join(process.cwd(), "src"));
if (files.length === 0) {
  console.error("No *.test.ts files under src/");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", "--test", ...files],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
