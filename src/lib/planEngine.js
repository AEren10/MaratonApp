import { differenceInDays, todayTR } from "./dateUtils";
import { getSubjectsForExam } from "../data/curriculum";

/**
 * Gunluk plan olusturma algoritmasi.
 *
 * Girdiler:
 *  - examType: 'tyt' | 'tyt_ayt' | 'ayt' | 'dil'
 *  - field: 'sayisal' | 'ea' | 'sozel' | 'dil' | null
 *  - examDate: sinav tarihi
 *  - weakAreas: { [subjectKey]: number } (0-100 arasi basari yuzdesi)
 *  - recentStudy: { [subjectKey]: Date } (son calisma tarihi)
 *  - dailyTarget: hedef soru sayisi (varsayilan 80)
 */
export function generateDailyPlan({
  examType = "tyt",
  field = null,
  examDate,
  weakAreas = {},
  recentStudy = {},
  topicWeakness = {},
  priorityReasons = {},
  dailyTarget = 80,
}) {
  const today = new Date();
  const daysLeft = examDate ? differenceInDays(examDate, today) : 180;

  // Build subject pool from active exam config so AYT students see AYT subjects too.
  const pool = getSubjectsForExam(examType, field);
  const subjectMap = {};
  pool.forEach((s) => { subjectMap[s.key] = s; });

  const scored = [];
  for (const key of Object.keys(subjectMap)) {
    const weakness = 100 - (weakAreas[key] ?? 50);
    const lastStudied = recentStudy[key];
    const daysSince = lastStudied
      ? differenceInDays(today, new Date(lastStudied))
      : 30;
    const neglectScore = Math.min(daysSince * 3, 40);
    const urgency = daysLeft < 30 ? 20 : daysLeft < 90 ? 10 : 0;
    // smartNudge net-düşüş sinyali olan dersi öne al.
    const priorityBoost = priorityReasons[key] ? 25 : 0;
    const totalScore = weakness * 0.5 + neglectScore + urgency + priorityBoost;
    scored.push({ key, score: totalScore });
  }

  scored.sort((a, b) => b.score - a.score);

  const tasks = [];
  let remaining = dailyTarget;
  const subjectCount = Math.min(scored.length, daysLeft < 30 ? 3 : 4);

  for (let i = 0; i < subjectCount && remaining > 0; i++) {
    const { key } = scored[i];
    const subject = subjectMap[key];
    if (!subject) continue;

    const ratio = i === 0 ? 0.35 : i === 1 ? 0.3 : i === 2 ? 0.2 : 0.15;
    const count = Math.round(dailyTarget * ratio);
    const actual = Math.min(count, remaining);

    // En zayıf konuyu seç (varsa) → görev konu seviyesine iner.
    const weakTopics = topicWeakness[key];
    const weakestTopic = weakTopics && weakTopics.length ? weakTopics[0] : null;
    const topicLabel = weakestTopic?.topic || null;

    // === Urgency tier kararı ===
    // tier:   "critical" | "high" | "medium" | "low"
    // rkind:  "red" | "amber" | "blue" | "gray"  (geriye uyumlu)
    // badge:  başlıkta gösterilecek kısa etiket
    let reason = "";
    let rkind = "gray";
    let tier = "low";
    let badge = null;
    const daysSince = recentStudy[key]
      ? differenceInDays(today, new Date(recentStudy[key]))
      : null;
    const acc = weakAreas[key] ?? 50;

    if (priorityReasons[key]) {
      // smartNudge net düşüş sinyali — en yüksek aciliyet.
      reason = priorityReasons[key];
      rkind = "red";
      tier = "critical";
      badge = "DÜŞÜŞ VAR";
    } else if (daysSince !== null && daysSince > 14) {
      // 2 haftadan uzun süredir dokunulmamış — kritik.
      reason = `🚨 Bu konuya ${daysSince} gündür dönmedin!`;
      rkind = "red";
      tier = "critical";
      badge = "ACİL";
    } else if (weakestTopic && weakestTopic.acc < 40) {
      // Konu seviyesinde çok zayıf — yüksek aciliyet.
      reason = `${weakestTopic.topic}: sadece %${weakestTopic.acc} doğru`;
      rkind = "red";
      tier = "high";
      badge = "ZAYIF";
    } else if (daysSince !== null && daysSince > 7) {
      // 1-2 hafta dokunulmamış — dikkat.
      reason = `${daysSince} gündür çalışmadın`;
      rkind = "amber";
      tier = "high";
      badge = "DİKKAT";
    } else if (weakestTopic && weakestTopic.acc < 60) {
      // Konu seviyesinde orta zayıf.
      reason = `${weakestTopic.topic}: %${weakestTopic.acc} doğru`;
      rkind = "amber";
      tier = "medium";
    } else if (acc < 40) {
      // Dersin geneli zayıf.
      reason = "Zayıf alanın — soru bombala";
      rkind = "red";
      tier = "high";
      badge = "ZAYIF";
    } else if (acc < 60) {
      reason = `%${acc} doğruluk — pekiştir`;
      rkind = "amber";
      tier = "medium";
    } else {
      reason = "Düzenli tekrar";
      rkind = "blue";
      tier = "low";
    }

    tasks.push({
      subject: key,
      subjectLabel: subject.label,
      topicLabel,
      topic: weakestTopic?.topic || null,
      color: subject.color,
      questionCount: actual,
      priority: i + 1,
      reason,
      rkind,
      tier,
      badge,
      daysSince,
      accuracy: acc,
      completed: false,
    });

    remaining -= actual;
  }

  return {
    date: todayTR(),
    tasks,
    totalQuestions: dailyTarget - remaining,
    estimatedMinutes: Math.round(((dailyTarget - remaining) / 80) * 120),
  };
}
