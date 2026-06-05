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
  const repeatedView = resolveEffectiveView(fixture.input);
  const failures = [];

  if (view.posture !== fixture.expected.posture) {
    failures.push(`expected posture ${fixture.expected.posture}, got ${view.posture}`);
  }

  if (view.effectiveViewRef !== repeatedView.effectiveViewRef) {
    failures.push(`effectiveViewRef was not deterministic across repeated resolution`);
  }

  for (const sourceRef of fixture.expected.traceSourceRefs) {
    if (!view.trace.some((entry) => entry.sourceRef === sourceRef)) {
      failures.push(`missing trace source ${sourceRef}`);
    }
  }

  expectArray("allowedBy", view, fixture, failures);
  expectArray("deniedBy", view, fixture, failures);
  expectArray("requiredReceipts", view, fixture, failures);
  expectArray("missingReceipts", view, fixture, failures);
  expectArray("satisfiedReceipts", view, fixture, failures);
  expectUnresolvedSourceRefs(view, fixture, failures);
  expectPolicyHistoryPosture(view, fixture, failures);

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

function expectArray(field, view, fixture, failures) {
  if (!fixture.expected[field]) {
    return;
  }

  const actual = view[field] ?? [];
  if (!sameArray(actual, fixture.expected[field])) {
    failures.push(`${field} expected ${JSON.stringify(fixture.expected[field])}, got ${JSON.stringify(actual)}`);
  }
}

function expectUnresolvedSourceRefs(view, fixture, failures) {
  if (!fixture.expected.unresolvedSourceRefs) {
    return;
  }

  const actual = view.unresolved.map((entry) => entry.sourceRef);
  if (!sameArray(actual, fixture.expected.unresolvedSourceRefs)) {
    failures.push(`unresolvedSourceRefs expected ${JSON.stringify(fixture.expected.unresolvedSourceRefs)}, got ${JSON.stringify(actual)}`);
  }
}

function expectPolicyHistoryPosture(view, fixture, failures) {
  if (!fixture.expected.policyHistoryPosture) {
    return;
  }

  if (view.policyHistoryPosture !== fixture.expected.policyHistoryPosture) {
    failures.push(`policyHistoryPosture expected ${fixture.expected.policyHistoryPosture}, got ${view.policyHistoryPosture}`);
  }
}

function sameArray(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}
