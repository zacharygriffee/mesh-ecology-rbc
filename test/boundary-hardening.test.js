import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const forbiddenPatterns = [
  /from\s+["']node:(fs|net|http|https|dgram|tls|child_process|worker_threads)["']/,
  /from\s+["'](fs|net|http|https|dgram|tls|child_process|worker_threads)["']/,
  /\bfetch\s*\(/,
  /\bDate\.now\s*\(/,
  /\bMath\.random\s*\(/,
  /\bcreateServer\s*\(/,
  /\.listen\s*\(/,
  /\bHypercore\b/,
  /\bAutobase\b/,
  /\bCorestore\b/,
  /\bDHT\b/
];

test("src stays free of forbidden runtime boundaries", async () => {
  const files = await jsFiles(path.resolve("src"));
  const violations = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(source)) {
        violations.push(`${path.relative(".", file)} matches ${pattern}`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

async function jsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await jsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}
