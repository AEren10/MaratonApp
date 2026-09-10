import { differenceInDays, todayTR } from "./dateUtils.js";
import { getSubjectsForExam } from "../data/curriculum.js";
import { buildPlanTaskKey } from "../domain/plan/planTaskIdentity.js";
import { buildDailyAssignmentNarrative } from "../domain/plan/dailyAssignment.js";

const ROUTE_REASON_TEXT = {
  REVIEW_DUE: "Tekrar zamanı geldi",
  NET_DROP: "Son denemelerde düşüş var",
  LOW_ACCURACY: "Doğruluk açığı öncelikli",
  NEGLECTED: "Uzun süredir çalışılmadı",
  HIGH_EXAM_WEIGHT: "Sınav getirisi yüksek",
  PREREQUISITE: "Temel sırayı güçlendirir",
  DEBT_RECOVERY: "Konu borcunu kapatır",
  ROUTE_COMMITMENT: "Rotandaki sıradaki durak",
};

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
  // Haftalık rotanın bu haftaki durakları: [{ subject, topic, ... }]
  routeWeekStops = [],
}) {
  const today = new Date();
  const daysLeft = examDate ? differenceInDays(examDate, today) : 180;

  // Build subject pool from active exam config so AYT students see AYT subjects too.
  const pool = getSubjectsForExam(examType, field);
  const subjectMap = {};
  pool.forEach((s) => { subjectMap[s.key] = s; });

  // ROTA ÖNCELİKLİDİR.
  //
  // Önceden günlük plan ile haftalık rota BİRBİRİNDEN HABERSİZDİ: rota
  // "bu hafta Paragraf ve Türev" derken günlük plan kendi skoruyla bambaşka
  // dersler seçebiliyordu. Öğrenci iki ayrı yerde çelişen yönlendirme
  // görüyordu — planın güvenilirliğini bitiren bir şey.
  //
  // Artık rotanın bu haftaki durakları varsa günlük plan ONLARDAN türetilir.
  // Rota yoksa (henüz çizilmemiş) eski skorlama devreye girer.
  const validRouteStops = routeWeekStops.filter((stop) => subjectMap[stop.subject]);

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
  const scoreBySubject = new Map(scored.map((item) => [item.key, item.score]));
  // Her rota durağı ayrı adaydır. Subject bazında tekilleştirmek, aynı dersteki
  // ikinci konuyu görünmez yapıyor ve tamamlamayı yanlış durağa yazıyordu.
  const candidates = validRouteStops.length
    ? validRouteStops.map((routeStop) => ({
      key: routeStop.subject,
      score: scoreBySubject.get(routeStop.subject) || 0,
      routeStop,
    }))
    : scored;

  const tasks = [];
  let remaining = dailyTarget;
  const subjectCount = Math.min(candidates.length, daysLeft < 30 ? 3 : 4);
  const selected = candidates.slice(0, subjectCount);
  const weights = [0.35, 0.3, 0.2, 0.15].slice(0, selected.length);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0) || 1;

  for (let i = 0; i < subjectCount && remaining > 0; i++) {
    const { key, routeStop = null } = selected[i];
    const subject = subjectMap[key];
    if (!subject) continue;

    const count = i === subjectCount - 1
      ? remaining
      : Math.round(dailyTarget * (weights[i] / weightTotal));
    const actual = Math.min(count, remaining);

    // Konu seçimi: ROTA öncelikli.
    // Rota bu hafta bu derste hangi durağı gösteriyorsa günlük görev de onu
    // hedefler. Rota yoksa en zayıf konuya düşülür.
    const weakTopics = topicWeakness[key];
    const weakestTopic = weakTopics && weakTopics.length ? weakTopics[0] : null;
    const topicLabel = routeStop?.topic || weakestTopic?.topic || null;

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

    const routeInsight = routeStop?.insight || null;
    const routeReasonCode = routeInsight?.reasonCode || routeStop?.reasonCodes?.[0];
    if (routeReasonCode) {
      reason = routeInsight?.reasonText
        || ROUTE_REASON_TEXT[routeReasonCode]
        || "Rotandaki öncelikli durak";
      rkind = routeReasonCode === "LOW_ACCURACY" ? "red" : "blue";
      tier = routeReasonCode === "LOW_ACCURACY" ? "high" : "medium";
      badge = routeReasonCode === "REVIEW_DUE" ? "TEKRAR" : "ROTA";
    } else if (priorityReasons[key]) {
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

    const task = {
      subject: key,
      subjectLabel: subject.label,
      topicLabel,
      topic: topicLabel,
      stopId: routeStop?.id || routeStop?.stopId || null,
      version: routeStop?.version ?? null,
      routeStopId: routeStop?.id || routeStop?.stopId || null,
      logicalStopKey: routeStop?.logicalStopKey || null,
      rootStopKey: routeStop?.rootStopKey || null,
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
      routeConfidence: routeInsight?.confidence || routeStop?.dataConfidence || null,
      routeInsight,
    };
    task.assignment = buildDailyAssignmentNarrative({
      reason,
      routeInsight,
      routeReasonCode,
      routeStop,
      questionCount: actual,
      tier,
      accuracy: acc,
      daysSince,
    });
    tasks.push({
      ...task,
      estimatedMinutes: task.assignment.estimatedMinutes,
      planTaskKey: buildPlanTaskKey(task),
    });

    remaining -= actual;
  }

  return {
    date: todayTR(),
    tasks,
    totalQuestions: dailyTarget - remaining,
    estimatedMinutes: tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0),
  };
}
