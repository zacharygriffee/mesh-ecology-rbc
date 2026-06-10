#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateFileResourceLocalAdmissionDurabilityPlan,
  stableStringify
} from "../src/index.js";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const args = parseArgs(process.argv.slice(2));
const layerPlan = await readJson(resolve(repoRoot, args.layerPlan));
const layerPlanReadback = await readJson(resolve(repoRoot, args.layerPlanReadback));
const edgePlanVisibility = await readJson(resolve(repoRoot, args.edgePlanVisibility));
const { receipt, readback, transcript } = evaluateFileResourceLocalAdmissionDurabilityPlan({
  layerPlan,
  layerPlanReadback,
  edgePlanVisibility,
  observerMode: args.observerMode ?? "single_operator_local_layer"
});

const receiptPath = resolve(
  repoRoot,
  args.receiptOut ??
    "proof-artifacts/file-resource-local-admission-durability-plan-evaluation-20260610T093000Z/receipt.json"
);
const readbackPath = resolve(
  repoRoot,
  args.readbackOut ??
    "proof-artifacts/file-resource-local-admission-durability-plan-evaluation-20260610T093000Z/readback.json"
);
const transcriptPath = resolve(
  repoRoot,
  args.transcriptOut ??
    "proof-artifacts/file-resource-local-admission-durability-plan-evaluation-20260610T093000Z/transcript.json"
);
await writeJson(receiptPath, receipt);
await writeJson(readbackPath, readback);
await writeJson(transcriptPath, transcript);

process.stdout.write(`${JSON.stringify({
  status: "file_resource_local_admission_durability_plan_evaluation_emitted",
  evaluationStatus: transcript.evaluationStatus,
  decision: receipt.decision,
  posture: receipt.posture,
  receiptRef: receipt.receiptRef,
  receiptHash: receipt.receiptHash,
  readbackRef: readback.readbackRef,
  readbackHash: readback.readbackHash,
  transcriptHash: transcript.transcriptHash,
  requiredNextBoundary: transcript.requiredNextBoundary,
  packetIssues: transcript.packetIssues,
  nonClaims: transcript.nonClaims
}, null, 2)}\n`);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${stableStringify(value)}\n`, "utf8");
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--layer-plan") {
      parsed.layerPlan = next;
      index += 1;
    } else if (arg === "--layer-plan-readback") {
      parsed.layerPlanReadback = next;
      index += 1;
    } else if (arg === "--edge-plan-visibility") {
      parsed.edgePlanVisibility = next;
      index += 1;
    } else if (arg === "--observer-mode") {
      parsed.observerMode = next;
      index += 1;
    } else if (arg === "--receipt-out") {
      parsed.receiptOut = next;
      index += 1;
    } else if (arg === "--readback-out") {
      parsed.readbackOut = next;
      index += 1;
    } else if (arg === "--transcript-out") {
      parsed.transcriptOut = next;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  for (const field of [
    "layerPlan",
    "layerPlanReadback",
    "edgePlanVisibility"
  ]) {
    if (!parsed[field]) throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
  }
  return parsed;
}
