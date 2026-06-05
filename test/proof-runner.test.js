import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  operationalProofFixtures,
  reportOnlyReceiptProofFixtures
} from "../conformance/index.js";

const fixtureIds = Object.values(operationalProofFixtures)
  .map((fixture) => fixture.id)
  .sort();
const receiptFixtureIds = Object.values(reportOnlyReceiptProofFixtures)
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

test("receipt:list prints named report-only receipt proof fixtures", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:list"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.trim().split("\n").sort(), receiptFixtureIds);
});

test("receipt:run executes all named report-only receipt proof fixtures", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:run"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  for (const fixture of Object.values(reportOnlyReceiptProofFixtures)) {
    assert.match(
      result.stdout,
      new RegExp(`${fixture.id} ${fixture.expected.decision} rbc-evaluation-receipt:[a-f0-9]{16} rbc-evaluation-readback:[a-f0-9]{16}`)
    );
  }
});

test("receipt:run executes selected named report-only receipt proof fixtures", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/rbc-proof.js", "receipt:run", "layer-writer-authorized", "layer-writer-hard-denied"],
    {
      cwd: ".",
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 0);
  assert.match(result.stdout, /layer-writer-authorized allowed rbc-evaluation-receipt:[a-f0-9]{16}/);
  assert.match(result.stdout, /layer-writer-hard-denied denied rbc-evaluation-receipt:[a-f0-9]{16}/);
  assert.equal(result.stdout.trim().split("\n").length, 2);
});

test("receipt proof runner fails closed for unknown fixture name", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:run", "missing-fixture"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown report-only receipt proof fixture: missing-fixture/);
});

test("receipt:transcript emits deterministic report-only receipt proof JSON", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:transcript"], {
    cwd: ".",
    encoding: "utf8"
  });
  const repeatedResult = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:transcript"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, repeatedResult.stdout);

  const transcript = JSON.parse(result.stdout);
  assert.equal(transcript.transcriptVersion, "rbc_report_only_receipt_proof_transcript.v1");
  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.deepEqual(transcript.fixtureIds.sort(), receiptFixtureIds);
  assert.match(transcript.transcriptHash, /^sha256:[a-f0-9]{64}$/);

  for (const entry of transcript.results) {
    assert.match(entry.receiptRef, /^rbc-evaluation-receipt:[a-f0-9]{16}$/);
    assert.match(entry.readbackRef, /^rbc-evaluation-readback:[a-f0-9]{16}$/);
    assert.equal(entry.readbackVerified, true);
    assert.equal(entry.nonClaims.governedSeam, false);
  }
});

test("receipt:transcript emits selected report-only receipt proof JSON", () => {
  const result = spawnSync(
    process.execPath,
    ["bin/rbc-proof.js", "receipt:transcript", "layer-writer-authorized"],
    {
      cwd: ".",
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 0);
  const transcript = JSON.parse(result.stdout);
  assert.deepEqual(transcript.fixtureIds, ["layer-writer-authorized"]);
  assert.equal(transcript.results.length, 1);
  assert.equal(transcript.results[0].id, "layer-writer-authorized");
  assert.equal(transcript.results[0].decision, "allowed");
});

test("receipt transcript runner fails closed for unknown fixture name", () => {
  const result = spawnSync(process.execPath, ["bin/rbc-proof.js", "receipt:transcript", "missing-fixture"], {
    cwd: ".",
    encoding: "utf8"
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown report-only receipt proof fixture: missing-fixture/);
});
