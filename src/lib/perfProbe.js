import React from "react";

// GECICI OLCUM (4 Ekim, sekme kasmasi): yalniz gelistirme modunda. 12ms'yi
// asan React cizimlerini ve sekme basislarini Metro'ya yazar. Uretimde bos.
const SLOW_MS = 12;
let t0 = Date.now();

export function perfMark(label) {
  if (!__DEV__) return;
  t0 = Date.now();
  console.log(`[perf] ${label}`);
}

function onRender(id, phase, actual) {
  if (actual >= SLOW_MS) console.log(`[perf] ${id} ${phase} ${Math.round(actual)}ms (+${Date.now() - t0}ms)`);
}

export function PerfProbe({ id, children }) {
  if (!__DEV__) return children;
  return <React.Profiler id={id} onRender={onRender}>{children}</React.Profiler>;
}
