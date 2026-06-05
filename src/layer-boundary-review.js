import { createHash } from "node:crypto";

import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const LAYER_BOUNDARY_REVIEW_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_layer_boundary_review_evaluation_transcript.v1";

const REVIEW_RECEIPT_REF = "layer_rbc_boundary_review";

export function createLayerBoundaryReviewEvaluationInput(packet = {}) {
  const evaluationRequest = packet.evaluationRequest ?? {};
  const scope = evaluationRequest.scope ?? {};
  const followup = packet.followupResolution ?? {};
  const reviewMaterial = packet.reviewMaterial ?? {};
  const packetHashRef = packet.packetHash ? `sha256:${packet.packetHash}` : "sha256:missing-layer-boundary-review-hash";
  const actorRef = scope.actorRef ?? firstRef(reviewMaterial.appendCapabilityWriterRefs, "writer:unknown");
  const layerRef = scope.layerRef ?? "layer:unknown";
  const scopeRef = scope.scopeRef ?? "layer:unknown-scope";

  return {
    rulebookRef: evaluationRequest.rulebookRef ?? null,
    capabilityRef: evaluationRequest.capabilityRef ?? null,
    scope: {
      ...scope,
      scopeRef,
      layerRef,
      actorRef
    },
    evidenceRefs: uniqueRefs([
      packet.packetRef,
      packetHashRef,
      followup.sourceLayerPacketRef,
      followup.sourceLayerPacketHash ? `sha256:${followup.sourceLayerPacketHash}` : null,
      followup.sourceRbcReceiptRef,
      followup.sourceRbcReceiptHash,
      followup.sourceFollowupHash ? `sha256:${followup.sourceFollowupHash}` : null,
      ...arrayOf(followup.requiredFollowupReceiptRefs),
      ...arrayOf(followup.satisfiedFollowupReceiptRefs),
      ...arrayOf(followup.resolvedLayerMaterialRefs),
      ...arrayOf(followup.remainingBlockedReasonRefs),
      reviewMaterial.appendCapabilityCandidateRef,
      reviewMaterial.appendCapabilityOperatorDecisionRef,
      ...arrayOf(reviewMaterial.decisionEvidenceRefs)
    ]),
    expiry: evaluationRequest.expiry ?? null,
    reason: evaluationRequest.reason ??
      "Report-only RBC evaluation over supplied Layer boundary review material.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: scope.operatorRef ?? "operator:unknown",
        surfaceRef: layerRef,
        deviceRef: firstRef(scope.candidateDeviceRefs, "device:unknown-layer-candidate"),
        roleRef: "role:layer-writer",
        branchRef: layerRef,
        actionRef: "action:layer-boundary-review",
        artifactRef: packet.packetRef,
        contextRef: scopeRef,
        timeRef: packet.createdAt ?? null
      },
      facts: {
        packetStatus: packet.packetStatus,
        packetProofRung: packet.proofBoundary?.packetProofRung,
        materialStatus: followup.materialStatus,
        satisfiedFollowupReceiptRefs: arrayOf(followup.satisfiedFollowupReceiptRefs),
        resolvedMaterialCount: arrayOf(followup.resolvedLayerMaterialRefs).length,
        remainingBlockedReasonRefs: arrayOf(followup.remainingBlockedReasonRefs),
        appendCapabilityApprovedAsReviewMaterial: reviewMaterial.appendCapabilityApprovedAsReviewMaterial === true,
        sourceRepo: packet.sourceRepo,
        packetHash: packet.packetHash
      },
      rulebooks: [{
        id: evaluationRequest.rulebookRef ?? "rulebook.layer-boundary-review.supplied",
        rules: [
          {
            id: "rule.layer-rbc-boundary-review-requires-satisfied-followup-receipt",
            domain: "layer_writer_capability_admission",
            effect: "requires_review",
            priority: 90,
            strength: "normal",
            when: {
              actionRef: "action:layer-boundary-review",
              packetStatus: "ready_for_report_only_rbc_followup_evaluation",
              packetProofRung: "local_supplied_material"
            },
            requires: {
              receipts: [REVIEW_RECEIPT_REF]
            },
            reason: "Layer boundary-review packet must satisfy the deferred RBC follow-up receipt ref."
          },
          {
            id: "rule.layer-rbc-boundary-review-material-ready",
            domain: "layer_writer_capability_admission",
            effect: "allow",
            priority: 20,
            strength: "normal",
            when: {
              actionRef: "action:layer-boundary-review",
              materialStatus: "layer_rbc_boundary_review_material_ready",
              appendCapabilityApprovedAsReviewMaterial: true
            },
            reason: "Layer supplied concrete boundary-review material for report-only follow-up evaluation."
          }
        ]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: arrayOf(followup.satisfiedFollowupReceiptRefs).map((receiptRef) => ({
        id: `receipt.supplied.${receiptRef}`,
        receiptRef
      })),
      time: packet.createdAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function evaluateLayerBoundaryReviewPacket(packet = {}) {
  const packetIssues = getLayerBoundaryReviewPacketIssues(packet);
  const input = createLayerBoundaryReviewEvaluationInput(packet);
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const followup = packet.followupResolution ?? {};
  const reviewMaterial = packet.reviewMaterial ?? {};
  const transcriptBody = {
    transcriptVersion: LAYER_BOUNDARY_REVIEW_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    sourceRepo: packet.sourceRepo ?? null,
    sourcePacketRef: packet.packetRef ?? null,
    sourcePacketHash: packet.packetHash ?? null,
    sourceLayerPacketHash: followup.sourceLayerPacketHash ?? null,
    sourceDeferredRbcReceiptHash: followup.sourceRbcReceiptHash ?? null,
    sourceFollowupHash: followup.sourceFollowupHash ?? null,
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
      traceRefs: receipt.traceRefs,
      satisfiedFollowupReceiptRefs: arrayOf(followup.satisfiedFollowupReceiptRefs),
      resolvedLayerMaterialRefs: arrayOf(followup.resolvedLayerMaterialRefs),
      remainingBlockedReasonRefs: arrayOf(followup.remainingBlockedReasonRefs),
      appendCapabilityOperatorDecisionRef: reviewMaterial.appendCapabilityOperatorDecisionRef ?? null
    },
    nonClaims: {
      ...receipt.nonClaims,
      layerAdmission: false,
      layerMutation: false,
      appendCapabilityGrant: false,
      appendCapabilityApplication: false,
      durableDecisionAppend: false,
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

export function getLayerBoundaryReviewPacketIssues(packet = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };

  addIf(packet.artifactKind !== "layer_rbc_boundary_review_packet", "packet_kind_mismatch");
  addIf(packet.schemaVersion !== "layer-rbc-boundary-review-packet.v0", "packet_schema_mismatch");
  addIf(packet.reviewOnly !== true, "packet_not_review_only");
  addIf(packet.packetStatus !== "ready_for_report_only_rbc_followup_evaluation", "packet_status_not_ready");
  addIf(packet.proofBoundary?.packetProofRung !== "local_supplied_material", "packet_proof_rung_overclaim");
  addIf(packet.proofBoundary?.publicSwarmProofCreatedByPacket !== false, "packet_claims_public_swarm_created_by_packet");
  addIf(packet.proofBoundary?.seamCrossedSwarmTransportByPacket !== false, "packet_claims_swarm_transport_by_packet");
  addIf(packet.proofBoundary?.governedSeamClaimed !== false, "packet_claims_governed_seam");
  addIf(packet.proofBoundary?.rbcReceiptObserved !== false, "packet_claims_rbc_receipt");
  addIf(packet.proofBoundary?.layerMutationPerformed !== false, "packet_claims_layer_mutation");
  addIf(!arrayOf(packet.followupResolution?.satisfiedFollowupReceiptRefs).includes(REVIEW_RECEIPT_REF), "satisfied_followup_receipt_missing");
  addIf(packet.followupResolution?.materialStatus !== "layer_rbc_boundary_review_material_ready", "material_status_not_ready");
  addIf(packet.reviewMaterial?.appendCapabilityApprovedAsReviewMaterial !== true, "append_capability_review_material_not_approved");
  addIf(packet.reviewMaterial?.appendCapabilityGrantedByThisPacket !== false, "packet_claims_append_capability_grant");
  addIf(packet.reviewMaterial?.appendCapabilityAppliedByThisPacket !== false, "packet_claims_append_capability_application");
  addIf(packet.reviewMaterial?.productionAppendApprovedByThisPacket !== false, "packet_claims_production_append");
  addIf(packet.reviewMaterial?.durableDecisionAppendedByThisPacket !== false, "packet_claims_durable_decision_append");
  addIf(packet.nonClaims?.packetIsRbcReceipt !== false, "packet_non_claim_rbc_receipt_missing_or_true");
  addIf(packet.nonClaims?.packetIsGovernedSeam !== false, "packet_non_claim_governed_seam_missing_or_true");
  addIf(packet.nonClaims?.packetChangesLayerAdmission !== false, "packet_non_claim_layer_admission_missing_or_true");
  addIf(packet.nonClaims?.packetGrantsAppendCapability !== false, "packet_non_claim_append_capability_missing_or_true");
  addIf(packet.nonClaims?.packetAppendsDurableDecision !== false, "packet_non_claim_durable_decision_missing_or_true");
  addIf(packet.nonClaims?.packetGrantsAuthority !== false, "packet_non_claim_authority_missing_or_true");
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

function firstRef(values, fallback) {
  return Array.isArray(values) && values.length > 0 ? values[0] : fallback;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

function hashJson(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
