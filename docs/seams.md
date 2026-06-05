# Seams

Most seams are conceptual in v0. The pure core exposes only the resolver seam
and trace output needed for tests and examples.

## Basis Seam

The basis describes the bounded situation RBC is resolving for.

## Rule Material Seam

Rulebooks, overlays, grants, and denials enter RBC as already supplied
declarative material. RBC does not fetch or own them.

Policy packs are also supplied material. The v1 helper only maps pack fields
into resolver input; it does not load packs from storage or a network.

## Resolver Seam

`resolveEffectiveView(input)` computes the effective view without hidden
clocks, file reads, network calls, random IDs, or global state.

## Trace Seam

Every result includes trace entries naming the material that affected or
explained the resolution.

## Receipt Seam

Receipt requirements are represented as required receipt refs or names. RBC
does not issue receipts in v0.

## Compatibility Seam

Compatibility posture is present as a field, but branch compatibility logic is
not implemented in v0.

## Admission Seam

Admission posture is present as `admissibility`, but full admission logic is
not implemented in v0.

## Adapter Seam

Adapters are external data suppliers. They may prepare basis, facts, receipts,
and rule material as plain JavaScript objects before calling RBC, but the core
resolver must not contain adapter reads, writes, clocks, networking, identity,
or authority behavior.
