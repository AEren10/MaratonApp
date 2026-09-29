const inFlight = new Map();

function encode(value) {
  if (value === undefined) return "__undefined__";
  return JSON.stringify(value);
}

export function makeInFlightKey(resource, userId, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => [key, params[key]]);
  return `${encode(resource)}:${encode(userId)}:${encode(sortedParams)}`;
}

function shallowCopy(value) {
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === "object") return { ...value };
  return value;
}

export function shareInFlight(key, loader) {
  let job = inFlight.get(key);
  if (!job) {
    job = Promise.resolve().then(loader);
    inFlight.set(key, job);
    job.finally(() => {
      if (inFlight.get(key) === job) inFlight.delete(key);
    }).catch(() => {});
  }
  return job.then(shallowCopy);
}

export function invalidateInFlightResource(resource, userId) {
  const prefix = userId === undefined
    ? `${encode(resource)}:`
    : `${encode(resource)}:${encode(userId)}:`;
  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
}

export function resetInFlightRequests() {
  inFlight.clear();
}
