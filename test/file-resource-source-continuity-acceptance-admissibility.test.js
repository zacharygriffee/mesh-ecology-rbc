import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluateFileResourceSourceContinuityAcceptanceAdmissibility,
  getFileResourceSourceContinuityAcceptanceAdmissibilityIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const generatedEdgeIntent = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-source-continuity-acceptance-operator-intent-20260610T080000Z/intent.json", import.meta.url),
  "utf8"
));
const generatedEdgeIntentReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-source-continuity-acceptance-operator-intent-20260610T080000Z/readback.json", import.meta.url),
  "utf8"
));
const generatedLayerRemainingBlockersPacket = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-source-continuity-acceptance-remaining-blockers-packet-20260609T203000Z/packet.json", import.meta.url),
  "utf8"
));
const generatedCausalPrerequisiteObservation = JSON.parse(readFileSync(
  new URL("../../causal-substrate/proof-artifacts/file-resource-source-continuity-prerequisite-20260609T163000Z/observation.json", import.meta.url),
  "utf8"
));
const generatedBytesVisibilityEvidence = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-bytes/proof-artifacts/studio-file-resource-lift-visibility-20260609T130000Z/evidence.json", import.meta.url),
  "utf8"
));

test("RBC evaluates source-continuity acceptance as admissible for single-operator local layer", () => {
  const { receipt, readback, transcript } = evaluateFileResourceSourceContinuityAcceptanceAdmissibility({
    edgeIntent: generatedEdgeIntent,
    edgeIntentReadback: generatedEdgeIntentReadback,
    layerRemainingBlockersPacket: generatedLayerRemainingBlockersPacket,
    causalPrerequisiteObservation: generatedCausalPrerequisiteObservation,
    bytesVisibilityEvidence: generatedBytesVisibilityEvidence
  });

  assert.equal(transcript.transcriptVersion, "rbc_file_resource_source_continuity_acceptance_admissibility_evaluation.v0");
  assert.equal(transcript.admissibilityStatus, "admissible_for_layer_source_continuity_acceptance_append");
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(transcript.nonClaims.mutatesLayer, false);
  assert.equal(transcript.nonClaims.layerAppend, false);
  assert.equal(transcript.nonClaims.rbcDecisionAsAppend, false);
  assert.equal(transcript.nonClaims.acceptedSourceContinuity, false);
  assert.equal(transcript.nonClaims.canonicalTruth, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("RBC reports needs_more_observers outside single-operator local layer", () => {
  const { transcript } = evaluateFileResourceSourceContinuityAcceptanceAdmissibility({
    edgeIntent: generatedEdgeIntent,
    edgeIntentReadback: generatedEdgeIntentReadback,
    layerRemainingBlockersPacket: generatedLayerRemainingBlockersPacket,
    causalPrerequisiteObservation: generatedCausalPrerequisiteObservation,
    bytesVisibilityEvidence: generatedBytesVisibilityEvidence,
    observerMode: "team_layer"
  });

  assert.equal(transcript.admissibilityStatus, "needs_more_observers");
  assert.ok(transcript.packetIssues.includes("observer_mode_requires_more_observers"));
});

test("RBC source-continuity acceptance admissibility rejects overclaiming Edge intent", () => {
  const edgeIntent = structuredClone(generatedEdgeIntent);
  edgeIntent.nonClaims.authority = true;
  edgeIntent.nonClaims.layerAppend = true;

  const issues = getFileResourceSourceContinuityAcceptanceAdmissibilityIssues({
    edgeIntent,
    edgeIntentReadback: generatedEdgeIntentReadback,
    layerRemainingBlockersPacket: generatedLayerRemainingBlockersPacket,
    causalPrerequisiteObservation: generatedCausalPrerequisiteObservation,
    bytesVisibilityEvidence: generatedBytesVisibilityEvidence
  });

  assert.ok(issues.includes("edge_intent_claims_authority"));
  assert.ok(issues.includes("edge_intent_claims_layerAppend"));
});

test("RBC CLI emits source-continuity acceptance admissibility receipt", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-file-resource-source-continuity-acceptance-admissibility.mjs",
    "--edge-intent",
    "../mesh-ecology-edge/proof-artifacts/file-resource-source-continuity-acceptance-operator-intent-20260610T080000Z/intent.json",
    "--edge-intent-readback",
    "../mesh-ecology-edge/proof-artifacts/file-resource-source-continuity-acceptance-operator-intent-20260610T080000Z/readback.json",
    "--layer-remaining-blockers-packet",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-source-continuity-acceptance-remaining-blockers-packet-20260609T203000Z/packet.json",
    "--causal-prerequisite-observation",
    "../causal-substrate/proof-artifacts/file-resource-source-continuity-prerequisite-20260609T163000Z/observation.json",
    "--bytes-visibility-evidence",
    "../mesh-ecology-bytes/proof-artifacts/studio-file-resource-lift-visibility-20260609T130000Z/evidence.json",
    "--receipt-out",
    ".tmp/test-file-resource-source-continuity-acceptance-admissibility/receipt.json",
    "--readback-out",
    ".tmp/test-file-resource-source-continuity-acceptance-admissibility/readback.json",
    "--transcript-out",
    ".tmp/test-file-resource-source-continuity-acceptance-admissibility/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "file_resource_source_continuity_acceptance_admissibility_evaluation_emitted");
  assert.equal(output.admissibilityStatus, "admissible_for_layer_source_continuity_acceptance_append");
  assert.equal(output.nonClaims.authority, false);
});
