export default {
  basis: {
    observerRef: "observer:zack",
    surfaceRef: "surface:public-web",
    actionRef: "action:publish",
    artifactRef: "artifact:note-001",
    contextRef: "context:edge",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    surfaceClass: "public"
  },
  rulebooks: [],
  overlays: [],
  grants: [{
    id: "grant.temporary-publish",
    effect: "allow",
    scope: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web"
    },
    expiresAt: "2026-06-04T23:59:59.000Z",
    reason: "Temporary publishing grant."
  }],
  denials: [],
  time: "2026-06-05T00:00:00.000Z"
};
