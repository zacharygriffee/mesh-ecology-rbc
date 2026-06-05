import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  evaluateLayerBoundaryReviewPacket,
  getLayerBoundaryReviewPacketIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const layerBoundaryReviewPacket = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-review/packet.json", import.meta.url),
  "utf8"
));

test("evaluates actual Layer boundary review packet as report-only allowed followup receipt", () => {
  const { receipt, readback, transcript } = evaluateLayerBoundaryReviewPacket(layerBoundaryReviewPacket);

  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.packetHashVerified, true);
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(receipt.rulebookRef, layerBoundaryReviewPacket.evaluationRequest.rulebookRef);
  assert.equal(receipt.capabilityRef, layerBoundaryReviewPacket.evaluationRequest.capabilityRef);
  assert.equal(receipt.scope.scopeRef, layerBoundaryReviewPacket.evaluationRequest.scope.scopeRef);
  assert.ok(receipt.evidenceRefs.includes(layerBoundaryReviewPacket.packetRef));
  assert.ok(receipt.evidenceRefs.includes(`sha256:${layerBoundaryReviewPacket.packetHash}`));
  assert.ok(receipt.evidenceRefs.includes("layer_rbc_boundary_review"));
  assert.ok(receipt.evidenceRefs.includes("blocked:production_append_not_approved"));
  assert.equal(transcript.sourceLayerPacketHash, layerBoundaryReviewPacket.followupResolution.sourceLayerPacketHash);
  assert.equal(transcript.sourceDeferredRbcReceiptHash, layerBoundaryReviewPacket.followupResolution.sourceRbcReceiptHash);
  assert.equal(transcript.sourceFollowupHash, layerBoundaryReviewPacket.followupResolution.sourceFollowupHash);
  assert.deepEqual(transcript.preservedRefs.satisfiedFollowupReceiptRefs, ["layer_rbc_boundary_review"]);
  assert.deepEqual(
    transcript.preservedRefs.remainingBlockedReasonRefs,
    layerBoundaryReviewPacket.followupResolution.remainingBlockedReasonRefs
  );
  assert.ok(
    receipt.traceRefs.includes("rule.layer-rbc-boundary-review-requires-satisfied-followup-receipt")
  );
  assert.equal(receipt.nonClaims.governedSeam, false);
  assert.equal(receipt.nonClaims.seamTransport, false);
  assert.equal(receipt.nonClaims.authority, false);
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.layerMutation, false);
  assert.equal(transcript.nonClaims.appendCapabilityGrant, false);
  assert.equal(transcript.nonClaims.appendCapabilityApplication, false);
  assert.equal(transcript.nonClaims.durableDecisionAppend, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("rejects Layer boundary review packet overclaims in packet issue list", () => {
  const packet = structuredClone(layerBoundaryReviewPacket);
  packet.proofBoundary.governedSeamClaimed = true;
  packet.proofBoundary.layerMutationPerformed = true;
  packet.reviewMaterial.appendCapabilityGrantedByThisPacket = true;
  packet.reviewMaterial.durableDecisionAppendedByThisPacket = true;

  const issues = getLayerBoundaryReviewPacketIssues(packet);
  assert.ok(issues.includes("packet_claims_governed_seam"));
  assert.ok(issues.includes("packet_claims_layer_mutation"));
  assert.ok(issues.includes("packet_claims_append_capability_grant"));
  assert.ok(issues.includes("packet_claims_durable_decision_append"));
});

test("rejects damaged Layer boundary review packet hash", () => {
  const packet = structuredClone(layerBoundaryReviewPacket);
  packet.followupResolution.sourceFollowupHash = "damaged";

  assert.ok(getLayerBoundaryReviewPacketIssues(packet).includes("packet_hash_mismatch"));
});

test("CLI emits receipt, readback, and transcript for actual Layer boundary review packet", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-layer-boundary-review-packet.mjs",
    "--packet",
    "../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-review/packet.json",
    "--receipt-out",
    ".tmp/test-layer-boundary-review/receipt.json",
    "--readback-out",
    ".tmp/test-layer-boundary-review/readback.json",
    "--transcript-out",
    ".tmp/test-layer-boundary-review/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "layer_boundary_review_evaluation_receipt_emitted");
  assert.equal(output.decision, "allowed");
  assert.equal(output.proofRung, "local_supplied_material");
  assert.equal(output.packetHashVerified, true);
  assert.deepEqual(output.satisfiedFollowupReceiptRefs, ["layer_rbc_boundary_review"]);
  assert.ok(output.remainingBlockedReasonRefs.includes("blocked:durable_decision_not_appended"));
  assert.equal(output.nonClaims.governedSeam, false);
  assert.equal(output.nonClaims.layerAdmission, false);
  assert.equal(output.nonClaims.appendCapabilityGrant, false);
});
