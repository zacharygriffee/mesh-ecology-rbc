import {
  DEFAULT_ADMISSIBILITY,
  DEFAULT_COMPATIBILITY,
  EFFECTS,
  NON_CLAIMS,
  SOURCE_TYPES,
  STRENGTHS
} from "./constants.js";
import { collectRuleEntries } from "./cascade.js";
import { stableHash, cloneStable } from "./hash.js";
import { buildResolutionContext, matchesScope, matchesWhen } from "./match.js";
import { choosePosture } from "./precedence.js";
import { omitUndefined, traceEntry } from "./trace.js";
import {
  duplicateRefIssues,
  validateDenial,
  validateGrant,
  validateInput,
  validateReceipt,
  validateRuleEntry,
  validationTrace,
  validDateString
} from "./validate.js";

export function resolveEffectiveView(input = {}) {
  const inputIssues = validateInput(input);
  const resolverInput = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const basis = cloneStable(resolverInput.basis ?? {});
  const context = buildResolutionContext(resolverInput);
  const time = resolverInput.time ?? basis.timeRef ?? null;
  const allRuleEntries = collectRuleEntries(arrayOf(resolverInput.rulebooks), arrayOf(resolverInput.overlays));
  const ruleEntryIssues = allRuleEntries.flatMap(validateRuleEntry);
  const grantIssues = arrayOf(resolverInput.grants).flatMap(validateGrant);
  const denialIssues = arrayOf(resolverInput.denials).flatMap(validateDenial);
  const receiptIssues = arrayOf(resolverInput.receipts).flatMap(validateReceipt);
  const duplicateIssues = duplicateRefIssues(sourceRefsForDuplicateCheck(allRuleEntries, resolverInput));
  const validationIssues = [
    ...inputIssues,
    ...ruleEntryIssues,
    ...grantIssues,
    ...denialIssues,
    ...receiptIssues,
    ...duplicateIssues,
    ...timeIssues(time)
  ];
  const invalidSourceRefs = new Set(validationIssues
    .filter((issue) => issue.sourceType !== SOURCE_TYPES.VALIDATION)
    .map((issue) => issue.sourceRef));

  const ruleSources = allRuleEntries
    .filter((entry) => !invalidSourceRefs.has(entry.rule?.id ?? `${entry.rulebookRef}:rule:${entry.ruleIndex}`))
    .filter((entry) => matchesWhen(entry.rule?.when ?? {}, context))
    .map(ruleSource);

  const denialSources = arrayOf(resolverInput.denials)
    .filter((denial) => !invalidSourceRefs.has(denial?.id))
    .filter((denial) => matchesScope(denial.scope ?? {}, context))
    .map((denial, index) => materialSource(denial, SOURCE_TYPES.DENIAL, allRuleEntries.length + index));

  const grantEvaluations = arrayOf(resolverInput.grants)
    .filter((grant) => !invalidSourceRefs.has(grant?.id))
    .filter((grant) => matchesScope(grant.scope ?? {}, context))
    .map((grant, index) => evaluateGrant(grant, time, allRuleEntries.length + arrayOf(resolverInput.denials).length + index));

  const activeGrantSources = grantEvaluations
    .filter((grant) => grant.status === "active")
    .map((grant) => materialSource(grant.material, SOURCE_TYPES.GRANT));

  const receiptEvaluations = arrayOf(resolverInput.receipts)
    .filter((receipt, index) => !invalidSourceRefs.has(receiptRef(receipt, index)))
    .map((receipt, index) => evaluateReceipt(receipt, time, index));

  const reviewRules = ruleSources.filter((source) => source.effect === EFFECTS.REQUIRES_REVIEW);
  const blockingReviewRules = reviewRules.filter((source) => !reviewSatisfied(source, receiptEvaluations));
  const satisfiedReviewRules = reviewRules.filter((source) => reviewSatisfied(source, receiptEvaluations));
  const conflicts = detectConflicts(ruleSources, activeGrantSources);
  const unresolved = [
    ...validationIssues.map(validationSource),
    ...grantEvaluations
      .filter((grant) => grant.status === "unresolved_time")
      .map((grant) => materialSource(grant.material, SOURCE_TYPES.GRANT))
  ];

  const matches = {
    denials: [
      ...ruleSources.filter(isDeny),
      ...denialSources
    ],
    reviewRules: blockingReviewRules,
    provisionalRules: ruleSources.filter((source) => source.effect === EFFECTS.PROVISIONAL),
    allows: [
      ...ruleSources.filter((source) => source.effect === EFFECTS.ALLOW),
      ...activeGrantSources
    ],
    conflicts,
    unresolved
  };

  const decision = choosePosture(matches);
  const winningIds = new Set(decision.winningSources.map((source) => source.id));
  const trace = [
    ...ruleSources.map((source) => sourceTrace(source, decision, winningIds, satisfiedReviewRules)),
    ...denialSources.map((source) => sourceTrace(source, decision, winningIds, satisfiedReviewRules)),
    ...grantEvaluations.map(grantTrace),
    ...receiptEvaluations.map(receiptTrace),
    ...conflicts.map(conflictTrace),
    ...validationIssues.map(validationTrace),
    ...defaultTrace(decision, ruleSources, denialSources, grantEvaluations, validationIssues)
  ];

  const deniedBy = matches.denials.map((source) => source.id);
  const allowedBy = matches.allows.map((source) => source.id);
  const requiredReceipts = unique(reviewRules.flatMap((source) => source.receipts));
  const missingReceipts = unique(blockingReviewRules.flatMap((source) => source.receipts))
    .filter((receipt) => !receiptEvaluations.some((evaluation) => (
      evaluation.status === "active" &&
      evaluation.receiptRef === receipt
    )));
  const satisfiedReceipts = unique(receiptEvaluations
    .filter((receipt) => receipt.status === "active")
    .map((receipt) => receipt.receiptRef));
  const effects = unique([
    ...ruleSources.map((source) => source.effect),
    ...denialSources.map((source) => source.effect),
    ...activeGrantSources.map((source) => source.effect)
  ]);

  const viewWithoutRef = {
    posture: decision.posture,
    basis,
    effects,
    allowedBy,
    deniedBy,
    requiredReceipts,
    missingReceipts,
    satisfiedReceipts,
    sourceRefs: sourceRefs(ruleSources, denialSources, activeGrantSources),
    appliedRuleRefs: ruleSources.map((source) => source.id),
    grantRefs: activeGrantSources.map((source) => source.id),
    denialRefs: denialSources.map((source) => source.id),
    overlayRefs: unique(ruleSources.map((source) => source.overlayRef)),
    conflicts: conflicts.map(publicConflict),
    unresolved: unresolved.map(publicUnresolved),
    compatibility: resolverInput.compatibility ?? DEFAULT_COMPATIBILITY,
    admissibility: resolverInput.admissibility ?? DEFAULT_ADMISSIBILITY,
    mediation: mediationFor(decision, requiredReceipts),
    nonClaims: NON_CLAIMS,
    trace
  };

  return {
    effectiveViewRef: `rbc-view:${stableHash(viewWithoutRef)}`,
    ...viewWithoutRef
  };
}

function ruleSource(entry) {
  const rule = entry.rule ?? {};
  return {
    id: rule.id ?? `${entry.rulebookRef}:rule:${entry.ruleIndex}`,
    sourceType: SOURCE_TYPES.RULE,
    rulebookRef: entry.rulebookRef,
    overlayRef: entry.overlayRef,
    effect: rule.effect,
    strength: rule.strength ?? STRENGTHS.NORMAL,
    priority: rule.priority ?? 0,
    nonOverridable: rule.nonOverridable === true,
    sourceOrder: entry.sourceOrder,
    cascadeOrder: entry.cascadeOrder,
    cascadeType: entry.cascadeType,
    receipts: rule.requires?.receipts ?? [],
    reason: rule.reason ?? "Rule matched the resolution context."
  };
}

function materialSource(material, sourceType, sourceOrder = null) {
  return {
    id: material.id,
    sourceType,
    effect: material.effect,
    strength: material.strength ?? STRENGTHS.NORMAL,
    nonOverridable: material.nonOverridable === true,
    sourceOrder,
    receipts: material.requires?.receipts ?? [],
    reason: material.reason ?? `${sourceType} matched the resolution context.`
  };
}

function evaluateGrant(grant, time, sourceOrder) {
  if (grant.expiresAt && !time) {
    return {
      material: grant,
      sourceOrder,
      status: "unresolved_time",
      reason: "Grant has expiresAt, but no resolution time was provided."
    };
  }

  if (grant.expiresAt && !validTimePair(grant.expiresAt, time)) {
    return {
      material: grant,
      sourceOrder,
      status: "unresolved_time",
      reason: "Grant expiration could not be compared to the supplied resolution time."
    };
  }

  if (grant.expiresAt && Date.parse(grant.expiresAt) <= Date.parse(time)) {
    return {
      material: grant,
      sourceOrder,
      status: "expired",
      reason: "Grant expired before or at the resolution time."
    };
  }

  return {
    material: grant,
    sourceOrder,
    status: "active",
    reason: grant.reason
  };
}

function isDeny(source) {
  return source.effect === EFFECTS.DENY;
}

function sourceTrace(source, decision, winningIds, satisfiedReviewRules) {
  return traceEntry({
    sourceRef: source.id,
    sourceType: source.sourceType,
    effect: source.effect,
    status: sourceStatus(source, satisfiedReviewRules),
    role: sourceRole(source, decision, winningIds),
    reason: source.reason,
    precedence: decision.precedence,
    details: source.rulebookRef || source.overlayRef
      ? omitUndefined({
          rulebookRef: source.rulebookRef,
          overlayRef: source.overlayRef,
          strength: source.strength,
          priority: source.priority,
          nonOverridable: source.nonOverridable,
          sourceOrder: source.sourceOrder,
          cascadeOrder: source.cascadeOrder,
          cascadeType: source.cascadeType
        })
      : {
          strength: source.strength,
          nonOverridable: source.nonOverridable,
          sourceOrder: source.sourceOrder
        }
  });
}

function validTimePair(expiresAt, time) {
  return Number.isFinite(Date.parse(expiresAt)) && Number.isFinite(Date.parse(time));
}

function grantTrace(evaluation) {
  return traceEntry({
    sourceRef: evaluation.material.id,
    sourceType: SOURCE_TYPES.GRANT,
    effect: evaluation.material.effect,
    status: evaluation.status,
    role: evaluation.status === "active" ? "applied" : "unresolved",
    reason: evaluation.reason ?? evaluation.material.reason
  });
}

function defaultTrace(decision, ruleSources, denialSources, grantEvaluations, validationIssues) {
  if (
    decision.precedence !== "unknown_default" ||
    ruleSources.length > 0 ||
    denialSources.length > 0 ||
    grantEvaluations.some((grant) => grant.status === "active") ||
    validationIssues.length > 0
  ) {
    return [];
  }

  return decision.winningSources.map((source) => traceEntry({
    sourceRef: source.id,
    sourceType: source.sourceType,
    effect: source.effect,
    posture: decision.posture,
    reason: source.reason,
    precedence: decision.precedence
  }));
}

function mediationFor(decision, requiredReceipts) {
  if (decision.posture === "requires_review") {
    return {
      mode: "review",
      requiredReceipts
    };
  }

  if (decision.posture === "requires_mediation") {
    return {
      mode: "mediation",
      reason: "Resolution did not produce an allow, deny, or review gate."
    };
  }

  return null;
}

function unique(values) {
  return [...new Set(values.filter((value) => value !== undefined && value !== null))];
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

function sourceRefsForDuplicateCheck(ruleEntries, input) {
  return [
    ...ruleEntries.map((entry) => ({
      id: entry.rule?.id,
      sourceType: SOURCE_TYPES.RULE
    })),
    ...arrayOf(input.grants).map((grant) => ({
      id: grant?.id,
      sourceType: SOURCE_TYPES.GRANT
    })),
    ...arrayOf(input.denials).map((denial) => ({
      id: denial?.id,
      sourceType: SOURCE_TYPES.DENIAL
    }))
  ];
}

function timeIssues(time) {
  if (time !== null && time !== undefined && !validDateString(time)) {
    return [{
      sourceRef: "time",
      sourceType: SOURCE_TYPES.VALIDATION,
      code: "invalid_resolution_time",
      reason: "Resolution time must be valid when supplied through input.time or basis.timeRef."
    }];
  }

  return [];
}

function validationSource(issue) {
  return {
    id: issue.sourceRef,
    sourceType: issue.sourceType,
    effect: "unresolved",
    reason: issue.reason
  };
}

function evaluateReceipt(receipt, time, index) {
  const sourceRef = receiptRef(receipt, index);
  const receiptType = typeof receipt === "string"
    ? receipt
    : receipt.receiptRef ?? receipt.type ?? receipt.id;

  if (typeof receipt === "object" && receipt?.expiresAt && !time) {
    return {
      id: sourceRef,
      receiptRef: receiptType,
      status: "unresolved_time",
      reason: "Receipt has expiresAt, but no resolution time was provided."
    };
  }

  if (typeof receipt === "object" && receipt?.expiresAt && Date.parse(receipt.expiresAt) <= Date.parse(time)) {
    return {
      id: sourceRef,
      receiptRef: receiptType,
      status: "expired",
      reason: "Receipt expired before or at the resolution time."
    };
  }

  if (typeof receipt === "object" && ["invalid", "revoked", "superseded"].includes(receipt.status)) {
    return {
      id: sourceRef,
      receiptRef: receiptType,
      status: receipt.status,
      reason: `Receipt evidence is ${receipt.status}.`
    };
  }

  return {
    id: sourceRef,
    receiptRef: receiptType,
    status: "active",
    reason: "Receipt evidence was supplied by the caller."
  };
}

function reviewSatisfied(source, receiptEvaluations) {
  if (source.effect !== EFFECTS.REQUIRES_REVIEW || source.receipts.length === 0) {
    return false;
  }

  const activeReceipts = new Set(receiptEvaluations
    .filter((receipt) => receipt.status === "active")
    .map((receipt) => receipt.receiptRef));

  return source.receipts.every((receipt) => activeReceipts.has(receipt));
}

function receiptTrace(evaluation) {
  return traceEntry({
    sourceRef: evaluation.id,
    sourceType: SOURCE_TYPES.RECEIPT,
    effect: "evidence",
    status: evaluation.status,
    role: evaluation.status === "active" ? "evidence" : "unresolved",
    reason: evaluation.reason,
    details: {
      receiptRef: evaluation.receiptRef
    }
  });
}

function receiptRef(receipt, index) {
  if (typeof receipt === "string") {
    return receipt;
  }

  return receipt?.id ?? receipt?.receiptRef ?? receipt?.type ?? `receipt:${index}`;
}

function detectConflicts(ruleSources, grantSources) {
  const conflicts = [];
  const allowSources = [
    ...ruleSources.filter((source) => source.effect === EFFECTS.ALLOW),
    ...grantSources
  ];
  const nonOverridableStrictSources = ruleSources.filter((source) => (
    source.nonOverridable &&
    [EFFECTS.DENY, EFFECTS.REQUIRES_REVIEW, EFFECTS.PROVISIONAL].includes(source.effect)
  ));

  for (const strictSource of nonOverridableStrictSources) {
    for (const allowSource of allowSources) {
      if ((allowSource.sourceOrder ?? Number.MAX_SAFE_INTEGER) > (strictSource.sourceOrder ?? -1)) {
        conflicts.push({
          id: `conflict:${strictSource.id}:${allowSource.id}`,
          sourceType: SOURCE_TYPES.VALIDATION,
          effect: "conflict",
          reason: "Later allow material attempted to loosen a non-overridable constraint.",
          sources: [strictSource.id, allowSource.id]
        });
      }
    }
  }

  const byPriority = new Map();
  for (const source of ruleSources) {
    const key = `${source.cascadeOrder}:${source.priority}:${source.strength}`;
    const group = byPriority.get(key) ?? [];
    group.push(source);
    byPriority.set(key, group);
  }

  for (const group of byPriority.values()) {
    const effects = unique(group.map((source) => source.effect));
    const hasIncompatible = effects.includes(EFFECTS.ALLOW) && (
      effects.includes(EFFECTS.PROVISIONAL) ||
      effects.includes(EFFECTS.REQUIRES_REVIEW)
    );

    if (hasIncompatible) {
      conflicts.push({
        id: `conflict:${group.map((source) => source.id).join("+")}`,
        sourceType: SOURCE_TYPES.VALIDATION,
        effect: "conflict",
        reason: "Same-precedence rule material produced incompatible effects.",
        sources: group.map((source) => source.id)
      });
    }
  }

  return conflicts;
}

function conflictTrace(conflict) {
  return traceEntry({
    sourceRef: conflict.id,
    sourceType: SOURCE_TYPES.VALIDATION,
    effect: "conflict",
    status: "conflict",
    role: "unresolved",
    reason: conflict.reason,
    details: {
      sources: conflict.sources
    }
  });
}

function publicConflict(conflict) {
  return {
    conflictRef: conflict.id,
    sourceRefs: conflict.sources,
    reason: conflict.reason
  };
}

function publicUnresolved(source) {
  return {
    sourceRef: source.id,
    sourceType: source.sourceType,
    reason: source.reason
  };
}

function sourceRefs(ruleSources, denialSources, grantSources) {
  return unique([
    ...ruleSources.map((source) => source.id),
    ...denialSources.map((source) => source.id),
    ...grantSources.map((source) => source.id)
  ]);
}

function sourceStatus(source, satisfiedReviewRules) {
  if (satisfiedReviewRules.some((rule) => rule.id === source.id)) {
    return "satisfied";
  }

  return "matched";
}

function sourceRole(source, decision, winningIds) {
  if (winningIds.has(source.id)) {
    return "winner";
  }

  if (
    [EFFECTS.ALLOW, EFFECTS.PROVISIONAL].includes(source.effect) &&
    ["hard_deny", "explicit_deny", "requires_review", "conflict", "unresolved_material"].includes(decision.precedence)
  ) {
    return "shadowed";
  }

  if (source.effect === EFFECTS.REQUIRES_REVIEW && decision.precedence === "scoped_allow") {
    return "satisfied_gate";
  }

  return "applied";
}
