import { estimateWeeklyCapacity, rampedCapacity } from "../domain/route/capacity";
import { estimateTopicCost, priorityScore } from "../domain/route/topicCost";
import { scheduleWeeks, weeksUntilExam } from "../domain/route/scheduler";
import { computeDebt, distributeDebt, debtInWeeks } from "../domain/route/debt";
import { reviewStatus, reviewCost, reviewPriority } from "../domain/route/retention";
import { topicsNeededForNet } from "../domain/route/netEstimate";
import { startOfWeekTR, dateKey } from "./dateUtils";

// KİŞİYE ÖZEL ROTA MOTORU
//
// roadmapEngine.js'in yerini alır. Farkı:
//   - hafta bütçesi kullanıcının GERÇEK temposundan çıkar (medyan, son 4 hafta)
//   - konular eşit değil: zorluk × sınav ağırlığı × ustalık açığı ile maliyet
//   - 12 hafta sınırı yok, sınava kalan süre kadar planlar
//   - borç kavramı var (yapılmayan iş kaybolmuyor, dağıtılıyor)
//   - ara verme/dondurma sonrası kapasite kademeli geri geliyor
//   - senaryo: "haftada X soru çözersem nereye varırım"
//
// TASARIM NOTU: AKIŞ 2'deki ekranlar bu çıktının parçalarına doğrudan oturur —
//   Rota Detay        → route.weeks[0]
//   Rotanın tamamı    → route.weeks
//   Durak Detayı      → week.stops[i]
//   Ara Verme/Donduruldu → buildRoute({ pausedWeeks })
//   Senaryolar        → simulateScenario()
//   Bölüm Eşiği       → thresholdGap()
//   Rotayı Yeniden Çiz → buildRoute() yeniden çağır

export function buildRoute({
  pool = [],                 // [{ key, label, color, topics: [], weight }]
  progressByKey = {},        // topic_progress
  studyLogs = [],            // kapasite için geçmiş
  dailyQuestionGoal = 20,
  daysLeft = null,
  weakSubjectKeys = [],
  pausedWeeks = 0,           // ara verildiyse kaç hafta
  now = new Date(),
} = {}) {
  const weeksLeft = weeksUntilExam(daysLeft);
  const baseCapacity = estimateWeeklyCapacity(studyLogs, dailyQuestionGoal, now);
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

      const cost = estimateTopicCost(entry, subjectWeight);

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
              yield: subjectWeight,
              done: false,
            },
            unpreparedBefore: 0, // tekrar sıraya tabi değil
            score: reviewPriority({
              retention: rs.retention,
              subjectWeight,
              daysLeft: daysLeft ?? 180,
            }),
          });
          reviewCount += 1;
        }
        continue;
      }

      items.push({
        ...entry,
        isReview: false,
        cost,
        unpreparedBefore,
        score: priorityScore({
          cost,
          neglectedDays,
          daysLeft: daysLeft ?? 180,
          isWeakArea: weakSet.has(subject.key),
          unpreparedBefore,
        }),
      });
    }
  }

  items.sort((a, b) => b.score - a.score);

  const { weeks, overflow } = scheduleWeeks(items, capacity, weeksLeft);
  const stamped = stampWeekDates(weeks, now);

  const remainingQuestions = items.reduce((n, i) => n + i.cost.questions, 0);
  const overflowQuestions = overflow.reduce((n, i) => n + i.cost.questions, 0);

  return {
    capacity,
    weeksLeft,
    weeks: stamped,
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
    shortfall: {
      topics: overflow.length,
      questions: overflowQuestions,
      extraQuestionsPerWeek: weeksLeft > 0 ? Math.ceil(overflowQuestions / weeksLeft) : 0,
    },
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
 * SENARYO — "haftada X soru çözersem ne olur?"
 * Tasarımda AKIŞ 2 · Senaryolar.
 */
export function simulateScenario(route, questionsPerWeek) {
  const perWeek = Math.max(1, questionsPerWeek);
  const need = route.totals.remainingQuestions;
  const weeksNeeded = Math.ceil(need / perWeek);
  const fits = weeksNeeded <= route.weeksLeft;
  return {
    questionsPerWeek: perWeek,
    weeksNeeded,
    weeksLeft: route.weeksLeft,
    fits,
    // Sığmıyorsa kaç hafta eksik / sığıyorsa kaç hafta pay kalıyor
    weeksDelta: route.weeksLeft - weeksNeeded,
    requiredPerWeek: route.weeksLeft > 0 ? Math.ceil(need / route.weeksLeft) : need,
    dailyEquivalent: Math.ceil(perWeek / 7),
  };
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

export { computeDebt, distributeDebt, debtInWeeks };
