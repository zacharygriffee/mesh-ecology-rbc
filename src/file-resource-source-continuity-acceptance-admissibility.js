import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_TRANSCRIPT_VERSION =
  "rbc_file_resource_source_continuity_acceptance_admissibility_evaluation.v0";

export const FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES = Object.freeze({
  ADMISSIBLE: "admissible_for_layer_source_continuity_acceptance_append",
  BLOCKED: "blocked",
  NEEDS_MORE_OBSERVERS: "needs_more_observers"
});

const REQUIRED_FALSE_NONCLAIMS = [
  "callsLayerLive",
  "mutatesLayer",
  "layerAdmission",
  "admissionDecisionApplied",
  "admissionAppendApproved",
  "layerAppend",
  "acceptedContinuity",
  "acceptedSourceContinuity",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "viewAsSourceContinuity",
  "rbcDecisionAsAdmission",
  "rbcDecisionAsAppend",
  "canonicalTruth",
  "authority",
  "productionDurability"
];

export function evaluateFileResourceSourceContinuityAcceptanceAdmissibility({
  edgeIntent = {},
  edgeIntentReadback = {},
  layerRemainingBlockersPacket = {},
  causalPrerequisiteObservation = {},
  bytesVisibilityEvidence = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const packetIssues = getFileResourceSourceContinuityAcceptanceAdmissibilityIssues({
    edgeIntent,
    edgeIntentReadback,
    layerRemainingBlockersPacket,
    causalPrerequisiteObservation,
    bytesVisibilityEvidence,
    observerMode
  });
  const status = observerMode !== "single_operator_local_layer"
    ? FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES.NEEDS_MORE_OBSERVERS
    : packetIssues.length === 0
      ? FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES.ADMISSIBLE
      : FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES.BLOCKED;
  const input = createFileResourceSourceContinuityAcceptanceAdmissibilityInput({
    edgeIntent,
    edgeIntentReadback,
    layerRemainingBlockersPacket,
    causalPrerequisiteObservation,
    bytesVisibilityEvidence,
    observerMode,
    status,
    packetIssues
  });
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only_admissibility",
    sourceRepo: "mesh-ecology-rbc",
    sourceEdgeIntentRef: edgeIntent.intentRef ?? null,
    sourceEdgeIntentHash: edgeIntent.intentHash ?? null,
    sourceLayerRemainingBlockersPacketRef: layerRemainingBlockersPacket.packetRef ?? null,
    sourceCausalObservationRef: causalPrerequisiteObservation.observationId ?? null,
    sourceBytesVisibilityEvidenceRef: bytesVisibilityEvidence.evidenceRef ?? null,
    observerMode,
    admissibilityStatus: status,
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
      edgeIntentReadbackRef: edgeIntentReadback.readbackRef ?? null,
      layerRemainingBlockersPacketHash: layerRemainingBlockersPacket.packetHash ?? null,
      causalPrerequisiteObservationHash: causalPrerequisiteObservation.observationHash ?? null,
      bytesVisibilityEvidenceHash: bytesVisibilityEvidence.evidenceHash ?? null
    },
    nonClaims: Object.fromEntries(REQUIRED_FALSE_NONCLAIMS.map((field) => [field, false]))
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

export function createFileResourceSourceContinuityAcceptanceAdmissibilityInput({
  edgeIntent,
  edgeIntentReadback,
  layerRemainingBlockersPacket,
  causalPrerequisiteObservation,
  bytesVisibilityEvidence,
  observerMode,
  status,
  packetIssues
}) {
  const clean = packetIssues.length === 0 && status === FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES.ADMISSIBLE;
  return {
    rulebookRef: "rulebook.file-resource-source-continuity-acceptance-admissibility.report-only.v0",
    capabilityRef: "capability.layer.file-resource.source-continuity-acceptance.admissibility-review.v0",
    scope: {
      scopeRef: "scope:file-resource-lift:source-continuity-acceptance",
      edgeIntentRef: edgeIntent.intentRef ?? null,
      layerRemainingBlockersPacketRef: layerRemainingBlockersPacket.packetRef ?? null,
      causalPrerequisiteObservationRef: causalPrerequisiteObservation.observationId ?? null,
      bytesVisibilityEvidenceRef: bytesVisibilityEvidence.evidenceRef ?? null,
      observerMode,
      admissibilityStatus: status
    },
    evidenceRefs: uniqueRefs([
      edgeIntent.intentRef,
      edgeIntent.intentHash,
      edgeIntentReadback.readbackRef,
      edgeIntentReadback.readbackHash,
      layerRemainingBlockersPacket.packetRef,
      layerRemainingBlockersPacket.packetHash,
      causalPrerequisiteObservation.observationId,
      causalPrerequisiteObservation.observationHash,
      bytesVisibilityEvidence.evidenceRef,
      bytesVisibilityEvidence.evidenceHash
    ]),
    expiry: null,
    reason: clean
      ? "Report-only RBC admissibility over confirmed Edge intent; Layer may perform its own source-continuity acceptance append."
      : "Report-only RBC admissibility blocked or requires more observers; no Layer append is performed by RBC.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "edge:file-resource-source-continuity-acceptance-operator-intent",
        surfaceRef: "surface:file-resource-source-continuity-acceptance",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:file-resource-source-continuity-acceptance-admissibility-evaluator",
        branchRef: "file-resource-lift:source-continuity-acceptance",
        actionRef: "action:file-resource-source-continuity-acceptance-admissibility-review",
        artifactRef: edgeIntent.intentRef ?? null,
        contextRef: edgeIntent.sourceRefs?.targetContextRef ?? null,
        timeRef: edgeIntent.recordedAt ?? null
      },
      facts: {
        intentStatus: edgeIntent.status,
        intentHashMatches: edgeIntentReadback.intentHashMatches === true,
        operatorConfirmed: edgeIntent.operatorIntent?.operatorConfirmed === true,
        requestedVerb: edgeIntent.requestedVerb,
        observerMode,
        layerRemainingBlockersStatus: layerRemainingBlockersPacket.packetStatus,
        causalPrerequisiteObserved: causalPrerequisiteObservation.status,
        bytesVisibilityStatus: bytesVisibilityEvidence.visibilityStatus,
        admissibilityStatus: status,
        clean
      },
      rulebooks: [{
        id: "rulebook.file-resource-source-continuity-acceptance-admissibility.report-only.v0",
        rules: [{
          id: "rule.file-resource-source-continuity-acceptance-single-operator-local-layer",
          domain: "file_resource_source_continuity_acceptance",
          effect: "allow",
          priority: 50,
          strength: "normal",
          when: {
            actionRef: "action:file-resource-source-continuity-acceptance-admissibility-review",
            intentStatus: "edge_file_resource_source_continuity_acceptance_operator_intent_recorded",
            intentHashMatches: true,
            operatorConfirmed: true,
            requestedVerb: "accept_file_resource_source_continuity",
            observerMode: "single_operator_local_layer",
            layerRemainingBlockersStatus: "layer_file_resource_source_continuity_acceptance_remaining_blockers_packet_recorded_not_accepted",
            causalPrerequisiteObserved: "file-resource-source-continuity-prerequisite-observed",
            bytesVisibilityStatus: "studio_lift_source_pointer_and_payload_visibility_visible",
            admissibilityStatus: FILE_RESOURCE_SOURCE_CONTINUITY_ACCEPTANCE_ADMISSIBILITY_STATUSES.ADMISSIBLE,
            clean: true
          },
          reason:
            "Single-operator local-layer evidence is admissible for Layer-owned source-continuity acceptance append."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: edgeIntent.recordedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function getFileResourceSourceContinuityAcceptanceAdmissibilityIssues({
  edgeIntent = {},
  edgeIntentReadback = {},
  layerRemainingBlockersPacket = {},
  causalPrerequisiteObservation = {},
  bytesVisibilityEvidence = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };
  addIf(observerMode !== "single_operator_local_layer", "observer_mode_requires_more_observers");
  addIf(edgeIntent.artifactKind !== "edge_file_resource_source_continuity_acceptance_operator_intent", "edge_intent_kind_invalid");
  addIf(edgeIntent.schemaVersion !== "edge_file_resource_source_continuity_acceptance_operator_intent.v0", "edge_intent_schema_invalid");
  addIf(edgeIntent.status !== "edge_file_resource_source_continuity_acceptance_operator_intent_recorded", "edge_intent_not_recorded");
  addIf(edgeIntent.requestedVerb !== "accept_file_resource_source_continuity", "edge_intent_requested_verb_invalid");
  addIf(edgeIntent.operatorIntent?.operatorConfirmed !== true, "edge_intent_not_operator_confirmed");
  addIf(edgeIntentReadback.artifactKind !== "edge_file_resource_source_continuity_acceptance_operator_intent_readback", "edge_intent_readback_kind_invalid");
  addIf(edgeIntentReadback.sourceIntentRef !== edgeIntent.intentRef, "edge_intent_readback_ref_mismatch");
  addIf(edgeIntentReadback.sourceIntentHash !== edgeIntent.intentHash, "edge_intent_readback_hash_mismatch");
  addIf(edgeIntentReadback.intentHashMatches !== true, "edge_intent_hash_not_verified");
  addIf(layerRemainingBlockersPacket.artifactKind !== "layer_file_resource_source_continuity_acceptance_remaining_blockers_packet", "layer_remaining_blockers_kind_invalid");
  addIf(layerRemainingBlockersPacket.packetStatus !== "layer_file_resource_source_continuity_acceptance_remaining_blockers_packet_recorded_not_accepted", "layer_remaining_blockers_status_invalid");
  addIf(causalPrerequisiteObservation.artifactKind !== "causal_file_resource_source_continuity_prerequisite_observation", "causal_observation_kind_invalid");
  addIf(causalPrerequisiteObservation.status !== "file-resource-source-continuity-prerequisite-observed", "causal_prerequisite_not_observed");
  addIf(bytesVisibilityEvidence.artifactKind !== "bytes_studio_file_resource_lift_visibility_evidence", "bytes_visibility_kind_invalid");
  addIf(bytesVisibilityEvidence.visibilityStatus !== "studio_lift_source_pointer_and_payload_visibility_visible", "bytes_visibility_not_visible");
  for (const field of [
    "layerMutation",
    "layerAdmission",
    "sourceContinuityAccepted",
    "acceptedSourceContinuity",
    "layerAppend",
    "canonicalTruth",
    "authority"
  ]) {
    addIf(edgeIntent.nonClaims?.[field] !== false, `edge_intent_claims_${field}`);
  }
  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}
