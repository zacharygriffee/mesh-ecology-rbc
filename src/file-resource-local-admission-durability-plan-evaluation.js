import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_file_resource_local_admission_durability_plan_evaluation.v0";

export const FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES = Object.freeze({
  ALLOWED_FOR_LAYER_CANDIDATE_BOUNDARY: "allowed_for_layer_local_admission_durability_candidate_boundary",
  BLOCKED: "blocked",
  NEEDS_MORE_OBSERVERS: "needs_more_observers"
});

const REQUIRED_FALSE_PLAN_NONCLAIMS = [
  "layerAdmission",
  "broadResourceAdmission",
  "globalCanon",
  "canonicalAdmission",
  "canonicalTruth",
  "admissionAppendApproved",
  "durableAdmissionAppend",
  "productionDurability",
  "materialVisibilityIsDurability",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "localPathAsCanon",
  "viewAsSourceContinuity",
  "multiObserverConvergence",
  "rbcAuthority",
  "edgeAuthority",
  "causalTruth",
  "authority"
];

const REQUIRED_FALSE_VISIBILITY_NONCLAIMS = [
  "actionControls",
  "queueAction",
  "dispatch",
  "execution",
  "layerMutation",
  "layerAdmission",
  "admissionAppendApproved",
  "durableAdmissionAppend",
  "broadResourceAdmission",
  "globalCanon",
  "canonicalTruth",
  "productionDurability",
  "materialVisibilityIsDurability",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "localPathAsCanon",
  "viewAsSourceContinuity",
  "multiObserverConvergence",
  "rbcAuthority",
  "edgeAuthority",
  "authority"
];

const REQUIRED_BLOCKERS = [
  "blocked:local_layer_admission_not_planned_beyond_prerequisites",
  "blocked:durable_admission_append_not_approved",
  "blocked:durable_admission_append_not_attempted",
  "blocked:production_durability_not_proven",
  "blocked:multi_observer_convergence_not_established"
];

export function evaluateFileResourceLocalAdmissionDurabilityPlan({
  layerPlan = {},
  layerPlanReadback = {},
  edgePlanVisibility = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const packetIssues = getFileResourceLocalAdmissionDurabilityPlanIssues({
    layerPlan,
    layerPlanReadback,
    edgePlanVisibility,
    observerMode
  });
  const evaluationStatus = observerMode !== "single_operator_local_layer"
    ? FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES.NEEDS_MORE_OBSERVERS
    : packetIssues.length === 0
      ? FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_BOUNDARY
      : FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES.BLOCKED;
  const input = createFileResourceLocalAdmissionDurabilityPlanEvaluationInput({
    layerPlan,
    layerPlanReadback,
    edgePlanVisibility,
    observerMode,
    evaluationStatus,
    packetIssues
  });
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only_local_admission_durability_plan_evaluation",
    sourceRepo: "mesh-ecology-rbc",
    sourceLayerPlanRef: layerPlan.planRef ?? null,
    sourceLayerPlanHash: layerPlan.planHash ?? null,
    sourceLayerPlanReadbackRef: layerPlanReadback.readbackRef ?? null,
    sourceEdgePlanVisibilityRef: edgePlanVisibility.visibilityRef ?? null,
    sourceEdgePlanVisibilityHash: edgePlanVisibility.visibilityHash ?? null,
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
      layerPlanReadbackHash: layerPlanReadback.readbackHash ?? null,
      preservedSourceRefs: layerPlan.sourceRefs ?? {},
      edgeVisibilitySourceRefs: edgePlanVisibility.sourceRefs ?? {}
    },
    requiredNextBoundary: "layer_consumes_rbc_local_admission_durability_plan_evaluation_before_any_layer_admission_or_durability_candidate",
    nextPosture: "layer_reads_rbc_local_admission_durability_plan_evaluation_report_only",
    nonClaims: {
      approvesAdmission: false,
      approvesAppend: false,
      performsLayerMutation: false,
      layerAdmission: false,
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

export function createFileResourceLocalAdmissionDurabilityPlanEvaluationInput({
  layerPlan,
  layerPlanReadback,
  edgePlanVisibility,
  observerMode,
  evaluationStatus,
  packetIssues
}) {
  const clean = packetIssues.length === 0 &&
    evaluationStatus === FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_BOUNDARY;
  return {
    rulebookRef: "rulebook.file-resource-local-admission-durability-plan-evaluation.report-only.v0",
    capabilityRef: "capability.layer.file-resource.local-admission-durability-plan.evaluation-review.v0",
    scope: {
      scopeRef: "scope:file-resource-lift:local-admission-durability-plan",
      layerPlanRef: layerPlan.planRef ?? null,
      edgePlanVisibilityRef: edgePlanVisibility.visibilityRef ?? null,
      observerMode,
      evaluationStatus
    },
    evidenceRefs: uniqueRefs([
      layerPlan.planRef,
      layerPlan.planHash,
      layerPlanReadback.readbackRef,
      layerPlanReadback.readbackHash,
      edgePlanVisibility.visibilityRef,
      edgePlanVisibility.visibilityHash,
      layerPlan.sourceRefs?.layerAcceptanceAppendRef,
      layerPlan.sourceRefs?.causalAcceptanceObservationRef,
      layerPlan.sourceRefs?.bytesAcceptedVisibilityRef,
      layerPlan.sourceRefs?.edgeAcceptedVisibilityRef,
      layerPlan.sourceRefs?.rbcReceiptRef
    ]),
    expiry: null,
    reason: clean
      ? "Report-only RBC evaluation allows Layer to consider a future local admission/durability candidate boundary; RBC does not admit, append, approve durability, or canonize."
      : "Report-only RBC evaluation is blocked or requires more observers; no Layer candidate, admission, append, or durability action is performed by RBC.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "edge:file-resource-local-admission-durability-plan-visibility",
        surfaceRef: "surface:file-resource-local-admission-durability-plan",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:file-resource-local-admission-durability-plan-evaluator",
        branchRef: "file-resource-lift:local-admission-durability-plan",
        actionRef: "action:file-resource-local-admission-durability-plan-evaluation",
        artifactRef: layerPlan.planRef ?? null,
        contextRef: layerPlan.layerScope?.contextRef ?? null,
        timeRef: edgePlanVisibility.recordedAt ?? layerPlan.plannedAt ?? null
      },
      facts: {
        layerPlanStatus: layerPlan.planStatus,
        layerPlanHashMatches: layerPlanReadback.planHashMatches === true,
        edgePlanVisibilityStatus: edgePlanVisibility.status,
        edgePlanHasNoActionControls: edgePlanVisibility.operatorVisibility?.noActionControls === true,
        observerMode,
        acceptedSourceContinuityPreserved: layerPlan.planningResult?.acceptedSourceContinuityPreserved === true,
        materialVisibilityPreserved: layerPlan.planningResult?.materialVisibilityPreserved === true,
        causalCompatibilityObserved: layerPlan.planningResult?.causalCompatibilityObserved === true,
        productionDurabilityNotClaimed: layerPlan.nonClaims?.productionDurability === false,
        evaluationStatus,
        clean
      },
      rulebooks: [{
        id: "rulebook.file-resource-local-admission-durability-plan-evaluation.report-only.v0",
        rules: [{
          id: "rule.file-resource-local-admission-durability-plan-single-operator-local-layer",
          domain: "file_resource_local_admission_durability_plan",
          effect: "allow",
          priority: 50,
          strength: "normal",
          when: {
            actionRef: "action:file-resource-local-admission-durability-plan-evaluation",
            layerPlanStatus: "layer_file_resource_local_admission_durability_plan_recorded_not_admitted",
            layerPlanHashMatches: true,
            edgePlanVisibilityStatus: "file_resource_local_admission_durability_plan_visible_for_operator_review",
            edgePlanHasNoActionControls: true,
            observerMode: "single_operator_local_layer",
            acceptedSourceContinuityPreserved: true,
            materialVisibilityPreserved: true,
            causalCompatibilityObserved: true,
            productionDurabilityNotClaimed: true,
            evaluationStatus: FILE_RESOURCE_LOCAL_ADMISSION_DURABILITY_PLAN_EVALUATION_STATUSES.ALLOWED_FOR_LAYER_CANDIDATE_BOUNDARY,
            clean: true
          },
          reason:
            "The supplied plan is report-only, visible to Edge, and suitable for Layer to consider a later candidate boundary without creating admission or durability."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: edgePlanVisibility.recordedAt ?? layerPlan.plannedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function getFileResourceLocalAdmissionDurabilityPlanIssues({
  layerPlan = {},
  layerPlanReadback = {},
  edgePlanVisibility = {},
  observerMode = "single_operator_local_layer"
} = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };

  addIf(observerMode !== "single_operator_local_layer", "observer_mode_requires_more_observers");
  addIf(layerPlan.artifactKind !== "layer_file_resource_local_admission_durability_plan", "layer_plan_kind_invalid");
  addIf(layerPlan.schemaVersion !== "layer_file_resource_local_admission_durability_plan.v0", "layer_plan_schema_invalid");
  addIf(layerPlan.planStatus !== "layer_file_resource_local_admission_durability_plan_recorded_not_admitted", "layer_plan_status_invalid");
  addIf(layerPlan.requiredNextBoundary !== "edge_file_resource_local_admission_durability_plan_visibility_before_admission_or_durability_action", "layer_plan_next_boundary_invalid");
  addIf(layerPlan.planningResult?.planOnly !== true, "layer_plan_not_plan_only");
  addIf(layerPlan.planningResult?.acceptedSourceContinuityPreserved !== true, "layer_plan_missing_accepted_source_continuity");
  addIf(layerPlan.planningResult?.acceptedForLayerScopeOnly !== true, "layer_plan_not_layer_scope_only");
  addIf(layerPlan.planningResult?.materialVisibilityPreserved !== true, "layer_plan_missing_material_visibility");
  addIf(layerPlan.planningResult?.causalCompatibilityObserved !== true, "layer_plan_missing_causal_observation");
  addIf(layerPlan.planningResult?.edgeOperatorVisibilityObserved !== true, "layer_plan_missing_edge_visibility");
  addIf(layerPlan.planningResult?.localAdmissionPrerequisitesNamed !== true, "layer_plan_missing_admission_prerequisites");
  addIf(layerPlan.planningResult?.durabilityPrerequisitesNamed !== true, "layer_plan_missing_durability_prerequisites");
  for (const blockerRef of REQUIRED_BLOCKERS) {
    addIf(!layerPlan.planningResult?.remainingBlockers?.some((blocker) => blocker.blockerRef === blockerRef && blocker.resolvedByThisPlan === false), `layer_plan_missing_blocker_${blockerRef}`);
  }
  for (const field of REQUIRED_FALSE_PLAN_NONCLAIMS) {
    addIf(layerPlan.nonClaims?.[field] !== false, `layer_plan_claims_${field}`);
  }

  addIf(layerPlanReadback.artifactKind !== "layer_file_resource_local_admission_durability_plan_readback", "layer_plan_readback_kind_invalid");
  addIf(layerPlanReadback.sourcePlanRef !== layerPlan.planRef, "layer_plan_readback_ref_mismatch");
  addIf(layerPlanReadback.sourcePlanHash !== layerPlan.planHash, "layer_plan_readback_hash_mismatch");
  addIf(layerPlanReadback.recomputedPlanHash !== layerPlan.planHash, "layer_plan_readback_recomputed_hash_mismatch");
  addIf(layerPlanReadback.planHashMatches !== true, "layer_plan_hash_not_verified");
  addIf(layerPlanReadback.planStatus !== layerPlan.planStatus, "layer_plan_readback_status_mismatch");
  addIf(layerPlanReadback.requiredNextBoundary !== layerPlan.requiredNextBoundary, "layer_plan_readback_next_boundary_mismatch");
  addIf(layerPlanReadback.nonClaims?.readbackIsAdmission !== false, "layer_plan_readback_claims_admission");
  addIf(layerPlanReadback.nonClaims?.readbackApprovesAppend !== false, "layer_plan_readback_claims_append_approval");
  addIf(layerPlanReadback.nonClaims?.readbackClaimsDurability !== false, "layer_plan_readback_claims_durability");
  addIf(layerPlanReadback.nonClaims?.readbackIsCanonicalTruth !== false, "layer_plan_readback_claims_canonical_truth");
  addIf(layerPlanReadback.nonClaims?.readbackIsAuthority !== false, "layer_plan_readback_claims_authority");

  addIf(edgePlanVisibility.artifactKind !== "edge_file_resource_local_admission_durability_plan_visibility", "edge_visibility_kind_invalid");
  addIf(edgePlanVisibility.schemaVersion !== "edge_file_resource_local_admission_durability_plan_visibility.v0", "edge_visibility_schema_invalid");
  addIf(edgePlanVisibility.status !== "file_resource_local_admission_durability_plan_visible_for_operator_review", "edge_visibility_status_invalid");
  addIf(edgePlanVisibility.requiredNextBoundary !== "spine_reassessment_after_edge_file_resource_local_admission_durability_plan_visibility", "edge_visibility_next_boundary_invalid");
  addIf(edgePlanVisibility.sourceRefs?.layerPlanRef !== layerPlan.planRef, "edge_visibility_layer_plan_ref_mismatch");
  addIf(edgePlanVisibility.sourceRefs?.layerPlanHash !== layerPlan.planHash, "edge_visibility_layer_plan_hash_mismatch");
  addIf(edgePlanVisibility.sourceRefs?.layerPlanReadbackRef !== layerPlanReadback.readbackRef, "edge_visibility_layer_readback_ref_mismatch");
  addIf(edgePlanVisibility.sourceRefs?.layerPlanReadbackHash !== layerPlanReadback.readbackHash, "edge_visibility_layer_readback_hash_mismatch");
  addIf(edgePlanVisibility.operatorVisibility?.visibleForOperatorReview !== true, "edge_visibility_not_operator_visible");
  addIf(edgePlanVisibility.operatorVisibility?.noActionControls !== true, "edge_visibility_has_action_controls");
  addIf(!Array.isArray(edgePlanVisibility.operatorVisibility?.actionControls) || edgePlanVisibility.operatorVisibility.actionControls.length !== 0, "edge_visibility_action_controls_not_empty");
  addIf(edgePlanVisibility.edgeBoundary?.mutatesLayer !== false, "edge_visibility_mutates_layer");
  addIf(edgePlanVisibility.edgeBoundary?.admitsResource !== false, "edge_visibility_admits_resource");
  addIf(edgePlanVisibility.edgeBoundary?.approvesAppend !== false, "edge_visibility_approves_append");
  addIf(edgePlanVisibility.edgeBoundary?.attemptsDurability !== false, "edge_visibility_attempts_durability");
  addIf(edgePlanVisibility.edgeBoundary?.claimsAuthority !== false, "edge_visibility_claims_authority");
  addIf(edgePlanVisibility.edgeBoundary?.claimsProductionDurability !== false, "edge_visibility_claims_production_durability");
  for (const field of REQUIRED_FALSE_VISIBILITY_NONCLAIMS) {
    addIf(edgePlanVisibility.nonClaims?.[field] !== false, `edge_visibility_claims_${field}`);
  }

  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}
