import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";

test("malformed top-level input returns traceable mediation", () => {
  const view = resolveEffectiveView(null);

  assert.equal(view.posture, "requires_mediation");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "input"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "input" &&
    entry.status === "invalid_input"
  )));
});

test("malformed grant cannot silently allow an action", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    grants: [{
      id: "grant.malformed",
      effect: "allow",
      scope: "not-an-object",
      reason: "This malformed grant must not allow anything."
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.allowedBy, []);
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "grant.malformed"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "grant.malformed" &&
    entry.status === "invalid_scope" &&
    entry.role === "unresolved"
  )));
});

test("invalid resolution time blocks expiring grant resolution", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web",
      timeRef: "not-a-date"
    },
    grants: [{
      id: "grant.expiring",
      effect: "allow",
      scope: {
        actionRef: "action:publish",
        surfaceRef: "surface:public-web"
      },
      expiresAt: "2026-06-06T00:00:00.000Z",
      reason: "Expiring grant."
    }]
  });

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.allowedBy, []);
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "time"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "grant.expiring" &&
    entry.status === "unresolved_time"
  )));
});

test("executable predicates are rejected as unresolved material", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    rulebooks: [{
      id: "rulebook.bad",
      rules: [{
        id: "rule.executable",
        effect: "allow",
        when: {
          actionRef: () => true
        },
        reason: "Executable predicates are not declarative rule material."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.allowedBy, []);
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "rule.executable"));
});

test("unsupported effects are explicit unresolved material", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    rulebooks: [{
      id: "rulebook.unsupported",
      rules: [{
        id: "rule.unsupported-effect",
        effect: "auto_execute",
        when: {
          actionRef: "action:publish"
        },
        reason: "Unsupported effects cannot resolve posture."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "rule.unsupported-effect"));
});

test("duplicate refs are explicit unresolved material", () => {
  const view = resolveEffectiveView({
    basis: {
      actionRef: "action:publish",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    rulebooks: [{
      id: "rulebook.duplicate",
      rules: [{
        id: "rule.duplicate",
        effect: "allow",
        when: {
          actionRef: "action:publish"
        }
      }, {
        id: "rule.duplicate",
        effect: "allow",
        when: {
          actionRef: "action:publish"
        }
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.allowedBy, []);
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "rule.duplicate"));
});
