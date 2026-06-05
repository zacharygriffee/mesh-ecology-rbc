import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    conflictRefs: ["policy:conflict:edge-publication"],
    sourceBranchRefs: ["branch:main", "branch:edge-local"]
  }
};
