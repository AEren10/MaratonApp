// BU HAFTA SABIT -- rota her degisiklikte yeniden hesaplaniyor; bu haftanin
// durak seti ise hafta ilk kaydedildiginde sabitlenir.
//
// Neden: yeniden hesap her seferinde bu haftaya TAM butce veriyordu; durak
// bitirdikce yerine yenisi geliyordu (ana sayfada 1 durak bitir, 3 yenisi
// gelsin), bitmis durak listeden dusuyordu ve hafta tekrari haftada
// calisilmamis konulara kayiyordu. Sabit hafta: bitenler "bitti" olarak
// yerinde kalir, liste sayaci ilerler. Ogrenci yine ekler/tasir/erteler;
// sabit olan yalniz algoritmanin haftayi arkadan yeniden yazmasi.
// Gelecek haftalar taslak: her hesapta yenilenir.

const OPEN = new Set(["active", "upcoming"]);

/** Sunucu satiri -> motor duragi. */
function rowToStop(row) {
  const m = row.metadata || {};
  return {
    ...m,
    subject: row.subject || m.subject,
    subjectLabel: row.subject_label || m.subjectLabel || row.subject,
    topic: row.topic || m.topic,
    cost: {
      questions: Number(m.questions) || 0,
      minutes: Number(m.minutes) || 0,
      difficulty: m.difficulty || null,
    },
    isReview: Boolean(m.isReview) || row.stop_kind === "review",
    logicalStopKey: row.logical_key || m.logicalStopKey,
    rootStopKey: row.root_key || m.rootStopKey,
    segmentIndex: row.segment_index ?? m.segmentIndex ?? 0,
    position: row.position ?? m.position ?? 0,
    stopId: row.id,
    lifecycleStatus: row.lifecycle_status,
    version: row.version,
    completedAt: row.completed_at || row.status_changed_at || null,
    insight: m.insight || null,
  };
}

/**
 * @param rows       kayitli duraklar (en son revizyon)
 * @param weekStart  bu haftanin pazartesisi "YYYY-MM-DD"
 * @param knownTopics { ders: { konu } } -- "hallettim" denen konunun BITMEMIS
 *                   duragi sabit haftadan da duser (ogrencinin son sozu)
 * @returns null (bu hafta henuz kaydedilmemis) | { stops, planStartDay }
 */
export function frozenWeekFromRows(rows = [], weekStart, knownTopics = {}) {
  if (!weekStart) return null;
  const own = (rows || []).filter((r) => String(r.week_start || "").slice(0, 10) === weekStart);
  if (!own.length) return null;
  const stops = own
    .map(rowToStop)
    .filter((s) => !(OPEN.has(s.lifecycleStatus) && !s.isReview && knownTopics?.[s.subject]?.[s.topic] !== undefined))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const starts = own.map((r) => r.metadata?.planStart).filter(Boolean).sort();
  return { stops, planStartDay: starts[0] || null };
}
