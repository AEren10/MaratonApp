// KAYIT ONCESI ROTA ONIZLEMESI (saf).
//
// Kullaniciya "rotan hazir" demeden once rota GERCEKTEN cizilir: ayni motor
// (buildRoute), ayni mufredat. Kullanici verisi yok -- yalniz sinav, alan,
// gunluk ayirabildigi sure ve sinav yili. Kayittan sonra kurulum bu
// cevaplarla devam eder, kullanici ayni seyi iki kez secmez.
import { buildRoute } from "../../lib/routeEngine.js";
import { getSubjectsForExam } from "../../data/curriculum.js";

/** Gunluk sure secenekleri. Soru karsiligi hedef ekranindaki olcekle ayni (50 soru = 1 saat). */
export const PREVIEW_DAILY_OPTIONS = Object.freeze([
  { id: "h1", hours: 1, questions: 50, label: "1 saat" },
  { id: "h2", hours: 2, questions: 100, label: "2 saat" },
  { id: "h3", hours: 3, questions: 150, label: "3 saat" },
  { id: "h4", hours: 4, questions: 200, label: "4+ saat" },
]);

/** Haziran sinavi: kurulumdaki sinav tarihiyle ayni gun (15 Haziran). */
export function previewExamDate(year) {
  return new Date(Number(year), 5, 15);
}

function daysBetween(from, to) {
  return Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
}

/**
 * @returns null (eksik girdi) ya da
 *  { weeksLeft, topics, firstStops: [{ key, subject, subjectLabel, topic, minutes, reason }] }
 */
export function buildRoutePreview({ examType, field = null, dailyQuestions, examYear, now = new Date() } = {}) {
  if (!examType || !dailyQuestions || !examYear) return null;
  const pool = getSubjectsForExam(examType, field || undefined);
  if (!pool.length) return null;

  const route = buildRoute({
    pool,
    dailyQuestionGoal: dailyQuestions,
    daysLeft: daysBetween(now, previewExamDate(examYear)),
    examType,
    now,
    studyLogDataState: "ready",
  });

  // Ilk hafta yarim olabilir (hafta ortasi): ilk iki haftadan, ayni konunun
  // parcalari tekrarlanmadan ilk dort durak.
  const seen = new Set();
  const firstStops = [];
  for (const week of route.weeks.slice(0, 2)) {
    for (const stop of week.stops || []) {
      if (stop.isReview) continue;
      const id = `${stop.subject}|${stop.topic}`;
      if (seen.has(id)) continue;
      seen.add(id);
      firstStops.push({
        key: stop.logicalStopKey || id,
        subject: stop.subject,
        subjectLabel: stop.subjectLabel,
        topic: stop.topic,
        minutes: Math.round(Number(stop.cost?.minutes) || 0),
        reason: stop.insight?.reasonText || null,
      });
      if (firstStops.length >= 4) break;
    }
    if (firstStops.length >= 4) break;
  }

  return {
    weeksLeft: route.weeksLeft,
    topics: route.totals?.topics || 0,
    firstStops,
  };
}
