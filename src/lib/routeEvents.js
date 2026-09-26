const listeners = new Set();

export function onRouteUpdated(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitRouteUpdated(payload = null) {
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (_) {}
  });
}
