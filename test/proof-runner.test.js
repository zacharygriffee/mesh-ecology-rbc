import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { operationalProofFixtures } from "../conformance/index.js";

const fixtureIds = Object.values(operationalProofFixtures)
  .map((fixture) => fixture.id)
  .sort();

test("proof:list prints named operational proof fixtures", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "list"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.trim().split("\n").sort(), fixtureIds);
});

test("proof:run executes all named operational proof fixtures", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "run"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  for (const fixture of Object.values(operationalProofFixtures)) {
    assert.match(
      result.stdout,
      new RegExp(`${fixture.id} ${fixture.expected.posture} rbc-view:[a-f0-9]{64}`)
    );
  }
});

test("proof:run executes selected named operational proof fixtures", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/rbc-proof.js", "run", "edge-writer-admission-allowed", "causal-policy-history-conflict"],
    {
      cwd: ".",
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /edge-writer-admission-allowed allowed rbc-view:[a-f0-9]{64}/);
  assert.match(result.stdout, /causal-policy-history-conflict requires_mediation rbc-view:[a-f0-9]{64}/);
  assert.equal(result.stdout.trim().split("\n").length, 2);
});

test("proof runner fails closed for unknown fixture name", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "run", "missing-fixture"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown operational proof fixture: missing-fixture/);
});
