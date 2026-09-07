// KONU HAFIZASI — unutma eğrisi ve tekrar ihtiyacı.
//
// Rotanın en büyük eksiğiydi: bir konu bir kez "ustalaşıldı" sayılınca
// rotadan TAMAMEN düşüyordu. Ocak'ta ustalaşılan konu Haziran sınavında
// hâlâ "bitti" sayılıyor, oysa tekrar edilmediyse büyük kısmı unutulmuş
// oluyor. 9-12 aylık bir hazırlıkta bu, planı baştan yanlış yapar.
//
// Model — Ebbinghaus unutma eğrisinin pratik hali:
//   R(t) = exp(-t / S)
//     R = hatırlama oranı (0-1)
//     t = son çalışmadan bu yana geçen gün
//     S = hafıza gücü (gün cinsinden); büyüdükçe eğri yatıklaşır
//
// S neden büyür:
//   - daha çok soru çözülmüş olması (hacim)
//   - yüksek doğruluk (kavrama)
//   - AYRI OTURUMLARDA çalışılmış olması (aralıklı tekrar etkisi)
// Sonuncusu kritik: 100 soruyu tek gecede çözmek ile 5 ayrı günde çözmek
// aynı şey değil. Aralıklı çalışma kalıcılığı belirgin şekilde artırır.

const BASE_STRENGTH = 6;      // gün — hiç pekişmemiş bir konunun yarı ömrü ölçeği
const MAX_STRENGTH = 220;     // tavan: hiçbir konu "sonsuza kadar hatırlanır" değil

/**
 * Konunun hafıza gücü (gün).
 * @param tp topic_progress satırı: { total_questions, correct_count, study_count }
 */
export function memoryStrength(tp = {}) {
  const q = Number(tp.total_questions) || 0;
  if (q <= 0) return 0;

  const acc = Math.min(1, Math.max(0, (Number(tp.correct_count) || 0) / q));
  // Ayrı oturum sayısı bilinmiyorsa hacimden kaba bir tahmin (10 soru ≈ 1 oturum).
  const sessions = Math.max(1, Number(tp.study_count) || Math.ceil(q / 10));

  // Hacim: doygunluk var — 20. sorudan sonraki katkı azalıyor.
  const volume = Math.log1p(q / 8);
  // Kavrama: %50 altı doğrulukta pekişme neredeyse yok.
  const comprehension = Math.max(0, (acc - 0.4) / 0.6);
  // Aralıklama: ayrı oturum sayısının karekökü.
  const spacing = Math.sqrt(sessions);

  const s = BASE_STRENGTH * volume * (0.35 + comprehension) * spacing;
  return Math.min(MAX_STRENGTH, Math.round(s * 10) / 10);
}

/** Şu anki hatırlama oranı (0-1). */
export function currentRetention(tp = {}, now = new Date()) {
  const strength = memoryStrength(tp);
  if (strength <= 0) return 0;

  const last = tp.last_studied_at ? new Date(tp.last_studied_at) : null;
  if (!last || Number.isNaN(last.getTime())) return 0;

  const days = Math.max(0, (now - last) / 86400000);
  const r = Math.exp(-days / strength);
  return Math.round(r * 1000) / 1000;
}

// Bu eşiğin altına düşen konu tekrar gerektirir.
export const REVIEW_THRESHOLD = 0.75;
// Bu eşiğin altı "neredeyse unutulmuş" — tekrar değil yeniden öğrenme.
export const RELEARN_THRESHOLD = 0.4;

/**
 * Bir konunun tekrar durumu.
 * @returns { retention, strength, needsReview, relearn, daysSince, daysUntilReview }
 */
export function reviewStatus(tp = {}, now = new Date()) {
  const strength = memoryStrength(tp);
  const retention = currentRetention(tp, now);
  const last = tp.last_studied_at ? new Date(tp.last_studied_at) : null;
  const daysSince = last && !Number.isNaN(last.getTime())
    ? Math.floor((now - last) / 86400000)
    : null;

  // Hatırlama eşiğe düşene kadar kaç gün var: t = -S * ln(threshold)
  const daysUntilReview = strength > 0
    ? Math.max(0, Math.round(-strength * Math.log(REVIEW_THRESHOLD) - (daysSince || 0)))
    : 0;

  return {
    strength,
    retention,
    daysSince,
    daysUntilReview,
    needsReview: strength > 0 && retention < REVIEW_THRESHOLD,
    relearn: strength > 0 && retention < RELEARN_THRESHOLD,
  };
}

/**
 * Tekrarın maliyeti — sıfırdan öğrenmekten ÇOK daha ucuz.
 *
 * Hatırlama ne kadar yüksekse tekrar o kadar hızlı geçer. Neredeyse
 * unutulmuş konu (relearn) ise yeniden öğrenmeye yaklaşır.
 */
export function reviewCost(originalQuestions, retention) {
  const r = Math.min(1, Math.max(0, retention));
  // %100 hatırlama → maliyetin %12'si; %0 → %70'i.
  const factor = 0.12 + (1 - r) * 0.58;
  return Math.max(3, Math.round(originalQuestions * factor));
}

/**
 * Tekrarın önceliği.
 *
 * Bilerek yüksek: unutulmakta olan bir konuyu tazelemek, yeni bir konuya
 * baştan başlamaktan neredeyse her zaman daha kârlıdır — maliyeti düşük,
 * getirisi (kaybedilmeyi önlenen net) yüksektir. Sınav yaklaştıkça bu daha
 * da belirginleşir.
 */
export function reviewPriority({ retention, subjectWeight = 10, daysLeft = 180 }) {
  const urgency = daysLeft > 0 ? Math.min(2.2, 200 / Math.max(30, daysLeft)) : 1;
  // Eşiğin ne kadar altına düşmüş — düştükçe aciliyet artar.
  const decayGap = Math.max(0, REVIEW_THRESHOLD - retention) / REVIEW_THRESHOLD;
  const score = subjectWeight * (0.5 + decayGap) * urgency;
  return Math.round(score * 100) / 100;
}
