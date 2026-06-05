export default {
  basis: {
    observerRef: "observer:zack",
    roleRef: "role:operator",
    actionRef: "action:proto-publish",
    contextRef: "context:proto-lab",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    actorRef: "actor:zack",
    actorClass: "operator",
    actionKind: "proto-publish",
    resolutionHorizon: "local-review"
  },
  rulebooks: [{
    id: "rulebook.proto-style-prepared",
    rules: [{
      id: "rule.proto-action-kind-allowed",
      effect: "allow",
      priority: 10,
      when: {
        actorClass: "operator",
        actionKind: "proto-publish",
        resolutionHorizon: "local-review"
      },
      reason: "Prepared proto-style actor/action/horizon gate allows this bounded action."
    }, {
      id: "rule.proto-publish-review-required",
      effect: "requires_review",
      priority: 50,
      when: {
        actionKind: "proto-publish"
      },
      requires: {
        receipts: ["operator_review"]
      },
      reason: "Prepared proto-style publish requires caller-supplied review evidence."
    }]
  }],
  grants: [{
    id: "grant.proto-local-review",
    effect: "allow",
    scope: {
      actorRef: "actor:zack",
      actionKind: "proto-publish",
      resolutionHorizon: "local-review"
    },
    expiresAt: "2026-06-06T00:00:00.000Z",
    reason: "Prepared temporary proto-style local grant."
  }],
  denials: [{
    id: "deny.proto-non-operator",
    effect: "deny",
    scope: {
      actorClass: "non_operator",
      actionKind: "proto-publish"
    },
    strength: "hard",
    reason: "Prepared proto-style deny for non-operator actors."
  }],
  receipts: [{
    id: "receipt.proto-operator-review",
    receiptRef: "operator_review",
    status: "valid"
  }],
  time: "2026-06-05T00:00:00.000Z"
};
