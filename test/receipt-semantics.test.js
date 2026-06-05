import assert from "node:assert/strict";
import test from "node:test";

import { resolveEffectiveView } from "../src/index.js";

const gatedInput = {
  basis: {
    actionRef: "action:publish",
    surfaceRef: "surface:public-web",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  rulebooks: [{
    id: "rulebook.review",
    rules: [{
      id: "rule.publish-review",
      effect: "requires_review",
      when: {
        actionRef: "action:publish"
      },
      requires: {
        receipts: ["operator_review"]
      }
    }]
  }],
  grants: [{
    id: "grant.publish",
    effect: "allow",
    scope: {
      actionRef: "action:publish",
      surfaceRef: "surface:public-web"
    }
  }],
  time: "2026-06-05T00:00:00.000Z"
};

test("missing receipt keeps review gate active", () => {
  const view = resolveEffectiveView(gatedInput);

  assert.equal(view.posture, "requires_review");
  assert.deepEqual(view.missingReceipts, ["operator_review"]);
});

test("valid receipt satisfies review gate", () => {
  const view = resolveEffectiveView({
    ...gatedInput,
    receipts: [{
      id: "receipt.valid-review",
      receiptRef: "operator_review",
      status: "valid"
    }]
  });

  assert.equal(view.posture, "allowed");
  assert.deepEqual(view.satisfiedReceipts, ["operator_review"]);
});

for (const status of ["invalid", "revoked", "superseded"]) {
  test(`${status} receipt does not satisfy review gate`, () => {
    const view = resolveEffectiveView({
      ...gatedInput,
      receipts: [{
        id: `receipt.${status}-review`,
        receiptRef: "operator_review",
        status
      }]
    });

    assert.equal(view.posture, "requires_review");
    assert.deepEqual(view.missingReceipts, ["operator_review"]);
    assert.ok(view.trace.some((entry) => (
      entry.sourceRef === `receipt.${status}-review` &&
      entry.status === status &&
      entry.role === "unresolved"
    )));
  });
}

test("expired receipt does not satisfy review gate", () => {
  const view = resolveEffectiveView({
    ...gatedInput,
    receipts: [{
      id: "receipt.expired-review",
      receiptRef: "operator_review",
      expiresAt: "2026-06-04T00:00:00.000Z"
    }]
  });

  assert.equal(view.posture, "requires_review");
  assert.deepEqual(view.missingReceipts, ["operator_review"]);
  assert.ok(view.trace.some((entry) => (
    entry.sourceRef === "receipt.expired-review" &&
    entry.status === "expired"
  )));
});

test("malformed receipt evidence is explicit unresolved material", () => {
  const view = resolveEffectiveView({
    ...gatedInput,
    receipts: [{
      id: "receipt.malformed-review",
      receiptRef: "operator_review",
      expiresAt: "not-a-date"
    }]
  });

  assert.equal(view.posture, "requires_mediation");
  assert.ok(view.unresolved.some((entry) => entry.sourceRef === "receipt.malformed-review"));
});
