import assert from "node:assert/strict";
import test from "node:test";

import {
  REPORT_ONLY_PROOF_RUNG,
  hashReportOnlyEvaluationReceipt,
  resolveReportOnlyEvaluationReceipt,
  stableStringify,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";
import edgeWriterAdmissionAllowed from "../conformance/fixtures/edge-writer-admission-allowed.js";
import edgeWriterAdmissionHardDenied from "../conformance/fixtures/edge-writer-admission-hard-denied.js";
import edgeWriterAdmissionRequiresReview from "../conformance/fixtures/edge-writer-admission-requires-review.js";

const receiptInput = {
  rulebookRef: "rulebook.edge-writer-admission",
  capabilityRef: "capability:edge-writer-admission",
  scope: {
    actionRef: "action:writer-admission",
    contextRef: "context:edge-local-layer",
    roleRef: "role:operator"
  },
  evidenceRefs: ["receipt.edge-writer-review.writer-001"],
  expiry: null,
  reason: "Report-only evaluation for local writer admission.",
  resolverInput: edgeWriterAdmissionAllowed
};

test("report-only evaluation receipt preserves allowed decision and non-claims", () => {
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(receiptInput);

  assert.equal(receipt.receiptVersion, "rbc_report_only_evaluation_receipt.v1");
  assert.equal(receipt.mode, "report_only");
  assert.equal(receipt.proofRung, REPORT_ONLY_PROOF_RUNG);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(receipt.rulebookRef, "rulebook.edge-writer-admission");
  assert.equal(receipt.capabilityRef, "capability:edge-writer-admission");
  assert.deepEqual(receipt.scope, receiptInput.scope);
  assert.deepEqual(receipt.evidenceRefs, ["receipt.edge-writer-review.writer-001"]);
  assert.equal(receipt.expiry, null);
  assert.match(receipt.receiptRef, /^rbc-evaluation-receipt:[a-f0-9]{16}$/);
  assert.match(receipt.receiptHash, /^sha256:[a-f0-9]{64}$/);
  assert.match(receipt.effectiveViewRef, /^rbc-view:[a-f0-9]{64}$/);
  assert.ok(receipt.sourceRefs.includes("rule.edge-local-trusted-writer-allow"));
  assert.ok(receipt.traceRefs.includes("receipt.edge-writer-review.writer-001"));
  assert.equal(receipt.nonClaims.authority, false);
  assert.equal(receipt.nonClaims.execution, false);
  assert.equal(receipt.nonClaims.governedSeam, false);
  assert.equal(receipt.nonClaims.seamTransport, false);
  assert.equal(receipt.nonClaims.downstreamConsumption, false);
  assert.equal(receipt.nonClaims.productionDurability, false);

  assert.equal(readback.hashMatches, true);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("report-only evaluation receipt maps denial to denied", () => {
  const { receipt } = resolveReportOnlyEvaluationReceipt({
    ...receiptInput,
    resolverInput: edgeWriterAdmissionHardDenied,
    evidenceRefs: ["receipt.edge-writer-review.writer-001", "deny.untrusted-device-writer-admission"]
  });

  assert.equal(receipt.decision, "denied");
  assert.equal(receipt.posture, "denied");
  assert.ok(receipt.sourceRefs.includes("deny.untrusted-device-writer-admission"));
});

test("report-only evaluation receipt maps review gate to deferred", () => {
  const { receipt } = resolveReportOnlyEvaluationReceipt({
    ...receiptInput,
    resolverInput: edgeWriterAdmissionRequiresReview,
    evidenceRefs: []
  });

  assert.equal(receipt.decision, "deferred");
  assert.equal(receipt.posture, "requires_review");
  assert.ok(receipt.traceRefs.includes("rule.edge-writer-admission-requires-review"));
});

test("report-only evaluation receipt and readback hashes are deterministic", () => {
  const first = resolveReportOnlyEvaluationReceipt(receiptInput);
  const second = resolveReportOnlyEvaluationReceipt(receiptInput);

  assert.deepEqual(second, first);
  assert.equal(hashReportOnlyEvaluationReceipt(first.receipt), first.receipt.receiptHash);
});

test("report-only evaluation readback detects tampering", () => {
  const { receipt, readback } = resolveReportOnlyEvaluationReceipt(receiptInput);
  const tamperedReadback = {
    ...readback,
    decision: "denied"
  };

  assert.equal(verifyReportOnlyEvaluationReadback(receipt, tamperedReadback), false);
});

test("report-only evaluation receipt does not mutate input", () => {
  const before = stableStringify(receiptInput);

  resolveReportOnlyEvaluationReceipt(receiptInput);

  assert.equal(stableStringify(receiptInput), before);
});
