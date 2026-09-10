import { estimateWeeklyCapacity, rampedCapacity } from "../domain/route/capacity.js";
import { estimateTopicCost, priorityScoreDetails } from "../domain/route/topicCost.js";
import { scheduleWeeks, weeksUntilExam } from "../domain/route/scheduler.js";
import { computeDebt, capDebt, distributeDebt, debtInWeeks } from "../domain/route/debt.js";
import { reviewStatus, reviewCost, reviewPriority } from "../domain/route/retention.js";
import { topicsNeededForNet } from "../domain/route/netEstimate.js";
import { decorateScheduledRoute, createRouteRevision } from "../domain/route/routeIdentity.js";
import { attachStopInsights, buildRouteIntelligence } from "../domain/route/routeIntelligence.js";
import { startOfWeekTR, dateKey } from "./dateUtils.js";

// KİŞİYE ÖZEL ROTA MOTORU
//
// roadmapEngine.js'in yerini alır. Farkı:
//   - hafta bütçesi kullanıcının GERÇEK temposundan çıkar (medyan, son 4 hafta)
//   - konular eşit değil: zorluk × sınav ağırlığı × ustalık açığı ile maliyet
//   - 12 hafta sınırı yok, sınava kalan süre kadar planlar
//   - borç kavramı var (yapılmayan iş kaybolmuyor, dağıtılıyor)
//   - ara verme/dondurma sonrası kapasite kademeli geri geliyor
//   - senaryo: "%90/%100/%110 tempo ile sınav günü netim nereye gelir"
//
// TASARIM NOTU: AKIŞ 2'deki ekranlar bu çıktının parçalarına doğrudan oturur —
//   Rota Detay        → route.weeks[0]
//   Rotanın tamamı    → route.weeks
//   Durak Detayı      → week.stops[i]
//   Ara Verme/Donduruldu → buildRoute({ pausedWeeks })
//   Senaryolar        → domain/forecast/tempoScenario
//   Bölüm Eşiği       → thresholdGap()
//   Rotayı Yeniden Çiz → buildRoute() yeniden çağır

export function buildRoute({
  pool = [],                 // [{ key, label, color, topics: [], weight }]
  progressByKey = {},        // topic_progress
  studyLogs = [],            // kapasite için geçmiş
  dailyQuestionGoal = 20,
  daysLeft = null,
  weakSubjectKeys = [],
  pausedWeeks = null,        // dönüşten sonra kaçıncı toparlanma haftası
  examType = "unknown",
  now = new Date(),
  studyLogDataState = "ready",
} = {}) {
  const weeksLeft = weeksUntilExam(daysLeft);
  const baseCapacity = estimateWeeklyCapacity(
    studyLogs, dailyQuestionGoal, now, { dataState: studyLogDataState },
  );
  const capacity = rampedCapacity(baseCapacity, pausedWeeks);

  const weakSet = new Set(weakSubjectKeys);
  const items = [];
  let masteredCount = 0;
  let totalCount = 0;
  let reviewCount = 0;

  for (const subject of pool) {
    const prog = progressByKey[subject.key] || {};
    // Ağırlık = dersin sınavdaki SORU SAYISI. Alan adı `questionCount`;
    // `weight` diye bir alan curriculum'da YOK, o yüzden her ders 10 varsayılıyor
    // ve topicCost'taki "sınav ağırlığı" mantığı tamamen ölüydü:
    // 40 soruluk Matematik ile 5 soruluk Felsefe aynı getiriyi alıyordu.
    const subjectWeight = Number(subject.questionCount ?? subject.weight) || 10;
    const topicShare = subjectWeight / Math.max(1, subject.topics?.length || 1);

    // Müfredat sırası = öğretim sırası. Bir konudan ÖNCE gelen kaç konu
    // henüz hazır değil, onu sayıyoruz; priorityScore bunu ağırlık olarak
    // kullanıp sırayı bozan seçimleri geri plana atıyor.
    let unpreparedSoFar = 0;

    for (const t of subject.topics || []) {
      const name = typeof t === "string" ? t : t.name;
      if (!name) continue;
      totalCount += 1;

      const tp = prog[name] || {};
      const q = tp.total_questions || 0;
      const acc = q > 0 ? Math.round(((tp.correct_count || 0) / q) * 100) : 0;
      const neglectedDays = tp.last_studied_at
        ? Math.max(0, Math.round((now - new Date(tp.last_studied_at)) / 86400000))
        : 0;

      const unpreparedBefore = unpreparedSoFar;
      // Bu konu "hazır" sayılır mı — en az bir miktar çalışılmışsa evet.
      if (q < 10) unpreparedSoFar += 1;

      const entry = {
        subject: subject.key,
        subjectLabel: subject.label,
        color: subject.color,
        topic: name,
        q,
        acc,
        neglectedDays,
      };

      const cost = estimateTopicCost(
        entry,
        { ...subject, questionCount: subjectWeight },
        examType === "lgs" ? "LGS" : "TYT",
      );

      if (cost.done) {
        masteredCount += 1;

        // USTALAŞMIŞ ≠ SONSUZA KADAR BİLİNİYOR.
        // Unutma eğrisine göre hatırlama eşiğin altına düştüyse konu rotaya
        // TEKRAR olarak geri girer. Maliyeti sıfırdan öğrenmenin çok altında,
        // önceliği ise yüksek: unutulmakta olanı tazelemek, yeniye baştan
        // başlamaktan neredeyse her zaman daha kârlı.
        const rs = reviewStatus(tp, now);
        if (rs.needsReview) {
          const rCost = reviewCost(20, rs.retention);
          items.push({
            ...entry,
            isReview: true,
            relearn: rs.relearn,
            retention: rs.retention,
            memoryStrength: rs.strength,
            cost: {
              questions: rCost,
              minutes: Math.round(rCost * 1.4),
              mastery: "review",
              difficulty: cost.difficulty,
              yield: topicShare,
              done: false,
            },
            unpreparedBefore: 0, // tekrar sıraya tabi değil
            score: reviewPriority({
              retention: rs.retention,
              subjectWeight: topicShare,
              daysLeft: daysLeft ?? 180,
            }),
            reasonCodes: ["REVIEW_DUE"],
            scoreComponents: {
              retention: rs.retention,
              examShare: Math.round(topicShare * 100) / 100,
            },
            dataConfidence: q >= 20 ? "high" : "medium",
          });
          reviewCount += 1;
        }
        continue;
      }

      const priority = priorityScoreDetails({
        cost,
        neglectedDays,
        daysLeft: daysLeft ?? 180,
        isWeakArea: weakSet.has(subject.key),
        unpreparedBefore,
      });
      const reasonCodes = [];
      if (weakSet.has(subject.key)) reasonCodes.push("LOW_ACCURACY");
      if (neglectedDays >= 14) reasonCodes.push("NEGLECTED");
      if (cost.yield >= 0.5) reasonCodes.push("HIGH_EXAM_WEIGHT");
      if (unpreparedBefore > 0) reasonCodes.push("PREREQUISITE");
      if (!reasonCodes.length) reasonCodes.push("ROUTE_COMMITMENT");
      items.push({
        ...entry,
        isReview: false,
        cost,
        unpreparedBefore,
        score: priority.score,
        scoreComponents: priority.components,
        reasonCodes,
        dataConfidence: q >= 20 ? "high" : q >= 5 ? "medium" : "low",
      });
    }
  }

  items.sort((a, b) => b.score - a.score);

  const { weeks, overflow } = scheduleWeeks(items, capacity, weeksLeft, { daysLeft });
  const stamped = stampWeekDates(weeks, now);
  const scheduled = attachStopInsights(decorateScheduledRoute(stamped, { examType }));
  const revision = createRouteRevision({
    weeks: scheduled,
    examType,
    capacity,
    weekStart: scheduled[0]?.weekStart || dateKey(startOfWeekTR(now)),
  });

  const remainingQuestions = items.reduce((n, i) => n + i.cost.questions, 0);
  const overflowQuestions = overflow.reduce((n, i) => n + i.cost.questions, 0);
  const shortfall = {
    topics: overflow.length,
    questions: overflowQuestions,
    extraQuestionsPerWeek: weeksLeft > 0 ? Math.ceil(overflowQuestions / weeksLeft) : 0,
  };
  const intelligence = buildRouteIntelligence({
    capacity,
    items,
    weeks: scheduled,
    overflow,
    shortfall,
    weakSubjectKeys,
    daysLeft,
    studyLogDataState,
  });

  return {
    capacity,
    weeksLeft,
    weeks: scheduled,
    revision,
    overflow,
    totals: {
      topics: totalCount,
      mastered: masteredCount,
      pending: items.length,
      // Tekrar duraklarını ayrı say: "18 yeni konu + 4 tekrar" demek,
      // "22 konu" demekten çok daha anlamlı.
      reviews: reviewCount,
      newTopics: items.length - reviewCount,
      remainingQuestions,
      progress: totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) / 100 : 0,
    },
    // Süreye sığmayan iş — kullanıcıya dürüstçe söylenmeli.
    feasible: overflow.length === 0,
    shortfall,
    intelligence,
  };
}

/** Haftalara gerçek tarih damgası bas — borç hesabı buna dayanıyor. */
function stampWeekDates(weeks, now) {
  const firstMonday = new Date(startOfWeekTR(now));
  return weeks.map((w, i) => {
    const start = new Date(firstMonday.getTime() + i * 7 * 86400000);
    const end = new Date(start.getTime() + 6 * 86400000);
    return { ...w, weekStart: dateKey(start), weekEnd: dateKey(end) };
  });
}

/**
 * BÖLÜM EŞİĞİ — hedef net ile mevcut net arasındaki açık.
 * Tasarımda AKIŞ 2 · Bölüm Eşiği.
 */
export function thresholdGap({
  currentNet = 0,
  targetNet = 0,
  route,
  pool = [],
  progressByKey = {},
  trialType,
}) {
  const gap = Math.max(0, targetNet - currentNet);
  if (gap <= 0) {
    return { currentNet, targetNet, gap: 0, reached: true, topicsNeeded: 0, questionsNeeded: 0, perWeek: 0 };
  }

  // Sabit "her konu 0,6 net" varsayımı YERİNE müfredattan türetiliyor:
  // konunun sınavdaki payı (ders soru sayısı / konu sayısı) × kazanılacak
  // doğruluk × yanlış cezası etkisi. Böylece 40 soruluk Matematik'teki bir
  // konu ile 6 soruluk Din'deki bir konu artık aynı sayılmıyor.
  const need = topicsNeededForNet(pool, progressByKey, gap, trialType);

  return {
    currentNet,
    targetNet,
    gap: Math.round(gap * 100) / 100,
    reached: false,
    topicsNeeded: need.topics,
    questionsNeeded: need.questions,
    perWeek: route?.weeksLeft > 0 ? Math.ceil(need.questions / route.weeksLeft) : need.questions,
    // Tüm konular ustalaşsa bile hedef tutmuyorsa söylenmeli — sessizce
    // ulaşılamaz bir hedef göstermek en zararlı yanlış yönlendirme.
    reachable: need.reachable,
    maxPossibleNet: need.maxPossibleNet,
    topContributors: need.breakdown,
  };
}

export { computeDebt, capDebt, distributeDebt, debtInWeeks };
export { simulateTempoScenario as simulateScenario } from "../domain/forecast/tempoScenario.js";
