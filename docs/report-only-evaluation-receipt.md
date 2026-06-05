# Report-Only Evaluation Receipt

The report-only evaluation receipt is RBC's first seam-facing lane over supplied
material. It is still `local_supplied_material` proof, not governed seam proof.

Callers supply:

- `rulebookRef`
- `capabilityRef`
- `scope`
- `evidenceRefs`
- `expiry`
- `reason`
- `resolverInput`

RBC resolves `resolverInput` with `resolveEffectiveView`, maps the effective
posture to `allowed`, `denied`, or `deferred`, and emits a stable receipt plus a
readback object.

```js
import { resolveReportOnlyEvaluationReceipt } from "mesh-ecology-rbc";

const { receipt, readback } = resolveReportOnlyEvaluationReceipt({
  rulebookRef: "rulebook.edge-writer-admission",
  capabilityRef: "capability:edge-writer-admission",
  scope: {
    actionRef: "action:writer-admission"
  },
  evidenceRefs: ["receipt.edge-writer-review.writer-001"],
  expiry: null,
  reason: "Report-only evaluation for local writer admission.",
  resolverInput
});
```

The receipt preserves:

- `decision`
- `posture`
- `rulebookRef`
- `capabilityRef`
- `scope`
- `evidenceRefs`
- `expiry`
- `reason`
- `effectiveViewRef`
- `sourceRefs`
- `traceRefs`
- `nonClaims`

Readback includes the receipt hash, selected posture fields, and `hashMatches`.
`verifyReportOnlyEvaluationReadback(receipt, readback)` returns `true` only when
the readback still matches the receipt.

## Non-Claims

This lane does not claim:

- governed seam
- seam transport
- downstream consumption
- authority
- execution
- storage
- production durability
- canonical truth

Only a later downstream repo boundary consuming the receipt can raise the proof
rung toward governed seam.

## Operational Proof

Layer-oriented supplied-material proof fixtures cover:

- `layer-writer-authorized`
- `layer-writer-missing-review`
- `layer-writer-hard-denied`
- `layer-writer-expired-grant`

Run:

```bash
node bin/rbc-proof.js receipt:list
node bin/rbc-proof.js receipt:run
node bin/rbc-proof.js receipt:run layer-writer-authorized
node bin/rbc-proof.js receipt:transcript
```

These fixtures prove receipt/readback hashes, deterministic repeated output,
source refs, trace refs, and non-claims. They are RBC-local evaluator proof,
not Layer repo proof.

`receipt:transcript` emits stable JSON with `transcriptHash`, fixture results,
receipt/readback refs, source refs, trace refs, readback verification, and
non-claims. It is an audit artifact over supplied material, not downstream
consumption proof.
