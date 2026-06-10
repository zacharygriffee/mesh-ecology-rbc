import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_file_resource_local_admission_durability_candidate_shape_plan_evaluation.v0";

export const FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES = Object.freeze({
  ALLOWED_FOR_LAYER_CANDIDATE_CREATION_BOUNDARY:
    "allowed_for_layer_local_admission_durability_candidate_creation_boundary",
  BLOCKED: "blocked",
  NEEDS_MORE_OBSERVERS: "needs_more_observers"
});

const REQUIRED_CANDIDATE_FIELDS = [
  "targetLayerScope",
  "sourceContinuityAcceptanceRef",
  "sourceContinuityAcceptanceReadbackRef",
  "materialVisibilityRefs",
  "sourceEvidenceRefs",
  "candidatePrerequisitePacketRef",
  "candidatePrerequisiteVisibilityRef",
  "rbcEvaluationQuestion",
  "bytesDurabilityPostureQuestion",
  "causalObservationQuestion",
  "operatorMediationQuestion",
  "candidateNonClaims"
];

const REQUIRED_BLOCKERS = [
  "blocked:local_admission_candidate_not_created",
  "blocked:layer_admission_not_appended",
  "blocked:append_approval_not_granted",
  "blocked:durable_admission_append_not_attempted",
  "blocked:production_durability_not_proven",
  "blocked:multi_observer_convergence_not_established",
  "blocked:canonical_truth_not_claimed"
];

const REQUIRED_FALSE_NONCLAIMS = [
  "actionControls",
  "queueAction",
  "dispatch",
  "execution",
  "layerMutation",
  "localAdmissionCandidate",
  "layerAdmission",
  "broadResourceAdmission",
  "globalCanon",
  "canonicalAdmission",
  "canonicalTruth",
  "admissionAppendApproved",
  "durableAdmissionAppend",
  "productionDurability",
  "materialVisibilityIsDurability",
  "materialVisibilityIsCanon",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "localPathAsCanon",
  "viewAsSourceContinuity",
  "multiObserverConvergence",
  "rbcDecisionAsAdmission",
  "rbcDecisionAsAppendApproval",
  "rbcDecisionAsDurabilityApproval",
  "rbcAuthority",
  "edgeAuthority",
  "causalTruth",
  "authority"
];

export function evaluateFileResourceLocalAdmissionDurabilityCandidateShapePlan({
  layerShapePlan = {},
  layerShapePlanReadback = {},
  edgeShapePlanVisibility = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const packetIssues = getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues({
    layerShapePlan,
    layerShapePlanReadback,
    edgeShapePlanVisibility,
    observerMode
  });
  const evaluationStatus = observerMode !== "single_operator_local_layer"
    ? FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES.NEEDS_MORE_OBSERVERS
    : packetIssues.length === 0
      ? FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_CREATION_BOUNDARY
      : FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES.BLOCKED;
  const input = createFileResourceLocalAdmissionDurabilityCandidateShapePlanEvaluationInput({
    layerShapePlan,
    layerShapePlanReadback,
    edgeShapePlanVisibility,
    observerMode,
    evaluationStatus,
    packetIssues
  });
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only_local_admission_durability_candidate_shape_plan_evaluation",
    sourceRepo: "mesh-ecology-rbc",
    sourceLayerShapePlanRef: layerShapePlan.planRef ?? null,
    sourceLayerShapePlanHash: layerShapePlan.planHash ?? null,
    sourceLayerShapePlanReadbackRef: layerShapePlanReadback.readbackRef ?? null,
    sourceEdgeShapePlanVisibilityRef: edgeShapePlanVisibility.visibilityRef ?? null,
    sourceEdgeShapePlanVisibilityHash: edgeShapePlanVisibility.visibilityHash ?? null,
    observerMode,
    evaluationStatus,
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
      layerShapePlanReadbackHash: layerShapePlanReadback.readbackHash ?? null,
      preservedSourceRefs: layerShapePlan.sourceRefs ?? {},
      edgeVisibilitySourceRefs: edgeShapePlanVisibility.sourceRefs ?? {}
    },
    requiredNextBoundary:
      "layer_consumes_rbc_local_admission_durability_candidate_shape_plan_evaluation_before_any_candidate_creation_or_admission",
    nextPosture: "layer_reads_rbc_local_admission_durability_candidate_shape_plan_evaluation_report_only",
    nonClaims: {
      createsCandidate: false,
      approvesAdmission: false,
      approvesAppend: false,
      approvesDurability: false,
      performsLayerMutation: false,
      layerAdmission: false,
      localAdmissionCandidate: false,
      admissionAppendApproved: false,
      durableAdmissionAppend: false,
      canonicalTruth: false,
      productionDurability: false,
      materialVisibilityIsDurability: false,
      storageRefAsAdmission: false,
      externalReferenceAsCanon: false,
      viewAsSourceContinuity: false,
      edgeAuthority: false,
      rbcAuthority: false,
      authority: false
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

export function createFileResourceLocalAdmissionDurabilityCandidateShapePlanEvaluationInput({
  layerShapePlan,
  layerShapePlanReadback,
  edgeShapePlanVisibility,
  observerMode,
  evaluationStatus,
  packetIssues
}) {
  const clean = packetIssues.length === 0 &&
    evaluationStatus ===
      FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_CREATION_BOUNDARY;
  return {
    rulebookRef: "rulebook.file-resource-local-admission-durability-candidate-shape-plan-evaluation.report-only.v0",
    capabilityRef:
      "capability.layer.file-resource.local-admission-durability-candidate-shape-plan.evaluation-review.v0",
    scope: {
      scopeRef: "scope:file-resource-lift:local-admission-durability-candidate-shape-plan",
      layerShapePlanRef: layerShapePlan.planRef ?? null,
      edgeShapePlanVisibilityRef: edgeShapePlanVisibility.visibilityRef ?? null,
      observerMode,
      evaluationStatus
    },
    evidenceRefs: uniqueRefs([
      layerShapePlan.planRef,
      layerShapePlan.planHash,
      layerShapePlanReadback.readbackRef,
      layerShapePlanReadback.readbackHash,
      edgeShapePlanVisibility.visibilityRef,
      edgeShapePlanVisibility.visibilityHash,
      layerShapePlan.sourceRefs?.layerPrerequisitePacketRef,
      layerShapePlan.sourceRefs?.edgePrerequisiteVisibilityRef,
      layerShapePlan.sourceRefs?.layerAcceptanceAppendRef,
      layerShapePlan.sourceRefs?.causalAcceptanceObservationRef,
      layerShapePlan.sourceRefs?.bytesAcceptedVisibilityRef,
      layerShapePlan.sourceRefs?.edgeIntentRef,
      layerShapePlan.sourceRefs?.rbcPlanEvaluationReceiptRef
    ]),
    expiry: null,
    reason: clean
      ? "Report-only RBC evaluation allows Layer to consider a future local admission/durability candidate creation boundary; RBC does not create the candidate, admit, append, approve durability, or canonize."
      : "Report-only RBC evaluation is blocked or requires more observers; no candidate, Layer admission, append, or durability action is performed by RBC.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "edge:file-resource-local-admission-durability-candidate-shape-plan-visibility",
        surfaceRef: "surface:file-resource-local-admission-durability-candidate-shape-plan",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:file-resource-local-admission-durability-candidate-shape-plan-evaluator",
        branchRef: "file-resource-lift:local-admission-durability-candidate-shape-plan",
        actionRef: "action:file-resource-local-admission-durability-candidate-shape-plan-evaluation",
        artifactRef: layerShapePlan.planRef ?? null,
        contextRef: layerShapePlan.layerScope?.contextRef ?? null,
        timeRef: edgeShapePlanVisibility.recordedAt ?? layerShapePlan.recordedAt ?? null
      },
      facts: {
        layerShapePlanStatus: layerShapePlan.planStatus,
        layerShapePlanHashMatches: layerShapePlanReadback.planHashMatches === true,
        edgeShapePlanVisibilityStatus: edgeShapePlanVisibility.status,
        edgeShapePlanHasNoActionControls: edgeShapePlanVisibility.operatorVisibility?.noActionControls === true,
        observerMode,
        shapeOnly: layerShapePlan.candidateShape?.shapeOnly === true,
        candidateCreated: layerShapePlan.candidateShape?.candidateCreated,
        edgeCandidateCreated: edgeShapePlanVisibility.operatorVisibility?.candidateCreated,
        sourceRefsPreserved: edgeShapePlanVisibility.operatorVisibility?.sourceRefsPreserved === true,
        productionDurabilityNotClaimed: layerShapePlan.nonClaims?.productionDurability === false,
        evaluationStatus,
        clean
      },
      rulebooks: [{
        id: "rulebook.file-resource-local-admission-durability-candidate-shape-plan-evaluation.report-only.v0",
        rules: [{
          id: "rule.file-resource-local-admission-durability-candidate-shape-plan-single-operator-local-layer",
          domain: "file_resource_local_admission_durability_candidate_shape_plan",
          effect: "allow",
          priority: 50,
          strength: "normal",
          when: {
            actionRef: "action:file-resource-local-admission-durability-candidate-shape-plan-evaluation",
            layerShapePlanStatus:
              "layer_file_resource_local_admission_durability_candidate_shape_plan_recorded_not_candidate",
            layerShapePlanHashMatches: true,
            edgeShapePlanVisibilityStatus:
              "file_resource_local_admission_durability_candidate_shape_plan_visible_for_operator_review",
            edgeShapePlanHasNoActionControls: true,
            observerMode: "single_operator_local_layer",
            shapeOnly: true,
            candidateCreated: false,
            edgeCandidateCreated: false,
            sourceRefsPreserved: true,
            productionDurabilityNotClaimed: true,
            evaluationStatus:
              FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_CANDIDATE_SHAPE_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_CREATION_BOUNDARY,
            clean: true
          },
          reason:
            "The supplied shape plan is report-only, visible to Edge, and suitable for Layer to consider a later candidate creation boundary without creating admission or durability."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: edgeShapePlanVisibility.recordedAt ?? layerShapePlan.recordedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues({
  layerShapePlan = {},
  layerShapePlanReadback = {},
  edgeShapePlanVisibility = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };

  addIf(observerMode !== "single_operator_local_layer", "observer_mode_requires_more_observers");
  addIf(
    layerShapePlan.artifactKind !== "layer_file_resource_local_admission_durability_candidate_shape_plan",
    "layer_shape_plan_kind_invalid"
  );
  addIf(
    layerShapePlan.schemaVersion !== "layer_file_resource_local_admission_durability_candidate_shape_plan.v0",
    "layer_shape_plan_schema_invalid"
  );
  addIf(
    layerShapePlan.planStatus !== "layer_file_resource_local_admission_durability_candidate_shape_plan_recorded_not_candidate",
    "layer_shape_plan_status_invalid"
  );
  addIf(
    layerShapePlan.requiredNextBoundary !==
      "edge_file_resource_local_admission_durability_candidate_shape_plan_visibility_before_any_candidate_append_admission_or_durability_action",
    "layer_shape_plan_next_boundary_invalid"
  );
  addIf(layerShapePlan.candidateShape?.shapeOnly !== true, "layer_shape_plan_not_shape_only");
  addIf(layerShapePlan.candidateShape?.candidateCreated !== false, "layer_shape_plan_created_candidate");
  addIf(layerShapePlan.candidateShape?.candidateAppendApproved !== false, "layer_shape_plan_approved_append");
  addIf(layerShapePlan.candidateShape?.admissionAppendAttempted !== false, "layer_shape_plan_attempted_admission_append");
  addIf(layerShapePlan.candidateShape?.durabilityActionAttempted !== false, "layer_shape_plan_attempted_durability");
  addIf(
    layerShapePlan.candidateShape?.productionDurabilityAttempted !== false,
    "layer_shape_plan_attempted_production_durability"
  );
  addIf(
    layerShapePlan.candidateShape?.acceptedSourceContinuityScope !== "single_operator_local_layer_only",
    "layer_shape_plan_source_continuity_scope_invalid"
  );
  addIf(
    layerShapePlan.candidateShape?.materialVisibilityPosture !==
      "material_visibility_required_but_not_durability_or_canon",
    "layer_shape_plan_material_visibility_posture_invalid"
  );
  for (const fieldRef of REQUIRED_CANDIDATE_FIELDS) {
    addIf(
      !layerShapePlan.candidateShape?.candidateFields?.some(
        (field) => field.fieldRef === fieldRef &&
          field.requiredForFutureCandidate === true &&
          field.satisfiedByThisPlan === false
      ),
      `layer_shape_plan_missing_candidate_field_${fieldRef}`
    );
  }
  for (const blockerRef of REQUIRED_BLOCKERS) {
    addIf(
      !layerShapePlan.candidateShape?.remainingBlockers?.some(
        (blocker) => blocker.blockerRef === blockerRef && blocker.resolvedByThisPlan === false
      ),
      `layer_shape_plan_missing_blocker_${blockerRef}`
    );
  }
  for (const field of REQUIRED_FALSE_NONCLAIMS) {
    addIf(layerShapePlan.nonClaims?.[field] !== false, `layer_shape_plan_claims_${field}`);
  }

  addIf(
    layerShapePlanReadback.artifactKind !== "layer_file_resource_local_admission_durability_candidate_shape_plan_readback",
    "layer_shape_plan_readback_kind_invalid"
  );
  addIf(layerShapePlanReadback.sourcePlanRef !== layerShapePlan.planRef, "layer_shape_plan_readback_ref_mismatch");
  addIf(layerShapePlanReadback.sourcePlanHash !== layerShapePlan.planHash, "layer_shape_plan_readback_hash_mismatch");
  addIf(
    layerShapePlanReadback.recomputedPlanHash !== layerShapePlan.planHash,
    "layer_shape_plan_readback_recomputed_hash_mismatch"
  );
  addIf(layerShapePlanReadback.planHashMatches !== true, "layer_shape_plan_hash_not_verified");
  addIf(layerShapePlanReadback.planStatus !== layerShapePlan.planStatus, "layer_shape_plan_readback_status_mismatch");
  addIf(
    layerShapePlanReadback.requiredNextBoundary !== layerShapePlan.requiredNextBoundary,
    "layer_shape_plan_readback_next_boundary_mismatch"
  );
  addIf(layerShapePlanReadback.nonClaims?.readbackIsCandidate !== false, "layer_shape_plan_readback_claims_candidate");
  addIf(layerShapePlanReadback.nonClaims?.readbackIsAdmission !== false, "layer_shape_plan_readback_claims_admission");
  addIf(layerShapePlanReadback.nonClaims?.readbackApprovesAppend !== false, "layer_shape_plan_readback_claims_append_approval");
  addIf(layerShapePlanReadback.nonClaims?.readbackClaimsDurability !== false, "layer_shape_plan_readback_claims_durability");
  addIf(
    layerShapePlanReadback.nonClaims?.readbackIsCanonicalTruth !== false,
    "layer_shape_plan_readback_claims_canonical_truth"
  );
  addIf(layerShapePlanReadback.nonClaims?.readbackIsAuthority !== false, "layer_shape_plan_readback_claims_authority");

  addIf(
    edgeShapePlanVisibility.artifactKind !== "edge_file_resource_local_admission_durability_candidate_shape_plan_visibility",
    "edge_visibility_kind_invalid"
  );
  addIf(
    edgeShapePlanVisibility.schemaVersion !== "edge_file_resource_local_admission_durability_candidate_shape_plan_visibility.v0",
    "edge_visibility_schema_invalid"
  );
  addIf(
    edgeShapePlanVisibility.status !==
      "file_resource_local_admission_durability_candidate_shape_plan_visible_for_operator_review",
    "edge_visibility_status_invalid"
  );
  addIf(
    edgeShapePlanVisibility.requiredNextBoundary !==
      "spine_reassessment_after_edge_file_resource_local_admission_durability_candidate_shape_plan_visibility",
    "edge_visibility_next_boundary_invalid"
  );
  addIf(edgeShapePlanVisibility.sourceRefs?.layerPlanRef !== layerShapePlan.planRef, "edge_visibility_layer_plan_ref_mismatch");
  addIf(edgeShapePlanVisibility.sourceRefs?.layerPlanHash !== layerShapePlan.planHash, "edge_visibility_layer_plan_hash_mismatch");
  addIf(
    edgeShapePlanVisibility.sourceRefs?.layerPlanReadbackRef !== layerShapePlanReadback.readbackRef,
    "edge_visibility_layer_readback_ref_mismatch"
  );
  addIf(
    edgeShapePlanVisibility.sourceRefs?.layerPlanReadbackHash !== layerShapePlanReadback.readbackHash,
    "edge_visibility_layer_readback_hash_mismatch"
  );
  addIf(edgeShapePlanVisibility.operatorVisibility?.visibleForOperatorReview !== true, "edge_visibility_not_operator_visible");
  addIf(edgeShapePlanVisibility.operatorVisibility?.shapeOnly !== true, "edge_visibility_not_shape_only");
  addIf(edgeShapePlanVisibility.operatorVisibility?.candidateCreated !== false, "edge_visibility_created_candidate");
  addIf(edgeShapePlanVisibility.operatorVisibility?.sourceRefsPreserved !== true, "edge_visibility_source_refs_not_preserved");
  addIf(edgeShapePlanVisibility.operatorVisibility?.readOnly !== true, "edge_visibility_not_read_only");
  addIf(edgeShapePlanVisibility.operatorVisibility?.statusOnly !== true, "edge_visibility_not_status_only");
  addIf(edgeShapePlanVisibility.operatorVisibility?.noActionControls !== true, "edge_visibility_has_action_controls");
  addIf(
    !Array.isArray(edgeShapePlanVisibility.operatorVisibility?.actionControls) ||
      edgeShapePlanVisibility.operatorVisibility.actionControls.length !== 0,
    "edge_visibility_action_controls_not_empty"
  );
  addIf(edgeShapePlanVisibility.edgeBoundary?.mutatesLayer !== false, "edge_visibility_mutates_layer");
  addIf(
    edgeShapePlanVisibility.edgeBoundary?.createsLocalAdmissionCandidate !== false,
    "edge_visibility_creates_candidate"
  );
  addIf(edgeShapePlanVisibility.edgeBoundary?.admitsResource !== false, "edge_visibility_admits_resource");
  addIf(edgeShapePlanVisibility.edgeBoundary?.approvesAdmissionAppend !== false, "edge_visibility_approves_append");
  addIf(edgeShapePlanVisibility.edgeBoundary?.approvesDurability !== false, "edge_visibility_approves_durability");
  addIf(edgeShapePlanVisibility.edgeBoundary?.attemptsDurability !== false, "edge_visibility_attempts_durability");
  addIf(edgeShapePlanVisibility.edgeBoundary?.claimsAuthority !== false, "edge_visibility_claims_authority");
  addIf(
    edgeShapePlanVisibility.edgeBoundary?.claimsProductionDurability !== false,
    "edge_visibility_claims_production_durability"
  );
  for (const field of REQUIRED_FALSE_NONCLAIMS) {
    addIf(edgeShapePlanVisibility.nonClaims?.[field] !== false, `edge_visibility_claims_${field}`);
  }

  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}
