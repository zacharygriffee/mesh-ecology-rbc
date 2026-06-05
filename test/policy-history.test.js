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

test("synced policy history preserves existing resolution", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      visibleRefs: ["policy:create:allow-publish"],
      sourceBranchRefs: ["branch:main"]
    }
  });

  assert.equal(view.posture, "allowed");
  assert.equal(view.policyHistoryPosture, "policy_history_synced");
  assert.deepEqual(view.policyHistory.visibleRefs, ["policy:create:allow-publish"]);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "policyHistory" &&
    entry.status === "policy_history_synced" &&
    entry.role === "evidence"
  )));
});

test("partial policy history is explicit and hash-significant", () => {
  const synced = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      visibleRefs: ["policy:create:allow-publish"]
    }
  });
  const partial = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      visibleRefs: ["policy:create:allow-publish"],
      partialRefs: ["policy:overlay:device-local"]
    }
  });

  assert.equal(partial.posture, "allowed");
  assert.equal(partial.policyHistoryPosture, "policy_history_partial");
  assert.notEqual(partial.effectiveViewRef, synced.effectiveViewRef);
});

test("desynced policy history is surfaced from caller-supplied refs", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      desyncedRefs: ["policy:device-a", "policy:device-b"]
    }
  });

  assert.equal(view.policyHistoryPosture, "policy_history_desynced");
  assert.deepEqual(view.policyHistory.desyncedRefs, ["policy:device-a", "policy:device-b"]);
});

test("unverified policy history is surfaced from caller-supplied refs", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      unverifiedRefs: ["policy:unverified:edge-publication"]
    }
  });

  assert.equal(view.policyHistoryPosture, "policy_history_unverified");
  assert.deepEqual(view.policyHistory.unverifiedRefs, ["policy:unverified:edge-publication"]);
});

test("conflict-observed policy history requires mediation", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      conflictRefs: ["policy:conflict:edge-publication"]
    }
  });

  assert.equal(view.posture, "requires_mediation");
  assert.equal(view.policyHistoryPosture, "policy_history_conflict_observed");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "policyHistory"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "policyHistory" &&
    entry.role === "unresolved"
  )));
});

test("revoked and superseded policy refs are unresolved caller-supplied policy material", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      revocationRefs: ["policy:revoked:allow-publish"],
      supersessionRefs: ["policy:superseded:allow-publish"]
    }
  });

  assert.equal(view.posture, "requires_mediation");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "policy:revoked:allow-publish"));
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "policy:superseded:allow-publish"));
});

test("unsupported policy history posture is unresolved and does not leak into view posture", () => {
  const view = resolveEffectiveView({
    ...baseInput,
    policyHistory: {
      posture: "policy_history_magic",
      visibleRefs: ["policy:create:allow-publish"]
    }
  });

  assert.equal(view.posture, "requires_mediation");
  assert.equal(view.policyHistoryPosture, "policy_history_synced");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "policyHistory"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "policyHistory" &&
    entry.status === "unsupported_policy_history_posture"
  )));
});
