# Next Objectives

Status: lane guide, not a fixed task list. RBC agents should choose the next
small operational improvement inside RBC's deterministic evaluator role.

## Current Pressure: Local Admission/Durability Candidate Shape Plan Evaluation Complete

Spine routed the next file/resource lift boundary to RBC after Layer recorded a
local admission/durability candidate shape plan and Edge made that plan visible
to the operator. RBC has now consumed those supplied artifacts and emitted a
report-only evaluation receipt/readback/transcript.

Current local admission/durability candidate shape plan evaluation refs:

```text
command: npm run rbc:file-resource-local-admission-durability-candidate-shape-plan
sourceLayerShapePlanRef: layer-file-resource-local-admission-durability-candidate-shape-plan:857d1c1a0f7e94a2
sourceLayerShapePlanHash: sha256:85cd33864ea5b3fd7c9e0fda2ad4f19fdfac345c696544e06e001b43f5defa19
sourceLayerShapePlanReadbackRef: layer-file-resource-local-admission-durability-candidate-shape-plan-readback:2091f899dd37ddce
sourceLayerShapePlanReadbackHash: sha256:20beec7029fa125b366be82d0c9df459889ae36fc4832feaca268c874d6a6278
sourceEdgeVisibilityRef: edge-file-resource-local-admission-durability-candidate-shape-plan-visibility:a53dfdb35ce098f9
sourceEdgeVisibilityHash: sha256:cf3c0b26a51f7c0d0814ea43900ac046c10d8604aa9bfe5e4df6032db03453c9
receiptRef: rbc-evaluation-receipt:c34d43281d68333b
receiptHash: sha256:c34d43281d68333bb26e651de26671f6037e593a0998ec64f5bac76685937c75
readbackRef: rbc-evaluation-readback:290ff046480a5a55
readbackHash: sha256:290ff046480a5a55b1db30baa8b3c1151bb282ba2d9f30e1b83e61e23eadbd90
transcriptHash: sha256:7a802d8438361fff6ca5606dca04a7d7418fcc59f8bbc759448ca3b6520ffcf4
evaluationStatus: allowed_for_layer_local_admission_durability_candidate_creation_boundary
decision: allowed
proofRung: local_supplied_material
requiredNextBoundary: layer_consumes_rbc_local_admission_durability_candidate_shape_plan_evaluation_before_any_candidate_creation_or_admission
```

This means only that the supplied Layer shape plan/readback and Edge visibility
are acceptable report-only evidence for Layer to consider a future local
admission/durability candidate creation boundary.

It is not candidate creation, admission, append approval, durable append
approval, Layer mutation, resource canon, production durability, storage,
transport, governed seam, authority, Causal truth, Edge action authority, or
public-swarm proof.

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
npm run rbc:file-resource-local-admission-durability-candidate-shape-plan
node bin/rbc-proof.js receipt:transcript
npm run release:check
```

The current proof is real evaluator-core proof over supplied material. It is
not seam proof, governed seam proof, public swarm proof, or production
durability proof.

## Active Evaluator Shape

The local admission/durability candidate shape plan evaluator consumes:

- `layer_file_resource_local_admission_durability_candidate_shape_plan.v0`
- `layer_file_resource_local_admission_durability_candidate_shape_plan_readback.v0`
- `edge_file_resource_local_admission_durability_candidate_shape_plan_visibility.v0`

It verifies that:

- the Layer shape plan is recorded as shape-only and not a candidate;
- Layer readback verifies the shape plan hash;
- Edge projects read-only operator visibility with no action controls;
- future candidate fields and remaining blockers are named but unsatisfied;
- accepted source continuity and material visibility are referenced without
  becoming admission, durability, or canon;
- remaining blockers for candidate creation, admission, append approval,
  durable append, production durability, canon, and multi-observer convergence
  remain unresolved;
- storage refs, external refs, local paths, and views are not treated as canon
  or source continuity;
- RBC and Edge do not claim authority.

## Next Useful Work

The next pressure should move back to Spine for repo-family reassessment, then
to Layer to consume this RBC report-only evaluation before any local
admission/durability candidate is created or admission path begins.

RBC should not continue solo work unless a new downstream packet or boundary
question arrives.

- preserve deterministic refs if the same packet is evaluated again;
- keep proof fixtures operational rather than doc-only;
- add only downstream-driven profiles after a real boundary asks for them;
- keep caller-supplied policy history explicit;
- keep adapters as data suppliers outside the resolver core;
- do not claim governed seam from local receipt generation alone;
- do not claim the candidate shape plan evaluation creates a candidate, grants
  Layer admission, approves append, approves durability, grants authority,
  creates production durability, canonical truth, or seam transport.
