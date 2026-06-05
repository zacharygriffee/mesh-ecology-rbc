import { NON_CLAIMS } from "./constants.js";
import { cloneStable, stableHash } from "./hash.js";
import { resolveEffectiveView } from "./resolve.js";

export const REPORT_ONLY_EVALUATION_RECEIPT_VERSION = "rbc_report_only_evaluation_receipt.v1";
export const REPORT_ONLY_EVALUATION_READBACK_VERSION = "rbc_report_only_evaluation_readback.v1";
export const REPORT_ONLY_PROOF_RUNG = "local_supplied_material";

export function resolveReportOnlyEvaluationReceipt(input = {}) {
  const resolverInput = cloneStable(input.resolverInput ?? {});
  const effectiveView = resolveEffectiveView(resolverInput);
  const receiptBody = {
    receiptVersion: REPORT_ONLY_EVALUATION_RECEIPT_VERSION,
    mode: "report_only",
    proofRung: REPORT_ONLY_PROOF_RUNG,
    decision: decisionFromPosture(effectiveView.posture),
    posture: effectiveView.posture,
    rulebookRef: input.rulebookRef ?? null,
    capabilityRef: input.capabilityRef ?? null,
    scope: cloneStable(input.scope ?? {}),
    evidenceRefs: cloneStable(arrayOf(input.evidenceRefs)),
    expiry: input.expiry ?? null,
    reason: input.reason ?? `Report-only evaluation produced ${effectiveView.posture}.`,
    effectiveViewRef: effectiveView.effectiveViewRef,
    viewVersion: effectiveView.viewVersion,
    sourceRefs: cloneStable(effectiveView.sourceRefs),
    traceRefs: unique(effectiveView.trace.map((entry) => entry.sourceRef)),
    nonClaims: reportOnlyNonClaims(effectiveView.nonClaims)
  };
  const receiptHash = `sha256:${stableHash(receiptBody)}`;
  const receipt = {
    receiptRef: `rbc-evaluation-receipt:${receiptHash.slice("sha256:".length, "sha256:".length + 16)}`,
    receiptHash,
    ...receiptBody
  };

  return {
    receipt,
    readback: createReportOnlyEvaluationReadback(receipt)
  };
}

export function createReportOnlyEvaluationReadback(receipt) {
  const receiptHash = hashReportOnlyEvaluationReceipt(receipt);
  const readbackBody = {
    readbackVersion: REPORT_ONLY_EVALUATION_READBACK_VERSION,
    receiptRef: receipt.receiptRef,
    receiptHash,
    effectiveViewRef: receipt.effectiveViewRef,
    decision: receipt.decision,
    proofRung: receipt.proofRung,
    mode: receipt.mode,
    hashMatches: receipt.receiptHash === receiptHash,
    nonClaims: cloneStable(receipt.nonClaims)
  };
  const readbackHash = `sha256:${stableHash(readbackBody)}`;

  return {
    readbackRef: `rbc-evaluation-readback:${readbackHash.slice("sha256:".length, "sha256:".length + 16)}`,
    readbackHash,
    ...readbackBody
  };
}

export function verifyReportOnlyEvaluationReadback(receipt, readback) {
  const expectedReadback = createReportOnlyEvaluationReadback(receipt);

  return (
    readback.readbackRef === expectedReadback.readbackRef &&
    readback.readbackHash === expectedReadback.readbackHash &&
    readback.receiptRef === expectedReadback.receiptRef &&
    readback.receiptHash === expectedReadback.receiptHash &&
    readback.effectiveViewRef === expectedReadback.effectiveViewRef &&
    readback.decision === expectedReadback.decision &&
    readback.proofRung === expectedReadback.proofRung &&
    readback.mode === expectedReadback.mode &&
    readback.hashMatches === true
  );
}

export function hashReportOnlyEvaluationReceipt(receipt) {
  const {
    receiptRef,
    receiptHash,
    ...body
  } = receipt;

  return `sha256:${stableHash(body)}`;
}

function decisionFromPosture(posture) {
  if (posture === "allowed") {
    return "allowed";
  }

  if (posture === "denied") {
    return "denied";
  }

  return "deferred";
}

function reportOnlyNonClaims(viewNonClaims = NON_CLAIMS) {
  return cloneStable({
    ...viewNonClaims,
    governedSeam: false,
    seamTransport: false,
    downstreamConsumption: false,
    authority: false,
    execution: false,
    storage: false,
    productionDurability: false,
    canonicalTruth: false
  });
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}
