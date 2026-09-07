// KONU → NET DÖNÜŞÜMÜ.
//
// Önceden `thresholdGap` sabit bir varsayım kullanıyordu:
//   const NET_PER_TOPIC = 0.6;   // "her konu ~0,6 net getirir"
// Bu sayı hiçbir veriye dayanmıyordu ve tüm dersler için aynıydı — 40 soruluk
// Matematik'teki bir konu ile 6 soruluk Din'deki bir konu aynı sayılıyordu.
//
// Yeni model müfredattan türüyor:
//   Bir konunun sınavdaki payı  = dersin soru sayısı / dersin konu sayısı
//   Ustalaşınca kazanılan net   = pay × (hedef doğruluk − mevcut doğruluk)
//                                 − yanlış cezasının etkisi
//
// Hâlâ tahmin, ama artık DERSE ve KONUYA duyarlı ve dayanağı var.

import { wrongPenaltyForTrialType } from "../trial/trialModel";

// Ustalık hedefi: mastery.js "%80 üstü doğruluk" diyor.
const MASTERY_ACCURACY = 0.8;

/**
 * Tek bir konuyu ustalaştırmanın tahmini net kazancı.
 *
 * @param subject  { questionCount, topics: [] }
 * @param tp       topic_progress satırı (mevcut durum)
 * @param trialType net cezası için ("LGS" 1/3, diğerleri 1/4)
 */
export function netGainForTopic(subject, tp = {}, trialType) {
  const questionCount = Number(subject?.questionCount) || 0;
  const topicCount = subject?.topics?.length || 0;
  if (questionCount <= 0 || topicCount <= 0) return 0;

  // Konunun sınavdaki payı.
  const share = questionCount / topicCount;

  const q = Number(tp.total_questions) || 0;
  const currentAcc = q > 0 ? (Number(tp.correct_count) || 0) / q : 0;
  const gainAcc = Math.max(0, MASTERY_ACCURACY - currentAcc);
  if (gainAcc <= 0) return 0;

  // Doğruya dönen sorular. Bunların bir kısmı önceden YANLIŞ'tı (ceza da
  // kalkıyor), bir kısmı BOŞ'tu (sadece +1). Hiç çalışılmamış konuda
  // öğrenci daha çok boş bırakır; çalışılmış ama zayıf konuda daha çok
  // yanlış yapar. Bu yüzden yanlış oranını mevcut duruma göre tahmin ediyoruz.
  const wrongShare = q > 0 ? 0.6 : 0.25;
  const penalty = wrongPenaltyForTrialType(trialType);

  const converted = share * gainAcc;
  const net = converted * (1 + wrongShare * penalty);

  return Math.round(net * 100) / 100;
}

/**
 * Hedef nete ulaşmak için kaç konu ve kaç soru gerekiyor.
 *
 * Konular GETİRİSİ YÜKSEK olandan başlanarak toplanıyor — öğrenciye
 * "en verimli sırayla şu kadar konu" demek, "ortalama şu kadar konu"
 * demekten hem daha doğru hem daha kullanışlı.
 *
 * @param pool      ders havuzu
 * @param progressByKey topic_progress haritası
 * @param netGap    kapatılması gereken net
 */
export function topicsNeededForNet(pool = [], progressByKey = {}, netGap = 0, trialType) {
  if (netGap <= 0) return { topics: 0, questions: 0, netCovered: 0, reachable: true, breakdown: [] };

  const candidates = [];
  for (const subject of pool) {
    const prog = progressByKey[subject.key] || {};
    for (const t of subject.topics || []) {
      const name = typeof t === "string" ? t : t.name;
      if (!name) continue;
      const tp = prog[name] || {};
      const gain = netGainForTopic(subject, tp, trialType);
      if (gain > 0) {
        candidates.push({
          subject: subject.key,
          subjectLabel: subject.label,
          topic: name,
          netGain: gain,
        });
      }
    }
  }

  candidates.sort((a, b) => b.netGain - a.netGain);

  let covered = 0;
  const chosen = [];
  for (const c of candidates) {
    if (covered >= netGap) break;
    chosen.push(c);
    covered += c.netGain;
  }

  return {
    topics: chosen.length,
    // Ustalık eşiği 20 soru; kabaca konu başına o kadar.
    questions: chosen.length * 20,
    netCovered: Math.round(covered * 100) / 100,
    // Tüm konular ustalaşsa bile hedefe ulaşılamıyorsa dürüstçe söyle.
    reachable: covered >= netGap,
    maxPossibleNet: Math.round(candidates.reduce((n, c) => n + c.netGain, 0) * 100) / 100,
    breakdown: chosen.slice(0, 10),
  };
}
