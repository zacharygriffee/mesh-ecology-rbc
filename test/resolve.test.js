import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";
import hardDenyBeatsLocalAllow from "./fixtures/hard-deny-beats-local-allow.js";
import publicPublishRequiresReview from "./fixtures/public-publish-requires-review.js";
import temporaryGrantExpires from "./fixtures/temporary-grant-expires.js";
import unknownActionRequiresMediation from "./fixtures/unknown-action-requires-mediation.js";

test("public publish requires review", () => {
  const view = resolveEffectiveView(publicPublishRequiresReview);

  assert.equal(view.posture, "requires_review");
  assert.deepEqual(view.requiredReceipts, ["operator_review"]);
  assert.equal(view.mediation.mode, "review");
  assert.ok(view.trace.some((entry) => entry.sourceRef === "rule.public-publish-requires-review"));
});

test("hard deny beats local allow", () => {
  const view = resolveEffectiveView(hardDenyBeatsLocalAllow);

  assert.equal(view.posture, "denied");
  assert.deepEqual(view.deniedBy, ["deny.private-artifact-public-surface"]);
  assert.deepEqual(view.allowedBy, ["grant.publish.public.web"]);
  assert.ok(view.trace.some((entry) => entry.sourceRef === "deny.private-artifact-public-surface"));
  assert.ok(view.trace.some((entry) => entry.sourceRef === "grant.publish.public.web"));
});

test("temporary grant expires", () => {
  const view = resolveEffectiveView(temporaryGrantExpires);

  assert.equal(view.posture, "requires_mediation");
  assert.deepEqual(view.allowedBy, []);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "grant.temporary-publish" &&
    entry.status === "expired"
  )));
});

test("unknown action requires mediation", () => {
  const view = resolveEffectiveView(unknownActionRequiresMediation);

  assert.equal(view.posture, "requires_mediation");
  assert.equal(view.mediation.mode, "mediation");
  assert.ok(view.trace.some((entry) => entry.sourceRef === "rbc.default.requires_mediation"));
});

test("same input produces the same effectiveViewRef", () => {
  const first = resolveEffectiveView(publicPublishRequiresReview);
  const second = resolveEffectiveView(publicPublishRequiresReview);

  assert.equal(first.effectiveViewRef, second.effectiveViewRef);
});
