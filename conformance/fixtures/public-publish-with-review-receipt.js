export default {
  basis: {
    observerRef: "observer:zack",
    envelopeRef: "edge-envelope:zack-primary",
    surfaceRef: "surface:public-web",
    deviceRef: "device:workstation",
    roleRef: "role:operator",
    branchRef: "branch:main",
    actionRef: "action:publish",
    artifactRef: "artifact:note-001",
    contextRef: "context:edge",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    surfaceClass: "public",
    artifactClass: "public_note"
  },
  rulebooks: [{
    id: "rulebook.edge-publication",
    rules: [{
      id: "rule.public-publish-requires-review",
      domain: "execution",
      effect: "requires_review",
      priority: 50,
      strength: "normal",
      when: {
        actionRef: "action:publish",
        surfaceClass: "public"
      },
      requires: {
        receipts: ["operator_review"]
      },
      reason: "Publishing to a public surface requires operator review."
    }]
  }],
  overlays: [{
    id: "overlay.edge-local-public-publish",
    rules: [{
      id: "rule.local-public-note-publish-allow",
      domain: "execution",
      effect: "allow",
      priority: 10,
      strength: "normal",
      when: {
        actionRef: "action:publish",
        artifactClass: "public_note",
        surfaceRef: "surface:public-web"
      },
      reason: "Local edge context allows reviewed public notes to publish."
    }]
  }],
  grants: [{
    id: "grant.operator-public-publish",
    effect: "allow",
    scope: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web",
      roleRef: "role:operator"
    },
    expiresAt: "2026-06-06T00:00:00.000Z",
    reason: "Operator has temporary scoped public publishing grant."
  }],
  denials: [{
    id: "deny.private-artifact-public-surface",
    effect: "deny",
    scope: {
      actionRef: "action:publish",
      artifactClass: "private",
      surfaceClass: "public"
    },
    strength: "hard",
    reason: "Private artifacts cannot be published to public surfaces."
  }],
  receipts: [{
    id: "receipt.operator-review.note-001",
    receiptRef: "operator_review",
    status: "valid",
    issuedAt: "2026-06-05T00:00:00.000Z",
    reason: "Operator reviewed the public note."
  }],
  time: "2026-06-05T00:00:00.000Z"
};
