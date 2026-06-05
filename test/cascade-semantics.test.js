import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";

const basis = {
  actionRef: "action:publish",
  surfaceRef: "surface:public-web",
  timeRef: "2026-06-05T00:00:00.000Z"
};

test("non-overridable parent denial cannot be loosened by overlay allow", () => {
  const view = resolveEffectiveView({
    basis,
    facts: {
      surfaceClass: "public"
    },
    rulebooks: [{
      id: "rulebook.parent",
      rules: [{
        id: "rule.parent-public-publish-deny",
        effect: "deny",
        strength: "normal",
        nonOverridable: true,
        when: {
          actionRef: "action:publish",
          surfaceClass: "public"
        },
        reason: "Parent context denies this publication path."
      }]
    }],
    overlays: [{
      id: "overlay.local",
      rules: [{
        id: "rule.overlay-public-publish-allow",
        effect: "allow",
        when: {
          actionRef: "action:publish",
          surfaceClass: "public"
        },
        reason: "Local overlay attempts to allow publication."
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "denied");
  assert.deepEqual(view.deniedBy, ["rule.parent-public-publish-deny"]);
  assert.ok(view.conflicts.some((conflict) => (
    conflict.sourceRefs.includes("rule.parent-public-publish-deny") &&
    conflict.sourceRefs.includes("rule.overlay-public-publish-allow")
  )));
});

test("same-precedence incompatible rules require mediation", () => {
  const view = resolveEffectiveView({
    basis,
    facts: {
      surfaceClass: "public"
    },
    rulebooks: [{
      id: "rulebook.conflict",
      rules: [{
        id: "rule.public-publish-allow",
        effect: "allow",
        priority: 20,
        when: {
          actionRef: "action:publish",
          surfaceClass: "public"
        }
      }, {
        id: "rule.public-publish-provisional",
        effect: "provisional",
        priority: 20,
        when: {
          actionRef: "action:publish",
          surfaceClass: "public"
        }
      }]
    }],
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.equal(view.mediation.mode, "mediation");
  assert.ok(view.conflicts.some((conflict) => (
    conflict.sourceRefs.includes("rule.public-publish-allow") &&
    conflict.sourceRefs.includes("rule.public-publish-provisional")
  )));
});
