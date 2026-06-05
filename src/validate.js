import { EFFECTS, POSTURES, SOURCE_TYPES, STRENGTHS } from "./constants.js";

const SUPPORTED_EFFECTS = new Set(Object.values(EFFECTS));
const SUPPORTED_EXPLICIT_POSTURES = new Set([POSTURES.UNKNOWN, POSTURES.NOT_APPLICABLE]);
const SUPPORTED_STRENGTHS = new Set(Object.values(STRENGTHS));

export function validateInput(input = {}) {
  const issues = [];

  if (!plainObject(input)) {
    return [issue("input", SOURCE_TYPES.VALIDATION, "invalid_input", "Resolver input must be an object.")];
  }

  if (!plainObject(input.basis)) {
    issues.push(issue("basis", SOURCE_TYPES.VALIDATION, "invalid_basis", "Input basis must be an object."));
  }

  if (input.time !== undefined && !validDateString(input.time)) {
    issues.push(issue("time", SOURCE_TYPES.VALIDATION, "invalid_time", "Input time must be a valid date string when supplied."));
  }

  for (const field of ["rulebooks", "overlays", "grants", "denials", "receipts"]) {
    if (input[field] !== undefined && !Array.isArray(input[field])) {
      issues.push(issue(field, SOURCE_TYPES.VALIDATION, "invalid_collection", `${field} must be an array when supplied.`));
    }
  }

  return issues;
}

export function validateRuleEntry(entry) {
  const rule = entry.rule;
  const sourceRef = rule?.id ?? `${entry.rulebookRef}:rule:${entry.ruleIndex}`;
  const issues = [];

  if (!plainObject(rule)) {
    return [issue(sourceRef, SOURCE_TYPES.RULE, "invalid_rule", "Rule material must be an object.")];
  }

  if (!stringRef(rule.id)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RULE, "missing_id", "Rule must have a string id."));
  }

  if (!SUPPORTED_EFFECTS.has(rule.effect) && !SUPPORTED_EXPLICIT_POSTURES.has(rule.posture)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RULE, "unsupported_effect", "Rule effect or explicit posture is not supported."));
  }

  if (rule.strength !== undefined && !SUPPORTED_STRENGTHS.has(rule.strength)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RULE, "unsupported_strength", "Rule strength is not supported."));
  }

  if (rule.when !== undefined && !plainObject(rule.when)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RULE, "invalid_when", "Rule when must be an object when supplied."));
  }

  if (containsExecutable(rule.when)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RULE, "executable_predicate", "Rule when must be declarative data, not executable predicates."));
  }

  return issues;
}

export function validateGrant(grant) {
  return validateScopedMaterial(grant, SOURCE_TYPES.GRANT, EFFECTS.ALLOW, "Grant");
}

export function validateDenial(denial) {
  return validateScopedMaterial(denial, SOURCE_TYPES.DENIAL, EFFECTS.DENY, "Denial");
}

export function validateReceipt(receipt, index) {
  const sourceRef = receiptRef(receipt, index);
  const issues = [];

  if (typeof receipt === "string") {
    return issues;
  }

  if (!plainObject(receipt)) {
    return [issue(sourceRef, SOURCE_TYPES.RECEIPT, "invalid_receipt", "Receipt evidence must be a string or object.")];
  }

  if (!stringRef(receipt.id) && !stringRef(receipt.receiptRef) && !stringRef(receipt.type)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RECEIPT, "missing_ref", "Receipt evidence must have id, receiptRef, or type."));
  }

  if (receipt.expiresAt !== undefined && receipt.expiresAt !== null && !validDateString(receipt.expiresAt)) {
    issues.push(issue(sourceRef, SOURCE_TYPES.RECEIPT, "invalid_expiration", "Receipt expiresAt must be a valid date string when supplied."));
  }

  return issues;
}

export function duplicateRefIssues(sources) {
  const seen = new Map();
  const issues = [];

  for (const source of sources) {
    if (!source.id) {
      continue;
    }

    if (seen.has(source.id)) {
      issues.push(issue(source.id, source.sourceType, "duplicate_ref", `Duplicate source ref also used by ${seen.get(source.id)}.`));
    } else {
      seen.set(source.id, source.sourceType);
    }
  }

  return issues;
}

export function validationTrace(issueValue) {
  return {
    sourceRef: issueValue.sourceRef,
    sourceType: issueValue.sourceType,
    effect: "unresolved",
    status: issueValue.code,
    role: "unresolved",
    reason: issueValue.reason
  };
}

export function validDateString(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function plainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stringRef(value) {
  return typeof value === "string" && value.length > 0;
}

function validateScopedMaterial(material, sourceType, expectedEffect, label) {
  const sourceRef = material?.id ?? `${sourceType}:missing-id`;
  const issues = [];

  if (!plainObject(material)) {
    return [issue(sourceRef, sourceType, `invalid_${sourceType}`, `${label} material must be an object.`)];
  }

  if (!stringRef(material.id)) {
    issues.push(issue(sourceRef, sourceType, "missing_id", `${label} must have a string id.`));
  }

  if (material.effect !== expectedEffect) {
    issues.push(issue(sourceRef, sourceType, "unsupported_effect", `${label} effect must be ${expectedEffect}.`));
  }

  if (material.strength !== undefined && !SUPPORTED_STRENGTHS.has(material.strength)) {
    issues.push(issue(sourceRef, sourceType, "unsupported_strength", `${label} strength is not supported.`));
  }

  if (material.scope !== undefined && !plainObject(material.scope)) {
    issues.push(issue(sourceRef, sourceType, "invalid_scope", `${label} scope must be an object when supplied.`));
  }

  if (containsExecutable(material.scope)) {
    issues.push(issue(sourceRef, sourceType, "executable_scope", `${label} scope must be declarative data, not executable predicates.`));
  }

  if (material.expiresAt !== undefined && material.expiresAt !== null && !validDateString(material.expiresAt)) {
    issues.push(issue(sourceRef, sourceType, "invalid_expiration", `${label} expiresAt must be a valid date string when supplied.`));
  }

  return issues;
}

function containsExecutable(value) {
  if (!value || typeof value !== "object") {
    return typeof value === "function";
  }

  return Object.values(value).some((field) => typeof field === "function");
}

function receiptRef(receipt, index) {
  if (typeof receipt === "string") {
    return receipt;
  }

  return receipt?.id ?? receipt?.receiptRef ?? receipt?.type ?? `receipt:${index}`;
}

function issue(sourceRef, sourceType, code, reason) {
  return {
    sourceRef,
    sourceType,
    code,
    reason
  };
}
