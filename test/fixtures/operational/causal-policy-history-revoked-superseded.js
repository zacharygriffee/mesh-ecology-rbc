import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    revocationRefs: ["policy:revoked:edge-publication"],
    supersessionRefs: ["policy:superseded:edge-publication"],
    sourceBranchRefs: ["branch:main"]
  }
};
