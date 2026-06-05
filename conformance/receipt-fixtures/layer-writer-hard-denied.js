import base from "./layer-writer-base.js";

export default {
  ...base,
  evidenceRefs: [
    "grant.layer-writer-local-replica",
    "receipt.layer-writer-review.writer-001",
    "deny.layer-untrusted-device-writer"
  ],
  resolverInput: {
    ...base.resolverInput,
    basis: {
      ...base.resolverInput.basis,
      deviceRef: "device:untrusted-terminal"
    },
    facts: {
      ...base.resolverInput.facts,
      deviceTrust: "untrusted"
    }
  }
};
