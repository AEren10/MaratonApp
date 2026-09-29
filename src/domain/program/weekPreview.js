// GELECEK HAFTA ONIZLEMESI -- tek satir.
// "Türkçe 3 · Matematik 2 · İngilizce 2 · Hafta tekrarı"
// Ders basina durak sayisi (en cok 3 ders), hafta tekrari varsa sonda.
// Gurultu olmasin diye tek satir; ayrinti gunlerin listesinde.

export function weekPreviewLine(week) {
  const stops = week?.stops || [];
  if (!stops.length) return null;
  const counts = new Map();
  let weekly = false;
  for (const s of stops) {
    if (String(s.reviewCycle || "").startsWith("weekly")) { weekly = true; continue; }
    const label = s.subjectLabel || s.subject;
    if (!label) continue;
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  const parts = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"))
    .slice(0, 3)
    .map(([label, n]) => `${label} ${n}`);
  if (weekly) parts.push("Hafta tekrarı");
  return parts.length ? parts.join(" · ") : null;
}
