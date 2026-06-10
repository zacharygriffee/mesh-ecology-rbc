#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateFileResourceLiftOperatorDecision,
  stableStringify
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const decisionPath = resolve(repoRoot, args.decision ?? "../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/decision.json");
const decisionReadbackPath = resolve(repoRoot, args.decisionReadback ?? "../mesh-ecology-edge/proof-artifacts/file-resource-lift-operator-decision-20260609T140000Z/readback.json");
const receiptPath = resolve(repoRoot, args.receiptOut ?? "proof-artifacts/file-resource-lift-operator-decision-evaluation-20260609T141000Z/receipt.json");
const readbackPath = resolve(repoRoot, args.readbackOut ?? "proof-artifacts/file-resource-lift-operator-decision-evaluation-20260609T141000Z/readback.json");
const transcriptPath = resolve(repoRoot, args.transcriptOut ?? "proof-artifacts/file-resource-lift-operator-decision-evaluation-20260609T141000Z/transcript.json");

const decision = JSON.parse(await readFile(decisionPath, "utf8"));
const decisionReadback = JSON.parse(await readFile(decisionReadbackPath, "utf8"));
const { receipt, readback, transcript } = evaluateFileResourceLiftOperatorDecision(decision, decisionReadback);

await writeJson(receiptPath, receipt);
await writeJson(readbackPath, readback);
await writeJson(transcriptPath, transcript);

console.log(JSON.stringify({
  status: transcript.decisionHashVerified
    ? "file_resource_lift_operator_decision_evaluation_receipt_emitted"
    : "file_resource_lift_operator_decision_rejected",
  decision: receipt.decision,
  posture: receipt.posture,
  receiptRef: receipt.receiptRef,
  receiptHash: receipt.receiptHash,
  readbackRef: readback.readbackRef,
  readbackHash: readback.readbackHash,
  transcriptHash: transcript.transcriptHash,
  proofRung: transcript.proofRung,
  sourceDecisionRef: transcript.sourceDecisionRef,
  sourceDecisionHash: transcript.sourceDecisionHash,
  sourceDecisionReadbackHash: transcript.sourceDecisionReadbackHash,
  decisionHashVerified: transcript.decisionHashVerified,
  packetIssues: transcript.packetIssues,
  preservedRefs: transcript.preservedRefs,
  nonClaims: transcript.nonClaims
}, null, 2));

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${stableStringify(value)}\n`);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--decision") {
      parsed.decision = argv[index + 1];
      index += 1;
    } else if (arg === "--decision-readback") {
      parsed.decisionReadback = argv[index + 1];
      index += 1;
    } else if (arg === "--receipt-out") {
      parsed.receiptOut = argv[index + 1];
      index += 1;
    } else if (arg === "--readback-out") {
      parsed.readbackOut = argv[index + 1];
      index += 1;
    } else if (arg === "--transcript-out") {
      parsed.transcriptOut = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}
