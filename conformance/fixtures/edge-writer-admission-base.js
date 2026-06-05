export default {
  basis: {
    observerRef: "observer:zack",
    envelopeRef: "edge-envelope:zack-primary",
    surfaceRef: "surface:edge-local-writers",
    deviceRef: "device:trusted-workstation",
    roleRef: "role:operator",
    branchRef: "branch:main",
    actionRef: "action:writer-admission",
    artifactRef: "artifact:writer-profile-001",
    contextRef: "context:edge-local-layer",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    surfaceClass: "local",
    writerClass: "operator_managed",
    deviceTrust: "trusted"
  },
  rulebooks: [{
    id: "rulebook.edge-writer-admission",
    rules: [{
      id: "rule.edge-writer-admission-requires-review",
      domain: "admission",
      effect: "requires_review",
      priority: 70,
      strength: "normal",
      when: {
        actionRef: "action:writer-admission",
        contextRef: "context:edge-local-layer",
        surfaceClass: "local"
      },
      requires: {
        receipts: ["edge_writer_review"]
      },
      reason: "Local writer admission requires review evidence supplied by Edge."
    }]
  }],
  overlays: [{
    id: "overlay.edge-local-writer-admission",
    rules: [{
      id: "rule.edge-local-trusted-writer-allow",
      domain: "admission",
      effect: "allow",
      priority: 20,
      strength: "normal",
      when: {
        actionRef: "action:writer-admission",
        writerClass: "operator_managed",
        deviceTrust: "trusted"
      },
      reason: "The local Edge layer can admit reviewed operator-managed writers."
    }]
  }],
  grants: [{
    id: "grant.edge-operator-writer-admission",
    effect: "allow",
    scope: {
      actionRef: "action:writer-admission",
      roleRef: "role:operator",
      contextRef: "context:edge-local-layer"
    },
    expiresAt: "2026-06-06T00:00:00.000Z",
    reason: "Operator has scoped writer-admission grant for the local Edge layer."
  }],
  denials: [{
    id: "deny.untrusted-device-writer-admission",
    effect: "deny",
    scope: {
      actionRef: "action:writer-admission",
      deviceTrust: "untrusted"
    },
    strength: "hard",
    reason: "Untrusted devices cannot admit local writers."
  }],
  time: "2026-06-05T00:00:00.000Z"
};
