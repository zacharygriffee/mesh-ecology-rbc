#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateFileResourceSourceContinuityAcceptanceAdmissibility,
  stableStringify
} from "../src/index.js";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const args = parseArgs(process.argv.slice(2));
const edgeIntent = await readJson(resolve(repoRoot, args.edgeIntent));
const edgeIntentReadback = await readJson(resolve(repoRoot, args.edgeIntentReadback));
const layerRemainingBlockersPacket = await readJson(resolve(repoRoot, args.layerRemainingBlockersPacket));
const causalPrerequisiteObservation = await readJson(resolve(repoRoot, args.causalPrerequisiteObservation));
const bytesVisibilityEvidence = await readJson(resolve(repoRoot, args.bytesVisibilityEvidence));
const { receipt, readback, transcript } = evaluateFileResourceSourceContinuityAcceptanceAdmissibility({
  edgeIntent,
  edgeIntentReadback,
  layerRemainingBlockersPacket,
  causalPrerequisiteObservation,
  bytesVisibilityEvidence,
  observerMode: args.observerMode ?? "single_operator_local_layer"
});

const receiptPath = resolve(
  repoRoot,
  args.receiptOut ??
    "proof-artifacts/file-resource-source-continuity-acceptance-admissibility-20260610T081000Z/receipt.json"
);
const readbackPath = resolve(
  repoRoot,
  args.readbackOut ??
    "proof-artifacts/file-resource-source-continuity-acceptance-admissibility-20260610T081000Z/readback.json"
);
const transcriptPath = resolve(
  repoRoot,
  args.transcriptOut ??
    "proof-artifacts/file-resource-source-continuity-acceptance-admissibility-20260610T081000Z/transcript.json"
);
await writeJson(receiptPath, receipt);
await writeJson(readbackPath, readback);
await writeJson(transcriptPath, transcript);

process.stdout.write(`${JSON.stringify({
  status: "file_resource_source_continuity_acceptance_admissibility_evaluation_emitted",
  admissibilityStatus: transcript.admissibilityStatus,
  decision: receipt.decision,
  posture: receipt.posture,
  receiptRef: receipt.receiptRef,
  receiptHash: receipt.receiptHash,
  readbackRef: readback.readbackRef,
  readbackHash: readback.readbackHash,
  transcriptHash: transcript.transcriptHash,
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
    if (arg === "--edge-intent") {
      parsed.edgeIntent = next;
      index += 1;
    } else if (arg === "--edge-intent-readback") {
      parsed.edgeIntentReadback = next;
      index += 1;
    } else if (arg === "--layer-remaining-blockers-packet") {
      parsed.layerRemainingBlockersPacket = next;
      index += 1;
    } else if (arg === "--causal-prerequisite-observation") {
      parsed.causalPrerequisiteObservation = next;
      index += 1;
    } else if (arg === "--bytes-visibility-evidence") {
      parsed.bytesVisibilityEvidence = next;
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
    "edgeIntent",
    "edgeIntentReadback",
    "layerRemainingBlockersPacket",
    "causalPrerequisiteObservation",
    "bytesVisibilityEvidence"
  ]) {
    if (!parsed[field]) throw new Error(`--${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)} is required`);
  }
  return parsed;
}
