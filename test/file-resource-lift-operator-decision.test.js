import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluateFileResourceLiftOperatorDecision,
  getFileResourceLiftOperatorDecisionIssues,
  stableHash,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const generatedDecision = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/decision.json", import.meta.url),
  "utf8"
));
const generatedDecisionReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/readback.json", import.meta.url),
  "utf8"
));

function fixtureWithHash(value, field) {
  return {
    ...value,
    [field]: `sha256:${stableHash(value)}`
  };
}

function holdDecisionFixture() {
  const body = {
    ...structuredClone(generatedDecision),
    decision: "hold",
    operatorDecision: {
      ...generatedDecision.operatorDecision,
      approvedForLayerAdmissionCandidateReview: false,
      heldByOperator: true,
      futureLayerReviewPermitted: false,
      nextEmergenceBoundary: "operator_may_reconsider_file_resource_lift_decision_after_hold"
    },
    nextPosture: "operator_hold_preserved_no_layer_admission_candidate"
  };
  delete body.decisionHash;
  const decision = fixtureWithHash(body, "decisionHash");
  const readbackBody = {
    ...structuredClone(generatedDecisionReadback),
    sourceDecisionHash: decision.decisionHash,
    recomputedDecisionHash: decision.decisionHash,
    decision: "hold",
    sourceRefs: decision.sourceRefs
  };
  delete readbackBody.readbackHash;
  return {
    decision,
    readback: fixtureWithHash(readbackBody, "readbackHash")
  };
}

test("evaluates approved Edge file/resource lift operator decision as report-only allowed", () => {
  const { receipt, readback, transcript } = evaluateFileResourceLiftOperatorDecision(
    generatedDecision,
    generatedDecisionReadback
  );

  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.decisionHashVerified, true);
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(receipt.rulebookRef, "rulebook.file-resource-lift-operator-decision.report-only.v0");
  assert.equal(receipt.capabilityRef, "capability.layer.file-resource-lift.admission-candidate-review.v0");
  assert.ok(receipt.evidenceRefs.includes(generatedDecision.decisionRef));
  assert.ok(receipt.evidenceRefs.includes(generatedDecision.decisionHash));
  assert.ok(receipt.evidenceRefs.includes(generatedDecisionReadback.readbackHash));
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.acceptedContinuity, false);
  assert.equal(transcript.nonClaims.operatorReviewAsCanon, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("preserves operator hold as deferred report-only evaluation", () => {
  const { decision, readback } = holdDecisionFixture();
  const result = evaluateFileResourceLiftOperatorDecision(decision, readback);

  assert.deepEqual(result.transcript.packetIssues, []);
  assert.equal(result.receipt.decision, "deferred");
  assert.equal(result.receipt.posture, "requires_mediation");
});

test("rejects decision overclaims in packet issue list", () => {
  const decision = structuredClone(generatedDecision);
  decision.edgeBoundary.admitsResource = true;
  decision.edgeBoundary.createsQueueAction = true;
  decision.edgeBoundary.dispatchesWork = true;
  decision.edgeBoundary.executesRequest = true;
  decision.edgeBoundary.claimsAuthority = true;
  decision.nonClaims.layerAdmission = true;
  decision.nonClaims.operatorReviewAsCanon = true;

  const issues = getFileResourceLiftOperatorDecisionIssues(decision, generatedDecisionReadback);
  assert.ok(issues.includes("packet_claims_admitsResource"));
  assert.ok(issues.includes("packet_claims_createsQueueAction"));
  assert.ok(issues.includes("packet_claims_dispatchesWork"));
  assert.ok(issues.includes("packet_claims_executesRequest"));
  assert.ok(issues.includes("packet_claims_claimsAuthority"));
  assert.ok(issues.includes("non_claim_layerAdmission_missing_or_true"));
  assert.ok(issues.includes("non_claim_operatorReviewAsCanon_missing_or_true"));
});

test("rejects damaged Edge file/resource lift decision readback", () => {
  const readback = structuredClone(generatedDecisionReadback);
  readback.recomputedDecisionHash = "sha256:damaged";

  assert.ok(
    getFileResourceLiftOperatorDecisionIssues(generatedDecision, readback)
      .includes("readback_recomputed_hash_mismatch")
  );
});

test("CLI emits receipt, readback, and transcript for generated Edge operator decision", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-file-resource-lift-operator-decision.mjs",
    "--decision",
    "../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/decision.json",
    "--decision-readback",
    "../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/readback.json",
    "--receipt-out",
    ".tmp/test-file-resource-lift-operator-decision/receipt.json",
    "--readback-out",
    ".tmp/test-file-resource-lift-operator-decision/readback.json",
    "--transcript-out",
    ".tmp/test-file-resource-lift-operator-decision/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "file_resource_lift_operator_decision_evaluation_receipt_emitted");
  assert.equal(output.decision, "allowed");
  assert.equal(output.proofRung, "local_supplied_material");
  assert.equal(output.decisionHashVerified, true);
  assert.equal(output.nonClaims.layerAdmission, false);
  assert.equal(output.nonClaims.operatorReviewAsCanon, false);
  assert.equal(output.nonClaims.authority, false);
});
