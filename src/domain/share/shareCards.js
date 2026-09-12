import { formatMinutes, formatNumber, formatDelta, formatWeekday } from "../../lib/format.js";

// STORY PAYLAŞIM KARTLARI — içerik katmanı.
//
// Tasarım AKIŞ 12B: "Çalışma günü · Soru · Durak · Haftalık rota · Geri dönüş ·
// Ritim · Sıradaki durak · Rota hareketi — sekiz Story kartı, hepsi EMEK
// VERİSİ üzerinden."
//
// Buradaki her kart yalnızca VERİ döndürür; hiçbir görsel karar içermez.
// Böylece tasarım geldiğinde tek bir render bileşeni yazılıp sekizi de aynı
// şekli tüketebilir. Eski ShareCardScreen iki tipi `isWeekly` boolean'ıyla
// ayırıyordu — sekize çıkınca o yapı taşımaz.
//
// Ortak sözleşme:
//   { id, title, heroValue, heroLabel, stats: [{label,value}], caption, available }
//
// `available` false ise kart gösterilmez: verisi olmayan kartı boş
// göstermektense hiç göstermemek doğru (brief: "anlamını söyleyemediğin sayı
// ekranda durmaz").

export const SHARE_CARD_IDS = {
  STUDY_DAY: "study_day",
  QUESTIONS: "questions",
  STOP: "stop",
  WEEKLY_ROUTE: "weekly_route",
  COMEBACK: "comeback",
  RHYTHM: "rhythm",
  NEXT_STOP: "next_stop",
  ROUTE_MOVE: "route_move",
  FLAT_WEEK: "flat_week",
};

/**
 * @param ctx {
 *   today: { minutes, questions, subjects: [] },
 *   week:  { minutes, questions, activeDays, netAvg, prevNetAvg },
 *   streak: number,
 *   comebackAfterDays: number|null,
 *   route: { currentWeek, nextStop, progressPct, movedTopics },
 *   name: string,
 * }
 */
export function buildShareCards(ctx = {}) {
  return [
    studyDayCard(ctx),
    questionsCard(ctx),
    stopCard(ctx),
    weeklyRouteCard(ctx),
    comebackCard(ctx),
    rhythmCard(ctx),
    nextStopCard(ctx),
    routeMoveCard(ctx),
    flatWeekCard(ctx),
  ];
}

/** Sadece verisi olan kartlar. */
export function availableShareCards(ctx) {
  return buildShareCards(ctx).filter((c) => c.available);
}

export function getShareCard(id, ctx) {
  return buildShareCards(ctx).find((c) => c.id === id) || null;
}

// ---- Kartlar ----

function studyDayCard({ today = {} }) {
  const minutes = today.minutes || 0;
  return {
    id: SHARE_CARD_IDS.STUDY_DAY,
    title: "Bugünkü çalışma",
    heroValue: formatMinutes(minutes),
    heroLabel: "bugün çalıştım",
    stats: [
      { label: "Soru", value: formatNumber(today.questions || 0) },
      { label: "Ders", value: formatNumber((today.subjects || []).length) },
    ],
    caption: (today.subjects || []).slice(0, 3).join(" · ") || null,
    available: minutes > 0 || (today.questions || 0) > 0,
  };
}

function questionsCard({ week = {} }) {
  const q = week.questions || 0;
  return {
    id: SHARE_CARD_IDS.QUESTIONS,
    title: "Bu hafta çözülen",
    heroValue: formatNumber(q),
    heroLabel: "soru",
    stats: [
      { label: "Süre", value: formatMinutes(week.minutes || 0) },
      { label: "Aktif gün", value: formatNumber(week.activeDays || 0) },
    ],
    caption: null,
    available: q > 0,
  };
}

function stopCard({ route = {} }) {
  const stop = route.completedStop;
  return {
    id: SHARE_CARD_IDS.STOP,
    title: "Durak tamamlandı",
    heroValue: stop?.topic || "—",
    heroLabel: stop?.subjectLabel || "",
    stats: [
      { label: "Soru", value: formatNumber(stop?.questions || 0) },
      { label: "Zorluk", value: stop?.difficulty || "—" },
    ],
    caption: null,
    available: !!stop,
  };
}

function weeklyRouteCard({ route = {}, week = {} }) {
  const done = route.currentWeek?.completedQuestions || 0;
  const planned = route.currentWeek?.plannedQuestions || 0;
  const pct = planned > 0 ? Math.round((done / planned) * 100) : 0;
  return {
    id: SHARE_CARD_IDS.WEEKLY_ROUTE,
    title: "Haftalık rota",
    heroValue: `%${pct}`,
    heroLabel: "bu haftanın rotası",
    stats: [
      { label: "Yapılan", value: formatNumber(done) },
      { label: "Planlanan", value: formatNumber(planned) },
      { label: "Aktif gün", value: formatNumber(week.activeDays || 0) },
    ],
    caption: null,
    available: planned > 0,
  };
}

/**
 * DUZLESEN HAFTA — "KOTU HAFTA DA PAYLASILIR" (tasarim: Kart Modlari).
 *
 * Diger sekiz kartin hepsi ilerleme kutluyor. Tasarim bilincli olarak bir
 * de duz haftayi paylasilabilir kiliyor: "Duzlesen rota da bir hikaye.
 * Kotu haftayi paylasmak seriyi bozmak degil."
 *
 * Bu bir teselli metni degil, urun durusu: seri kirilmasin diye kotu
 * haftayi saklamak, uygulamanin kendi dilinde yalan soylemek olurdu.
 *
 * Yalniz gercekten duz hafta icin cikiyor -- iyi bir hafta "duzlesti"
 * diye paylasilmaz.
 */
function flatWeekCard({ week = {}, route = {} }) {
  const stops = route.currentWeek?.completedStops ?? 0;
  const trials = week.trials ?? 0;
  const activeDays = week.activeDays ?? 0;
  const weekNo = route.currentWeek?.weekNo ?? null;

  // Duz hafta: aktif gun 3'un altinda VE deneme yok. Ikisi birden
  // olmadikca kart cikmaz; yogun ama denemesiz bir hafta duz degildir.
  const isFlat = activeDays > 0 && activeDays < 3 && trials === 0;

  return {
    id: SHARE_CARD_IDS.FLAT_WEEK,
    title: weekNo ? `${weekNo}. hafta` : "Bu hafta",
    heroValue: `${formatNumber(stops)} durak`,
    heroLabel: "bu hafta rotam düzleşti",
    stats: [
      { label: "Durak", value: formatNumber(stops) },
      { label: "Deneme", value: formatNumber(trials) },
    ],
    caption:
      "Olur böyle. Bu hafta ara verdim, rota yerinde duruyor. " +
      "Kaldığım duraktan devam.",
    available: isFlat,
  };
}

function comebackCard({ comebackAfterDays, streak = 0 }) {
  return {
    id: SHARE_CARD_IDS.COMEBACK,
    title: "Geri döndüm",
    heroValue: comebackAfterDays ? `${formatNumber(comebackAfterDays)} gün` : "—",
    heroLabel: "aradan sonra",
    stats: [{ label: "Yeni seri", value: formatNumber(streak) }],
    // Ara verip dönmek kutlanacak bir şey; suçluluk dili YOK.
    caption: "Bırakmadım.",
    available: !!comebackAfterDays && comebackAfterDays >= 2,
  };
}

function rhythmCard({ week = {}, streak = 0 }) {
  const days = week.activeDays || 0;
  return {
    id: SHARE_CARD_IDS.RHYTHM,
    title: "Ritim",
    heroValue: formatNumber(streak),
    heroLabel: "günlük seri",
    stats: [
      { label: "Bu hafta", value: `${formatNumber(days)}/7 gün` },
      { label: "Süre", value: formatMinutes(week.minutes || 0) },
    ],
    caption: week.bestDay ? `En verimli gün: ${formatWeekday(week.bestDay)}` : null,
    available: streak > 0 || days > 0,
  };
}

function nextStopCard({ route = {} }) {
  const next = route.nextStop;
  return {
    id: SHARE_CARD_IDS.NEXT_STOP,
    title: "Sıradaki durak",
    heroValue: next?.topic || "—",
    heroLabel: next?.subjectLabel || "",
    stats: [
      { label: "Hedef", value: `${formatNumber(next?.questions || 0)} soru` },
      { label: "Zorluk", value: next?.difficulty || "—" },
    ],
    caption: null,
    available: !!next,
  };
}

function routeMoveCard({ route = {}, week = {} }) {
  const delta = (week.netAvg ?? 0) - (week.prevNetAvg ?? 0);
  const moved = route.movedTopics || 0;
  return {
    id: SHARE_CARD_IDS.ROUTE_MOVE,
    title: "Rota hareketi",
    heroValue: formatDelta(delta, 2),
    heroLabel: "net değişimi",
    stats: [
      { label: "Tamamlanan durak", value: formatNumber(moved) },
      { label: "Rota ilerlemesi", value: `%${Math.round((route.progressPct || 0) * 100)}` },
    ],
    // Renk tek başına bilgi taşımasın: yön metinde de var.
    caption: delta > 0 ? "Yükseliyor" : delta < 0 ? "Düşüyor" : "Sabit",
    available: moved > 0 || week.prevNetAvg != null,
  };
}
