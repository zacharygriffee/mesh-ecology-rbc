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
npm run rbc:layer-boundary-pressure
npm run rbc:layer-boundary-review
node bin/rbc-proof.js receipt:transcript
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
- `runReportOnlyReceiptProofSuite(ids)`
- `createReportOnlyReceiptProofTranscript(ids)`
- `evaluateLayerBoundaryPressurePacket(packet)`
- proof remains `local_supplied_material`
- covered by `npm test` and `npm run release:check`
- Layer-oriented receipt proof fixtures cover authorized, missing-review,
  hard-denied, and expired-grant paths.
- deterministic transcript output preserves receipt/readback hashes, source
  refs, trace refs, and non-claims for audit without claiming downstream
  consumption.
- `npm run rbc:layer-boundary-pressure` consumes Layer's concrete
  `layer-rbc-boundary-pressure` packet as supplied material and emits
  `proof-artifacts/layer-rbc-boundary-pressure-evaluation/receipt.json`,
  `readback.json`, and `transcript.json`.
- The concrete Layer packet evaluation currently emits a report-only
  `deferred` receipt because Layer supplied a review/approval boundary, not an
  authority grant.
- Layer has now produced concrete boundary-review material:
  `../mesh-ecology-layer/proof-artifacts/layer-rbc-boundary-review/packet.json`
  with packet hash
  `2df268eeb6500e8463a6f158e6f66cdfbb032a5487b86a61829c187303863707`.
  That packet satisfies `layer_rbc_boundary_review` as supplied material and
  cites Layer's append-capability operator decision as review material. It is
  not an RBC receipt, not governed seam, not Layer admission, not append
  capability application, not durable decision append, not authority, not
  production durability, and not swarm proof.
- `npm run rbc:layer-boundary-review` consumes that packet as supplied
  material and emits
  `proof-artifacts/layer-rbc-boundary-review-evaluation/receipt.json`,
  `readback.json`, and `transcript.json`.
- Current follow-up receipt:
  `rbc-evaluation-receipt:3464ecdcd9776950`
  `sha256:3464ecdcd9776950310b25cad61c20159754ea490822c85cfdd2c9418e172b44`.
  Readback:
  `rbc-evaluation-readback:f4894423add8e852`
  `sha256:f4894423add8e85214411efd90b80d7f03e777c338d810de52e7b5ea3cead473`.
  Transcript:
  `sha256:90461f3cbae32d800d709dfc7dfbb9363c69010fdee3d20a8e850af94c914316`.
- The decision is `allowed` for the supplied boundary-review material only.
  The receipt preserves remaining Layer blockers for accepted events, accepted
  continuity, production storage, production append, and durable decision
  append. It is not governed seam, Layer admission, append capability grant,
  durable decision append, authority, production durability, or swarm proof.

## Next Useful Work

RBC has consumed the Layer boundary-review packet. The next pressure should
move downstream to Layer: Layer should consume the new RBC receipt/readback as
read-only supplied material and decide the next Layer-local packet or
still-deferred posture. RBC should not continue solo work unless a new
downstream packet or boundary question arrives.

- preserve deterministic refs if the same packet is evaluated again;
- keep proof fixtures operational rather than doc-only;
- add only downstream-driven profiles after a real boundary asks for them;
- keep caller-supplied policy history explicit;
- keep adapters as data suppliers outside the resolver core;
- do not claim governed seam from local receipt generation alone;
- do not claim the Layer boundary-review packet evaluation grants Layer
  admission, append capability, durable decision append, authority, production
  durability, or seam transport.
