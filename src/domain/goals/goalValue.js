export function normalizeGoalValue(rawValue, min, max, step = 1, fallback = min) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || String(rawValue).trim() === "") return fallback;

  const snapped = Math.round(parsed / step) * step;
  return Math.max(min, Math.min(max, snapped));
}
