# Downstream Adoption Notes

Downstream repos consume RBC by preparing plain JavaScript data and calling
`resolveEffectiveView` or `resolvePolicyPackView`. RBC does not own downstream
authority, adapters, storage, transport, identity, or execution.

## Edge

Edge can prepare basis, facts, receipts, grants, denials, overlays, and policy
packs for local-layer publication, review, writer-admission, and mediation
posture. Edge remains the operator/control-surface owner.

## causal-substrate

causal-substrate can supply policy-history refs and branch-relative posture as
plain `policyHistory` data. RBC surfaces that posture but does not read logs,
settle truth, or interpret canonical history.

## Testbed

Testbed can run RBC operational proof fixtures to verify deterministic,
bounded, traceable behavior before accepting a repo-family proof claim.

## Platform

Platform can prepare activation or lifecycle rule material as plain rulebooks,
grants, denials, and receipts. RBC does not activate, schedule, deploy, or
grant runtime authority.

## Virtualia And Proto RBC

Virtualia/proto shapes should be prepared as declarative rule material before
calling RBC. Executable proto-RBC evaluators are not imported into RBC.

Operational proof is required for adoption. This document is guidance, not
success evidence.
