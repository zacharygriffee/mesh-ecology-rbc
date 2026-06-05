import base from "./causal-policy-history-base.js";

export default {
  ...base,
  policyHistory: {
    visibleRefs: ["policy:create:edge-publication"],
    desyncedRefs: ["policy:device-a:edge-publication", "policy:device-b:edge-publication"],
    sourceBranchRefs: ["branch:main", "branch:edge-local"]
  }
};
