import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  evaluateLayerBoundaryPressurePacket,
  getLayerBoundaryPressurePacketIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const layerPacket = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-pressure-packet.json", import.meta.url),
  "utf8"
));

test("evaluates actual Layer boundary pressure packet as report-only deferred receipt", () => {
  const { receipt, readback, transcript } = evaluateLayerBoundaryPressurePacket(layerPacket);

  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.packetHashVerified, true);
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "deferred");
  assert.equal(receipt.posture, "requires_review");
  assert.equal(receipt.rulebookRef, layerPacket.evaluationRequest.rulebookRef);
  assert.equal(receipt.capabilityRef, layerPacket.evaluationRequest.capabilityRef);
  assert.equal(receipt.scope.scopeRef, layerPacket.evaluationRequest.scope);
  assert.ok(receipt.evidenceRefs.includes(layerPacket.packetRef));
  assert.ok(receipt.evidenceRefs.includes(`sha256:${layerPacket.packetHash}`));
  assert.ok(receipt.traceRefs.includes("rule.layer-rbc-boundary-pressure-requires-report-only-review"));
  assert.equal(receipt.nonClaims.governedSeam, false);
  assert.equal(receipt.nonClaims.seamTransport, false);
  assert.equal(receipt.nonClaims.authority, false);
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.layerMutation, false);
  assert.equal(transcript.nonClaims.appendCapabilityGrant, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("rejects Layer packet overclaims in packet issue list", () => {
  const packet = structuredClone(layerPacket);
  packet.proofBoundary.governedSeamClaimed = true;

  assert.ok(getLayerBoundaryPressurePacketIssues(packet).includes("packet_claims_governed_seam"));
});

test("CLI emits receipt, readback, and transcript for actual Layer packet", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-layer-boundary-pressure-packet.mjs",
    "--packet",
    "../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-pressure-packet.json",
    "--receipt-out",
    ".tmp/test-layer-boundary-pressure/receipt.json",
    "--readback-out",
    ".tmp/test-layer-boundary-pressure/readback.json",
    "--transcript-out",
    ".tmp/test-layer-boundary-pressure/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "layer_boundary_pressure_evaluation_receipt_emitted");
  assert.equal(output.decision, "deferred");
  assert.equal(output.proofRung, "local_supplied_material");
  assert.equal(output.packetHashVerified, true);
});
