# mesh-ecology-rbc

`mesh-ecology-rbc` is the early Rulebook Cascade core for Mesh Ecology.

RBC is an importable deterministic module that computes an effective rule view
for a bounded basis. It receives a basis plus rule material, resolves the
relevant constraints, and returns a traceable posture.

## What RBC Is

- A pure JavaScript resolver for effective rule views.
- A bounded cascade over rulebooks, overlays, grants, and denials.
- A way to make ambiguity explicit instead of silently allowing unknown work.
- A small importable library intended to grow adapters later.

## What RBC Is Not

- Not a daemon, server, database, scheduler, UI, identity system, governance
  system, network service, or source of global state.
- Not Hypercore, Autobase, Corestore, DHT, browser peers, transport, or
  persistence.
- Not an owner of authority. RBC computes effective authority posture from
  supplied material.
- Not an executor. RBC determines whether an action is allowed, denied,
  review-gated, provisional, unknown, or unresolved.

## Guarantees

- Deterministic: the same input produces the same output.
- Bounded: every resolution is scoped to a basis.
- Traceable: every result includes a trace explaining how the posture was
  derived.

## Local Usage

```bash
npm test
npm run example
npm run proof:list
npm run proof:run
node bin/rbc-proof.js receipt:list
node bin/rbc-proof.js receipt:run
npm run release:check
```

```js
import { resolveEffectiveView } from "mesh-ecology-rbc";

const view = resolveEffectiveView({
  basis: {
    observerRef: "observer:zack",
    surfaceRef: "surface:public-web",
    actionRef: "action:publish",
    artifactRef: "artifact:note-001",
    contextRef: "context:edge",
    timeRef: "2026-06-05T00:00:00.000Z"
  },
  facts: {
    surfaceClass: "public"
  },
  rulebooks: [{
    id: "rulebook.edge-basic",
    rules: [{
      id: "rule.public-publish-requires-review",
      effect: "requires_review",
      when: {
        actionRef: "action:publish",
        surfaceClass: "public"
      },
      requires: {
        receipts: ["operator_review"]
      },
      reason: "Publishing to a public surface requires operator review."
    }]
  }],
  overlays: [],
  grants: [],
  denials: [],
  time: "2026-06-05T00:00:00.000Z"
});
```

The resolver does not read files, call the network, use hidden clocks, mutate
global state, or generate random IDs. If time matters, pass it as `time` or
`basis.timeRef`.

RBC can also emit a report-only evaluation receipt over supplied material:

```js
import { resolveReportOnlyEvaluationReceipt } from "mesh-ecology-rbc";

const proof = resolveReportOnlyEvaluationReceipt({
  rulebookRef: "rulebook.edge-writer-admission",
  capabilityRef: "capability:edge-writer-admission",
  scope: {
    actionRef: "action:writer-admission"
  },
  resolverInput
});
```

That receipt remains below governed seam until a concrete downstream boundary
consumes it.

## Operational Conformance

Downstream repos can import executable proof support without importing from
`test/`:

```js
import {
  runOperationalProofSuite,
  runReportOnlyReceiptProofSuite
} from "mesh-ecology-rbc/conformance";

const results = runOperationalProofSuite(["edge-writer-admission-allowed"]);
const receiptResults = runReportOnlyReceiptProofSuite(["layer-writer-authorized"]);
```

The package also exposes `rbc-proof` for listing or running the same proof
fixtures.

## Status

Early experimental repo. The current implementation is a minimal deterministic
resolver with simple equality matching and deny-wins precedence. Future storage,
transport, causal-history, receipt, and policy-pack adapters belong outside the
pure core.

See [docs/objectives.md](docs/objectives.md) for the staged objective list to
take RBC from the current scaffold to an operational core.

Operational release proof is tracked in
[docs/release-checklist.md](docs/release-checklist.md). Mock/proto preparation
guidance is in [docs/mock-proto-compatibility.md](docs/mock-proto-compatibility.md).
Downstream adoption notes are in [docs/downstream-adoption.md](docs/downstream-adoption.md),
caller-supplied policy history is described in [docs/policy-history.md](docs/policy-history.md),
and report-only receipts are described in
[docs/report-only-evaluation-receipt.md](docs/report-only-evaluation-receipt.md).
