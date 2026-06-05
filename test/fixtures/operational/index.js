import causalPolicyHistoryConflict from "./causal-policy-history-conflict.js";
import causalPolicyHistoryDesynced from "./causal-policy-history-desynced.js";
import causalPolicyHistoryPartial from "./causal-policy-history-partial.js";
import causalPolicyHistoryRevokedSuperseded from "./causal-policy-history-revoked-superseded.js";
import causalPolicyHistorySynced from "./causal-policy-history-synced.js";
import causalPolicyHistoryUnverified from "./causal-policy-history-unverified.js";
import edgeWriterAdmissionAllowed from "./edge-writer-admission-allowed.js";
import edgeWriterAdmissionHardDenied from "./edge-writer-admission-hard-denied.js";
import edgeWriterAdmissionRequiresReview from "./edge-writer-admission-requires-review.js";
import privatePublishHardDenied from "./private-publish-hard-denied.js";
import publicPublishWithReviewReceipt from "./public-publish-with-review-receipt.js";

const noRuntimeClaims = Object.freeze({
  execution: false,
  approval: false,
  authority: false,
  persistence: false,
  canonicalTruth: false,
  hiddenClock: false,
  network: false
});

export const operationalProofFixtures = Object.freeze({
  publicPublishWithReviewReceipt: Object.freeze({
    id: "public-publish-with-review-receipt",
    input: publicPublishWithReviewReceipt,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.public-publish-requires-review",
        "rule.local-public-note-publish-allow",
        "grant.operator-public-publish",
        "receipt.operator-review.note-001"
      ]),
      requiredReceipts: Object.freeze(["operator_review"]),
      missingReceipts: Object.freeze([]),
      satisfiedReceipts: Object.freeze(["operator_review"]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  privatePublishHardDenied: Object.freeze({
    id: "private-publish-hard-denied",
    input: privatePublishHardDenied,
    expected: Object.freeze({
      posture: "denied",
      traceSourceRefs: Object.freeze([
        "rule.public-publish-requires-review",
        "grant.operator-public-publish",
        "deny.private-artifact-public-surface",
        "receipt.operator-review.note-001"
      ]),
      deniedBy: Object.freeze(["deny.private-artifact-public-surface"]),
      requiredReceipts: Object.freeze(["operator_review"]),
      missingReceipts: Object.freeze([]),
      satisfiedReceipts: Object.freeze(["operator_review"]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  edgeWriterAdmissionAllowed: Object.freeze({
    id: "edge-writer-admission-allowed",
    input: edgeWriterAdmissionAllowed,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.edge-writer-admission-requires-review",
        "rule.edge-local-trusted-writer-allow",
        "grant.edge-operator-writer-admission",
        "receipt.edge-writer-review.writer-001"
      ]),
      allowedBy: Object.freeze([
        "rule.edge-local-trusted-writer-allow",
        "grant.edge-operator-writer-admission"
      ]),
      requiredReceipts: Object.freeze(["edge_writer_review"]),
      missingReceipts: Object.freeze([]),
      satisfiedReceipts: Object.freeze(["edge_writer_review"]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  edgeWriterAdmissionRequiresReview: Object.freeze({
    id: "edge-writer-admission-requires-review",
    input: edgeWriterAdmissionRequiresReview,
    expected: Object.freeze({
      posture: "requires_review",
      traceSourceRefs: Object.freeze([
        "rule.edge-writer-admission-requires-review",
        "rule.edge-local-trusted-writer-allow",
        "grant.edge-operator-writer-admission"
      ]),
      allowedBy: Object.freeze([
        "rule.edge-local-trusted-writer-allow",
        "grant.edge-operator-writer-admission"
      ]),
      requiredReceipts: Object.freeze(["edge_writer_review"]),
      missingReceipts: Object.freeze(["edge_writer_review"]),
      satisfiedReceipts: Object.freeze([]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  edgeWriterAdmissionHardDenied: Object.freeze({
    id: "edge-writer-admission-hard-denied",
    input: edgeWriterAdmissionHardDenied,
    expected: Object.freeze({
      posture: "denied",
      traceSourceRefs: Object.freeze([
        "rule.edge-writer-admission-requires-review",
        "grant.edge-operator-writer-admission",
        "deny.untrusted-device-writer-admission",
        "receipt.edge-writer-review.writer-001"
      ]),
      deniedBy: Object.freeze(["deny.untrusted-device-writer-admission"]),
      requiredReceipts: Object.freeze(["edge_writer_review"]),
      missingReceipts: Object.freeze([]),
      satisfiedReceipts: Object.freeze(["edge_writer_review"]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistorySynced: Object.freeze({
    id: "causal-policy-history-synced",
    input: causalPolicyHistorySynced,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory"
      ]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistoryPartial: Object.freeze({
    id: "causal-policy-history-partial",
    input: causalPolicyHistoryPartial,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory"
      ]),
      policyHistoryPosture: "policy_history_partial",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistoryDesynced: Object.freeze({
    id: "causal-policy-history-desynced",
    input: causalPolicyHistoryDesynced,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory"
      ]),
      policyHistoryPosture: "policy_history_desynced",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistoryUnverified: Object.freeze({
    id: "causal-policy-history-unverified",
    input: causalPolicyHistoryUnverified,
    expected: Object.freeze({
      posture: "allowed",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory"
      ]),
      policyHistoryPosture: "policy_history_unverified",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistoryConflict: Object.freeze({
    id: "causal-policy-history-conflict",
    input: causalPolicyHistoryConflict,
    expected: Object.freeze({
      posture: "requires_mediation",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory"
      ]),
      unresolvedSourceRefs: Object.freeze(["policyHistory"]),
      policyHistoryPosture: "policy_history_conflict_observed",
      nonClaims: noRuntimeClaims
    })
  }),
  causalPolicyHistoryRevokedSuperseded: Object.freeze({
    id: "causal-policy-history-revoked-superseded",
    input: causalPolicyHistoryRevokedSuperseded,
    expected: Object.freeze({
      posture: "requires_mediation",
      traceSourceRefs: Object.freeze([
        "rule.causal-policy-history-visible-allows-resolution",
        "policyHistory",
        "policy:revoked:edge-publication",
        "policy:superseded:edge-publication"
      ]),
      unresolvedSourceRefs: Object.freeze([
        "policy:revoked:edge-publication",
        "policy:superseded:edge-publication"
      ]),
      policyHistoryPosture: "policy_history_synced",
      nonClaims: noRuntimeClaims
    })
  })
});

export default operationalProofFixtures;
