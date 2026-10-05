export function normalizeStopCorrect(value, total) {
  if (value == null || String(value).trim() === "") return null;
  const parsed = Number(value);
  const limit = Number(total);
  if (!Number.isFinite(parsed) || !Number.isFinite(limit) || limit <= 0) return null;
  return Math.min(Math.max(Math.trunc(parsed), 0), Math.trunc(limit));
}
