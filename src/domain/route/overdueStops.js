import { subjectPaletteKey } from "../../themes/subjectPalette.js";

// GERIDE KALAN KONULAR — durak bazinda borc.
//
// Eski hesap haftalik TOPLAMA bakiyordu (planlanan soru - cozulen soru):
// baska bir derse calismak borcu siliyor, ekrandaki saat ile listedeki
// durak sayisi farkli kaynaktan geliyordu ("0,8 sa · 0 durak"). Metin
// "21 gun" derken kod 45 gun kullaniyordu.
//
// Kural (ekrandaki cumleyle AYNI):
// - Borc = bitmis haftalarin TAMAMLANMAMIS duraklari (aktif/sirada/atlandi).
// - O haftadan SONRA ayni ders + konuya calisildiysa durak kendiliginden kapanir.
// - Hafta bittikten 21 gun sonra borc olmaktan cikar; o sureye kadar agirligi
//   azalir (eski borc yeni borctan once kovalanmaz).
// - Ayni konunun parcalari tek satirda birlesir.
// - Toplam bir haftalik kapasiteyi gecmez; ustu "Sirada"ya duser (capped).
// - Ogrencinin bilerek ATLADIGI durak borc degildir ("atla" = istemiyorum).
// - Rota konuyu bu haftaya ya da ileriye ZATEN yeniden koyduysa borc
//   sayilmaz: ayni konu hem rotada hem borc listesinde cift sayiliyordu.
export const DEBT_WINDOW_DAYS = 21;
const OPEN = new Set(["active", "upcoming"]);
const DONE = new Set(["completed", "skipped", "rescheduled", "frozen"]);
const DAY = 86400000;

const topicKey = (subject, topic) => `${subjectPaletteKey(subject)}|${String(topic || "").trim().toLocaleLowerCase("tr-TR")}`;

/** Bu hafta ve sonrasinda rotada ACIK duran konular (ders|konu anahtari). */
export function plannedTopicKeys(weeks = [], thisMonday) {
  const keys = new Set();
  for (const week of weeks || []) {
    const ws = String(week?.weekStart || "").slice(0, 10);
    if (ws && thisMonday && ws < thisMonday) continue;
    for (const s of week?.stops || []) {
      if (!DONE.has(s?.lifecycleStatus) && s?.topic) keys.add(topicKey(s.subject, s.topic));
    }
  }
  return keys;
}

export function overdueStops({ stops = [], logs = [], thisMonday, now = new Date(), minutesPerWeek = 0, planned = null } = {}) {
  const studiedAfter = new Map(); // topicKey -> son calisma tarihi (YYYY-MM-DD)
  for (const log of logs || []) {
    const day = String(log.study_date || log.studyDate || "").slice(0, 10);
    if (!day || !log.topic) continue;
    const k = topicKey(log.subject, log.topic);
    if (!studiedAfter.has(k) || studiedAfter.get(k) < day) studiedAfter.set(k, day);
  }

  const byRoot = new Map();
  for (const stop of stops || []) {
    const weekStart = String(stop.week_start || stop.weekStart || "").slice(0, 10);
    const status = stop.lifecycle_status || stop.lifecycleStatus;
    if (!weekStart || weekStart >= thisMonday || !OPEN.has(status)) continue;
    const endMs = new Date(`${weekStart}T00:00:00`).getTime() + 7 * DAY;
    const ageDays = Math.max(0, Math.floor((now.getTime() - endMs) / DAY));
    if (ageDays > DEBT_WINDOW_DAYS) continue;
    const k = topicKey(stop.subject, stop.topic);
    const last = studiedAfter.get(k);
    if (last && last >= weekStart) continue; // sonradan calisilmis: kapandi
    if (planned?.has(k)) continue; // rota zaten yeniden planladi
    const minutes = Number(stop.metadata?.minutes ?? stop.cost?.minutes) || 0;
    const weight = 1 - ageDays / (DEBT_WINDOW_DAYS + 1);
    const root = stop.root_key || stop.rootStopKey || k;
    const prev = byRoot.get(root);
    byRoot.set(root, {
      key: root,
      stops: [...(prev?.stops || []), stop],
      subject: stop.subject_label || stop.subjectLabel || stop.subject,
      subjectKey: subjectPaletteKey(stop.subject),
      topic: stop.topic,
      minutes: (prev?.minutes || 0) + minutes,
      weight: Math.max(prev?.weight || 0, weight),
      ageDays: Math.min(prev?.ageDays ?? ageDays, ageDays),
      skipped: Boolean(prev?.skipped || status === "skipped"),
    });
  }

  const items = [...byRoot.values()]
    .map((it) => ({ ...it, score: it.minutes * it.weight }))
    .sort((a, b) => b.score - a.score);
  const raw = Math.round(items.reduce((sum, it) => sum + it.minutes * it.weight, 0));
  const cap = minutesPerWeek > 0 ? minutesPerWeek : Infinity;
  return {
    items,
    totalMinutes: Math.min(raw, cap),
    capped: raw > cap,
    rawMinutes: raw,
    weeks: minutesPerWeek > 0 ? Math.round((Math.min(raw, cap) / minutesPerWeek) * 10) / 10 : null,
  };
}
