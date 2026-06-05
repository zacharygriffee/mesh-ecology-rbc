import {
  resolveEffectiveView,
  resolveReportOnlyEvaluationReceipt,
  stableHash,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";
import { operationalProofFixtures } from "./fixtures/index.js";
import { reportOnlyReceiptProofFixtures } from "./receipt-fixtures/index.js";

export const REPORT_ONLY_RECEIPT_PROOF_TRANSCRIPT_VERSION = "rbc_report_only_receipt_proof_transcript.v1";

export {
  operationalProofFixtures,
  reportOnlyReceiptProofFixtures
};

export function listOperationalProofFixtures() {
  return Object.values(operationalProofFixtures).map((fixture) => fixture.id);
}

export function runOperationalProof(fixtureOrId) {
  const fixture = typeof fixtureOrId === "string"
    ? fixtureById(fixtureOrId)
    : fixtureOrId;

  if (!fixture || typeof fixture !== "object") {
    throw new Error("Operational proof fixture must be a fixture object or known fixture id.");
  }

  const view = resolveEffectiveView(fixture.input);
  const repeatedView = resolveEffectiveView(fixture.input);
  const failures = [];

  if (view.posture !== fixture.expected.posture) {
    failures.push(`expected posture ${fixture.expected.posture}, got ${view.posture}`);
  }

  if (view.effectiveViewRef !== repeatedView.effectiveViewRef) {
    failures.push("effectiveViewRef was not deterministic across repeated resolution");
  }

  for (const sourceRef of fixture.expected.traceSourceRefs) {
    if (!view.trace.some((entry) => entry.sourceRef === sourceRef)) {
      failures.push(`missing trace source ${sourceRef}`);
    }
  }

  expectArray("allowedBy", view, fixture, failures);
  expectArray("deniedBy", view, fixture, failures);
  expectArray("requiredReceipts", view, fixture, failures);
  expectArray("missingReceipts", view, fixture, failures);
  expectArray("satisfiedReceipts", view, fixture, failures);
  expectUnresolvedSourceRefs(view, fixture, failures);
  expectPolicyHistoryPosture(view, fixture, failures);

  for (const [claim, expected] of Object.entries(fixture.expected.nonClaims)) {
    if (view.nonClaims[claim] !== expected) {
      failures.push(`nonClaims.${claim} expected ${expected}, got ${view.nonClaims[claim]}`);
    }
  }

  if (!/^rbc-view:[a-f0-9]{64}$/.test(view.effectiveViewRef)) {
    failures.push(`invalid effectiveViewRef ${view.effectiveViewRef}`);
  }

  if (failures.length > 0) {
    throw new Error(`${fixture.id} failed: ${failures.join("; ")}`);
  }

  return {
    id: fixture.id,
    posture: view.posture,
    effectiveViewRef: view.effectiveViewRef
  };
}

export function runOperationalProofSuite(ids = []) {
  return selectedFixtures(ids).map(runOperationalProof);
}

export function listReportOnlyReceiptProofFixtures() {
  return Object.values(reportOnlyReceiptProofFixtures).map((fixture) => fixture.id);
}

export function runReportOnlyReceiptProof(fixtureOrId) {
  const fixture = typeof fixtureOrId === "string"
    ? receiptFixtureById(fixtureOrId)
    : fixtureOrId;

  if (!fixture || typeof fixture !== "object") {
    throw new Error("Report-only receipt proof fixture must be a fixture object or known fixture id.");
  }

  const proof = resolveReportOnlyEvaluationReceipt(fixture.input);
  const repeatedProof = resolveReportOnlyEvaluationReceipt(fixture.input);
  const { receipt, readback } = proof;
  const failures = [];

  if (receipt.decision !== fixture.expected.decision) {
    failures.push(`expected decision ${fixture.expected.decision}, got ${receipt.decision}`);
  }

  if (receipt.posture !== fixture.expected.posture) {
    failures.push(`expected posture ${fixture.expected.posture}, got ${receipt.posture}`);
  }

  if (receipt.rulebookRef !== fixture.expected.rulebookRef) {
    failures.push(`expected rulebookRef ${fixture.expected.rulebookRef}, got ${receipt.rulebookRef}`);
  }

  if (receipt.capabilityRef !== fixture.expected.capabilityRef) {
    failures.push(`expected capabilityRef ${fixture.expected.capabilityRef}, got ${receipt.capabilityRef}`);
  }

  if (receipt.receiptHash !== repeatedProof.receipt.receiptHash) {
    failures.push("receiptHash was not deterministic across repeated resolution");
  }

  if (readback.readbackHash !== repeatedProof.readback.readbackHash) {
    failures.push("readbackHash was not deterministic across repeated resolution");
  }

  for (const sourceRef of fixture.expected.sourceRefs) {
    if (!receipt.sourceRefs.includes(sourceRef)) {
      failures.push(`missing receipt source ref ${sourceRef}`);
    }
  }

  for (const traceRef of fixture.expected.traceRefs) {
    if (!receipt.traceRefs.includes(traceRef)) {
      failures.push(`missing receipt trace ref ${traceRef}`);
    }
  }

  for (const [claim, expected] of Object.entries(fixture.expected.nonClaims)) {
    if (receipt.nonClaims[claim] !== expected) {
      failures.push(`nonClaims.${claim} expected ${expected}, got ${receipt.nonClaims[claim]}`);
    }
  }

  if (!sameObject(receipt.scope, fixture.input.scope)) {
    failures.push(`scope expected ${JSON.stringify(fixture.input.scope)}, got ${JSON.stringify(receipt.scope)}`);
  }

  if (!sameArray(receipt.evidenceRefs, fixture.input.evidenceRefs)) {
    failures.push(`evidenceRefs expected ${JSON.stringify(fixture.input.evidenceRefs)}, got ${JSON.stringify(receipt.evidenceRefs)}`);
  }

  if (!/^rbc-evaluation-receipt:[a-f0-9]{16}$/.test(receipt.receiptRef)) {
    failures.push(`invalid receiptRef ${receipt.receiptRef}`);
  }

  if (!/^sha256:[a-f0-9]{64}$/.test(receipt.receiptHash)) {
    failures.push(`invalid receiptHash ${receipt.receiptHash}`);
  }

  if (!/^rbc-evaluation-readback:[a-f0-9]{16}$/.test(readback.readbackRef)) {
    failures.push(`invalid readbackRef ${readback.readbackRef}`);
  }

  if (!/^sha256:[a-f0-9]{64}$/.test(readback.readbackHash)) {
    failures.push(`invalid readbackHash ${readback.readbackHash}`);
  }

  if (!/^rbc-view:[a-f0-9]{64}$/.test(receipt.effectiveViewRef)) {
    failures.push(`invalid effectiveViewRef ${receipt.effectiveViewRef}`);
  }

  if (readback.hashMatches !== true) {
    failures.push("readback hashMatches must be true");
  }

  if (!verifyReportOnlyEvaluationReadback(receipt, readback)) {
    failures.push("readback verification failed");
  }

  if (receipt.proofRung !== "local_supplied_material") {
    failures.push(`proofRung expected local_supplied_material, got ${receipt.proofRung}`);
  }

  if (failures.length > 0) {
    throw new Error(`${fixture.id} failed: ${failures.join("; ")}`);
  }

  return {
    id: fixture.id,
    decision: receipt.decision,
    posture: receipt.posture,
    receiptRef: receipt.receiptRef,
    receiptHash: receipt.receiptHash,
    readbackRef: readback.readbackRef,
    readbackHash: readback.readbackHash,
    effectiveViewRef: receipt.effectiveViewRef
  };
}

export function runReportOnlyReceiptProofSuite(ids = []) {
  return selectedReceiptFixtures(ids).map(runReportOnlyReceiptProof);
}

export function createReportOnlyReceiptProofTranscript(ids = []) {
  const fixtures = selectedReceiptFixtures(ids);
  const results = fixtures.map((fixture) => {
    runReportOnlyReceiptProof(fixture);

    const { receipt, readback } = resolveReportOnlyEvaluationReceipt(fixture.input);

    return {
      id: fixture.id,
      decision: receipt.decision,
      posture: receipt.posture,
      receiptRef: receipt.receiptRef,
      receiptHash: receipt.receiptHash,
      readbackRef: readback.readbackRef,
      readbackHash: readback.readbackHash,
      effectiveViewRef: receipt.effectiveViewRef,
      sourceRefs: receipt.sourceRefs,
      traceRefs: receipt.traceRefs,
      nonClaims: receipt.nonClaims,
      readbackVerified: verifyReportOnlyEvaluationReadback(receipt, readback)
    };
  });
  const transcriptBody = {
    transcriptVersion: REPORT_ONLY_RECEIPT_PROOF_TRANSCRIPT_VERSION,
    proofRung: "local_supplied_material",
    mode: "report_only",
    fixtureIds: fixtures.map((fixture) => fixture.id),
    results
  };

  return {
    transcriptHash: `sha256:${stableHash(transcriptBody)}`,
    ...transcriptBody
  };
}

function selectedFixtures(ids) {
  const requestedIds = Array.isArray(ids) ? ids : [];

  if (requestedIds.length === 0) {
    return Object.values(operationalProofFixtures);
  }

  return requestedIds.map(fixtureById);
}

function selectedReceiptFixtures(ids) {
  const requestedIds = Array.isArray(ids) ? ids : [];

  if (requestedIds.length === 0) {
    return Object.values(reportOnlyReceiptProofFixtures);
  }

  return requestedIds.map(receiptFixtureById);
}

function fixtureById(id) {
  const fixture = Object.values(operationalProofFixtures)
    .find((candidate) => candidate.id === id);

  if (!fixture) {
    throw new Error(`Unknown operational proof fixture: ${id}`);
  }

  return fixture;
}

function receiptFixtureById(id) {
  const fixture = Object.values(reportOnlyReceiptProofFixtures)
    .find((candidate) => candidate.id === id);

  if (!fixture) {
    throw new Error(`Unknown report-only receipt proof fixture: ${id}`);
  }

  return fixture;
}

function expectArray(field, view, fixture, failures) {
  if (!fixture.expected[field]) {
    return;
  }

  const actual = view[field] ?? [];
  if (!sameArray(actual, fixture.expected[field])) {
    failures.push(`${field} expected ${JSON.stringify(fixture.expected[field])}, got ${JSON.stringify(actual)}`);
  }
}

function expectUnresolvedSourceRefs(view, fixture, failures) {
  if (!fixture.expected.unresolvedSourceRefs) {
    return;
  }

  const actual = view.unresolved.map((entry) => entry.sourceRef);
  if (!sameArray(actual, fixture.expected.unresolvedSourceRefs)) {
    failures.push(`unresolvedSourceRefs expected ${JSON.stringify(fixture.expected.unresolvedSourceRefs)}, got ${JSON.stringify(actual)}`);
  }
}

function expectPolicyHistoryPosture(view, fixture, failures) {
  if (!fixture.expected.policyHistoryPosture) {
    return;
  }

  if (view.policyHistoryPosture !== fixture.expected.policyHistoryPosture) {
    failures.push(`policyHistoryPosture expected ${fixture.expected.policyHistoryPosture}, got ${view.policyHistoryPosture}`);
  }
}

function sameArray(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

function sameObject(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}
