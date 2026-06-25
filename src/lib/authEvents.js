const listeners = new Set();

export function onAuthError(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitAuthError() {
  listeners.forEach((fn) => {
    try { fn(); } catch (_) {}
  });
}
