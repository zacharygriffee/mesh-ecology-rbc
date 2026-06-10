import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const FILE_RESOURCE_LIFT_OPERATOR_DECISION_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_file_resource_lift_operator_decision_evaluation_transcript.v0";

const DECISION_APPROVE = "approve_for_layer_admission_candidate_review";
const DECISION_HOLD = "hold";

const REQUIRED_FALSE_BOUNDARY = [
  "mutatesLayer",
  "admitsResource",
  "appendsContinuity",
  "createsQueueAction",
  "dispatchesWork",
  "acceptsResults",
  "executesRequest",
  "writesStorage",
  "invokesAgent",
  "callsRbc",
  "claimsRbcPermission",
  "completesLayerAdmissionCandidateReview",
  "claimsCanonicalTruth",
  "claimsAuthority"
];

const REQUIRED_FALSE_NONCLAIMS = [
  "actionControls",
  "queueAction",
  "dispatch",
  "execution",
  "layerMutation",
  "layerAdmission",
  "acceptedContinuity",
  "durableAppend",
  "storageWrite",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "localPathAsCanon",
  "viewAsSourceContinuity",
  "operatorReviewAsCanon",
  "rbcEvaluation",
  "rbcPermission",
  "layerAdmissionCandidateReview",
  "agentInvocation",
  "canonicalTruth",
  "authority"
];

export function createFileResourceLiftOperatorDecisionEvaluationInput(decision = {}, decisionReadback = {}) {
  const operatorDecision = decision.operatorDecision ?? {};
  const sourceRefs = decision.sourceRefs ?? {};
  const issues = getFileResourceLiftOperatorDecisionIssues(decision, decisionReadback);
  const clean = issues.length === 0;
  const approved = clean && decision.decision === DECISION_APPROVE && operatorDecision.futureLayerReviewPermitted === true;
  const held = clean && decision.decision === DECISION_HOLD && operatorDecision.heldByOperator === true;

  return {
    rulebookRef: "rulebook.file-resource-lift-operator-decision.report-only.v0",
    capabilityRef: "capability.layer.file-resource-lift.admission-candidate-review.v0",
    scope: {
      scopeRef: "scope:file-resource-lift:operator-decision-boundary",
      actorRef: decision.operatorRef ?? "operator:edge",
      edgeDecisionRef: decision.decisionRef ?? null,
      preflightVisibilityRef: sourceRefs.preflightVisibilityRef ?? null,
      layerPreflightReviewRef: sourceRefs.layerPreflightReviewRef ?? null,
      studioLiftSourceCandidateRef: sourceRefs.studioLiftSourceCandidateRef ?? null,
      bytesVisibilityEvidenceRef: sourceRefs.bytesVisibilityEvidenceRef ?? null,
      decision: decision.decision ?? null
    },
    evidenceRefs: uniqueRefs([
      decision.decisionRef,
      decision.decisionHash,
      decisionReadback.readbackRef,
      decisionReadback.readbackHash,
      sourceRefs.preflightVisibilityRef,
      sourceRefs.preflightVisibilityHash,
      sourceRefs.layerPreflightReviewRef,
      sourceRefs.layerPreflightReviewHash,
      sourceRefs.studioLiftSourceCandidateRef,
      sourceRefs.bytesVisibilityEvidenceRef,
      sourceRefs.bytesPointerRef,
      sourceRefs.bytesResolutionReceiptRef,
      sourceRefs.bytesVisibilityIndexRef
    ]),
    expiry: null,
    reason: held
      ? "Report-only RBC evaluation preserved operator hold; no Layer admission-candidate review is permitted."
      : "Report-only RBC evaluation over supplied Edge file/resource lift operator decision.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "edge:file-resource-lift-operator-decision",
        surfaceRef: "surface:file-resource-lift-decision-boundary",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:file-resource-lift-decision-evaluator",
        branchRef: "file-resource-lift:decision-boundary",
        actionRef: approved
          ? "action:file-resource-lift-admission-candidate-review-request"
          : "action:file-resource-lift-operator-hold",
        artifactRef: decision.decisionRef ?? null,
        contextRef: "context:file-resource-lift-preflight-after-edge-visibility",
        timeRef: decision.recordedAt ?? null
      },
      facts: {
        decisionStatus: decision.status,
        decisionProofRung: decision.proofRung,
        operatorDecision: decision.decision,
        recordedOnly: operatorDecision.recordedOnly === true,
        decisionRecorded: operatorDecision.decisionRecorded === true,
        approvedForLayerAdmissionCandidateReview: operatorDecision.approvedForLayerAdmissionCandidateReview === true,
        heldByOperator: operatorDecision.heldByOperator === true,
        futureLayerReviewPermitted: operatorDecision.futureLayerReviewPermitted === true,
        noActionControls: operatorDecision.noActionControls === true,
        decisionHashMatches: clean,
        sourceRepo: "mesh-ecology-edge",
        decisionHash: decision.decisionHash ?? null,
        readbackHash: decisionReadback.readbackHash ?? null
      },
      rulebooks: [{
        id: "rulebook.file-resource-lift-operator-decision.report-only.v0",
        rules: [{
          id: "rule.file-resource-lift-operator-decision-permits-layer-admission-candidate-review",
          domain: "file_resource_lift_operator_decision",
          effect: "allow",
          priority: 50,
          strength: "normal",
          when: {
            actionRef: "action:file-resource-lift-admission-candidate-review-request",
            decisionStatus: "file_resource_lift_operator_decision_recorded",
            decisionProofRung: "local_supplied_material",
            operatorDecision: DECISION_APPROVE,
            recordedOnly: true,
            decisionRecorded: true,
            approvedForLayerAdmissionCandidateReview: true,
            heldByOperator: false,
            futureLayerReviewPermitted: true,
            noActionControls: true,
            decisionHashMatches: true
          },
          reason:
            "The supplied Edge operator decision permits a report-only Layer admission-candidate review question."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: decision.recordedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function evaluateFileResourceLiftOperatorDecision(decision = {}, decisionReadback = {}) {
  const packetIssues = getFileResourceLiftOperatorDecisionIssues(decision, decisionReadback);
  const input = createFileResourceLiftOperatorDecisionEvaluationInput(decision, decisionReadback);
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: FILE_RESOURCE_LIFT_OPERATOR_DECISION_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    sourceRepo: "mesh-ecology-edge",
    sourceDecisionRef: decision.decisionRef ?? null,
    sourceDecisionHash: decision.decisionHash ?? null,
    sourceDecisionReadbackHash: decisionReadback.readbackHash ?? null,
    decisionHashVerified: packetIssues.length === 0,
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
      sourceRefsFromDecision: decision.sourceRefs ?? {},
      decisionReadbackRef: decisionReadback.sourceDecisionRef ?? null
    },
    nonClaims: {
      ...receipt.nonClaims,
      callsEdgeLive: false,
      mutatesEdge: false,
      mutatesLayer: false,
      queueAction: false,
      dispatch: false,
      resultAcceptance: false,
      requestExecution: false,
      layerAdmission: false,
      acceptedContinuity: false,
      durableAppend: false,
      storageRefAsAdmission: false,
      externalReferenceAsCanon: false,
      localPathAsCanon: false,
      viewAsSourceContinuity: false,
      operatorReviewAsCanon: false,
      governedSeam: false,
      causalTruth: false,
      meshPublication: false,
      productionDurability: false,
      canonicalTruth: false,
      authority: false,
      agentBridge: false
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

export function getFileResourceLiftOperatorDecisionIssues(decision = {}, decisionReadback = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };
  const operatorDecision = decision.operatorDecision ?? {};
  const boundary = decision.edgeBoundary ?? {};
  const nonClaims = decision.nonClaims ?? {};
  const sourceRefs = decision.sourceRefs ?? {};

  addIf(decision.artifactKind !== "edge_file_resource_lift_operator_decision", "decision_kind_mismatch");
  addIf(decision.schemaVersion !== "edge_file_resource_lift_operator_decision.v0", "decision_schema_mismatch");
  addIf(decision.status !== "file_resource_lift_operator_decision_recorded", "decision_status_not_recorded");
  addIf(decision.proofRung !== "local_supplied_material", "decision_proof_rung_overclaim");
  addIf(![DECISION_APPROVE, DECISION_HOLD].includes(decision.decision), "operator_decision_invalid");

  for (const [field, issue] of [
    ["recordedOnly", "decision_not_recorded_only"],
    ["decisionRecorded", "decision_not_recorded"],
    ["noActionControls", "action_controls_present"]
  ]) {
    addIf(operatorDecision[field] !== true, issue);
  }
  addIf(arrayOf(operatorDecision.actionControls).length > 0, "action_controls_present");

  if (decision.decision === DECISION_APPROVE) {
    addIf(operatorDecision.approvedForLayerAdmissionCandidateReview !== true, "approval_not_recorded");
    addIf(operatorDecision.futureLayerReviewPermitted !== true, "future_layer_review_not_permitted");
    addIf(operatorDecision.heldByOperator !== false, "operator_hold_conflicts_with_approval");
  }
  if (decision.decision === DECISION_HOLD) {
    addIf(operatorDecision.heldByOperator !== true, "operator_hold_not_recorded");
    addIf(operatorDecision.futureLayerReviewPermitted !== false, "hold_must_not_permit_layer_review");
    addIf(operatorDecision.approvedForLayerAdmissionCandidateReview !== false, "hold_conflicts_with_approval");
  }

  for (const [field, issue] of [
    ["preflightVisibilityRef", "preflight_visibility_ref_missing"],
    ["preflightVisibilityHash", "preflight_visibility_hash_missing"],
    ["layerPreflightReviewRef", "layer_preflight_review_ref_missing"],
    ["layerPreflightReviewHash", "layer_preflight_review_hash_missing"],
    ["studioLiftSourceCandidateRef", "studio_lift_source_candidate_ref_missing"],
    ["bytesVisibilityEvidenceRef", "bytes_visibility_evidence_ref_missing"]
  ]) {
    addIf(typeof sourceRefs[field] !== "string" || sourceRefs[field].length === 0, issue);
  }

  for (const field of REQUIRED_FALSE_BOUNDARY) {
    addIf(boundary[field] !== false, `packet_claims_${field}`);
  }

  for (const field of REQUIRED_FALSE_NONCLAIMS) {
    addIf(nonClaims[field] !== false, `non_claim_${field}_missing_or_true`);
  }

  addIf(decisionReadback.artifactKind !== "edge_file_resource_lift_operator_decision_readback", "readback_kind_mismatch");
  addIf(decisionReadback.schemaVersion !== "edge_file_resource_lift_operator_decision_readback.v0", "readback_schema_mismatch");
  addIf(decisionReadback.sourceDecisionRef !== decision.decisionRef, "readback_decision_ref_mismatch");
  addIf(decisionReadback.sourceDecisionHash !== decision.decisionHash, "readback_decision_hash_mismatch");
  addIf(decisionReadback.recomputedDecisionHash !== decision.decisionHash, "readback_recomputed_hash_mismatch");
  addIf(decisionReadback.decisionHashMatches !== true, "readback_hash_not_verified");
  addIf(decisionReadback.proofRung !== "local_supplied_material", "readback_proof_rung_overclaim");
  addIf(!decision.decisionHash, "decision_hash_missing");
  if (decision.decisionHash) {
    const { decisionHash, ...withoutHash } = decision;
    addIf(decision.decisionHash !== `sha256:${stableHash(withoutHash)}`, "decision_hash_mismatch");
  }

  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}
