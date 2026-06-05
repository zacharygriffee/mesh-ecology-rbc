import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView, resolvePolicyPackView, stableStringify } from "../src/index.js";
import publicPublishWithReviewReceipt from "../conformance/fixtures/public-publish-with-review-receipt.js";

function packFrom(input) {
  return {
    id: "policy-pack.edge-publication",
    version: "0.1.0",
    rulebooks: input.rulebooks,
    overlays: input.overlays,
    grants: input.grants,
    denials: input.denials,
    fixtures: ["public-publish-with-review-receipt"]
  };
}

test("policy pack wrapper resolves the same view as plain resolver input", () => {
  const packInput = {
    basis: publicPublishWithReviewReceipt.basis,
    facts: publicPublishWithReviewReceipt.facts,
    pack: packFrom(publicPublishWithReviewReceipt),
    receipts: publicPublishWithReviewReceipt.receipts,
    time: publicPublishWithReviewReceipt.time
  };

  const direct = resolveEffectiveView(publicPublishWithReviewReceipt);
  const packed = resolvePolicyPackView(packInput);

  assert.equal(packed.effectiveViewRef, direct.effectiveViewRef);
  assert.equal(packed.posture, "allowed");
});

test("policy pack wrapper does not mutate pack input", () => {
  const packInput = {
    basis: publicPublishWithReviewReceipt.basis,
    facts: publicPublishWithReviewReceipt.facts,
    pack: packFrom(publicPublishWithReviewReceipt),
    receipts: publicPublishWithReviewReceipt.receipts,
    time: publicPublishWithReviewReceipt.time
  };
  const before = stableStringify(packInput);

  resolvePolicyPackView(packInput);

  assert.equal(stableStringify(packInput), before);
});

test("malformed policy pack material is explicit unresolved mediation", () => {
  const view = resolvePolicyPackView({
    basis: {
      actionRef: "action:publish",
      timeRef: "2026-06-05T00:00:00.000Z"
    },
    pack: {
      id: "policy-pack.bad",
      version: "0.1.0",
      rulebooks: "not-an-array"
    },
    time: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(view.posture, "requires_mediation");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "rulebooks"));
});

test("adapter-shaped data prepared outside core resolves identically to plain data", () => {
  const adapterPayload = {
    suppliedBy: "adapter:fixture-only",
    material: packFrom(publicPublishWithReviewReceipt),
    facts: publicPublishWithReviewReceipt.facts,
    receipts: publicPublishWithReviewReceipt.receipts
  };
  const preparedInput = {
    basis: publicPublishWithReviewReceipt.basis,
    facts: adapterPayload.facts,
    pack: adapterPayload.material,
    receipts: adapterPayload.receipts,
    time: publicPublishWithReviewReceipt.time
  };

  assert.equal(
    resolvePolicyPackView(preparedInput).effectiveViewRef,
    resolveEffectiveView(publicPublishWithReviewReceipt).effectiveViewRef
  );
});
