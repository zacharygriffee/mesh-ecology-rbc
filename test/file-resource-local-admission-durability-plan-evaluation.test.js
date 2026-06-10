import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  evaluateFileResourceLocalAdmissionDurabilityPlan,
  getFileResourceLocalAdmissionDurabilityPlanIssues,
  verifyReportOnlyEvaluationReadback
} from "../src/index.js";

const generatedLayerPlan = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-plan-20260610T090000Z/plan.json", import.meta.url),
  "utf8"
));
const generatedLayerPlanReadback = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-plan-20260610T090000Z/readback.json", import.meta.url),
  "utf8"
));
const generatedEdgePlanVisibility = JSON.parse(readFileSync(
  new URL("../../mesh-ecology-edge/proof-artifacts/file-resource-local-admission-durability-plan-visibility-20260610T091500Z/visibility.json", import.meta.url),
  "utf8"
));

test("RBC evaluates local admission/durability plan as allowed for future Layer candidate boundary", () => {
  const { receipt, readback, transcript } = evaluateFileResourceLocalAdmissionDurabilityPlan({
    layerPlan: generatedLayerPlan,
    layerPlanReadback: generatedLayerPlanReadback,
    edgePlanVisibility: generatedEdgePlanVisibility
  });

  assert.equal(transcript.transcriptVersion, "rbc_file_resource_local_admission_durability_plan_evaluation.v0");
  assert.equal(transcript.evaluationStatus, "allowed_for_layer_local_admission_durability_candidate_boundary");
  assert.deepEqual(transcript.packetIssues, []);
  assert.equal(receipt.decision, "allowed");
  assert.equal(receipt.posture, "allowed");
  assert.equal(transcript.requiredNextBoundary, "layer_consumes_rbc_local_admission_durability_plan_evaluation_before_any_layer_admission_or_durability_candidate");
  assert.equal(transcript.nonClaims.approvesAdmission, false);
  assert.equal(transcript.nonClaims.approvesAppend, false);
  assert.equal(transcript.nonClaims.layerAdmission, false);
  assert.equal(transcript.nonClaims.durableAdmissionAppend, false);
  assert.equal(transcript.nonClaims.productionDurability, false);
  assert.equal(transcript.nonClaims.canonicalTruth, false);
  assert.equal(transcript.nonClaims.rbcAuthority, false);
  assert.equal(transcript.nonClaims.authority, false);
  assert.equal(verifyReportOnlyEvaluationReadback(receipt, readback), true);
});

test("RBC local admission/durability plan reports needs_more_observers outside single-operator local layer", () => {
  const { transcript } = evaluateFileResourceLocalAdmissionDurabilityPlan({
    layerPlan: generatedLayerPlan,
    layerPlanReadback: generatedLayerPlanReadback,
    edgePlanVisibility: generatedEdgePlanVisibility,
    observerMode: "team_layer"
  });

  assert.equal(transcript.evaluationStatus, "needs_more_observers");
  assert.ok(transcript.packetIssues.includes("observer_mode_requires_more_observers"));
});

test("RBC local admission/durability plan rejects damaged Layer readback", () => {
  const layerPlanReadback = structuredClone(generatedLayerPlanReadback);
  layerPlanReadback.planHashMatches = false;

  const issues = getFileResourceLocalAdmissionDurabilityPlanIssues({
    layerPlan: generatedLayerPlan,
    layerPlanReadback,
    edgePlanVisibility: generatedEdgePlanVisibility
  });

  assert.ok(issues.includes("layer_plan_hash_not_verified"));
});

test("RBC local admission/durability plan rejects Layer overclaims", () => {
  const layerPlan = structuredClone(generatedLayerPlan);
  layerPlan.nonClaims.layerAdmission = true;
  layerPlan.nonClaims.productionDurability = true;
  layerPlan.nonClaims.storageRefAsAdmission = true;
  layerPlan.nonClaims.viewAsSourceContinuity = true;

  const issues = getFileResourceLocalAdmissionDurabilityPlanIssues({
    layerPlan,
    layerPlanReadback: generatedLayerPlanReadback,
    edgePlanVisibility: generatedEdgePlanVisibility
  });

  assert.ok(issues.includes("layer_plan_claims_layerAdmission"));
  assert.ok(issues.includes("layer_plan_claims_productionDurability"));
  assert.ok(issues.includes("layer_plan_claims_storageRefAsAdmission"));
  assert.ok(issues.includes("layer_plan_claims_viewAsSourceContinuity"));
});

test("RBC local admission/durability plan rejects Edge action or authority overclaims", () => {
  const edgePlanVisibility = structuredClone(generatedEdgePlanVisibility);
  edgePlanVisibility.operatorVisibility.noActionControls = false;
  edgePlanVisibility.operatorVisibility.actionControls = ["approve_admission"];
  edgePlanVisibility.edgeBoundary.claimsAuthority = true;
  edgePlanVisibility.nonClaims.execution = true;
  edgePlanVisibility.nonClaims.edgeAuthority = true;

  const issues = getFileResourceLocalAdmissionDurabilityPlanIssues({
    layerPlan: generatedLayerPlan,
    layerPlanReadback: generatedLayerPlanReadback,
    edgePlanVisibility
  });

  assert.ok(issues.includes("edge_visibility_has_action_controls"));
  assert.ok(issues.includes("edge_visibility_action_controls_not_empty"));
  assert.ok(issues.includes("edge_visibility_claims_authority"));
  assert.ok(issues.includes("edge_visibility_claims_execution"));
  assert.ok(issues.includes("edge_visibility_claims_edgeAuthority"));
});

test("RBC CLI emits local admission/durability plan evaluation receipt", () => {
  const result = spawnSync(process.execPath, [
    "scripts/evaluate-file-resource-local-admission-durability-plan.mjs",
    "--layer-plan",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-plan-20260610T090000Z/plan.json",
    "--layer-plan-readback",
    "../mesh-ecology-layer/proof-artifacts/layer-file-resource-local-admission-durability-plan-20260610T090000Z/readback.json",
    "--edge-plan-visibility",
    "../mesh-ecology-edge/proof-artifacts/file-resource-local-admission-durability-plan-visibility-20260610T091500Z/visibility.json",
    "--receipt-out",
    ".tmp/test-file-resource-local-admission-durability-plan-evaluation/receipt.json",
    "--readback-out",
    ".tmp/test-file-resource-local-admission-durability-plan-evaluation/readback.json",
    "--transcript-out",
    ".tmp/test-file-resource-local-admission-durability-plan-evaluation/transcript.json"
  ], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.status, "file_resource_local_admission_durability_plan_evaluation_emitted");
  assert.equal(output.evaluationStatus, "allowed_for_layer_local_admission_durability_candidate_boundary");
  assert.equal(output.requiredNextBoundary, "layer_consumes_rbc_local_admission_durability_plan_evaluation_before_any_layer_admission_or_durability_candidate");
  assert.equal(output.nonClaims.rbcAuthority, false);
  assert.equal(output.nonClaims.productionDurability, false);
});
