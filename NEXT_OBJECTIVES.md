# Next Objectives

Status: lane guide, not a fixed task list. RBC agents should choose the next
small operational improvement inside RBC's deterministic evaluator role.

## Current Pressure: Local Admission/Durability Plan Evaluation Complete

Spine routed the next file/resource lift boundary to RBC after Layer recorded a
local admission/durability planning packet and Edge made that plan visible to
the operator. RBC has now consumed those supplied artifacts and emitted a
report-only evaluation receipt/readback/transcript.

Current local admission/durability plan evaluation refs:

```text
command: npm run rbc:file-resource-local-admission-durability-plan
sourceLayerPlanRef: layer-file-resource-local-admission-durability-plan:c116612d005c4dea
sourceLayerPlanHash: sha256:29c1b251b3fa0d1f09e1086b9aa7c18d7facdbc37d764428ed110baeb57b0207
sourceLayerPlanReadbackRef: layer-file-resource-local-admission-durability-plan-readback:3013d7b8205f4502
sourceLayerPlanReadbackHash: sha256:9133c0df472fe155ba438c770aedf038cb52e9e1d52542a0a26dcfdbf4152a05
sourceEdgeVisibilityRef: edge-file-resource-local-admission-durability-plan-visibility:1214ebd1b9ebad8e
sourceEdgeVisibilityHash: sha256:a62be269df26360d8ceb04326e52c9bc51124a5e82ddb783c85fb6a8993eb028
receiptRef: rbc-evaluation-receipt:c27247e3543cc268
receiptHash: sha256:c27247e3543cc268b22875340937377b60073054de612413f8eeb98189d9a9ed
readbackRef: rbc-evaluation-readback:f18e054e3c50d10c
readbackHash: sha256:f18e054e3c50d10cf589d5f6b7d7ad9bb913eb2822eef0f8e0339f8b6eeece23
transcriptHash: sha256:adedce8f1fb6c719adead7b37d60bc1d40b7b12e8d5bd105694a1c6fc159426e
evaluationStatus: allowed_for_layer_local_admission_durability_candidate_boundary
decision: allowed
proofRung: local_supplied_material
requiredNextBoundary: layer_consumes_rbc_local_admission_durability_plan_evaluation_before_any_layer_admission_or_durability_candidate
```

This means only that the supplied Layer plan/readback and Edge visibility are
acceptable report-only evidence for Layer to consider a future local
admission/durability candidate boundary.

It is not admission, append approval, durable append approval, Layer mutation,
resource canon, production durability, storage, transport, governed seam,
authority, Causal truth, Edge action authority, or public-swarm proof.

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
npm run rbc:edge-request-packet
npm run rbc:file-resource-lift-operator-decision
npm run rbc:file-resource-admission-candidate
npm run rbc:file-resource-source-continuity-acceptance-admissibility
npm run rbc:file-resource-local-admission-durability-plan
node bin/rbc-proof.js receipt:transcript
npm run release:check
```

The current proof is real evaluator-core proof over supplied material. It is
not seam proof, governed seam proof, public swarm proof, or production
durability proof.

## Active Evaluator Shape

The local admission/durability plan evaluator consumes:

- `layer_file_resource_local_admission_durability_plan.v0`
- `layer_file_resource_local_admission_durability_plan_readback.v0`
- `edge_file_resource_local_admission_durability_plan_visibility.v0`

It verifies that:

- the Layer plan is recorded as planning only and not admitted;
- Layer readback verifies the plan hash;
- Edge projects read-only operator visibility with no action controls;
- accepted source continuity is preserved only for the local layer/context;
- material visibility is preserved but not treated as durability;
- remaining blockers for admission, durable append, production durability, and
  multi-observer convergence remain unresolved;
- storage refs, external refs, local paths, and views are not treated as canon
  or source continuity;
- RBC and Edge do not claim authority.

## Next Useful Work

The next pressure should move back to Spine for repo-family reassessment, then
to Layer to consume this RBC report-only evaluation before any local
admission/durability candidate is proposed.

RBC should not continue solo work unless a new downstream packet or boundary
question arrives.

- preserve deterministic refs if the same packet is evaluated again;
- keep proof fixtures operational rather than doc-only;
- add only downstream-driven profiles after a real boundary asks for them;
- keep caller-supplied policy history explicit;
- keep adapters as data suppliers outside the resolver core;
- do not claim governed seam from local receipt generation alone;
- do not claim the local admission/durability plan evaluation grants Layer
  admission, append approval, durable append approval, authority, production
  durability, canonical truth, or seam transport.
