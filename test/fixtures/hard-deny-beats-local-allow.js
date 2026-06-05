export default {
  basis: {
    observerRef: "observer:zack",
    surfaceRef: "surface:public-web",
    actionRef: "action:publish",
    artifactRef: "artifact:private-note",
    contextRef: "context:edge",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    surfaceClass: "public",
    artifactClass: "private"
  },
  rulebooks: [],
  overlays: [],
  grants: [{
    id: "grant.publish.public.web",
    effect: "allow",
    scope: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web"
    },
    expiresAt: null,
    reason: "Operator has scoped grant to publish to public web."
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
  time: "2026-06-05T00:00:00.000Z"
};
