// Defter ders filtresi (saf): yalniz yanlisi olan dersler, en cok yanlistan
// aza. Anahtar kaydin kendi ders anahtari (wrongMatchesSubject ile uyumlu).
export function notebookSubjectChips(items = [], labelOf = (k) => k) {
  const counts = new Map();
  for (const it of items || []) {
    const key = typeof it?.subject === "string" ? it.subject : it?.subject?.key;
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: labelOf(key) || key, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "tr"));
}
