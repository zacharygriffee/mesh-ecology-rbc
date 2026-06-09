#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const checks = [
  {
    label: "unit and operational tests",
    command: process.execPath,
    args: ["--test"]
  },
  {
    label: "example resolver execution",
    command: process.execPath,
    args: ["examples/basic-resolution.js"]
  },
  {
    label: "proof fixture listing",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "list"]
  },
  {
    label: "full operational proof suite",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "run"]
  },
  {
    label: "selected operational proof fixtures",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "run", "edge-writer-admission-allowed", "causal-policy-history-conflict"]
  },
  {
    label: "report-only receipt proof fixture listing",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "receipt:list"]
  },
  {
    label: "full report-only receipt proof suite",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "receipt:run"]
  },
  {
    label: "selected report-only receipt proof fixtures",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "receipt:run", "layer-writer-authorized", "layer-writer-hard-denied"]
  },
  {
    label: "full report-only receipt proof transcript",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "receipt:transcript"]
  },
  {
    label: "selected report-only receipt proof transcript",
    command: process.execPath,
    args: ["bin/rbc-proof.js", "receipt:transcript", "layer-writer-authorized"]
  },
  {
    label: "Layer boundary pressure packet report-only evaluation",
    command: process.execPath,
    args: [
      "scripts/evaluate-layer-boundary-pressure-packet.mjs",
      "--packet",
      "../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-pressure-packet.json",
      "--receipt-out",
      ".tmp/release-check-layer-boundary-pressure/receipt.json",
      "--readback-out",
      ".tmp/release-check-layer-boundary-pressure/readback.json",
      "--transcript-out",
      ".tmp/release-check-layer-boundary-pressure/transcript.json"
    ]
  },
  {
    label: "Layer boundary review packet report-only evaluation",
    command: process.execPath,
    args: [
      "scripts/evaluate-layer-boundary-review-packet.mjs",
      "--packet",
      "../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-review/packet.json",
      "--receipt-out",
      ".tmp/release-check-layer-boundary-review/receipt.json",
      "--readback-out",
      ".tmp/release-check-layer-boundary-review/readback.json",
      "--transcript-out",
      ".tmp/release-check-layer-boundary-review/transcript.json"
    ]
  },
  {
    label: "Edge request packet report-only evaluation",
    command: process.execPath,
    args: [
      "scripts/evaluate-edge-request-packet.mjs",
      "--packet",
      "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/request-packet.json",
      "--packet-readback",
      "../mesh-ecology-edge/proof-artifacts/edge-minimal-operator-request-packet-20260609T003000Z/readback.json",
      "--receipt-out",
      ".tmp/release-check-edge-request-packet/receipt.json",
      "--readback-out",
      ".tmp/release-check-edge-request-packet/readback.json",
      "--transcript-out",
      ".tmp/release-check-edge-request-packet/transcript.json"
    ]
  },
  {
    label: "package bin proof execution",
    command: npmCommand,
    args: ["exec", "--", "rbc-proof", "run", "edge-writer-admission-allowed"]
  },
  {
    label: "package bin report-only receipt proof execution",
    command: npmCommand,
    args: ["exec", "--", "rbc-proof", "receipt:run", "layer-writer-authorized"]
  },
  {
    label: "package bin report-only receipt transcript execution",
    command: npmCommand,
    args: ["exec", "--", "rbc-proof", "receipt:transcript", "layer-writer-authorized"]
  },
  {
    label: "package dry run",
    command: npmCommand,
    args: ["pack", "--dry-run"]
  },
  {
    label: "git whitespace check",
    command: "git",
    args: ["diff", "--check"]
  }
];

try {
  assertNoRuntimeDependencies();
  assertNoTypeScriptFiles(".");
  runChecks();
  console.log("RBC release readiness proof passed.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function runChecks() {
  for (const check of checks) {
    console.log(`\n> ${check.label}`);
    const result = spawnSync(check.command, check.args, {
      cwd: ".",
      encoding: "utf8",
      stdio: "inherit"
    });

    if (result.status !== 0) {
      throw new Error(`${check.label} failed with exit code ${result.status}`);
    }
  }
}

function assertNoRuntimeDependencies() {
  const manifest = JSON.parse(readFileSync("package.json", "utf8"));
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    if (manifest[field] && Object.keys(manifest[field]).length > 0) {
      throw new Error(`Runtime dependency field ${field} must remain empty.`);
    }
  }
}

function assertNoTypeScriptFiles(root) {
  const found = [];
  walk(root, found);

  if (found.length > 0) {
    throw new Error(`TypeScript files are not allowed: ${found.join(", ")}`);
  }
}

function walk(dir, found) {
  for (const entry of readdirSync(dir)) {
    if ([".git", "node_modules"].includes(entry)) {
      continue;
    }

    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      walk(path, found);
      continue;
    }

    if (path.endsWith(".ts") || path.endsWith(".tsx")) {
      found.push(path);
    }
  }
}
