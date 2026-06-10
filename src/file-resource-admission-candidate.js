import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const FILE_RESOURCE_ADMISSION_CANDIDATE_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_file_resource_admission_candidate_evaluation_transcript.v0";

const READY = "ready_for_operator_rbc_admission_decision";
const REQUIRED_NEXT_BOUNDARY = "explicit_operator_or_rbc_admission_decision_before_layer_admission_append";

const REQUIRED_FALSE_PROOF_BOUNDARY = [
  "layerAdmission",
  "durableAppend",
  "acceptedContinuity",
  "storageRefAsAdmission",
  "externalReferenceAsCanon",
  "localPathAsCanon",
  "viewAsSourceContinuity",
  "operatorReviewAsCanon",
  "rbcDecisionAsAdmission",
  "causalObservationAsTruth",
  "canonicalTruth",
  "authority"
];

export function createFileResourceAdmissionCandidateEvaluationInput(candidate = {}, candidateReadback = {}) {
  const issues = getFileResourceAdmissionCandidateIssues(candidate, candidateReadback);
  const clean = issues.length === 0;

  return {
    rulebookRef: "rulebook.file-resource-admission-candidate.report-only.v0",
    capabilityRef: "capability.layer.file-resource.admission-decision-material-review.v0",
    scope: {
      scopeRef: "scope:file-resource-lift:admission-candidate-boundary",
      layerCandidateRef: candidate.candidateRef ?? null,
      layerCandidateHash: candidate.candidateHash ?? null,
      sourceLayerCommitHash: candidate.sourceLayerCommitHash ?? null,
      edgeOperatorDecisionRef: candidate.sourceRefs?.edgeOperatorDecisionRef ?? null,
      priorRbcReceiptRef: candidate.sourceRefs?.rbcReceiptRef ?? null,
      causalCompatibilityObservationRef: candidate.sourceRefs?.causalCompatibilityObservationRef ?? null,
      requiredNextBoundary: candidate.requiredNextBoundary ?? null
    },
    evidenceRefs: uniqueRefs([
      candidate.candidateRef,
      candidate.candidateHash,
      candidateReadback.readbackRef,
      candidateReadback.readbackHash,
      candidate.sourceRefs?.layerDecisionBoundaryReviewRef,
      candidate.sourceRefs?.layerDecisionBoundaryReviewHash,
      candidate.sourceRefs?.causalCompatibilityObservationRef,
      candidate.sourceRefs?.causalCompatibilityObservationHash,
      candidate.sourceRefs?.edgeOperatorDecisionRef,
      candidate.sourceRefs?.edgeOperatorDecisionHash,
      candidate.sourceRefs?.rbcReceiptRef,
      candidate.sourceRefs?.rbcReceiptHash,
      candidate.sourceRefs?.studioLiftSourceCandidateRef,
      candidate.sourceRefs?.bytesVisibilityEvidenceRef
    ]),
    expiry: null,
    reason: clean
      ? "Report-only RBC evaluation over supplied Layer file/resource admission candidate; no admission or append is performed."
      : "Report-only RBC evaluation rejected unsafe or incomplete Layer file/resource admission candidate material.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "layer:file-resource-admission-candidate",
        surfaceRef: "surface:file-resource-admission-candidate-boundary",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:file-resource-admission-candidate-evaluator",
        branchRef: "file-resource-lift:admission-candidate-boundary",
        actionRef: "action:file-resource-admission-decision-material-review",
        artifactRef: candidate.candidateRef ?? null,
        contextRef: "context:file-resource-lift-after-layer-admission-candidate",
        timeRef: candidate.recordedAt ?? null
      },
      facts: {
        candidateStatus: candidate.status,
        candidateClassification: candidate.classification,
        candidateProofRung: candidate.proofRung,
        candidateOnly: candidate.admissionCandidate?.candidateOnly === true,
        reviewOnly: candidate.proofBoundary?.reviewOnly === true,
        sourceContinuityQuestionPreserved:
          candidate.admissionCandidate?.sourceContinuityQuestionPreserved === true,
        causalCompatibilityQuestionReady:
          candidate.admissionCandidate?.causalCompatibilityQuestionReady === true,
        layerDecisionBoundaryReady:
          candidate.admissionCandidate?.layerDecisionBoundaryReady === true,
        requiresFutureOperatorOrRbcAdmissionDecision:
          candidate.admissionCandidate?.requiresFutureOperatorOrRbcAdmissionDecision === true,
        noActionControls: candidate.admissionCandidate?.noActionControls === true,
        candidateHashMatches: clean,
        requiredNextBoundary: candidate.requiredNextBoundary ?? null,
        sourceRepo: "mesh-ecology-layer",
        candidateHash: candidate.candidateHash ?? null,
        readbackHash: candidateReadback.readbackHash ?? null
      },
      rulebooks: [{
        id: "rulebook.file-resource-admission-candidate.report-only.v0",
        rules: [{
          id: "rule.file-resource-admission-candidate-ready-for-explicit-decision-boundary",
          domain: "file_resource_admission_candidate",
          effect: "allow",
          priority: 50,
          strength: "normal",
          when: {
            actionRef: "action:file-resource-admission-decision-material-review",
            candidateStatus: "layer_file_resource_admission_candidate_recorded_not_admitted",
            candidateClassification: READY,
            candidateProofRung: "local_supplied_material",
            candidateOnly: true,
            reviewOnly: true,
            sourceContinuityQuestionPreserved: true,
            causalCompatibilityQuestionReady: true,
            layerDecisionBoundaryReady: true,
            requiresFutureOperatorOrRbcAdmissionDecision: true,
            noActionControls: true,
            candidateHashMatches: true,
            requiredNextBoundary: REQUIRED_NEXT_BOUNDARY
          },
          reason:
            "The supplied Layer admission candidate is fit for explicit operator/RBC admission-decision review material, not admission."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: candidate.recordedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function evaluateFileResourceAdmissionCandidate(candidate = {}, candidateReadback = {}) {
  const packetIssues = getFileResourceAdmissionCandidateIssues(candidate, candidateReadback);
  const input = createFileResourceAdmissionCandidateEvaluationInput(candidate, candidateReadback);
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const transcriptBody = {
    transcriptVersion: FILE_RESOURCE_ADMISSION_CANDIDATE_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    sourceRepo: "mesh-ecology-layer",
    sourceCandidateRef: candidate.candidateRef ?? null,
    sourceCandidateHash: candidate.candidateHash ?? null,
    sourceCandidateReadbackHash: candidateReadback.readbackHash ?? null,
    candidateHashVerified: packetIssues.length === 0,
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
      sourceRefsFromCandidate: candidate.sourceRefs ?? {},
      candidateReadbackRef: candidateReadback.readbackRef ?? null
    },
    nonClaims: {
      ...receipt.nonClaims,
      callsLayerLive: false,
      mutatesLayer: false,
      layerAdmission: false,
      admissionDecisionApplied: false,
      admissionAppendApproved: false,
      appendCapabilityGrant: false,
      acceptedContinuity: false,
      durableAppend: false,
      storageRefAsAdmission: false,
      externalReferenceAsCanon: false,
      localPathAsCanon: false,
      viewAsSourceContinuity: false,
      operatorReviewAsCanon: false,
      rbcDecisionAsAdmission: false,
      causalObservationAsTruth: false,
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

export function getFileResourceAdmissionCandidateIssues(candidate = {}, candidateReadback = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };
  const admissionCandidate = candidate.admissionCandidate ?? {};
  const proofBoundary = candidate.proofBoundary ?? {};
  const nonClaims = candidate.nonClaims ?? {};
  const sourceRefs = candidate.sourceRefs ?? {};

  addIf(candidate.artifactKind !== "layer_file_resource_admission_candidate", "candidate_kind_mismatch");
  addIf(candidate.schemaVersion !== "layer_file_resource_admission_candidate.v0", "candidate_schema_mismatch");
  addIf(candidate.status !== "layer_file_resource_admission_candidate_recorded_not_admitted", "candidate_status_not_recorded");
  addIf(candidate.classification !== READY, "candidate_classification_not_ready");
  addIf(candidate.proofRung !== "local_supplied_material", "candidate_proof_rung_overclaim");
  addIf(candidate.requiredNextBoundary !== REQUIRED_NEXT_BOUNDARY, "candidate_next_boundary_invalid");

  for (const [field, issue] of [
    ["candidateOnly", "candidate_not_candidate_only"],
    ["sourceContinuityQuestionPreserved", "source_continuity_question_not_preserved"],
    ["causalCompatibilityQuestionReady", "causal_compatibility_question_not_ready"],
    ["layerDecisionBoundaryReady", "layer_decision_boundary_not_ready"],
    ["requiresFutureOperatorOrRbcAdmissionDecision", "future_operator_or_rbc_decision_not_required"],
    ["noActionControls", "action_controls_present"]
  ]) {
    addIf(admissionCandidate[field] !== true, issue);
  }
  addIf(arrayOf(admissionCandidate.actionControls).length > 0, "action_controls_present");

  for (const [field, issue] of [
    ["layerDecisionBoundaryReviewRef", "layer_decision_boundary_review_ref_missing"],
    ["layerDecisionBoundaryReviewHash", "layer_decision_boundary_review_hash_missing"],
    ["causalCompatibilityObservationRef", "causal_compatibility_observation_ref_missing"],
    ["causalCompatibilityObservationHash", "causal_compatibility_observation_hash_missing"],
    ["edgeOperatorDecisionRef", "edge_operator_decision_ref_missing"],
    ["edgeOperatorDecisionHash", "edge_operator_decision_hash_missing"],
    ["rbcReceiptRef", "prior_rbc_receipt_ref_missing"],
    ["rbcReceiptHash", "prior_rbc_receipt_hash_missing"],
    ["studioLiftSourceCandidateRef", "studio_lift_source_candidate_ref_missing"],
    ["bytesVisibilityEvidenceRef", "bytes_visibility_evidence_ref_missing"]
  ]) {
    addIf(typeof sourceRefs[field] !== "string" || sourceRefs[field].length === 0, issue);
  }

  addIf(proofBoundary.candidateOnly !== true, "proof_boundary_not_candidate_only");
  addIf(proofBoundary.reviewOnly !== true, "proof_boundary_not_review_only");
  for (const field of REQUIRED_FALSE_PROOF_BOUNDARY) {
    addIf(proofBoundary[field] !== false, `candidate_claims_${field}`);
    addIf(nonClaims[field] !== false, `non_claim_${field}_missing_or_true`);
  }

  addIf(candidateReadback.artifactKind !== "layer_file_resource_admission_candidate_readback", "readback_kind_mismatch");
  addIf(candidateReadback.schemaVersion !== "layer_file_resource_admission_candidate_readback.v0", "readback_schema_mismatch");
  addIf(candidateReadback.sourceCandidateRef !== candidate.candidateRef, "readback_candidate_ref_mismatch");
  addIf(candidateReadback.sourceCandidateHash !== candidate.candidateHash, "readback_candidate_hash_mismatch");
  addIf(candidateReadback.recomputedCandidateHash !== candidate.candidateHash, "readback_recomputed_hash_mismatch");
  addIf(candidateReadback.candidateHashMatches !== true, "readback_hash_not_verified");
  addIf(candidateReadback.proofRung !== "local_supplied_material", "readback_proof_rung_overclaim");
  addIf(candidateReadback.nonClaims?.readbackIsAdmission !== false, "readback_claims_admission");
  addIf(candidateReadback.nonClaims?.readbackIsContinuity !== false, "readback_claims_continuity");
  addIf(candidateReadback.nonClaims?.readbackIsAuthority !== false, "readback_claims_authority");
  addIf(!candidate.candidateHash, "candidate_hash_missing");
  if (candidate.candidateHash) {
    const { candidateHash, ...withoutHash } = candidate;
    addIf(candidate.candidateHash !== `sha256:${stableHash(withoutHash)}`, "candidate_hash_mismatch");
  }

  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}
