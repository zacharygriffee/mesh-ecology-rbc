import assert from "node:assert/strict";
import test from "node:test";

import {
  listOperationalProofFixtures,
  operationalProofFixtures,
  runOperationalProof,
  runOperationalProofSuite
} from "../conformance/index.js";

test("conformance API lists and runs selected operational proof", () => {
  assert.ok(listOperationalProofFixtures().includes("edge-writer-admission-allowed"));

  assert.deepEqual(runOperationalProofSuite(["edge-writer-admission-allowed"]), [{
    id: "edge-writer-admission-allowed",
    posture: "allowed",
    effectiveViewRef: "rbc-view:401ba7d7c528585b5bafd732704b39d81ae08a365c4af8bea7a5b338fe680bd3"
  }]);
});

test("conformance API runs a fixture object", () => {
  const result = runOperationalProof("causal-policy-history-conflict");

  assert.deepEqual(runOperationalProof(operationalProofFixtures.causalPolicyHistoryConflict), result);
});

test("conformance API fails closed for unknown fixture id", () => {
  assert.throws(
    () => runOperationalProofSuite(["missing-fixture"]),
    /Unknown operational proof fixture: missing-fixture/
  );
});
