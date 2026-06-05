import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("proof:list prints named operational proof fixtures", () => {
  const result = spawnSync(process.execPath, ["scripts/proof-runner.js", "list"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.trim().split("\n").sort(), [
    "private-publish-hard-denied",
    "public-publish-with-review-receipt"
  ]);
});

test("proof:run executes all named operational proof fixtures", () => {
  const result = spawnSync(process.execPath, ["scripts/proof-runner.js", "run"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /public-publish-with-review-receipt allowed rbc-view:[a-f0-9]{64}/);
  assert.match(result.stdout, /private-publish-hard-denied denied rbc-view:[a-f0-9]{64}/);
});

test("proof runner fails closed for unknown fixture name", () => {
  const result = spawnSync(process.execPath, ["scripts/proof-runner.js", "run", "missing-fixture"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown operational proof fixture: missing-fixture/);
});
