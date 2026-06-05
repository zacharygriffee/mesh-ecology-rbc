import assert from "node:assert/strict";
import test from "node:test";

import { stableStringify } from "../src/index.js";
import {
  createReportOnlyReceiptProofTranscript,
  listOperationalProofFixtures,
  listReportOnlyReceiptProofFixtures,
  operationalProofFixtures,
  reportOnlyReceiptProofFixtures,
  REPORT_ONLY_RECEIPT_PROOF_TRANSCRIPT_VERSION,
  runReportOnlyReceiptProof,
  runReportOnlyReceiptProofSuite,
  runOperationalProof,
  runOperationalProofSuite
} from "../conformance/index.js";

test("conformance API lists and runs selected operational proof", () => {
  assert.ok(listOperationalProofFixtures().includes("edge-writer-admission-allowed"));

  assert.deepEqual(runOperationalProofSuite(["edge-writer-admission-allowed"]), [{
    id: "edge-writer-admission-allowed",
    posture: "allowed",
    effectiveViewRef: "rbc-view:401ba7d7c528585b5bafd732704b39d81ae08a365c4af8bea7a5b338fe680bd3"
  }]);
});

test("conformance API runs a fixture object", () => {
  const result = runOperationalProof("causal-policy-history-conflict");

  assert.deepEqual(runOperationalProof(operationalProofFixtures.causalPolicyHistoryConflict), result);
});

test("conformance API fails closed for unknown fixture id", () => {
  assert.throws(
    () => runOperationalProofSuite(["missing-fixture"]),
    /Unknown operational proof fixture: missing-fixture/
  );
});

test("conformance API lists and runs selected report-only receipt proof", () => {
  assert.ok(listReportOnlyReceiptProofFixtures().includes("layer-writer-authorized"));

  const [result] = runReportOnlyReceiptProofSuite(["layer-writer-authorized"]);

  assert.equal(result.id, "layer-writer-authorized");
  assert.equal(result.decision, "allowed");
  assert.equal(result.posture, "allowed");
  assert.match(result.receiptRef, /^rbc-evaluation-receipt:[a-f0-9]{16}$/);
  assert.match(result.receiptHash, /^sha256:[a-f0-9]{64}$/);
  assert.match(result.readbackRef, /^rbc-evaluation-readback:[a-f0-9]{16}$/);
  assert.match(result.readbackHash, /^sha256:[a-f0-9]{64}$/);
  assert.match(result.effectiveViewRef, /^rbc-view:[a-f0-9]{64}$/);
});

test("conformance API runs a report-only receipt fixture object", () => {
  const result = runReportOnlyReceiptProof("layer-writer-hard-denied");

  assert.deepEqual(runReportOnlyReceiptProof(reportOnlyReceiptProofFixtures.layerWriterHardDenied), result);
});

test("conformance API fails closed for unknown report-only receipt fixture id", () => {
  assert.throws(
    () => runReportOnlyReceiptProofSuite(["missing-fixture"]),
    /Unknown report-only receipt proof fixture: missing-fixture/
  );
});

test("conformance API does not mutate report-only receipt proof fixtures", () => {
  const before = stableStringify(reportOnlyReceiptProofFixtures);

  runReportOnlyReceiptProofSuite();
  createReportOnlyReceiptProofTranscript();

  assert.equal(stableStringify(reportOnlyReceiptProofFixtures), before);
});

test("conformance API creates deterministic report-only receipt proof transcript", () => {
  const transcript = createReportOnlyReceiptProofTranscript();
  const repeatedTranscript = createReportOnlyReceiptProofTranscript();

  assert.deepEqual(transcript, repeatedTranscript);
  assert.equal(transcript.transcriptVersion, REPORT_ONLY_RECEIPT_PROOF_TRANSCRIPT_VERSION);
  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.mode, "report_only");
  assert.deepEqual(transcript.fixtureIds.sort(), listReportOnlyReceiptProofFixtures().sort());
  assert.match(transcript.transcriptHash, /^sha256:[a-f0-9]{64}$/);

  for (const result of transcript.results) {
    assert.equal(result.readbackVerified, true);
    assert.match(result.receiptHash, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.readbackHash, /^sha256:[a-f0-9]{64}$/);
    assert.match(result.effectiveViewRef, /^rbc-view:[a-f0-9]{64}$/);
    assert.ok(result.sourceRefs.length > 0);
    assert.ok(result.traceRefs.length > 0);
    assert.equal(result.nonClaims.governedSeam, false);
    assert.equal(result.nonClaims.seamTransport, false);
    assert.equal(result.nonClaims.downstreamConsumption, false);
  }
});

test("conformance API creates selected report-only receipt proof transcript", () => {
  const selected = createReportOnlyReceiptProofTranscript(["layer-writer-authorized"]);
  const full = createReportOnlyReceiptProofTranscript();

  assert.deepEqual(selected.fixtureIds, ["layer-writer-authorized"]);
  assert.equal(selected.results.length, 1);
  assert.equal(selected.results[0].id, "layer-writer-authorized");
  assert.equal(selected.results[0].decision, "allowed");
  assert.notEqual(selected.transcriptHash, full.transcriptHash);
});
