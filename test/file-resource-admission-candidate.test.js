import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluateFileResourceAdmissionCandidate,
  getFileResourceAdmissionCandidateIssues,
  stableHash,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const generatedCandidate = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/candidate.json", import.meta.url),
  "utf8"
));
const generatedCandidateReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/readback.json", import.meta.url),
  "utf8"
));

test("evaluates Layer file/resource admission candidate as report-only allowed", () => {
  const { receipt, readback, transcript } = evaluateFileResourceAdmissionCandidate(
    generatedCandidate,
    generatedCandidateReadback
  );

  assert.equal(transcript.proofRung, "local_supplied_material");
  assert.equal(transcript.candidateHashVerified, true);
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(receipt.rulebookRef, "rulebook.file-resource-admission-candidate.report-only.v0");
  assert.equal(receipt.capabilityRef, "capability.layer.file-resource.admission-decision-material-review.v0");
  assert.ok(receipt.evidenceRefs.includes(generatedCandidate.candidateRef));
  assert.ok(receipt.evidenceRefs.includes(generatedCandidate.candidateHash));
  assert.ok(receipt.evidenceRefs.includes(generatedCandidateReadback.readbackHash));
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.admissionDecisionApplied, false);
  assert.equal(transcript.nonClaims.admissionAppendApproved, false);
  assert.equal(transcript.nonClaims.acceptedContinuity, false);
  assert.equal(transcript.nonClaims.rbcDecisionAsAdmission, false);
  assert.equal(transcript.nonClaims.canonicalTruth, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("rejects admission candidate overclaims in packet issue list", () => {
  const candidate = structuredClone(generatedCandidate);
  candidate.proofBoundary.layerAdmission = true;
  candidate.proofBoundary.acceptedContinuity = true;
  candidate.proofBoundary.durableAppend = true;
  candidate.proofBoundary.rbcDecisionAsAdmission = true;
  candidate.proofBoundary.authority = true;
  candidate.nonClaims.layerAdmission = true;
  candidate.nonClaims.rbcDecisionAsAdmission = true;

  const issues = getFileResourceAdmissionCandidateIssues(candidate, generatedCandidateReadback);
  assert.ok(issues.includes("candidate_claims_layerAdmission"));
  assert.ok(issues.includes("candidate_claims_acceptedContinuity"));
  assert.ok(issues.includes("candidate_claims_durableAppend"));
  assert.ok(issues.includes("candidate_claims_rbcDecisionAsAdmission"));
  assert.ok(issues.includes("candidate_claims_authority"));
  assert.ok(issues.includes("non_claim_layerAdmission_missing_or_true"));
  assert.ok(issues.includes("non_claim_rbcDecisionAsAdmission_missing_or_true"));
});

test("rejects damaged Layer admission candidate readback", () => {
  const readback = structuredClone(generatedCandidateReadback);
  readback.recomputedCandidateHash = "sha256:damaged";

  assert.ok(
    getFileResourceAdmissionCandidateIssues(generatedCandidate, readback)
      .includes("readback_recomputed_hash_mismatch")
  );
});

test("rejects damaged Layer admission candidate hash", () => {
  const candidate = structuredClone(generatedCandidate);
  const body = {
    ...candidate,
    requiredNextBoundary: "storage_ref_is_admission"
  };
  delete body.candidateHash;
  candidate.requiredNextBoundary = body.requiredNextBoundary;
  candidate.candidateHash = `sha256:${stableHash(body)}`;

  assert.ok(
    getFileResourceAdmissionCandidateIssues(candidate, generatedCandidateReadback)
      .includes("candidate_next_boundary_invalid")
  );
});

test("CLI emits receipt, readback, and transcript for generated Layer admission candidate", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-file-resource-admission-candidate.mjs",
    "--candidate",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/candidate.json",
    "--candidate-readback",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/readback.json",
    "--receipt-out",
    ".tmp/test-file-resource-admission-candidate/receipt.json",
    "--readback-out",
    ".tmp/test-file-resource-admission-candidate/readback.json",
    "--transcript-out",
    ".tmp/test-file-resource-admission-candidate/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "file_resource_admission_candidate_evaluation_receipt_emitted");
  assert.equal(output.decision, "allowed");
  assert.equal(output.proofRung, "local_supplied_material");
  assert.equal(output.candidateHashVerified, true);
  assert.equal(output.nonClaims.layerAdmission, false);
  assert.equal(output.nonClaims.admissionAppendApproved, false);
  assert.equal(output.nonClaims.rbcDecisionAsAdmission, false);
  assert.equal(output.nonClaims.authority, false);
});
