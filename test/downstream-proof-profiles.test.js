import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";
import causalPolicyHistoryConflict from "./fixtures/operational/causal-policy-history-conflict.js";
import causalPolicyHistoryDesynced from "./fixtures/operational/causal-policy-history-desynced.js";
import causalPolicyHistoryPartial from "./fixtures/operational/causal-policy-history-partial.js";
import causalPolicyHistoryRevokedSuperseded from "./fixtures/operational/causal-policy-history-revoked-superseded.js";
import causalPolicyHistorySynced from "./fixtures/operational/causal-policy-history-synced.js";
import causalPolicyHistoryUnverified from "./fixtures/operational/causal-policy-history-unverified.js";
import edgeWriterAdmissionAllowed from "./fixtures/operational/edge-writer-admission-allowed.js";
import edgeWriterAdmissionHardDenied from "./fixtures/operational/edge-writer-admission-hard-denied.js";
import edgeWriterAdmissionRequiresReview from "./fixtures/operational/edge-writer-admission-requires-review.js";

test("edge writer-admission profile allows only reviewed scoped admission", () => {
  const view = resolveEffectiveView(edgeWriterAdmissionAllowed);

  assert.equal(view.posture, "allowed");
  assert.deepEqual(view.requiredReceipts, ["edge_writer_review"]);
  assert.deepEqual(view.missingReceipts, []);
  assert.deepEqual(view.satisfiedReceipts, ["edge_writer_review"]);
  assert.ok(view.allowedBy.includes("rule.edge-local-trusted-writer-allow"));
  assert.ok(view.allowedBy.includes("grant.edge-operator-writer-admission"));
  assert.equal(view.nonClaims.authority, false);
  assert.equal(view.nonClaims.approval, false);
});

test("edge writer-admission profile keeps missing review as a gate", () => {
  const view = resolveEffectiveView(edgeWriterAdmissionRequiresReview);

  assert.equal(view.posture, "requires_review");
  assert.deepEqual(view.requiredReceipts, ["edge_writer_review"]);
  assert.deepEqual(view.missingReceipts, ["edge_writer_review"]);
  assert.equal(view.mediation.mode, "review");
});

test("edge writer-admission profile lets hard denial beat grant and receipt", () => {
  const view = resolveEffectiveView(edgeWriterAdmissionHardDenied);

  assert.equal(view.posture, "denied");
  assert.deepEqual(view.deniedBy, ["deny.untrusted-device-writer-admission"]);
  assert.ok(view.allowedBy.includes("grant.edge-operator-writer-admission"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "deny.untrusted-device-writer-admission" &&
    entry.role === "winner"
  )));
});

test("causal policy-history pressure profiles surface non-conflict uncertainty without changing allow posture", () => {
  const synced = resolveEffectiveView(causalPolicyHistorySynced);
  const partial = resolveEffectiveView(causalPolicyHistoryPartial);
  const desynced = resolveEffectiveView(causalPolicyHistoryDesynced);
  const unverified = resolveEffectiveView(causalPolicyHistoryUnverified);

  assert.equal(synced.posture, "allowed");
  assert.equal(partial.posture, "allowed");
  assert.equal(desynced.posture, "allowed");
  assert.equal(unverified.posture, "allowed");
  assert.equal(synced.policyHistoryPosture, "policy_history_synced");
  assert.equal(partial.policyHistoryPosture, "policy_history_partial");
  assert.equal(desynced.policyHistoryPosture, "policy_history_desynced");
  assert.equal(unverified.policyHistoryPosture, "policy_history_unverified");
  assert.notEqual(partial.effectiveViewRef, synced.effectiveViewRef);
  assert.notEqual(desynced.effectiveViewRef, synced.effectiveViewRef);
  assert.notEqual(unverified.effectiveViewRef, synced.effectiveViewRef);
});

test("causal policy-history conflict pressure requires mediation", () => {
  const view = resolveEffectiveView(causalPolicyHistoryConflict);

  assert.equal(view.posture, "requires_mediation");
  assert.equal(view.policyHistoryPosture, "policy_history_conflict_observed");
  assert.deepEqual(view.unresolved.map((entry) => entry.sourceRef), ["policyHistory"]);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "policyHistory" &&
    entry.role === "unresolved"
  )));
});

test("causal policy-history revoked and superseded refs are traceable unresolved material", () => {
  const view = resolveEffectiveView(causalPolicyHistoryRevokedSuperseded);

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.unresolved.map((entry) => entry.sourceRef), [
    "policy:revoked:edge-publication",
    "policy:superseded:edge-publication"
  ]);
  assert.ok(view.trace.some((entry) => entry.sourceRef === "policy:revoked:edge-publication"));
  assert.ok(view.trace.some((entry) => entry.sourceRef === "policy:superseded:edge-publication"));
});
