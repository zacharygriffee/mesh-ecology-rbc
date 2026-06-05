export function buildResolutionContext(input = {}) {
  const basis = input.basis ?? {};
  const facts = input.facts ?? {};

  return {
    ...basis,
    ...metadataFacts(input),
    ...facts
  };
}

export function matchesWhen(when = {}, context = {}) {
  return matchesPattern(when, context);
}

export function matchesScope(scope = {}, context = {}) {
  return matchesPattern(scope, context);
}

export function matchesPattern(pattern = {}, context = {}) {
  return Object.entries(pattern).every(([key, expected]) => {
    const actual = context[key];

    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }

    return Object.is(actual, expected);
  });
}

function metadataFacts(input) {
  return {
    ...entityFacts("artifact", input.artifact ?? input.artifactMetadata),
    ...entityFacts("surface", input.surface ?? input.surfaceMetadata),
    ...entityFacts("role", input.role ?? input.roleMetadata),
    ...entityFacts("device", input.device ?? input.deviceMetadata)
  };
}

function entityFacts(prefix, entity) {
  if (!entity || typeof entity !== "object") {
    return {};
  }

  const classKey = `${prefix}Class`;
  const refKey = `${prefix}Ref`;
  const facts = {};

  if (entity[classKey] !== undefined) {
    facts[classKey] = entity[classKey];
  } else if (entity.class !== undefined) {
    facts[classKey] = entity.class;
  }

  if (entity[refKey] !== undefined) {
    facts[refKey] = entity[refKey];
  } else if (entity.ref !== undefined) {
    facts[refKey] = entity.ref;
  } else if (entity.id !== undefined) {
    facts[refKey] = entity.id;
  }

  return facts;
}
