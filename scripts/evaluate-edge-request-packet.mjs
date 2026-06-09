#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  evaluateEdgeRequestPacket,
  stableStringify
} from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const packetPath = resolve(repoRoot, args.packet ?? "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/request-packet.json");
const packetReadbackPath = resolve(repoRoot, args.packetReadback ?? "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/readback.json");
const receiptPath = resolve(repoRoot, args.receiptOut ?? "proof-artifacts/edge-request-packet-evaluation/receipt.json");
const readbackPath = resolve(repoRoot, args.readbackOut ?? "proof-artifacts/edge-request-packet-evaluation/readback.json");
const transcriptPath = resolve(repoRoot, args.transcriptOut ?? "proof-artifacts/edge-request-packet-evaluation/transcript.json");

const packet = JSON.parse(await readFile(packetPath, "utf8"));
const packetReadback = JSON.parse(await readFile(packetReadbackPath, "utf8"));
const { receipt, readback, transcript } = evaluateEdgeRequestPacket(packet, packetReadback);

await writeJson(receiptPath, receipt);
await writeJson(readbackPath, readback);
await writeJson(transcriptPath, transcript);

console.log(JSON.stringify({
  status: transcript.packetHashVerified
    ? "edge_request_packet_evaluation_receipt_emitted"
    : "edge_request_packet_rejected",
  decision: receipt.decision,
  posture: receipt.posture,
  receiptRef: receipt.receiptRef,
  receiptHash: receipt.receiptHash,
  readbackRef: readback.readbackRef,
  readbackHash: readback.readbackHash,
  transcriptHash: transcript.transcriptHash,
  proofRung: transcript.proofRung,
  sourcePacketRef: transcript.sourcePacketRef,
  sourcePacketHash: transcript.sourcePacketHash,
  sourcePacketReadbackHash: transcript.sourcePacketReadbackHash,
  packetHashVerified: transcript.packetHashVerified,
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
    if (arg === "--packet") {
      parsed.packet = argv[index + 1];
      index += 1;
    } else if (arg === "--packet-readback") {
      parsed.packetReadback = argv[index + 1];
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
