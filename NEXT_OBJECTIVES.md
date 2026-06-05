# Next Objectives

Status: lane guide, not a fixed task list. RBC agents should choose the next
small operational improvement inside RBC's deterministic evaluator role.

## Current Lane

RBC is an operational deterministic rulebook/capability evaluator core. It
accepts caller-supplied basis, facts, rulebooks, overlays, grants, denials,
receipts, and policy-history material, then returns a stable effective view
with trace and non-claims.

RBC does not own storage, transport, identity, authority, execution, Layer
admission, Edge mediation, Causal truth, Mesh dispatch, Platform consequence,
canonical history, production durability, or swarm proof.

Current strongest proof rung: `local_supplied_material`.

Current proof commands:

```text
npm test
npm run proof:list
npm run proof:run
npm run release:check
```

The current proof is real evaluator-core proof over supplied material. It is
not seam proof, governed seam proof, public swarm proof, or production
durability proof.

## Seam Pressure Tripwire

RBC should move toward seam-facing work only when the repo family can cite a
concrete boundary need for an external report-only evaluation receipt.

Tripwire triggers when at least one of these becomes true:

- Layer needs a report-only writer/capability/admission evaluation receipt
  before accepting or exposing a stronger seam posture.
- Edge, Layer, Causal Substrate, Platform, Conduit, or another peer repo need
  the same `allowed | denied | deferred` receipt shape at a boundary.
- A repo is about to claim `governed_seam`.
- Operator mediation repeatedly asks the same capability/rulebook question and
  deterministic rulebook evaluation is the narrow bottleneck.

Do not trigger RBC seam pressure for doctrine, schema alignment, semantic
rulebook text, operator approval alone, Edge projection, Layer receipt text,
Causal observation, Platform status, Conduit carrier work, or a desire to make
public swarm proof easier.

## First Seam-Facing Objective When Triggered

The first RBC pressure has landed and remains narrow:

```text
supplied rulebook/capability/scope/evidence refs
-> RBC deterministic effective view
-> report-only RBC evaluation receipt
-> readback/hash check
```

The receipt should preserve:

- `allowed | denied | deferred`
- `rulebookRef`
- `capabilityRef`
- `scope`
- `expiry/null`
- `reason`
- `effectiveViewRef`
- `sourceRefs`
- `traceRefs`
- `nonClaims`

This first receipt lane can remain local supplied material. It must not claim
governed seam, swarm transport, Layer admission, authority, production
durability, or canonical truth. Only a later path where the receipt governs an
actual seam crossing may support a `governed_seam` proof rung.

Current implementation:

- `resolveReportOnlyEvaluationReceipt(input)`
- `createReportOnlyEvaluationReadback(receipt)`
- `verifyReportOnlyEvaluationReadback(receipt, readback)`
- proof remains `local_supplied_material`
- covered by `npm test` and `npm run release:check`

## Next Useful Work

Until a concrete repo boundary consumes a report-only receipt, keep hardening
the evaluator core:

- preserve deterministic refs;
- keep proof fixtures operational rather than doc-only;
- improve Layer-oriented writer/capability/admission profiles;
- keep caller-supplied policy history explicit;
- keep adapters as data suppliers outside the resolver core.
- do not claim governed seam from local receipt generation alone.
