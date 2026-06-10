#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateFileResourceAdmissionCandidate,
  stableStringify
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const candidatePath = resolve(repoRoot, args.candidate ?? "../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/candidate.json");
const candidateReadbackPath = resolve(repoRoot, args.candidateReadback ?? "../mesh-ecology-layer/proof-artifacts/layer-file-resource-admission-candidate-20260609T145000Z/readback.json");
const receiptPath = resolve(repoRoot, args.receiptOut ?? "proof-artifacts/file-resource-admission-candidate-evaluation-20260609T151000Z/receipt.json");
const readbackPath = resolve(repoRoot, args.readbackOut ?? "proof-artifacts/file-resource-admission-candidate-evaluation-20260609T151000Z/readback.json");
const transcriptPath = resolve(repoRoot, args.transcriptOut ?? "proof-artifacts/file-resource-admission-candidate-evaluation-20260609T151000Z/transcript.json");

const candidate = JSON.parse(await readFile(candidatePath, "utf8"));
const candidateReadback = JSON.parse(await readFile(candidateReadbackPath, "utf8"));
const { receipt, readback, transcript } = evaluateFileResourceAdmissionCandidate(candidate, candidateReadback);

await writeJson(receiptPath, receipt);
await writeJson(readbackPath, readback);
await writeJson(transcriptPath, transcript);

console.log(JSON.stringify({
  status: transcript.candidateHashVerified
    ? "file_resource_admission_candidate_evaluation_receipt_emitted"
    : "file_resource_admission_candidate_rejected",
  decision: receipt.decision,
  posture: receipt.posture,
  receiptRef: receipt.receiptRef,
  receiptHash: receipt.receiptHash,
  readbackRef: readback.readbackRef,
  readbackHash: readback.readbackHash,
  transcriptHash: transcript.transcriptHash,
  proofRung: transcript.proofRung,
  sourceCandidateRef: transcript.sourceCandidateRef,
  sourceCandidateHash: transcript.sourceCandidateHash,
  sourceCandidateReadbackHash: transcript.sourceCandidateReadbackHash,
  candidateHashVerified: transcript.candidateHashVerified,
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
    if (arg === "--candidate") {
      parsed.candidate = argv[index + 1];
      index += 1;
    } else if (arg === "--candidate-readback") {
      parsed.candidateReadback = argv[index + 1];
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
