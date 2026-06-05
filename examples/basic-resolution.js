import { resolveEffectiveView } from "../src/index.js";

const basis = {
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
};

const view = resolveEffectiveView({
  basis,
  facts: {
    surfaceClass: "public"
  },
  rulebooks: [{
    id: "rulebook.edge-basic",
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
  overlays: [],
  grants: [],
  denials: [],
  time: "2026-06-05T00:00:00.000Z"
});

console.log(JSON.stringify(view, null, 2));
