import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  evaluateEdgeRequestPacket,
  getEdgeRequestPacketIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const edgeRequestPacket = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/request-packet.json", import.meta.url),
  "utf8"
));
const edgeRequestPacketReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/readback.json", import.meta.url),
  "utf8"
));

test("evaluates Edge minimal operator request packet as report-only allowed receipt", () => {
  const { receipt, readback, transcript } = evaluateEdgeRequestPacket(edgeRequestPacket, edgeRequestPacketReadback);

  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.packetHashVerified, true);
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(receipt.rulebookRef, "rulebook.edge-minimal-operator-request.report-only.v0");
  assert.equal(receipt.capabilityRef, "capability.edge.operator-request.report-only-reassessment.v0");
  assert.equal(receipt.scope.requestKind, "request_repo_family_reassessment");
  assert.equal(receipt.scope.selectedCard, "operator_next_posture");
  assert.ok(receipt.evidenceRefs.includes(edgeRequestPacket.packetRef));
  assert.ok(receipt.evidenceRefs.includes(edgeRequestPacket.packetHash));
  assert.ok(receipt.evidenceRefs.includes(edgeRequestPacketReadback.readbackHash));
  assert.ok(
    receipt.traceRefs.includes("rule.edge-request-packet-reassessment-visible-for-report-only-evaluation")
  );
  assert.equal(transcript.sourcePacketRef, edgeRequestPacket.packetRef);
  assert.equal(transcript.sourcePacketHash, edgeRequestPacket.packetHash);
  assert.equal(transcript.sourcePacketReadbackHash, edgeRequestPacketReadback.readbackHash);
  assert.equal(transcript.nonClaims.callsEdgeLive, false);
  assert.equal(transcript.nonClaims.queueAction, false);
  assert.equal(transcript.nonClaims.dispatch, false);
  assert.equal(transcript.nonClaims.requestExecution, false);
  assert.equal(transcript.nonClaims.activationApproval, false);
  assert.equal(transcript.nonClaims.dependencyAcquisitionAuthorization, false);
  assert.equal(transcript.nonClaims.governedSeam, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(transcript.nonClaims.edgeOwnedPublicSwarmProof, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("rejects Edge request packet overclaims in packet issue list", () => {
  const packet = structuredClone(edgeRequestPacket);
  packet.edgeBoundary.createsQueueAction = true;
  packet.edgeBoundary.dispatchesWork = true;
  packet.edgeBoundary.executesRequest = true;
  packet.edgeBoundary.approvesActivation = true;
  packet.edgeBoundary.claimsGovernedSeam = true;
  packet.edgeBoundary.claimsAuthority = true;
  packet.edgeBoundary.claimsEdgeOwnedPublicSwarmProof = true;

  const issues = getEdgeRequestPacketIssues(packet, edgeRequestPacketReadback);
  assert.ok(issues.includes("packet_claims_queue_action"));
  assert.ok(issues.includes("packet_claims_dispatch"));
  assert.ok(issues.includes("packet_claims_request_execution"));
  assert.ok(issues.includes("packet_claims_activation_approval"));
  assert.ok(issues.includes("packet_claims_governed_seam"));
  assert.ok(issues.includes("packet_claims_authority"));
  assert.ok(issues.includes("packet_claims_edge_public_swarm_proof"));
});

test("rejects damaged Edge request packet readback", () => {
  const readback = structuredClone(edgeRequestPacketReadback);
  readback.recomputedPacketHash = "sha256:damaged";

  assert.ok(getEdgeRequestPacketIssues(edgeRequestPacket, readback).includes("readback_recomputed_hash_mismatch"));
});

test("CLI emits receipt, readback, and transcript for actual Edge request packet", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-edge-request-packet.mjs",
    "--packet",
    "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/request-packet.json",
    "--packet-readback",
    "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/readback.json",
    "--receipt-out",
    ".tmp/test-edge-request-packet/receipt.json",
    "--readback-out",
    ".tmp/test-edge-request-packet/readback.json",
    "--transcript-out",
    ".tmp/test-edge-request-packet/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "edge_request_packet_evaluation_receipt_emitted");
  assert.equal(output.decision, "allowed");
  assert.equal(output.proofRung, "local_supplied_material");
  assert.equal(output.packetHashVerified, true);
  assert.equal(output.sourcePacketRef, edgeRequestPacket.packetRef);
  assert.equal(output.sourcePacketHash, edgeRequestPacket.packetHash);
  assert.equal(output.sourcePacketReadbackHash, edgeRequestPacketReadback.readbackHash);
  assert.equal(output.nonClaims.governedSeam, false);
  assert.equal(output.nonClaims.queueAction, false);
  assert.equal(output.nonClaims.dispatch, false);
  assert.equal(output.nonClaims.authority, false);
});
