# RBC Operational Objective List

Status: planning baseline for taking `mesh-ecology-rbc` from v0 scaffold to a
fully operational deterministic core.

This list keeps the core boundary intact: RBC remains a pure JavaScript library
that computes effective rule views. Adapters may later supply rule material,
facts, receipts, or causal history, but adapters must not move storage,
transport, authority, identity, or execution into the resolver core.

## Operational Definition

RBC is fully operational when it can:

- Resolve a bounded basis against versioned rule material.
- Produce deterministic effective views with stable refs.
- Explain every posture through mandatory trace.
- Preserve unknown, ambiguity, conflict, expiration, and mediation as explicit
  outcomes.
- Support repo-family policy domains without becoming their authority.
- Accept adapter-supplied material without owning adapter concerns.
- Pass operational proof that another repo can rely on.

## Success Standard

Operational proof is the only success standard. A phase is not complete because
the wording is doctrinally aligned, a semantic check passes, a schema looks
consistent, or a document says the boundary is correct.

Doctrine, semantic checks, schema validation, lint-like guards, and concise
docs are supporting gates. They are useful only when backed by executable proof
against resolver behavior: concrete inputs, expected effective views,
deterministic refs, required traces, and negative cases proving RBC does not
silently allow, execute, approve, persist, or claim authority.

## Phase 0: Core Doctrine Lock

- Confirm the public contract: `resolveEffectiveView(input)`.
- Keep ESM-only JavaScript with no server, daemon, database, networking, or
  persistence.
- Define supported posture vocabulary and effect vocabulary.
- Define non-claims in docs and tests: no execution, no approval, no authority,
  no canonical truth, no hidden clock.
- Add a compatibility policy for breaking changes before any repo-family
  consumers import RBC directly.

Exit criteria:

- README and docs agree on what RBC is and is not.
- Public exports are intentional and covered by tests.
- A consumer can import RBC without side effects.

## Phase 1: Input Contract Hardening

- Define a formal input schema in plain JavaScript documentation.
- Add runtime validation for basis, rulebooks, overlays, grants, denials, facts,
  and time.
- Reject or mark unresolved malformed material instead of throwing unexpectedly
  during normal resolution.
- Normalize singular/plural and legacy vocabulary only at the boundary.
- Preserve original refs while exposing normalized internal context.
- Add tests for invalid dates, missing IDs, malformed scopes, unsupported
  effects, duplicate refs, and empty input.

Exit criteria:

- Bad input produces deterministic errors or unresolved posture.
- Validation behavior is documented and covered.
- No hidden defaults silently loosen policy.

## Phase 2: Rule Matching V1

- Keep simple equality matching as the default.
- Add explicit support for array membership where already present.
- Decide whether missing fields fail closed as non-match or unresolved, then
  test that rule.
- Add optional matcher diagnostics for why a rule did not match.
- Add metadata-derived facts for artifact, surface, role, device, observer,
  branch, envelope, and context.
- Prevent executable predicates from entering the core rule shape.

Exit criteria:

- Matching remains deterministic and declarative.
- Rule authors can understand why material did or did not apply.
- Tests cover basis-only, facts-only, metadata-derived, and mixed matching.

## Phase 3: Cascade Semantics V1

- Model parent rulebooks, local overlays, and action-scoped material with clear
  inheritance order.
- Add explicit source order fields to trace.
- Decide overlay modes: add, tighten, loosen, replace, suppress, or annotate.
- Require loosening overlays to carry explicit authority evidence refs supplied
  by the caller.
- Support non-overridable constraints.
- Add conflict detection when multiple matching rules produce incompatible
  effects at the same precedence level.

Exit criteria:

- Cascade order is documented and reflected in trace.
- Non-overridable parent constraints cannot be loosened by local overlays.
- Conflicts become `requires_mediation` or another explicit posture, never a
  silent allow.

## Phase 4: Precedence And Posture Completion

- Complete effect-to-posture mapping for allow, deny, requires review,
  provisional, unknown, not applicable, and requires mediation.
- Distinguish hard deny, soft deny, review gate, provisional allow, scoped
  allow, and unresolved material.
- Define how required receipts affect `requires_review` vs `provisional`.
- Add branch compatibility and admissibility placeholders that can be computed
  from supplied facts later.
- Document exact deny-wins and unknown-wins behavior.

Exit criteria:

- Every supported effect maps to a documented posture.
- Same-precedence ambiguity is explicit.
- Tests prove no unknown operation becomes allowed.

## Phase 5: Trace And Explainability

- Stabilize trace entry shape.
- Include source ref, source type, effect, reason, match context, cascade order,
  precedence, expiry status, and winning/losing posture role.
- Add trace summaries for applied, relevant, expired, invalid, shadowed, and
  conflicting material.
- Hash only stable deterministic fields.
- Add snapshot-like tests for trace shape without making traces brittle.

Exit criteria:

- Every effective view has at least one trace entry.
- A consumer can reconstruct why the posture was derived.
- Trace output is stable across repeated runs.

## Phase 6: Effective View Contract V1

- Finalize field names and casing.
- Decide whether to expose both `effectiveViewRef` and
  `effectiveRulebookViewRef`.
- Add `sourceRefs`, `appliedRuleRefs`, `grantRefs`, `denialRefs`,
  `overlayRefs`, `conflicts`, `unresolved`, and `nonClaims` if needed.
- Define compatibility and admissibility object shapes.
- Add deterministic serialization docs for view refs.

Exit criteria:

- Effective view shape is versioned.
- Repo-family consumers can depend on fields without guessing.
- Stable hash tests cover field ordering and equivalent object ordering.

## Phase 7: Receipt And Mediation Semantics

- Treat receipts as supplied evidence, not objects RBC issues.
- Define receipt requirement matching.
- Distinguish missing receipt, invalid receipt, expired receipt, superseded
  receipt, and sufficient receipt.
- Model mediation as an explicit output object.
- Keep operator approval outside RBC while allowing caller-supplied approval
  refs to affect posture.

Exit criteria:

- RBC can say what receipt evidence is required.
- RBC can say supplied receipt evidence is sufficient or insufficient.
- RBC still does not approve, issue, or persist receipts.

## Phase 8: Versioned Policy Packs

- Define a policy-pack shape that bundles rulebooks, overlays, vocabulary, and
  fixtures.
- Keep packs as declarative data.
- Add pack validation and conformance fixtures.
- Support domain-separated packs such as edge publication, local-layer writer
  admission, artifact visibility, branch compatibility, and mediation routing.
- Add tests proving packs can be composed without global state.

Exit criteria:

- A repo can import a policy pack and call RBC without custom glue.
- Pack composition is deterministic.
- Pack conflicts are explicit.

## Phase 9: Adapter Boundaries

- Define adapter interfaces for rule material, facts, receipt evidence, and
  causal history.
- Keep adapters outside `resolveEffectiveView`.
- Add optional helper functions for preparing input from adapter output.
- Document adapters as data suppliers only.
- Prepare separate future packages or directories for storage/network adapters
  without adding them to the core dependency graph.

Exit criteria:

- Core tests run without adapters.
- Adapter output can be consumed as plain data.
- No adapter can create hidden clocks, hidden reads, hidden writes, or hidden
  authority inside the resolver.

## Phase 10: Causal History Integration Readiness

- Define how policy-history refs enter the input.
- Add fields for visible policy history, partial history, desync, supersession,
  revocation, and branch-relative context.
- Compute policy-history posture only from supplied material.
- Add fixtures for synced, partial, desynced, unverified, and conflict-observed
  policy history.
- Keep causal-substrate interpretation outside RBC.

Exit criteria:

- RBC can surface policy-history uncertainty.
- RBC does not read causal logs or become causal truth.
- Branch-relative ambiguity is explicit in the effective view.

## Phase 11: Conformance Suite

- Create fixture families for every public posture.
- Add cross-product tests for precedence, expiration, overlays,
  non-overridable constraints, receipts, malformed material, and stable hashes.
- Add import smoke tests for package consumers.
- Add mutation-safety tests proving inputs are not mutated.
- Add determinism tests with reordered object keys.
- Add operational proof bundles that run resolver behavior end to end from
  rule material to effective view.

Exit criteria:

- `npm test` includes operational proof of deterministic, bounded, traceable
  behavior.
- Any downstream repo can run conformance fixtures against an imported RBC
  version.
- Regression failures point to specific doctrine or contract violations.
- Doctrine-only, semantic-only, schema-only, or documentation-only checks are
  never counted as success by themselves.

## Phase 12: Release Readiness

- Choose versioning policy.
- Add changelog.
- Add package publication checklist.
- Add API stability notes.
- Add migration notes from proto-RBC and mock RBC shapes in sibling repos.
- Tag a first operational release once at least one downstream repo imports RBC
  as its resolver for a bounded review-only workflow.

Exit criteria:

- Operational v1 is tagged.
- At least one downstream consumer uses RBC as pure data-in/data-out library.
- No operational release includes networking, persistence, execution, or
  authority ownership in core.

## Completed Operational Proof Gates

- Runtime validation produces deterministic unresolved or mediation posture.
- Input mutation safety is tested.
- Invalid time and malformed material are tested.
- Source order and precedence details are present in trace.
- Non-overridable parent constraints are tested.
- `effective_view.v1` is emitted as `viewVersion`.
- All public postures have executable fixtures.
- Receipt states are tested.
- Pure policy-pack resolution is tested.
- Adapter-shaped data prepared outside RBC resolves identically to plain data.
- Temporary consumer import through package exports is tested.
- Named operational proof fixture index is tested.
- Prepared mock/proto RBC compatibility fixture is tested.
- Scalar compatibility/admissibility preservation and hash impact are tested.
- Source boundary hardening is tested.
- Fixture runner commands list and execute named operational proof bundles.
- Caller-supplied policy-history posture is surfaced without reading causal
  logs.
- Edge writer-admission proof profile covers allowed, requires-review, and
  hard-denied paths.
- causal-substrate policy-history pressure proof profile covers synced,
  partial, desynced, unverified, conflict, revoked, and superseded paths.
- Proof runner validates deterministic repeated refs, receipt expectations,
  unresolved source refs, and policy-history posture for named fixtures.
- Operational conformance proof is exported from `mesh-ecology-rbc/conformance`
  for downstream-style imports without importing from `test/`.
- `npm run release:check` executes the repo-level release readiness proof gate.
- Report-only evaluation receipts over supplied material are implemented with
  readback/hash proof and explicit non-claims.
- Layer-oriented report-only receipt proof fixtures cover authorized,
  missing-review, hard-denied, and expired-grant paths.

## Immediate Next Work

1. Add an operator-requested v1 tag only after explicit instruction.
2. Wait for a concrete downstream boundary to consume a report-only evaluation
   receipt before claiming governed seam.
3. Revisit structured `compatibility` and `admissibility` for v1.1 only after
   downstream proof shows scalar fields are insufficient.
4. Add downstream-owned conformance proof once Edge or causal-substrate imports
   and runs RBC directly.
