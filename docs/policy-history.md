# Policy History

`policyHistory` is caller-supplied plain data. RBC does not read causal logs,
load policy records, settle branch truth, or become causal-substrate.

```js
{
  posture: "policy_history_partial",
  visibleRefs: ["policy:create:edge-publication"],
  partialRefs: ["policy:overlay:local-device"],
  desyncedRefs: [],
  unverifiedRefs: [],
  conflictRefs: [],
  supersessionRefs: [],
  revocationRefs: [],
  sourceBranchRefs: ["branch:main"]
}
```

Supported postures:

- `policy_history_synced`
- `policy_history_partial`
- `policy_history_desynced`
- `policy_history_unverified`
- `policy_history_conflict_observed`

If no posture is supplied, RBC infers one from supplied refs:

- conflict refs produce `policy_history_conflict_observed`
- desync refs produce `policy_history_desynced`
- partial refs produce `policy_history_partial`
- unverified refs produce `policy_history_unverified`
- otherwise the posture is `policy_history_synced`

Revocation, supersession, and conflict-observed refs are surfaced as unresolved
policy material so they cannot silently allow a posture.
