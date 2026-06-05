export function traceEntry(fields) {
  return omitUndefined({
    sourceRef: fields.sourceRef,
    sourceType: fields.sourceType,
    effect: fields.effect,
    posture: fields.posture,
    status: fields.status,
    role: fields.role,
    reason: fields.reason,
    precedence: fields.precedence,
    details: fields.details
  });
}

export function omitUndefined(value) {
  return Object.entries(value).reduce((result, [key, field]) => {
    if (field !== undefined) {
      result[key] = field;
    }
    return result;
  }, {});
}
