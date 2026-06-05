import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    unverifiedRefs: ["policy:unverified:edge-publication"],
    sourceBranchRefs: ["branch:main"]
  }
};
