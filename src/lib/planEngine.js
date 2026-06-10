import { differenceInDays } from "date-fns";
import { TYT_SUBJECTS } from "../themes/subjects";

/**
 * Gunluk plan olusturma algoritmasi.
 *
 * Girdiler:
 *  - examDate: sinav tarihi
 *  - weakAreas: { [subjectKey]: number } (0-100 arasi basari yuzdesi)
 *  - recentStudy: { [subjectKey]: Date } (son calisma tarihi)
 *  - dailyTarget: hedef soru sayisi (varsayilan 80)
 *
 * Cikti:
 *  - tasks: [{ subject, topic, questionCount, priority, reason }]
 */
export function generateDailyPlan({
  examDate,
  weakAreas = {},
  recentStudy = {},
  dailyTarget = 80,
}) {
  const today = new Date();
  const daysLeft = examDate ? differenceInDays(examDate, today) : 180;
  const subjects = Object.keys(TYT_SUBJECTS);
  const scored = [];

  for (const key of subjects) {
    const weakness = 100 - (weakAreas[key] ?? 50);
    const lastStudied = recentStudy[key];
    const daysSince = lastStudied
      ? differenceInDays(today, new Date(lastStudied))
      : 30;
    const neglectScore = Math.min(daysSince * 3, 40);
    const urgency = daysLeft < 30 ? 20 : daysLeft < 90 ? 10 : 0;
    const totalScore = weakness * 0.5 + neglectScore + urgency;

    scored.push({ key, score: totalScore });
  }

  scored.sort((a, b) => b.score - a.score);

  const tasks = [];
  let remaining = dailyTarget;
  const subjectCount = Math.min(scored.length, daysLeft < 30 ? 3 : 4);

  for (let i = 0; i < subjectCount && remaining > 0; i++) {
    const { key } = scored[i];
    const subject = TYT_SUBJECTS[key];
    const ratio = i === 0 ? 0.35 : i === 1 ? 0.3 : i === 2 ? 0.2 : 0.15;
    const count = Math.round(dailyTarget * ratio);
    const actual = Math.min(count, remaining);

    let reason = "";
    const daysSince = recentStudy[key]
      ? differenceInDays(today, new Date(recentStudy[key]))
      : null;

    if (daysSince && daysSince > 7) {
      reason = `${daysSince} gundur calismadin`;
    } else if ((weakAreas[key] ?? 50) < 40) {
      reason = "Zayif alanin";
    } else {
      reason = "Duzenli tekrar";
    }

    tasks.push({
      subject: key,
      subjectLabel: subject.label,
      color: subject.color,
      questionCount: actual,
      priority: i + 1,
      reason,
      completed: false,
    });

    remaining -= actual;
  }

  return {
    date: today.toISOString().split("T")[0],
    tasks,
    totalQuestions: dailyTarget - remaining,
    estimatedMinutes: Math.round(((dailyTarget - remaining) / 80) * 120),
  };
}
