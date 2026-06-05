import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";
import protoStylePublishPrepared from "../conformance/fixtures/proto-style-publish-prepared.js";

test("prepared mock/proto RBC shape resolves as plain declarative RBC input", () => {
  const view = resolveEffectiveView(protoStylePublishPrepared);

  assert.equal(view.posture, "allowed");
  assert.ok(view.allowedBy.includes("rule.proto-action-kind-allowed"));
  assert.ok(view.allowedBy.includes("grant.proto-local-review"));
  assert.deepEqual(view.requiredReceipts, ["operator_review"]);
  assert.deepEqual(view.satisfiedReceipts, ["operator_review"]);
  assert.equal(view.nonClaims.authority, false);
  assert.equal(view.nonClaims.execution, false);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "rule.proto-publish-review-required" &&
    entry.role === "satisfied_gate"
  )));
});
