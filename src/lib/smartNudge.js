import { differenceInDays } from "date-fns";
import { TYT_SUBJECTS } from "../themes/subjects";
import { getAllSubjects } from "../screens/trial/trialTypes";
import { C } from "../themes/tokens";

/**
 * Akilli uyari/oneri sistemi.
 *
 * Calisma verilerine bakarak ogrenciye
 * motivasyon veya uyari mesajlari uretir.
 */

const NUDGE_TYPES = {
  NEGLECTED: "neglected",
  NET_DROP: "net_drop",
  OVER_FOCUS: "over_focus",
  TEMPO_LOW: "tempo_low",
  STREAK_RISK: "streak_risk",
  PERSONAL_RECORD: "personal_record",
  IMPROVEMENT: "improvement",
};

// Gives a display label for a trial subject key (tyt_turkce → "Türkçe")
function trialSubjectLabel(key) {
  const found = getAllSubjects(C).find((s) => s.key === key);
  return found?.name || key;
}

export function generateNudges({ recentStudy, trials, streak, weakAreas }) {
  const nudges = [];
  const today = new Date();

  // 1) Ihmal edilen dersler — recentStudy uses curriculum keys (turkce, matematik...)
  for (const [key, lastDate] of Object.entries(recentStudy || {})) {
    const days = differenceInDays(today, new Date(lastDate));
    const subject = TYT_SUBJECTS[key];
    if (!subject) continue;

    if (days >= 7) {
      nudges.push({
        type: NUDGE_TYPES.NEGLECTED,
        priority: days > 14 ? "high" : "medium",
        subject: key,
        message: `${days} gundur ${subject.label} calismadin. Bugun 15 soru coz!`,
        actionLabel: "Plana Ekle",
      });
    }
  }

  // 2) Net dususu — trials use trial keys (tyt_turkce, ayt_matematik...).
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

        if (drop >= 3) {
          nudges.push({
            type: NUDGE_TYPES.NET_DROP,
            priority: drop >= 5 ? "high" : "medium",
            subject: key,
            message: `${trialSubjectLabel(key)}'te son denemede ${drop.toFixed(1)} net dusus var.`,
            actionLabel: "Konu Analizi",
          });
        }

        if (latestNet - prevNet >= 5) {
          nudges.push({
            type: NUDGE_TYPES.IMPROVEMENT,
            priority: "low",
            subject: key,
            message: `${trialSubjectLabel(key)}'te +${(latestNet - prevNet).toFixed(1)} net artis, harika!`,
          });
        }
      }
    }
  }

  // 3) Streak riski
  if (streak && streak > 3) {
    nudges.push({
      type: NUDGE_TYPES.STREAK_RISK,
      priority: "medium",
      message: `${streak} gunluk serini kaybetme! Bugun en az 20 soru coz.`,
      actionLabel: "Hizli Calis",
    });
  }

  // Oncelik sirasina gore sirala
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  nudges.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return nudges.slice(0, 5);
}
