import { getTopicDifficulty } from "../../lib/topicDifficulty.js";
import { getMastery } from "../../lib/mastery.js";
import { netGainForTopic } from "./netEstimate.js";

// Bir konuyu "ustalaştırmanın" tahmini maliyeti ve getirisi.
//
// Eski motor her konuyu eşit sayıyordu. Oysa "Temel Kavramlar" ile "Türev"
// aynı emeği istemiyor, ve TYT'de 40 soruluk Matematik ile 5 soruluk Felsefe
// aynı getiriyi vermiyor. Rota bu ikisini ayırt etmezse öğrenci düşük
// getirili konularda vakit harcıyor.

// Ustalık eşiği: mastery.js "20 soru + %80 doğruluk" diyor. Maliyet bu
// hedefe ulaşmak için KALAN soru sayısıdır.
const MASTERY_QUESTION_TARGET = 20;

// Zorluk çarpanı — zor konu aynı seviyeye gelmek için daha çok soru ister.
const DIFFICULTY_EFFORT = { kolay: 0.75, orta: 1, zor: 1.6 };

/**
 * @param topic      { subject, topic, q, acc }  — q: çözülen soru, acc: doğruluk %
 * @param subjectWeight  o dersin sınavdaki soru sayısı (getiri ağırlığı)
 */
export function estimateTopicCost(topic, subject = {}, trialType) {
  const q = Number(topic.q) || 0;
  const acc = Number(topic.acc) || 0;
  const { difficulty } = getTopicDifficulty(topic.topic);
  const mastery = getMastery({ q, acc });

  if (mastery.level === "mastered") {
    return { questions: 0, minutes: 0, mastery: mastery.level, difficulty, yield: 0, done: true };
  }

  const effort = DIFFICULTY_EFFORT[difficulty] || 1;

  // Kalan soru: hedefe ne kadar var. Doğruluk düşükse hedef yukarı kayar,
  // çünkü sadece soru çözmek değil, doğruluğu da yükseltmek gerekiyor.
  const accGap = Math.max(0, 80 - acc) / 80;           // 0..1
  const baseRemaining = Math.max(0, MASTERY_QUESTION_TARGET - q);
  const accPenalty = Math.round(MASTERY_QUESTION_TARGET * accGap * 0.8);
  const questions = Math.max(5, Math.round((baseRemaining + accPenalty) * effort));

  // Süre: zor konuda soru başına daha uzun.
  const minutesPerQuestion = difficulty === "zor" ? 2.4 : difficulty === "kolay" ? 1.1 : 1.6;
  const minutes = Math.round(questions * minutesPerQuestion);

  // Getiri ile hedef-net hesabı aynı kaynaktan gelir. Dersin tüm soru
  // sayısını her konuya yazmak, çok konulu dersleri katlayarak şişiriyordu.
  const yieldScore = netGainForTopic(subject, {
    total_questions: q,
    correct_count: Math.round(q * acc / 100),
  }, trialType);

  return {
    questions,
    minutes,
    mastery: mastery.level,
    difficulty,
    yield: yieldScore,
    done: false,
  };
}

/**
 * Öncelik skoru — yüksek olan önce çalışılır.
 *
 * Üç girdi:
 *   getiri     → sınavda ne kadar işe yarar
 *   maliyet    → ne kadar emek ister (düşük maliyet öne çıkar)
 *   aciliyet   → sınava az kaldıysa yüksek getirili konular öne alınır
 *
 * `neglectedDays`: bu konuya en son ne zaman dokunulduğu. Uzun süre
 * dokunulmamış ama başlanmış konular unutulmaya açık, öne alınır.
 */
export function priorityScore({
  cost,
  neglectedDays = 0,
  daysLeft = 180,
  isWeakArea = false,
  unpreparedBefore = 0,
}) {
  return priorityScoreDetails({
    cost, neglectedDays, daysLeft, isWeakArea, unpreparedBefore,
  }).score;
}

export function priorityScoreDetails({
  cost,
  neglectedDays = 0,
  daysLeft = 180,
  isWeakArea = false,
  unpreparedBefore = 0,
}) {
  if (cost.done) return { score: -1, components: {} };

  const yieldPart = cost.yield;
  const costPart = Math.max(1, cost.questions) / 20;        // ~1 civarı
  const urgency = daysLeft > 0 ? Math.min(2, 180 / Math.max(30, daysLeft)) : 1;
  const decay = Math.min(1.4, 1 + neglectedDays / 60);      // 60 günde +%40
  const weakBoost = isWeakArea ? 1.35 : 1;

  // MÜFREDAT SIRASI — en önemli düzeltme.
  //
  // Müfredattaki konu sırası öğretim sırasıdır: "Üslü Sayılar" gelmeden
  // "Köklü Sayılar", "Limit" gelmeden "Türev" çalışılmaz. Yalnızca getiri/
  // maliyet skoruna bakan bir sıralama Türev'i 1. haftaya, Temel Kavramlar'ı
  // 20. haftaya koyabiliyordu — matematiksel olarak "optimal", pedagojik
  // olarak saçma.
  //
  // Sert kilit DEĞİL: öğrenci önceki konuları okulda görmüş olabilir, bu
  // yüzden engellemek yerine ağırlık düşürüyoruz. Kendinden önce hazır
  // olmayan her konu skoru %12 kırpar, en fazla %70'e kadar.
  const sequencePenalty = Math.max(0.3, 1 - unpreparedBefore * 0.12);

  const score = (yieldPart / costPart) * urgency * decay * weakBoost * sequencePenalty;
  return {
    score: Math.round(score * 100) / 100,
    components: {
      expectedNetGain: yieldPart,
      effortQuestions: cost.questions,
      urgency: Math.round(urgency * 100) / 100,
      retention: Math.round(decay * 100) / 100,
      weakAreaBoost: weakBoost,
      sequenceReadiness: Math.round(sequencePenalty * 100) / 100,
    },
  };
}
