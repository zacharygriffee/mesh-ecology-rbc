import { createHash } from "node:crypto";

import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const LAYER_BOUNDARY_PRESSURE_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_layer_boundary_pressure_evaluation_transcript.v1";

export function createLayerBoundaryPressureEvaluationInput(packet = {}) {
  const evaluationRequest = packet.evaluationRequest ?? {};
  const boundaryRefs = packet.boundaryRefs ?? {};
  const retainedPublicProofRefs = packet.retainedPublicProofRefs ?? {};
  const sourceArtifactRefs = Object.values(packet.sourceArtifacts ?? {})
    .map((artifact) => artifact?.ref)
    .filter(Boolean);
  const candidateDeviceRef = firstRef(boundaryRefs.candidateDeviceRefs, "device:unknown-layer-candidate");
  const candidateWriterRef = firstRef(boundaryRefs.candidateWriterRefs, evaluationRequest.actorRef ?? "writer:unknown");
  const candidateSeatRef = firstRef(boundaryRefs.candidateSeatRefs, evaluationRequest.seatRef ?? "seat:unknown");
  const layerRef = boundaryRefs.layerRef ?? "layer:unknown";
  const scope = evaluationRequest.scope ?? "layer:unknown-scope";
  const packetHashRef = packet.packetHash ? `sha256:${packet.packetHash}` : "sha256:missing-layer-packet-hash";

  return {
    rulebookRef: evaluationRequest.rulebookRef ?? null,
    capabilityRef: evaluationRequest.capabilityRef ?? null,
    scope: {
      scopeRef: scope,
      layerRef,
      layerProfileRef: boundaryRefs.layerProfileRef ?? null,
      actorRef: evaluationRequest.actorRef ?? candidateWriterRef,
      operatorRef: evaluationRequest.operatorRef ?? null,
      seatRef: evaluationRequest.seatRef ?? candidateSeatRef,
      candidateWriterRefs: boundaryRefs.candidateWriterRefs ?? [],
      candidateDeviceRefs: boundaryRefs.candidateDeviceRefs ?? [],
      retainedPublicProofRunId: retainedPublicProofRefs.runId ?? null
    },
    evidenceRefs: uniqueRefs([
      packet.packetRef,
      packetHashRef,
      ...sourceArtifactRefs,
      ...(boundaryRefs.admissionEvidenceRefs ?? []),
      ...(boundaryRefs.appendCapabilityEvidenceRefs ?? []),
      ...(boundaryRefs.policyHistoryRefs ?? []),
      ...(boundaryRefs.blockedReasonRefs ?? []),
      retainedPublicProofRefs.classificationRef,
      retainedPublicProofRefs.handoffPacketRef
    ]),
    expiry: evaluationRequest.expiry ?? null,
    reason: evaluationRequest.reason ??
      "Report-only RBC evaluation over supplied Layer boundary pressure material.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: evaluationRequest.operatorRef ?? "operator:unknown",
        surfaceRef: layerRef,
        deviceRef: candidateDeviceRef,
        roleRef: "role:layer-writer",
        branchRef: layerRef,
        actionRef: "action:layer-append",
        artifactRef: packet.packetRef,
        contextRef: scope,
        timeRef: packet.createdAt ?? null
      },
      facts: {
        packetStatus: packet.packetStatus,
        pressureLane: packet.pressureLane,
        packetProofRung: packet.proofBoundary?.packetProofRung,
        retainedPublicProofCited: packet.proofBoundary?.retainedPublicProofCited === true,
        strongestLayerProofRungCited: packet.proofBoundary?.strongestLayerProofRungCited,
        candidateWriterRef,
        candidateSeatRef,
        candidateDeviceRef,
        sourceRepo: packet.sourceRepo,
        packetHash: packet.packetHash
      },
      rulebooks: [{
        id: evaluationRequest.rulebookRef ?? "rulebook.layer-boundary-pressure.supplied",
        rules: [{
          id: "rule.layer-rbc-boundary-pressure-requires-report-only-review",
          domain: "layer_writer_capability_admission",
          effect: "requires_review",
          priority: 90,
          strength: "normal",
          when: {
            actionRef: "action:layer-append",
            packetStatus: "ready_for_report_only_rbc_evaluation_receipt_input",
            packetProofRung: "local_supplied_material"
          },
          requires: {
            receipts: ["layer_rbc_boundary_review"]
          },
          reason: "Layer boundary pressure packet requests report-only RBC evaluation before any governed boundary claim."
        }]
      }],
      overlays: [{
        id: "overlay.layer-retained-public-proof-context",
        rules: [{
          id: "rule.layer-retained-public-device-boundary-context",
          domain: "layer_writer_capability_admission",
          effect: "allow",
          priority: 10,
          strength: "normal",
          when: {
            retainedPublicProofCited: true,
            strongestLayerProofRungCited: "public_hyperdht_device_boundary"
          },
          reason: "Layer supplied retained public device-boundary proof refs as context for report-only evaluation."
        }]
      }],
      grants: [],
      denials: blockedReasonDenials(boundaryRefs.blockedReasonRefs ?? []),
      receipts: [],
      time: packet.createdAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function evaluateLayerBoundaryPressurePacket(packet = {}) {
  const packetIssues = getLayerBoundaryPressurePacketIssues(packet);
  const input = createLayerBoundaryPressureEvaluationInput(packet);
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: LAYER_BOUNDARY_PRESSURE_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    sourceRepo: packet.sourceRepo ?? null,
    sourcePacketRef: packet.packetRef ?? null,
    sourcePacketHash: packet.packetHash ?? null,
    packetHashVerified: packetIssues.length === 0,
    packetIssues,
    receiptRef: receipt.receiptRef,
    receiptHash: receipt.receiptHash,
    readbackRef: readback.readbackRef,
    readbackHash: readback.readbackHash,
    decision: receipt.decision,
    posture: receipt.posture,
    effectiveViewRef: receipt.effectiveViewRef,
    preservedRefs: {
      rulebookRef: receipt.rulebookRef,
      capabilityRef: receipt.capabilityRef,
      scope: receipt.scope,
      evidenceRefs: receipt.evidenceRefs,
      sourceRefs: receipt.sourceRefs,
      traceRefs: receipt.traceRefs
    },
    nonClaims: {
      ...receipt.nonClaims,
      layerAdmission: false,
      layerMutation: false,
      appendCapabilityGrant: false,
      governedSeam: false,
      seamTransport: false,
      authority: false,
      productionDurability: false
    }
  };

  return {
    transcript: {
      transcriptHash: `sha256:${stableHash(transcriptBody)}`,
      ...transcriptBody
    },
    receipt,
    readback,
    input
  };
}

export function getLayerBoundaryPressurePacketIssues(packet = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };

  addIf(packet.artifactKind !== "layer_rbc_boundary_pressure_packet", "packet_kind_mismatch");
  addIf(packet.schemaVersion !== "layer-rbc-boundary-pressure-packet.v0", "packet_schema_mismatch");
  addIf(packet.reviewOnly !== true, "packet_not_review_only");
  addIf(packet.proofBoundary?.packetProofRung !== "local_supplied_material", "packet_proof_rung_overclaim");
  addIf(packet.proofBoundary?.publicSwarmProofCreatedByPacket !== false, "packet_claims_public_swarm_created_by_packet");
  addIf(packet.proofBoundary?.seamCrossedSwarmTransportByPacket !== false, "packet_claims_swarm_transport_by_packet");
  addIf(packet.proofBoundary?.governedSeamClaimed !== false, "packet_claims_governed_seam");
  addIf(packet.proofBoundary?.rbcReceiptObserved !== false, "packet_claims_rbc_receipt");
  addIf(packet.nonClaims?.packetIsRbcReceipt !== false, "packet_non_claim_rbc_receipt_missing_or_true");
  addIf(packet.nonClaims?.packetIsGovernedSeam !== false, "packet_non_claim_governed_seam_missing_or_true");
  addIf(!packet.evaluationRequest?.rulebookRef, "rulebook_ref_missing");
  addIf(!packet.evaluationRequest?.capabilityRef, "capability_ref_missing");
  addIf(!packet.evaluationRequest?.scope, "scope_missing");
  addIf(!packet.packetHash, "packet_hash_missing");

  if (packet.packetHash) {
    const { packetHash, ...withoutHash } = packet;
    addIf(packetHash !== hashJson(withoutHash), "packet_hash_mismatch");
  }

  return issues;
}

function blockedReasonDenials(blockedReasonRefs) {
  return blockedReasonRefs
    .filter((ref) => ref.includes("hard_denied") || ref.includes("denied"))
    .map((ref) => ({
      id: ref,
      effect: "deny",
      strength: "hard",
      scope: {
        actionRef: "action:layer-append"
      },
      reason: `Layer supplied blocked reason ${ref}.`
    }));
}

function firstRef(values, fallback) {
  return Array.isArray(values) && values.length > 0 ? values[0] : fallback;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function hashJson(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
