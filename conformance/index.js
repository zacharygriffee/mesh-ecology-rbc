import { resolveEffectiveView } from "../src/index.js";
import { operationalProofFixtures } from "./fixtures/index.js";

export { operationalProofFixtures };

export function listOperationalProofFixtures() {
  return Object.values(operationalProofFixtures).map((fixture) => fixture.id);
}

export function runOperationalProof(fixtureOrId) {
  const fixture = typeof fixtureOrId === "string"
    ? fixtureById(fixtureOrId)
    : fixtureOrId;

  if (!fixture || typeof fixture !== "object") {
    throw new Error("Operational proof fixture must be a fixture object or known fixture id.");
  }

  const view = resolveEffectiveView(fixture.input);
  const repeatedView = resolveEffectiveView(fixture.input);
  const failures = [];

  if (view.posture !== fixture.expected.posture) {
    failures.push(`expected posture ${fixture.expected.posture}, got ${view.posture}`);
  }

  if (view.effectiveViewRef !== repeatedView.effectiveViewRef) {
    failures.push("effectiveViewRef was not deterministic across repeated resolution");
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
    throw new Error(`${fixture.id} failed: ${failures.join("; ")}`);
  }

  return {
    id: fixture.id,
    posture: view.posture,
    effectiveViewRef: view.effectiveViewRef
  };
}

export function runOperationalProofSuite(ids = []) {
  return selectedFixtures(ids).map(runOperationalProof);
}

function selectedFixtures(ids) {
  const requestedIds = Array.isArray(ids) ? ids : [];

  if (requestedIds.length === 0) {
    return Object.values(operationalProofFixtures);
  }

  return requestedIds.map(fixtureById);
}

function fixtureById(id) {
  const fixture = Object.values(operationalProofFixtures)
    .find((candidate) => candidate.id === id);

  if (!fixture) {
    throw new Error(`Unknown operational proof fixture: ${id}`);
  }

  return fixture;
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
