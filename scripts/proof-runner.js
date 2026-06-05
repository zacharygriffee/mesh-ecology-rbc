#!/usr/bin/env node

import { resolveEffectiveView } from "../src/index.js";
import { operationalProofFixtures } from "../test/fixtures/operational/index.js";

const command = process.argv[2] ?? "run";
const requestedIds = process.argv.slice(3);

if (command === "list") {
  for (const fixture of Object.values(operationalProofFixtures)) {
    console.log(fixture.id);
  }
  process.exit(0);
}

if (command !== "run") {
  fail(`Unknown proof command: ${command}`);
}

const fixtures = selectedFixtures(requestedIds);
const results = fixtures.map(runFixture);

for (const result of results) {
  console.log(`${result.id} ${result.posture} ${result.effectiveViewRef}`);
}

function selectedFixtures(ids) {
  const fixtures = Object.values(operationalProofFixtures);
  if (ids.length === 0) {
    return fixtures;
  }

  const byId = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  return ids.map((id) => {
    const fixture = byId.get(id);
    if (!fixture) {
      fail(`Unknown operational proof fixture: ${id}`);
    }
    return fixture;
  });
}

function runFixture(fixture) {
  const view = resolveEffectiveView(fixture.input);
  const failures = [];

  if (view.posture !== fixture.expected.posture) {
    failures.push(`expected posture ${fixture.expected.posture}, got ${view.posture}`);
  }

  for (const sourceRef of fixture.expected.traceSourceRefs) {
    if (!view.trace.some((entry) => entry.sourceRef === sourceRef)) {
      failures.push(`missing trace source ${sourceRef}`);
    }
  }

  for (const [claim, expected] of Object.entries(fixture.expected.nonClaims)) {
    if (view.nonClaims[claim] !== expected) {
      failures.push(`nonClaims.${claim} expected ${expected}, got ${view.nonClaims[claim]}`);
    }
  }

  if (!/^rbc-view:[a-f0-9]{64}$/.test(view.effectiveViewRef)) {
    failures.push(`invalid effectiveViewRef ${view.effectiveViewRef}`);
  }

  if (failures.length > 0) {
    fail(`${fixture.id} failed: ${failures.join("; ")}`);
  }

  return {
    id: fixture.id,
    posture: view.posture,
    effectiveViewRef: view.effectiveViewRef
  };
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
