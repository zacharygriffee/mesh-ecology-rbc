import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluateFileResourceLocalAdmissionDurabilityCandidateShapePlan,
  getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const generatedLayerShapePlan = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-candidate-shape-plan-20260610T104500Z/plan.json", import.meta.url),
  "utf8"
));
const generatedLayerShapePlanReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-candidate-shape-plan-20260610T104500Z/readback.json", import.meta.url),
  "utf8"
));
const generatedEdgeShapePlanVisibility = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-local-admission-durability-candidate-shape-plan-visibility-20260610T143000Z/visibility.json", import.meta.url),
  "utf8"
));

test("RBC evaluates candidate shape plan as allowed for future Layer candidate creation boundary", () => {
  const { receipt, readback, transcript } = evaluateFileResourceLocalAdmissionDurabilityCandidateShapePlan({
    layerShapePlan: generatedLayerShapePlan,
    layerShapePlanReadback: generatedLayerShapePlanReadback,
    edgeShapePlanVisibility: generatedEdgeShapePlanVisibility
  });

  assert.equal(
    transcript.transcriptVersion,
    "rbc_file_resource_local_admission_durability_candidate_shape_plan_evaluation.v0"
  );
  assert.equal(
    transcript.evaluationStatus,
    "allowed_for_layer_local_admission_durability_candidate_creation_boundary"
  );
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(
    transcript.requiredNextBoundary,
    "layer_consumes_rbc_local_admission_durability_candidate_shape_plan_evaluation_before_any_candidate_creation_or_admission"
  );
  assert.equal(transcript.nonClaims.createsCandidate, false);
  assert.equal(transcript.nonClaims.approvesAdmission, false);
  assert.equal(transcript.nonClaims.approvesAppend, false);
  assert.equal(transcript.nonClaims.approvesDurability, false);
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.localAdmissionCandidate, false);
  assert.equal(transcript.nonClaims.durableAdmissionAppend, false);
  assert.equal(transcript.nonClaims.productionDurability, false);
  assert.equal(transcript.nonClaims.canonicalTruth, false);
  assert.equal(transcript.nonClaims.rbcAuthority, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("RBC candidate shape plan reports needs_more_observers outside single-operator local layer", () => {
  const { transcript } = evaluateFileResourceLocalAdmissionDurabilityCandidateShapePlan({
    layerShapePlan: generatedLayerShapePlan,
    layerShapePlanReadback: generatedLayerShapePlanReadback,
    edgeShapePlanVisibility: generatedEdgeShapePlanVisibility,
    observerMode: "team_layer"
  });

  assert.equal(transcript.evaluationStatus, "needs_more_observers");
  assert.ok(transcript.packetIssues.includes("observer_mode_requires_more_observers"));
});

test("RBC candidate shape plan rejects damaged Layer readback", () => {
  const layerShapePlanReadback = structuredClone(generatedLayerShapePlanReadback);
  layerShapePlanReadback.planHashMatches = false;

  const issues = getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues({
    layerShapePlan: generatedLayerShapePlan,
    layerShapePlanReadback,
    edgeShapePlanVisibility: generatedEdgeShapePlanVisibility
  });

  assert.ok(issues.includes("layer_shape_plan_hash_not_verified"));
});

test("RBC candidate shape plan rejects Layer overclaims", () => {
  const layerShapePlan = structuredClone(generatedLayerShapePlan);
  layerShapePlan.candidateShape.candidateCreated = true;
  layerShapePlan.nonClaims.localAdmissionCandidate = true;
  layerShapePlan.nonClaims.layerAdmission = true;
  layerShapePlan.nonClaims.productionDurability = true;
  layerShapePlan.nonClaims.storageRefAsAdmission = true;
  layerShapePlan.nonClaims.viewAsSourceContinuity = true;

  const issues = getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues({
    layerShapePlan,
    layerShapePlanReadback: generatedLayerShapePlanReadback,
    edgeShapePlanVisibility: generatedEdgeShapePlanVisibility
  });

  assert.ok(issues.includes("layer_shape_plan_created_candidate"));
  assert.ok(issues.includes("layer_shape_plan_claims_localAdmissionCandidate"));
  assert.ok(issues.includes("layer_shape_plan_claims_layerAdmission"));
  assert.ok(issues.includes("layer_shape_plan_claims_productionDurability"));
  assert.ok(issues.includes("layer_shape_plan_claims_storageRefAsAdmission"));
  assert.ok(issues.includes("layer_shape_plan_claims_viewAsSourceContinuity"));
});

test("RBC candidate shape plan rejects Edge action or authority overclaims", () => {
  const edgeShapePlanVisibility = structuredClone(generatedEdgeShapePlanVisibility);
  edgeShapePlanVisibility.operatorVisibility.noActionControls = false;
  edgeShapePlanVisibility.operatorVisibility.actionControls = ["create_candidate"];
  edgeShapePlanVisibility.edgeBoundary.createsLocalAdmissionCandidate = true;
  edgeShapePlanVisibility.edgeBoundary.claimsAuthority = true;
  edgeShapePlanVisibility.nonClaims.execution = true;
  edgeShapePlanVisibility.nonClaims.edgeAuthority = true;

  const issues = getFileResourceLocalAdmissionDurabilityCandidateShapePlanIssues({
    layerShapePlan: generatedLayerShapePlan,
    layerShapePlanReadback: generatedLayerShapePlanReadback,
    edgeShapePlanVisibility
  });

  assert.ok(issues.includes("edge_visibility_has_action_controls"));
  assert.ok(issues.includes("edge_visibility_action_controls_not_empty"));
  assert.ok(issues.includes("edge_visibility_creates_candidate"));
  assert.ok(issues.includes("edge_visibility_claims_authority"));
  assert.ok(issues.includes("edge_visibility_claims_execution"));
  assert.ok(issues.includes("edge_visibility_claims_edgeAuthority"));
});

test("RBC CLI emits candidate shape plan evaluation receipt", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-file-resource-local-admission-durability-candidate-shape-plan.mjs",
    "--layer-shape-plan",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-candidate-shape-plan-20260610T104500Z/plan.json",
    "--layer-shape-plan-readback",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-candidate-shape-plan-20260610T104500Z/readback.json",
    "--edge-shape-plan-visibility",
    "../mesh-ecology-edge/proof-artifacts/file-resource-local-admission-durability-candidate-shape-plan-visibility-20260610T143000Z/visibility.json",
    "--receipt-out",
    ".tmp/test-file-resource-local-admission-durability-candidate-shape-plan-evaluation/receipt.json",
    "--readback-out",
    ".tmp/test-file-resource-local-admission-durability-candidate-shape-plan-evaluation/readback.json",
    "--transcript-out",
    ".tmp/test-file-resource-local-admission-durability-candidate-shape-plan-evaluation/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "file_resource_local_admission_durability_candidate_shape_plan_evaluation_emitted");
  assert.equal(
    output.evaluationStatus,
    "allowed_for_layer_local_admission_durability_candidate_creation_boundary"
  );
  assert.equal(
    output.requiredNextBoundary,
    "layer_consumes_rbc_local_admission_durability_candidate_shape_plan_evaluation_before_any_candidate_creation_or_admission"
  );
  assert.equal(output.nonClaims.rbcAuthority, false);
  assert.equal(output.nonClaims.createsCandidate, false);
  assert.equal(output.nonClaims.productionDurability, false);
});
