import { resolveReportOnlyEvaluationReceipt } from "./evaluation-receipt.js";
import { stableHash } from "./hash.js";

export const EDGE_REQUEST_PACKET_EVALUATION_TRANSCRIPT_VERSION =
  "rbc_edge_minimal_operator_request_packet_evaluation_transcript.v0";

const SUPPORTED_REQUEST_KIND = "request_repo_family_reassessment";

export function createEdgeRequestPacketEvaluationInput(packet = {}, packetReadback = {}) {
  const sourceRefs = packet.sourceRefs ?? {};
  const operatorRequest = packet.operatorRequestPacket ?? {};
  const packetHashRef = packet.packetHash ?? "sha256:missing-edge-request-packet-hash";
  const readbackHashRef = packetReadback.readbackHash ?? "sha256:missing-edge-request-packet-readback-hash";

  return {
    rulebookRef: "rulebook.edge-minimal-operator-request.report-only.v0",
    capabilityRef: "capability.edge.operator-request.report-only-reassessment.v0",
    scope: {
      scopeRef: "scope:edge-operator-request:repo-family-reassessment",
      actorRef: "operator:edge",
      edgePacketRef: packet.packetRef ?? null,
      selectedCard: operatorRequest.selectedCard ?? null,
      requestKind: operatorRequest.requestKind ?? null,
      currentConvergence: sourceRefs.currentConvergence ?? null
    },
    evidenceRefs: uniqueRefs([
      packet.packetRef,
      packetHashRef,
      packetReadback.sourcePacketRef,
      packetReadback.sourcePacketHash,
      packetReadback.readbackHash,
      sourceRefs.draftRef,
      sourceRefs.draftHash,
      sourceRefs.draftReadbackHash,
      sourceRefs.previewRef,
      sourceRefs.previewHash,
      sourceRefs.previewReadbackHash,
      sourceRefs.projectionRef,
      sourceRefs.projectionHash,
      sourceRefs.projectionReadbackHash,
      sourceRefs.minimalProjectionRef,
      sourceRefs.sourcePressureVisibilityRef,
      readbackHashRef
    ]),
    expiry: null,
    reason:
      "Report-only RBC evaluation over supplied Edge minimal operator request packet.",
    resolverInput: {
      basis: {
        observerRef: "observer:rbc",
        envelopeRef: "edge:operator-envelope",
        surfaceRef: "surface:edge-minimal-operator-request",
        deviceRef: "device:not-applicable-local-supplied-material",
        roleRef: "role:operator-request-evaluator",
        branchRef: "edge:operator-request",
        actionRef: "action:repo-family-reassessment-request",
        artifactRef: packet.packetRef ?? null,
        contextRef: "context:repo-family-mechanics-visible-but-too-complicated",
        timeRef: packet.recordedAt ?? null
      },
      facts: {
        packetStatus: packet.status,
        packetProofRung: packet.proofRung,
        requestKind: operatorRequest.requestKind,
        selectedCard: operatorRequest.selectedCard,
        acceptedIntentDraftSource: operatorRequest.acceptedIntentDraftSource === true,
        readOnly: operatorRequest.readOnly === true,
        requestOnly: operatorRequest.requestOnly === true,
        recordedOnly: operatorRequest.recordedOnly === true,
        requiresFutureMediation: operatorRequest.requiresFutureMediation === true,
        noActionPerformed: operatorRequest.noActionPerformed === true,
        notQueued: operatorRequest.notQueued === true,
        notDispatched: operatorRequest.notDispatched === true,
        noActionControls: operatorRequest.noActionControls === true,
        packetHashMatches: getEdgeRequestPacketIssues(packet, packetReadback).length === 0,
        sourceRepo: "mesh-ecology-edge",
        packetHash: packet.packetHash ?? null,
        readbackHash: packetReadback.readbackHash ?? null
      },
      rulebooks: [{
        id: "rulebook.edge-minimal-operator-request.report-only.v0",
        rules: [{
          id: "rule.edge-request-packet-reassessment-visible-for-report-only-evaluation",
          domain: "edge_operator_request_packet",
          effect: "allow",
          priority: 40,
          strength: "normal",
          when: {
            actionRef: "action:repo-family-reassessment-request",
            packetStatus: "minimal_operator_request_packet_recorded_not_dispatched",
            packetProofRung: "local_supplied_material",
            requestKind: SUPPORTED_REQUEST_KIND,
            acceptedIntentDraftSource: true,
            readOnly: true,
            requestOnly: true,
            recordedOnly: true,
            requiresFutureMediation: true,
            noActionPerformed: true,
            notQueued: true,
            notDispatched: true,
            noActionControls: true,
            packetHashMatches: true
          },
          reason:
            "The supplied Edge request packet is acceptable for report-only RBC evaluation and future mediated reassessment."
        }]
      }],
      overlays: [],
      grants: [],
      denials: [],
      receipts: [],
      time: packet.recordedAt ?? null,
      compatibility: "compatible",
      admissibility: "report_only"
    }
  };
}

export function evaluateEdgeRequestPacket(packet = {}, packetReadback = {}) {
  const packetIssues = getEdgeRequestPacketIssues(packet, packetReadback);
  const input = createEdgeRequestPacketEvaluationInput(packet, packetReadback);
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(input);
  const operatorRequest = packet.operatorRequestPacket ?? {};
  const transcriptBody = {
    transcriptVersion: EDGE_REQUEST_PACKET_EVALUATION_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    sourceRepo: "mesh-ecology-edge",
    sourcePacketRef: packet.packetRef ?? null,
    sourcePacketHash: packet.packetHash ?? null,
    sourcePacketReadbackHash: packetReadback.readbackHash ?? null,
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
      requestKind: operatorRequest.requestKind ?? null,
      selectedCard: operatorRequest.selectedCard ?? null,
      sourceRefsFromPacket: packet.sourceRefs ?? {},
      packetReadbackRef: packetReadback.sourcePacketRef ?? null
    },
    nonClaims: {
      ...receipt.nonClaims,
      callsEdgeLive: false,
      mutatesEdge: false,
      queueAction: false,
      dispatch: false,
      resultAcceptance: false,
      requestExecution: false,
      activationApproval: false,
      dependencyAcquisitionAuthorization: false,
      governedSeam: false,
      edgeOwnedPublicSwarmProof: false,
      layerAdmission: false,
      causalTruth: false,
      meshPublication: false,
      productionDurability: false,
      canonicalTruth: false,
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

export function getEdgeRequestPacketIssues(packet = {}, packetReadback = {}) {
  const issues = [];
  const addIf = (condition, issue) => {
    if (condition) issues.push(issue);
  };
  const operatorRequest = packet.operatorRequestPacket ?? {};
  const boundary = packet.edgeBoundary ?? {};
  const nonClaims = packet.nonClaims ?? {};

  addIf(packet.artifactKind !== "edge_minimal_operator_request_packet", "packet_kind_mismatch");
  addIf(packet.schemaVersion !== "edge_minimal_operator_request_packet.v0", "packet_schema_mismatch");
  addIf(packet.status !== "minimal_operator_request_packet_recorded_not_dispatched", "packet_status_not_recorded");
  addIf(packet.proofRung !== "local_supplied_material", "packet_proof_rung_overclaim");
  addIf(operatorRequest.requestKind !== SUPPORTED_REQUEST_KIND, "unsupported_request_kind");
  addIf(operatorRequest.selectedCard !== "operator_next_posture", "selected_card_mismatch");
  for (const [field, issue] of [
    ["acceptedIntentDraftSource", "intent_draft_source_not_accepted"],
    ["readOnly", "request_not_read_only"],
    ["requestOnly", "packet_not_request_only"],
    ["recordedOnly", "packet_not_recorded_only"],
    ["requiresFutureMediation", "future_mediation_not_required"],
    ["noActionPerformed", "action_performed_claimed"],
    ["notQueued", "queue_action_claimed"],
    ["notDispatched", "dispatch_claimed"],
    ["noActionControls", "action_controls_present"]
  ]) {
    addIf(operatorRequest[field] !== true, issue);
  }
  addIf(arrayOf(operatorRequest.actionControls).length > 0, "action_controls_present");
  addIf(arrayOf(operatorRequest.queueControls).length > 0, "queue_controls_present");
  addIf(arrayOf(operatorRequest.dispatchControls).length > 0, "dispatch_controls_present");
  addIf(arrayOf(operatorRequest.acceptanceControls).length > 0, "acceptance_controls_present");
  addIf(arrayOf(operatorRequest.approvalControls).length > 0, "approval_controls_present");

  for (const [field, issue] of [
    ["runsFamilyRepos", "packet_claims_family_repo_runtime"],
    ["mutatesFamilyRepos", "packet_claims_family_repo_mutation"],
    ["deploysArtifact", "packet_claims_deployment"],
    ["activatesArtifact", "packet_claims_activation"],
    ["approvesActivation", "packet_claims_activation_approval"],
    ["mutatesPlatform", "packet_claims_platform_mutation"],
    ["mutatesLayer", "packet_claims_layer_mutation"],
    ["createsQueueAction", "packet_claims_queue_action"],
    ["dispatchesWork", "packet_claims_dispatch"],
    ["acceptsResults", "packet_claims_result_acceptance"],
    ["executesRequest", "packet_claims_request_execution"],
    ["executesIntent", "packet_claims_intent_execution"],
    ["authorizesDependencyAcquisition", "packet_claims_dependency_authorization"],
    ["grantsLayerAdmission", "packet_claims_layer_admission"],
    ["interpretsCausalTruth", "packet_claims_causal_truth"],
    ["createsAgentBridge", "packet_claims_agent_bridge"],
    ["callsRbc", "packet_claims_live_rbc_call"],
    ["integratesConduitWorkflow", "packet_claims_conduit_workflow"],
    ["claimsEdgeOwnedPublicSwarmProof", "packet_claims_edge_public_swarm_proof"],
    ["claimsRbcGovernance", "packet_claims_rbc_governance"],
    ["claimsGovernedSeam", "packet_claims_governed_seam"],
    ["claimsMeshPublication", "packet_claims_mesh_publication"],
    ["claimsProductionDurability", "packet_claims_production_durability"],
    ["claimsCanonicalTruth", "packet_claims_canonical_truth"],
    ["claimsAuthority", "packet_claims_authority"]
  ]) {
    addIf(boundary[field] !== false, issue);
  }

  for (const [field, issue] of [
    ["queueAction", "non_claim_queue_action_missing_or_true"],
    ["dispatch", "non_claim_dispatch_missing_or_true"],
    ["resultAcceptance", "non_claim_result_acceptance_missing_or_true"],
    ["requestExecution", "non_claim_request_execution_missing_or_true"],
    ["approval", "non_claim_approval_missing_or_true"],
    ["dependencyAcquisitionAuthorization", "non_claim_dependency_authorization_missing_or_true"],
    ["layerAdmission", "non_claim_layer_admission_missing_or_true"],
    ["causalTruth", "non_claim_causal_truth_missing_or_true"],
    ["edgeOwnedPublicSwarmProof", "non_claim_edge_public_swarm_missing_or_true"],
    ["rbcGovernance", "non_claim_rbc_governance_missing_or_true"],
    ["governedSeam", "non_claim_governed_seam_missing_or_true"],
    ["meshPublication", "non_claim_mesh_publication_missing_or_true"],
    ["productionDurability", "non_claim_production_durability_missing_or_true"],
    ["canonicalTruth", "non_claim_canonical_truth_missing_or_true"],
    ["authority", "non_claim_authority_missing_or_true"]
  ]) {
    addIf(nonClaims[field] !== false, issue);
  }

  addIf(packetReadback.artifactKind !== "edge_minimal_operator_request_packet_readback", "readback_kind_mismatch");
  addIf(packetReadback.sourcePacketRef !== packet.packetRef, "readback_packet_ref_mismatch");
  addIf(packetReadback.sourcePacketHash !== packet.packetHash, "readback_packet_hash_mismatch");
  addIf(packetReadback.recomputedPacketHash !== packet.packetHash, "readback_recomputed_hash_mismatch");
  addIf(packetReadback.packetHashMatches !== true, "readback_hash_not_verified");
  addIf(packetReadback.proofRung !== "local_supplied_material", "readback_proof_rung_overclaim");
  addIf(!packet.packetHash, "packet_hash_missing");
  if (packet.packetHash) {
    const { packetHash, ...withoutHash } = packet;
    addIf(packetHash !== `sha256:${stableHash(withoutHash)}`, "packet_hash_mismatch");
  }

  return issues;
}

function uniqueRefs(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}
