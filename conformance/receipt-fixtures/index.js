import layerWriterAuthorized from "./layer-writer-authorized.js";
import layerWriterExpiredGrant from "./layer-writer-expired-grant.js";
import layerWriterHardDenied from "./layer-writer-hard-denied.js";
import layerWriterMissingReview from "./layer-writer-missing-review.js";

const reportOnlyNonClaims = Object.freeze({
  execution: false,
  approval: false,
  authority: false,
  persistence: false,
  canonicalTruth: false,
  hiddenClock: false,
  network: false,
  governedSeam: false,
  seamTransport: false,
  downstreamConsumption: false,
  storage: false,
  productionDurability: false
});

export const reportOnlyReceiptProofFixtures = Object.freeze({
  layerWriterAuthorized: Object.freeze({
    id: "layer-writer-authorized",
    input: layerWriterAuthorized,
    expected: Object.freeze({
      decision: "allowed",
      posture: "allowed",
      rulebookRef: "rulebook.layer-writer-capability",
      capabilityRef: "capability:layer-writer",
      sourceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "rule.layer-authorized-writer-allow",
        "grant.layer-writer-local-replica"
      ]),
      traceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "rule.layer-authorized-writer-allow",
        "grant.layer-writer-local-replica",
        "receipt.layer-writer-review.writer-001"
      ]),
      nonClaims: reportOnlyNonClaims
    })
  }),
  layerWriterMissingReview: Object.freeze({
    id: "layer-writer-missing-review",
    input: layerWriterMissingReview,
    expected: Object.freeze({
      decision: "deferred",
      posture: "requires_review",
      rulebookRef: "rulebook.layer-writer-capability",
      capabilityRef: "capability:layer-writer",
      sourceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "rule.layer-authorized-writer-allow",
        "grant.layer-writer-local-replica"
      ]),
      traceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "rule.layer-authorized-writer-allow",
        "grant.layer-writer-local-replica"
      ]),
      nonClaims: reportOnlyNonClaims
    })
  }),
  layerWriterHardDenied: Object.freeze({
    id: "layer-writer-hard-denied",
    input: layerWriterHardDenied,
    expected: Object.freeze({
      decision: "denied",
      posture: "denied",
      rulebookRef: "rulebook.layer-writer-capability",
      capabilityRef: "capability:layer-writer",
      sourceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "grant.layer-writer-local-replica",
        "deny.layer-untrusted-device-writer"
      ]),
      traceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "grant.layer-writer-local-replica",
        "deny.layer-untrusted-device-writer",
        "receipt.layer-writer-review.writer-001"
      ]),
      nonClaims: reportOnlyNonClaims
    })
  }),
  layerWriterExpiredGrant: Object.freeze({
    id: "layer-writer-expired-grant",
    input: layerWriterExpiredGrant,
    expected: Object.freeze({
      decision: "deferred",
      posture: "requires_mediation",
      rulebookRef: "rulebook.layer-writer-capability",
      capabilityRef: "capability:layer-writer",
      sourceRefs: Object.freeze([
        "rule.layer-writer-requires-review"
      ]),
      traceRefs: Object.freeze([
        "rule.layer-writer-requires-review",
        "grant.layer-writer-local-replica",
        "receipt.layer-writer-review.writer-001"
      ]),
      nonClaims: reportOnlyNonClaims
    })
  })
});

export default reportOnlyReceiptProofFixtures;
