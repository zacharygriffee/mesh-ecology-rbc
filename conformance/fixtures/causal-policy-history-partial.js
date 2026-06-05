import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    partialRefs: ["policy:overlay:edge-local-writer-admission"],
    sourceBranchRefs: ["branch:main"]
  }
};
