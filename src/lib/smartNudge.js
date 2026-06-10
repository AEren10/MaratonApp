import { differenceInDays } from "date-fns";
import { TYT_SUBJECTS } from "../themes/subjects";

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

export function generateNudges({ recentStudy, trials, streak, weakAreas }) {
  const nudges = [];
  const today = new Date();

  // 1) Ihmal edilen dersler
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

  // 2) Net dususu
  if (trials && trials.length >= 2) {
    const latest = trials[0];
    const prev = trials[1];

    for (const key of Object.keys(TYT_SUBJECTS)) {
      const latestNet = latest.subjects?.[key]?.net ?? 0;
      const prevNet = prev.subjects?.[key]?.net ?? 0;
      const drop = prevNet - latestNet;

      if (drop >= 3) {
        nudges.push({
          type: NUDGE_TYPES.NET_DROP,
          priority: drop >= 5 ? "high" : "medium",
          subject: key,
          message: `${TYT_SUBJECTS[key].label}'te son denemede ${drop} net dusus var.`,
          actionLabel: "Konu Analizi",
        });
      }

      if (latestNet - prevNet >= 5) {
        nudges.push({
          type: NUDGE_TYPES.IMPROVEMENT,
          priority: "low",
          subject: key,
          message: `${TYT_SUBJECTS[key].label}'te +${latestNet - prevNet} net artis, harika!`,
        });
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
