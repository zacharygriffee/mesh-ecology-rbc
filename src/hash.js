import { createHash } from "node:crypto";

export function stableHash(value) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function stableStringify(value) {
  return JSON.stringify(sortStable(value));
}

export function sortStable(value) {
  if (Array.isArray(value)) {
    return value.map(sortStable);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((sorted, key) => {
        const field = value[key];
        if (field !== undefined) {
          sorted[key] = sortStable(field);
        }
        return sorted;
      }, {});
  }

  return value;
}

export function cloneStable(value) {
  return sortStable(value);
}
