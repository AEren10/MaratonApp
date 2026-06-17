import { differenceInDays } from "date-fns";
import { TYT_SUBJECTS } from "../themes/subjects";
import { getAllSubjects } from "../screens/trial/trialTypes";
import { C } from "../themes/tokens";

export const NUDGE_TYPES = {
  NEGLECTED: "neglected",
  NET_DROP: "net_drop",
  OVER_FOCUS: "over_focus",
  TEMPO_LOW: "tempo_low",
  STREAK_RISK: "streak_risk",
  PERSONAL_RECORD: "personal_record",
  IMPROVEMENT: "improvement",
  WEAK_AREA: "weak_area",
  SUGGEST: "suggest",
};

function trialSubjectLabel(key) {
  const found = getAllSubjects(C).find((s) => s.key === key);
  return found?.name || key;
}

function subjectLabel(key) {
  return TYT_SUBJECTS[key]?.label || trialSubjectLabel(key) || key;
}

export function generateNudges({ recentStudy, trials, streak, weakAreas, todayTotal = 0, dailyGoal = 0 }) {
  const nudges = [];
  const today = new Date();

  // 1) İhmal edilen dersler
  const studyDays = {};
  for (const [key, lastDate] of Object.entries(recentStudy || {})) {
    const days = differenceInDays(today, new Date(lastDate));
    studyDays[key] = days;
    const subject = TYT_SUBJECTS[key];
    if (!subject) continue;

    if (days >= 14) {
      nudges.push({
        type: NUDGE_TYPES.NEGLECTED,
        priority: "high",
        subject: key,
        icon: "alertCircle",
        message: `${days} gündür ${subject.label} çalışmadın!`,
        detail: "Bu kadar ara vermek konuları unutturur. Bugün en az 15 soru çöz.",
        actionLabel: "Çalışmaya Başla",
        color: "red",
      });
    } else if (days >= 7) {
      nudges.push({
        type: NUDGE_TYPES.NEGLECTED,
        priority: "medium",
        subject: key,
        icon: "clock",
        message: `${subject.label}'i ${days} gündür açmadın`,
        detail: "Düzenli tekrar başarının anahtarı. Bugün kısa bir oturum yeter.",
        actionLabel: "Plana Ekle",
        color: "amber",
      });
    }
  }

  // 2) Net düşüşü + gelişim
  if (trials && trials.length >= 2) {
    const latest = trials[0];
    const sameTypePrev = trials.slice(1).find((t) => t.trialType === latest.trialType);

    if (sameTypePrev) {
      const subjectKeys = new Set([
        ...Object.keys(latest.subjects || {}),
        ...Object.keys(sameTypePrev.subjects || {}),
      ]);

      for (const key of subjectKeys) {
        const latestNet = latest.subjects?.[key]?.net ?? 0;
        const prevNet = sameTypePrev.subjects?.[key]?.net ?? 0;
        const drop = prevNet - latestNet;

        if (drop >= 5) {
          nudges.push({
            type: NUDGE_TYPES.NET_DROP,
            priority: "high",
            subject: key,
            icon: "trendDown",
            message: `${trialSubjectLabel(key)}'te ${drop.toFixed(1)} net düştün`,
            detail: "Bu derste yoğunlaşman gerek. Zayıf konularını analiz et.",
            actionLabel: "Analiz Et",
            color: "red",
          });
        } else if (drop >= 3) {
          nudges.push({
            type: NUDGE_TYPES.NET_DROP,
            priority: "medium",
            subject: key,
            icon: "trendDown",
            message: `${trialSubjectLabel(key)}'te ${drop.toFixed(1)} net düşüş`,
            detail: "Küçük düşüşler normal ama takip etmen önemli.",
            actionLabel: "Konu Analizi",
            color: "amber",
          });
        }

        if (latestNet - prevNet >= 5) {
          nudges.push({
            type: NUDGE_TYPES.IMPROVEMENT,
            priority: "low",
            subject: key,
            icon: "trendUp",
            message: `${trialSubjectLabel(key)}'te +${(latestNet - prevNet).toFixed(1)} net artış!`,
            detail: "Harika gidiyorsun, bu tempoyu koru!",
            color: "green",
          });
        }
      }
    }
  }

  // 3) Zayıf alanlar — weakAreas: { key: acc% }
  const weakEntries = Object.entries(weakAreas || {})
    .filter(([, acc]) => acc < 50)
    .sort(([, a], [, b]) => a - b);

  for (const [key, acc] of weakEntries.slice(0, 2)) {
    const alreadyMentioned = nudges.some((n) => n.subject === key);
    if (alreadyMentioned) continue;
    nudges.push({
      type: NUDGE_TYPES.WEAK_AREA,
      priority: acc < 30 ? "high" : "medium",
      subject: key,
      icon: "target",
      message: `${subjectLabel(key)}'te doğruluk oranın %${acc}`,
      detail: "Bu alanda daha fazla pratik yapman gerekiyor.",
      actionLabel: "Çalış",
      color: acc < 30 ? "red" : "amber",
    });
  }

  // 4) Aşırı odaklanma — bir derse çok, diğerlerine az
  const studiedKeys = Object.keys(recentStudy || {});
  if (studiedKeys.length >= 3) {
    const fresh = studiedKeys.filter((k) => (studyDays[k] || 99) <= 2);
    const stale = studiedKeys.filter((k) => (studyDays[k] || 99) >= 5);
    if (fresh.length === 1 && stale.length >= 2) {
      nudges.push({
        type: NUDGE_TYPES.OVER_FOCUS,
        priority: "medium",
        subject: fresh[0],
        icon: "eyeOff",
        message: `Sadece ${subjectLabel(fresh[0])} çalışıyorsun`,
        detail: `${stale.slice(0, 2).map(subjectLabel).join(" ve ")} ihmal ediliyor. Dengeli çalış!`,
        actionLabel: "Plan Güncelle",
        color: "purple",
      });
    }
  }

  // 5) Tempo düşük — günlük hedefin altında
  if (dailyGoal > 0 && todayTotal > 0 && todayTotal < dailyGoal * 0.3) {
    const remaining = dailyGoal - todayTotal;
    nudges.push({
      type: NUDGE_TYPES.TEMPO_LOW,
      priority: "medium",
      icon: "zap",
      message: `Bugün henüz ${todayTotal} soru çözdün`,
      detail: `Hedefe ${remaining} soru daha var. Hızlan!`,
      actionLabel: "Hızlı Çalış",
      color: "amber",
    });
  }

  // 6) Streak riski
  if (streak && streak > 3) {
    nudges.push({
      type: NUDGE_TYPES.STREAK_RISK,
      priority: "medium",
      icon: "flame",
      message: `${streak} günlük serini kaybetme!`,
      detail: "Bugün en az 20 soru çözerek serini koru.",
      actionLabel: "Hızlı Çalış",
      color: "coral",
    });
  }

  // 7) Proaktif öneri — en zayıf çalışılmayan konu
  const allStale = Object.entries(studyDays)
    .filter(([, d]) => d >= 3 && d < 7)
    .sort(([, a], [, b]) => b - a);
  if (allStale.length > 0 && nudges.filter((n) => n.priority === "high").length === 0) {
    const [key] = allStale[0];
    const alreadyMentioned = nudges.some((n) => n.subject === key);
    if (!alreadyMentioned) {
      nudges.push({
        type: NUDGE_TYPES.SUGGEST,
        priority: "low",
        subject: key,
        icon: "lightbulb",
        message: `${subjectLabel(key)} çalışsan iyi olur`,
        detail: `${studyDays[key]} gündür bu derse bakmadın. Kısa bir tekrar yap.`,
        actionLabel: "Başla",
        color: "blue",
      });
    }
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return nudges.slice(0, 8);
}
