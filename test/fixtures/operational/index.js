import privatePublishHardDenied from "./private-publish-hard-denied.js";
import publicPublishWithReviewReceipt from "./public-publish-with-review-receipt.js";

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
      nonClaims: Object.freeze({
        execution: false,
        approval: false,
        authority: false,
        persistence: false,
        canonicalTruth: false,
        hiddenClock: false,
        network: false
      })
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
      nonClaims: Object.freeze({
        execution: false,
        approval: false,
        authority: false,
        persistence: false,
        canonicalTruth: false,
        hiddenClock: false,
        network: false
      })
    })
  })
});

export default operationalProofFixtures;
