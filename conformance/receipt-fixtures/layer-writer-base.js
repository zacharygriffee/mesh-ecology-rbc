export default {
  rulebookRef: "rulebook.layer-writer-capability",
  capabilityRef: "capability:layer-writer",
  scope: {
    actionRef: "action:layer-write",
    contextRef: "context:layer-local-replica",
    roleRef: "role:layer-writer",
    storageRef: "storage:layer-local-replica"
  },
  evidenceRefs: [
    "grant.layer-writer-local-replica",
    "receipt.layer-writer-review.writer-001"
  ],
  expiry: null,
  reason: "Report-only evaluation for Layer writer capability.",
  resolverInput: {
    basis: {
      observerRef: "observer:rbc",
      envelopeRef: "edge-envelope:zack-primary",
      surfaceRef: "surface:layer-local-replica",
      deviceRef: "device:trusted-workstation",
      roleRef: "role:layer-writer",
      branchRef: "branch:main",
      actionRef: "action:layer-write",
      artifactRef: "artifact:layer-entry-001",
      contextRef: "context:layer-local-replica",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    facts: {
      writerClass: "authorized",
      storageClass: "local_replica",
      deviceTrust: "trusted"
    },
    rulebooks: [{
      id: "rulebook.layer-writer-capability",
      rules: [{
        id: "rule.layer-writer-requires-review",
        domain: "admission",
        effect: "requires_review",
        priority: 70,
        strength: "normal",
        when: {
          actionRef: "action:layer-write",
          contextRef: "context:layer-local-replica",
          storageClass: "local_replica"
        },
        requires: {
          receipts: ["layer_writer_review"]
        },
        reason: "Layer writer capability requires caller-supplied review evidence."
      }]
    }],
    overlays: [{
      id: "overlay.layer-local-replica-writer",
      rules: [{
        id: "rule.layer-authorized-writer-allow",
        domain: "admission",
        effect: "allow",
        priority: 20,
        strength: "normal",
        when: {
          actionRef: "action:layer-write",
          writerClass: "authorized",
          deviceTrust: "trusted"
        },
        reason: "Supplied local Layer material allows reviewed authorized writers."
      }]
    }],
    grants: [{
      id: "grant.layer-writer-local-replica",
      effect: "allow",
      scope: {
        actionRef: "action:layer-write",
        roleRef: "role:layer-writer",
        contextRef: "context:layer-local-replica"
      },
      expiresAt: "2026-06-06T00:00:00.000Z",
      reason: "Caller supplied scoped Layer writer grant."
    }],
    denials: [{
      id: "deny.layer-untrusted-device-writer",
      effect: "deny",
      scope: {
        actionRef: "action:layer-write",
        deviceTrust: "untrusted"
      },
      strength: "hard",
      reason: "Untrusted devices cannot receive Layer writer capability."
    }],
    receipts: [{
      id: "receipt.layer-writer-review.writer-001",
      receiptRef: "layer_writer_review",
      status: "valid",
      issuedAt: "2026-06-05T00:00:00.000Z",
      reason: "Caller supplied Layer writer review evidence."
    }],
    time: "2026-06-05T00:00:00.000Z"
  }
};
