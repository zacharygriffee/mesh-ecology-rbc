import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    sourceBranchRefs: ["branch:main"]
  }
};
