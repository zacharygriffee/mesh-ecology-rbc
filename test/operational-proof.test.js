import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView, stableStringify } from "../src/index.js";
import privatePublishHardDenied from "../conformance/fixtures/private-publish-hard-denied.js";
import publicPublishWithReviewReceipt from "../conformance/fixtures/public-publish-with-review-receipt.js";

test("operational proof allows reviewed public publish without claiming authority", () => {
  const view = resolveEffectiveView(publicPublishWithReviewReceipt);

  assert.equal(view.posture, "allowed");
  assert.deepEqual(view.requiredReceipts, ["operator_review"]);
  assert.deepEqual(view.missingReceipts, []);
  assert.deepEqual(view.satisfiedReceipts, ["operator_review"]);
  assert.ok(view.allowedBy.includes("grant.operator-public-publish"));
  assert.ok(view.allowedBy.includes("rule.local-public-note-publish-allow"));
  assert.equal(view.nonClaims.execution, false);
  assert.equal(view.nonClaims.approval, false);
  assert.equal(view.nonClaims.authority, false);
  assert.equal(view.nonClaims.persistence, false);
  assert.equal(view.nonClaims.hiddenClock, false);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "rule.public-publish-requires-review" &&
    entry.status === "satisfied" &&
    entry.role === "satisfied_gate"
  )));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "receipt.operator-review.note-001" &&
    entry.status === "active" &&
    entry.role === "evidence"
  )));
});

test("operational proof hard denies private publish even with grant and receipt", () => {
  const view = resolveEffectiveView(privatePublishHardDenied);

  assert.equal(view.posture, "denied");
  assert.deepEqual(view.deniedBy, ["deny.private-artifact-public-surface"]);
  assert.ok(view.allowedBy.includes("grant.operator-public-publish"));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "deny.private-artifact-public-surface" &&
    entry.role === "winner"
  )));
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "grant.operator-public-publish" &&
    entry.role === "applied"
  )));
});

test("operational proof does not mutate input material", () => {
  const before = stableStringify(publicPublishWithReviewReceipt);

  resolveEffectiveView(publicPublishWithReviewReceipt);

  assert.equal(stableStringify(publicPublishWithReviewReceipt), before);
});

test("operational proof stable refs survive equivalent object key ordering", () => {
  const reordered = {
    time: publicPublishWithReviewReceipt.time,
    receipts: publicPublishWithReviewReceipt.receipts,
    denials: publicPublishWithReviewReceipt.denials,
    grants: publicPublishWithReviewReceipt.grants,
    overlays: publicPublishWithReviewReceipt.overlays,
    rulebooks: publicPublishWithReviewReceipt.rulebooks,
    facts: {
      artifactClass: "public_note",
      surfaceClass: "public"
    },
    basis: {
      timeRef: "2026-06-05T00:00:00.000Z",
      contextRef: "context:edge",
      artifactRef: "artifact:note-001",
      actionRef: "action:publish",
      branchRef: "branch:main",
      roleRef: "role:operator",
      deviceRef: "device:workstation",
      surfaceRef: "surface:public-web",
      envelopeRef: "edge-envelope:zack-primary",
      observerRef: "observer:zack"
    }
  };

  assert.equal(
    resolveEffectiveView(reordered).effectiveViewRef,
    resolveEffectiveView(publicPublishWithReviewReceipt).effectiveViewRef
  );
});
