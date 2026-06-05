import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";

const baseInput = {
  basis: {
    actionRef: "action:publish",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  rulebooks: [{
    id: "rulebook.allow",
    rules: [{
      id: "rule.allow-publish",
      effect: "allow",
      when: {
        actionRef: "action:publish"
      }
    }]
  }],
  time: "2026-06-05T00:00:00.000Z"
};

test("compatibility and admissibility default scalar values are preserved", () => {
  const view = resolveEffectiveView(baseInput);

  assert.equal(view.compatibility, "compatible");
  assert.equal(view.admissibility, "not_applicable");
});

test("caller-supplied scalar compatibility and admissibility are hash-significant", () => {
  const defaultView = resolveEffectiveView(baseInput);
  const suppliedView = resolveEffectiveView({
    ...baseInput,
    compatibility: "policy_history_partial",
    admissibility: "admissible"
  });

  assert.equal(suppliedView.compatibility, "policy_history_partial");
  assert.equal(suppliedView.admissibility, "admissible");
  assert.notEqual(suppliedView.effectiveViewRef, defaultView.effectiveViewRef);
});
