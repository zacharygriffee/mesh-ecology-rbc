import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";
import { operationalProofFixtures } from "./fixtures/operational/index.js";

test("operational fixture index exposes named proof bundles", () => {
  assert.deepEqual(Object.keys(operationalProofFixtures).sort(), [
    "causalPolicyHistoryConflict",
    "causalPolicyHistoryDesynced",
    "causalPolicyHistoryPartial",
    "causalPolicyHistoryRevokedSuperseded",
    "causalPolicyHistorySynced",
    "causalPolicyHistoryUnverified",
    "edgeWriterAdmissionAllowed",
    "edgeWriterAdmissionHardDenied",
    "edgeWriterAdmissionRequiresReview",
    "privatePublishHardDenied",
    "publicPublishWithReviewReceipt"
  ]);
});

for (const [name, fixture] of Object.entries(operationalProofFixtures)) {
  test(`operational fixture ${name} resolves expected proof`, () => {
    const view = resolveEffectiveView(fixture.input);

    assert.equal(view.posture, fixture.expected.posture);
    assert.equal(view.trace.length > 0, true);
    for (const sourceRef of fixture.expected.traceSourceRefs) {
      assert.ok(view.trace.some((entry) => entry.sourceRef === sourceRef), `${sourceRef} missing from trace`);
    }
    if (fixture.expected.policyHistoryPosture) {
      assert.equal(view.policyHistoryPosture, fixture.expected.policyHistoryPosture);
    }
    if (fixture.expected.unresolvedSourceRefs) {
      assert.deepEqual(
        view.unresolved.map((entry) => entry.sourceRef),
        fixture.expected.unresolvedSourceRefs
      );
    }
    assert.deepEqual(view.nonClaims, fixture.expected.nonClaims);
    assert.match(view.effectiveViewRef, /^rbc-view:[a-f0-9]{64}$/);
  });
}
