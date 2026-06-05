export default {
  basis: {
    observerRef: "observer:causal-substrate",
    envelopeRef: "edge-envelope:zack-primary",
    surfaceRef: "surface:policy-history",
    deviceRef: "device:workstation",
    roleRef: "role:operator",
    branchRef: "branch:main",
    actionRef: "action:resolve-policy-history",
    artifactRef: "artifact:policy-pack-edge-publication",
    contextRef: "context:causal-substrate",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    policyDomain: "edge_publication",
    historyScope: "policy_pack"
  },
  rulebooks: [{
    id: "rulebook.causal-policy-history-pressure",
    rules: [{
      id: "rule.causal-policy-history-visible-allows-resolution",
      domain: "policy_history",
      effect: "allow",
      priority: 10,
      strength: "normal",
      when: {
        actionRef: "action:resolve-policy-history",
        policyDomain: "edge_publication"
      },
      reason: "Caller-supplied policy history may be surfaced without RBC reading causal logs."
    }]
  }],
  time: "2026-06-05T00:00:00.000Z"
};
