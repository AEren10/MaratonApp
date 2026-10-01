import { differenceInDays } from "./dateUtils";
import { TYT_SUBJECTS, getSubjectByKey } from "../themes/subjects";
import { getAllSubjects } from "../domain/trial/trialTypes";
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
  DISCOVERY: "discovery",
};

function subjectLabel(key) {
  const curriculum = getSubjectByKey(key);
  if (curriculum) return curriculum.label;
  const tyt = TYT_SUBJECTS[key];
  if (tyt) return tyt.label;
  const trial = getAllSubjects(C).find((s) => s.key === key);
  if (trial) return trial.name;
  return key;
}

export function generateNudges({ recentStudy, trials, streak, weakAreas, todayTotal = 0, dailyGoal = 0 }) {
  const nudges = [];
  const today = new Date();

  // 1) İhmal edilen dersler
  const studyDays = {};
  for (const [key, lastDate] of Object.entries(recentStudy || {})) {
    const days = differenceInDays(today, new Date(lastDate));
    studyDays[key] = days;
    // getSubjectByKey TÜM sınav tiplerini kapsar; TYT_SUBJECTS yalnızca TYT.
    // Öncekiyle LGS anahtarları (lgs_*) hiçbir zaman eşleşmiyordu, yani LGS
    // kullanıcısı "ihmal edilen ders" uyarısını HİÇ almıyordu.
    const subject = getSubjectByKey(key);
    if (!subject) continue;

    if (days >= 14) {
      nudges.push({
        type: NUDGE_TYPES.NEGLECTED,
        priority: "high",
        subject: key,
        icon: "alertCircle",
        message: `${subject.label} seni bekliyor: ${days} gündür açılmadı. Kısa bir durakla dönebilirsin.`,
        detail: "Uzun aradan sonra küçük başlamak en iyisi. Bugün 15 soru yeter.",
        actionLabel: "Çalışmaya başla",
        color: "amber",
      });
    } else if (days >= 7) {
      nudges.push({
        type: NUDGE_TYPES.NEGLECTED,
        priority: "medium",
        subject: key,
        icon: "clock",
        message: `${subject.label} ${days} gündür boşta. Programına bir durak ekleyelim mi?`,
        detail: "Düzenli tekrar başarının anahtarı. Bugün kısa bir oturum yeter.",
        actionLabel: "Plana ekle",
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
            message: `${subjectLabel(key)} son denemede ${drop.toFixed(1).replace(".", ",")} net geride. Nereden kaybettiğini birlikte bulalım.`,
            detail: "Tek deneme her şeyi söylemez. Hangi konudan geldiğine bakmak yeter.",
            actionLabel: "Nerede kaybettim?",
            color: "amber",
          });
        } else if (drop >= 3) {
          nudges.push({
            type: NUDGE_TYPES.NET_DROP,
            priority: "medium",
            subject: key,
            icon: "trendDown",
            message: `${subjectLabel(key)} biraz geriledi (${drop.toFixed(1).replace(".", ",")} net). Küçük dalgalanmalar normal.`,
            detail: "Küçük düşüşler normal ama takip etmen önemli.",
            actionLabel: "Konuya bak",
            color: "amber",
          });
        }

        if (latestNet - prevNet >= 5) {
          nudges.push({
            type: NUDGE_TYPES.IMPROVEMENT,
            priority: "low",
            subject: key,
            icon: "trendUp",
            message: `${subjectLabel(key)} netin ${(latestNet - prevNet).toFixed(1).replace(".", ",")} arttı. Böyle devam!`,
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
      message: `${subjectLabel(key)} doğruluğun %${acc}. Az ama dikkatli soru, çok soru kadar kazandırır.`,
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
        message: `Son günlerde hep ${subjectLabel(fresh[0])}. Başka bir derse uğramak iyi gelir.`,
        detail: `${stale.slice(0, 2).map(subjectLabel).join(" ve ")} bir süredir açılmadı.`,
        actionLabel: "Planı güncelle",
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
      message: `Bugün ${todayTotal} soru çözdün. Kısa bir durakla hedefe yaklaşırsın.`,
      detail: `Hedefe ${remaining} soru kaldı.`,
      actionLabel: "Hızlı çalış",
      color: "amber",
    });
  }

  // 6) Streak riski
  if (streak && streak > 3) {
    nudges.push({
      type: NUDGE_TYPES.STREAK_RISK,
      priority: "medium",
      icon: "flame",
      message: `${streak} günlük serin sürüyor. Bugün tek durak yeter.`,
      detail: "Bugün en az 20 soru çözerek serini koru.",
      actionLabel: "Hızlı çalış",
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
        message: `Bugün ${subjectLabel(key)} için iyi bir gün.`,
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
