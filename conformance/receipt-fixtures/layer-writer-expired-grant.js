import base from "./layer-writer-base.js";

export default {
  ...base,
  evidenceRefs: [
    "grant.layer-writer-local-replica",
    "receipt.layer-writer-review.writer-001"
  ],
  resolverInput: {
    ...base.resolverInput,
    facts: {
      ...base.resolverInput.facts,
      writerClass: "grant_only"
    },
    grants: [{
      ...base.resolverInput.grants[0],
      expiresAt: "2026-06-04T00:00:00.000Z"
    }]
  }
};
