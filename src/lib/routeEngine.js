import { estimateWeeklyCapacity, rampedCapacity } from "../domain/route/capacity.js";
import { estimateTopicCost, priorityScoreDetails } from "../domain/route/topicCost.js";
import { scheduleWeeks, weeksUntilExam } from "../domain/route/scheduler.js";
import { computeDebt, capDebt, distributeDebt, debtInWeeks } from "../domain/route/debt.js";
import { reviewStatus, reviewCost, reviewPriority } from "../domain/route/retention.js";
import { topicsNeededForNet } from "../domain/route/netEstimate.js";
import { decorateScheduledRoute, createRouteRevision } from "../domain/route/routeIdentity.js";
import { attachStopInsights, buildRouteIntelligence } from "../domain/route/routeIntelligence.js";
import { startOfWeekTR, dateKey } from "./dateUtils.js";
import { personalPace, minutesPerQuestionFor } from "../domain/route/personalPace.js";
import { missingPrerequisites } from "../domain/route/prerequisites.js";
import { wrongBoost, wrongReviewQuestions, WRONG_REVIEW_MIN_DUE } from "../domain/route/wrongSignal.js";
import { addWeeklyReviews } from "../domain/route/weeklyReview.js";
import { topicShares } from "../domain/route/topicShares.js";
import { effectiveAccuracy } from "../domain/route/effectiveAccuracy.js";

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
  topicFeel = {},            // { ders: { konu: "easy"|"ok"|"hard" } } son geri bildirim
  habitLoad = null,          // { questionsPerWeek, minutesPerWeek } gunluk rutinlerin haftalik yuku
  subjectWeakness = {},      // { ders: 1..1.6 } denemeden orantili (trialWeakness)
  wrongsByTopic = {},        // { ders: { konu: { open, due } } } yanlis defteri (wrongSignal)
  targetReached = false,     // son net hedefte: hedefi koruma modu
} = {}) {
  const weeksLeft = weeksUntilExam(daysLeft);
  const baseCapacity = estimateWeeklyCapacity(
    studyLogs, dailyQuestionGoal, now, { dataState: studyLogDataState },
  );
  // Gunluk rutin (paragraf, problem...) rota butcesinin ICINDE: haftalik
  // yuku dusulur, yoksa ogrenci rutin + tam rota ile asiri yuklenir.
  const ramped = rampedCapacity(baseCapacity, pausedWeeks);
  const capacity = habitLoad?.questionsPerWeek > 0 ? {
    ...ramped,
    questionsPerWeek: Math.max(10, ramped.questionsPerWeek - habitLoad.questionsPerWeek),
    minutesPerWeek: Math.max(30, ramped.minutesPerWeek - (habitLoad.minutesPerWeek || 0)),
    habitLoad,
  } : ramped;
  // Kisinin kendi hizi: durak sureleri "35 dk" dediginde gercekten 35 dk olsun.
  const pace = personalPace(studyLogs);

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
    // Konu payi gercek OSYM sikligindan (topicShares); yoksa esit pay.
    const shares = topicShares({ ...subject, questionCount: subjectWeight });
    const equalShare = subjectWeight / Math.max(1, subject.topics?.length || 1);

    // On kosul artik mufredat sirasi DEGIL: yalniz gercek zincirler
    // (prerequisites.js). Mufredat sirasini dayatmak hic kaydi olmayan
    // ogrenciye dersleri bastan sona sirayla veriyordu.

    for (const t of subject.topics || []) {
      const name = typeof t === "string" ? t : t.name;
      if (!name) continue;
      totalCount += 1;

      const rawTp = prog[name] || {};
      const q = rawTp.total_questions || 0;
      const feel = topicFeel?.[subject.key]?.[name];
      // Dogru sayisi girilmemisse dogruluk "bilinmiyor" (effectiveAccuracy);
      // maliyet, ustalik ve hafiza bu etkin degerle hesaplanir.
      const { acc, known: accuracyKnown } = effectiveAccuracy({ q, correct: rawTp.correct_count, feel });
      const tp = accuracyKnown || q <= 0 ? rawTp : { ...rawTp, correct_count: Math.round((q * acc) / 100) };
      const neglectedDays = tp.last_studied_at
        ? Math.max(0, Math.round((now - new Date(tp.last_studied_at)) / 86400000))
        : 0;

      const missingPrereqs = missingPrerequisites(subject.key, name, progressByKey);
      const unpreparedBefore = missingPrereqs.length;

      const entry = {
        subject: subject.key,
        subjectLabel: subject.label,
        color: subject.color,
        topic: name,
        q,
        acc,
        neglectedDays,
      };

      const topicShare = shares[name] ?? equalShare;
      const cost = estimateTopicCost(
        entry,
        { ...subject, questionCount: subjectWeight, topicShares: shares },
        examType === "lgs" ? "LGS" : "TYT",
        { pace, feel: topicFeel?.[subject.key]?.[name] },
      );
      const topicHasAccuracyGap = accuracyKnown && hasTopicAccuracyGap({ q, acc });

      const wrongs = wrongsByTopic?.[subject.key]?.[name] || null;

      if (cost.done) {
        masteredCount += 1;

        // Ustalasilmis konuda zamani gelmis yanlislar: kisa yanlis tekrari.
        if ((wrongs?.due || 0) >= WRONG_REVIEW_MIN_DUE) {
          const wq = wrongReviewQuestions(wrongs.due);
          items.push({
            ...entry,
            isReview: true,
            reviewCycle: "wrongs",
            cost: {
              questions: wq,
              minutes: Math.round(wq * (minutesPerQuestionFor(pace, subject.key, 1.2) ?? 2)),
              mastery: "review",
              difficulty: cost.difficulty,
              yield: topicShare,
              done: false,
            },
            unpreparedBefore: 0,
            // Tekrar zamani gelmis yanlis, unutmaya yuz tutmus konudan once gelir.
            score: reviewPriority({ retention: 0.5, subjectWeight: topicShare, daysLeft: daysLeft ?? 180 }) * 1.15,
            reasonCodes: ["WRONG_REVIEW"],
            scoreComponents: { wrongsDue: wrongs.due, wrongsOpen: wrongs.open, examShare: Math.round(topicShare * 100) / 100 },
            dataConfidence: "high",
          });
          reviewCount += 1;
        }

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
              minutes: Math.round(rCost * (minutesPerQuestionFor(pace, subject.key, 0.875) ?? 1.4)),
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
              expectedNetGain: topicShare,
              effortQuestions: rCost,
              retention: rs.retention,
              examShare: Math.round(topicShare * 100) / 100,
              reviewDaysSince: rs.daysSince,
            },
            dataConfidence: q >= 20 ? "high" : "medium",
          });
          reviewCount += 1;
        }
        continue;
      }

      const weakFactor = subjectWeakness[subject.key] || null;
      const priority = priorityScoreDetails({
        cost,
        neglectedDays,
        daysLeft: daysLeft ?? 180,
        // Orantili carpan varsa eski "ilk 3 ders" isareti ona yol verir.
        isWeakArea: (weakFactor == null && weakSet.has(subject.key)) || topicHasAccuracyGap,
        unpreparedBefore,
        weakFactor,
      });
      // Bekleyen yanlislar oncelige: oturmamis konu one gelir.
      const wb = wrongBoost(wrongs);
      priority.score = Math.round(priority.score * wb * 100) / 100;
      const reasonCodes = [];
      if ((wrongs?.open || 0) >= 3) reasonCodes.push("WRONG_BACKLOG");
      if ((weakFactor || 1) >= 1.15 || (weakFactor == null && weakSet.has(subject.key)) || topicHasAccuracyGap) {
        reasonCodes.push("LOW_ACCURACY");
      }
      // Baslanmis ama bitmemis konu: zayiflik sinyalinden sonra, digerlerinden once.
      if (q >= 10) reasonCodes.push("FINISH_TOPIC");
      if (neglectedDays >= 14) reasonCodes.push("NEGLECTED");
      // Gercek siklikla neredeyse her konunun getirisi 0.5'i asiyor; etiket
      // yalniz dersin ortalamasindan belirgin cok soru getiren konuya.
      if (topicShare >= equalShare * 1.5) reasonCodes.push("HIGH_EXAM_WEIGHT");

      if (unpreparedBefore > 0) reasonCodes.push("PREREQUISITE");
      if (!reasonCodes.length) reasonCodes.push("ROUTE_COMMITMENT");
      items.push({
        ...entry,
        isReview: false,
        cost,
        unpreparedBefore,
        score: priority.score,
        // Durak aciklamasi "once Limit" diyebilsin diye eksik on kosullar.
        scoreComponents: { ...priority.components, missingPrerequisites: missingPrereqs },
        reasonCodes,
        dataConfidence: q >= 20 ? "high" : q >= 5 ? "medium" : "low",
      });
    }
  }

  // HEDEFI KORUMA MODU: hedef nete ulasan ogrenci icin en kiymetli is
  // kazanileni korumak. Tekrar ve yanlis duraklari one, yeni konu geriye.
  if (targetReached) {
    for (const item of items) {
      item.score = Math.round(item.score * (item.isReview ? 1.6 : 0.8) * 100) / 100;
      if (item.isReview && !item.reasonCodes.includes("TARGET_KEEP")) item.reasonCodes.push("TARGET_KEEP");
    }
  }

  items.sort((a, b) => b.score - a.score);

  const { weeks, overflow } = scheduleWeeks(items, capacity, weeksLeft, { daysLeft });
  const stamped = addWeeklyReviews(stampWeekDates(weeks, now), {
    minutesPerQuestion: (key) => minutesPerQuestionFor(pace, key, 1) ?? 1.6,
  });
  const scheduled = attachStopInsights(decorateScheduledRoute(stamped, { examType }));
  const revision = createRouteRevision({
    weeks: scheduled,
    examType,
    capacity,
    weekStart: scheduled[0]?.weekStart || dateKey(startOfWeekTR(now)),
  });

  const remainingQuestions = items.reduce((n, i) => n + i.cost.questions, 0);
  const overflowQuestions = overflow.reduce((n, i) => n + i.cost.questions, 0);
  // Konular oturum parcalarina bolunuyor; yetismeyen KONU sayisi tekil.
  const overflowTopics = new Set(overflow.map((i) => `${i.subject}|${i.topic}|${i.reviewCycle || ""}`)).size;
  const shortfall = {
    topics: overflowTopics,
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
    pace,
    mode: targetReached ? "keep" : "reach",
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

function hasTopicAccuracyGap({ q, acc }) {
  return Number(q) >= 5 && Number(acc) < 60;
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
