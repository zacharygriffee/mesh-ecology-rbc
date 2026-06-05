import assert from "node:assert/strict";
import test from "node:test";

import { EFFECTIVE_VIEW_VERSION, resolveEffectiveView } from "../src/index.js";

const baseBasis = {
  actionRef: "action:publish",
  surfaceRef: "surface:public-web",
  timeRef: "2026-06-05T00:00:00.000Z"
};

test("effective view exposes v1 contract version", () => {
  const view = resolveEffectiveView({
    basis: baseBasis,
    rulebooks: [{
      id: "rulebook.allow",
      rules: [{
        id: "rule.allow",
        effect: "allow",
        when: {
          actionRef: "action:publish"
        }
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.viewVersion, EFFECTIVE_VIEW_VERSION);
  assert.equal(view.viewVersion, "effective_view.v1");
});

test("allowed posture fixture resolves through scoped allow", () => {
  const view = resolveEffectiveView({
    basis: baseBasis,
    grants: [{
      id: "grant.allow-publish",
      effect: "allow",
      scope: {
        actionRef: "action:publish",
        surfaceRef: "surface:public-web"
      }
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "allowed");
  assert.deepEqual(view.allowedBy, ["grant.allow-publish"]);
});

test("provisional posture fixture resolves through provisional rule", () => {
  const view = resolveEffectiveView({
    basis: baseBasis,
    rulebooks: [{
      id: "rulebook.provisional",
      rules: [{
        id: "rule.provisional-publish",
        effect: "provisional",
        when: {
          actionRef: "action:publish"
        },
        reason: "Publish can proceed only provisionally."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "provisional");
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "rule.provisional-publish" &&
    entry.role === "winner"
  )));
});

test("unknown posture fixture resolves through explicit unknown rule", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:inspect-unknown",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    rulebooks: [{
      id: "rulebook.unknown",
      rules: [{
        id: "rule.unknown-action",
        posture: "unknown",
        when: {
          actionRef: "action:inspect-unknown"
        },
        reason: "The action is known to RBC but intentionally unresolved by current rule material."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "unknown");
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "rule.unknown-action" &&
    entry.role === "winner"
  )));
});

test("not applicable posture fixture resolves through explicit not_applicable rule", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:render-preview",
      contextRef: "context:presentation-only",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    rulebooks: [{
      id: "rulebook.not-applicable",
      rules: [{
        id: "rule.presentation-not-rbc",
        posture: "not_applicable",
        when: {
          contextRef: "context:presentation-only"
        },
        reason: "Presentation-only preview is outside this RBC decision boundary."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "not_applicable");
  assert.equal(view.mediation, null);
});

test("metadata-derived facts participate in deterministic matching", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    surface: {
      id: "surface:public-web",
      class: "public"
    },
    artifact: {
      id: "artifact:note-001",
      class: "public_note"
    },
    role: {
      id: "role:operator",
      class: "operator"
    },
    device: {
      id: "device:workstation",
      class: "trusted"
    },
    observer: {
      id: "observer:zack",
      class: "human_operator"
    },
    branch: {
      id: "branch:main",
      class: "mainline"
    },
    envelope: {
      id: "edge-envelope:zack-primary",
      class: "edge"
    },
    context: {
      id: "context:edge",
      class: "local_layer"
    },
    rulebooks: [{
      id: "rulebook.metadata",
      rules: [{
        id: "rule.metadata-match",
        effect: "allow",
        when: {
          surfaceClass: "public",
          artifactClass: "public_note",
          roleClass: "operator",
          deviceClass: "trusted",
          observerClass: "human_operator",
          branchClass: "mainline",
          envelopeClass: "edge",
          contextClass: "local_layer"
        }
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "allowed");
  assert.deepEqual(view.allowedBy, ["rule.metadata-match"]);
});
