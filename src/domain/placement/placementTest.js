// SEVİYE TESTİ — tasarım AKIŞ 12 (onboarding).
//
// TASARIM KISITI: uygulamada SORU BANKASI YOK. QuickPractice bile kullanıcının
// kendi yanlış defterinden besleniyor. Dolayısıyla seviye testi soru sorarak
// ölçemez; ÖZ-DEĞERLENDİRME tabanlı olmak zorunda.
//
// İki tuzağı bilerek ele alıyoruz:
//
// 1) YORGUNLUK — YKS müfredatında 60+ konu var. Onboarding'de hepsini tek tek
//    sormak testi bitirilemez yapar. Bu yüzden KADEMELİ: önce ders seviyesinde
//    sorulur, sadece "karışık" denen derslerde konuya inilir. "Hiç bilmiyorum"
//    veya "iyiyim" denen ders için konu sorusu sorulmaz.
//
// 2) İYİMSERLİK — öz-değerlendirme sistematik olarak yüksek çıkar. Bu yüzden
//    sonuç doğrudan "ustalaşmış" sayılmaz; tavanı sınırlanır ve deneme verisi
//    varsa ona göre kalibre edilir. Gerçek çalışma verisi geldikçe bu tahmin
//    yerini ölçüme bırakır.

export const LEVEL = {
  NONE: "none",     // hiç görmedim
  WEAK: "weak",     // duydum ama zayıfım
  MIXED: "mixed",   // bazı konular iyi, bazıları değil
  GOOD: "good",     // çoğunu biliyorum
  STRONG: "strong", // sağlamım
};

export const LEVEL_OPTIONS = [
  { key: LEVEL.NONE, label: "Hiç görmedim", desc: "Konuya hiç başlamadım" },
  { key: LEVEL.WEAK, label: "Zayıfım", desc: "Gördüm ama oturmadı" },
  { key: LEVEL.MIXED, label: "Karışık", desc: "Bazı konular iyi, bazıları değil" },
  { key: LEVEL.GOOD, label: "İyiyim", desc: "Çoğunu biliyorum" },
  { key: LEVEL.STRONG, label: "Sağlamım", desc: "Bu dersten net kaybetmem" },
];

// Seviye → tahmini doğruluk (%). Bilerek TEMKİNLİ: "sağlamım" bile %85,
// %100 değil. Öz-beyanı olduğu gibi kabul etmek rotayı yanlış kurar.
const LEVEL_ACCURACY = {
  [LEVEL.NONE]: 0,
  [LEVEL.WEAK]: 30,
  [LEVEL.MIXED]: 55,
  [LEVEL.GOOD]: 70,
  [LEVEL.STRONG]: 85,
};

// Seviye → "sanki şu kadar soru çözmüş" karşılığı. mastery.js eşiği 20 soru;
// STRONG bile 18'de bırakılıyor ki hiçbir konu ölçülmeden "ustalaşmış"
// sayılmasın ve rotadan tamamen düşmesin.
const LEVEL_QUESTIONS = {
  [LEVEL.NONE]: 0,
  [LEVEL.WEAK]: 4,
  [LEVEL.MIXED]: 9,
  [LEVEL.GOOD]: 14,
  [LEVEL.STRONG]: 18,
};

/** Sadece "karışık" denen dersler için konu sorusu sorulur. */
export function needsTopicDrilldown(subjectLevel) {
  return subjectLevel === LEVEL.MIXED;
}

/**
 * Testin adımlarını üretir.
 * @param subjects getSubjectsForExam çıktısı
 * @param subjectAnswers { [subjectKey]: LEVEL }  — 1. aşama cevapları
 */
export function buildPlacementSteps(subjects = [], subjectAnswers = {}) {
  const steps = subjects.map((s) => ({
    kind: "subject",
    id: `subject:${s.key}`,
    subjectKey: s.key,
    label: s.label,
    color: s.color,
    icon: s.icon,
    question: `${s.label} dersinde kendini nasıl görüyorsun?`,
  }));

  // 2. aşama: yalnızca "karışık" derslerin konuları.
  for (const s of subjects) {
    if (!needsTopicDrilldown(subjectAnswers[s.key])) continue;
    for (const t of s.topics || []) {
      const name = typeof t === "string" ? t : t.name;
      if (!name) continue;
      steps.push({
        kind: "topic",
        id: `topic:${s.key}:${name}`,
        subjectKey: s.key,
        topic: name,
        label: name,
        color: s.color,
        question: name,
      });
    }
  }

  return steps;
}

/** Kaç soru sorulacak — kullanıcıya baştan söylenmeli. */
export function estimateStepCount(subjects = [], subjectAnswers = {}) {
  return buildPlacementSteps(subjects, subjectAnswers).length;
}

/**
 * Test sonucunu topic_progress'e yazılabilir tahminlere çevirir.
 *
 * @param subjects       ders havuzu
 * @param subjectAnswers { [subjectKey]: LEVEL }
 * @param topicAnswers   { "subjectKey:topic": LEVEL }
 * @returns [{ subjectKey, topic, estimatedQuestions, estimatedCorrect, level, source }]
 */
export function buildPlacementEstimates(subjects = [], subjectAnswers = {}, topicAnswers = {}) {
  const out = [];

  for (const s of subjects) {
    const subjectLevel = subjectAnswers[s.key];
    if (!subjectLevel) continue;

    for (const t of s.topics || []) {
      const name = typeof t === "string" ? t : t.name;
      if (!name) continue;

      // Konu bazında cevap varsa o, yoksa dersin seviyesi devralınır.
      const explicit = topicAnswers[`${s.key}:${name}`];
      const level = explicit || subjectLevel;
      if (level === LEVEL.NONE) continue; // hiç görülmemiş konu için kayıt açma

      const questions = LEVEL_QUESTIONS[level] || 0;
      if (questions <= 0) continue;

      out.push({
        subjectKey: s.key,
        topic: name,
        level,
        estimatedQuestions: questions,
        estimatedCorrect: Math.round((questions * (LEVEL_ACCURACY[level] || 0)) / 100),
        source: explicit ? "topic_self_report" : "subject_self_report",
      });
    }
  }

  return out;
}

/**
 * Deneme verisiyle kalibrasyon.
 *
 * Öz-beyan iyimserdir. Kullanıcının gerçek deneme netleri varsa, beyan ettiği
 * doğruluk ile gerçek doğruluk arasındaki farkı ölçüp tahminleri aşağı çekeriz.
 * Beyan gerçekten düşükse yukarı ÇEKMEYİZ — düşük tahmin zararsız, yüksek
 * tahmin konuyu rotadan düşürür ve öğrenci çalışmadan geçmiş sayılır.
 */
export function calibrateWithTrials(estimates = [], trialAccuracyBySubject = {}) {
  return estimates.map((e) => {
    const real = trialAccuracyBySubject[e.subjectKey];
    if (real == null || e.estimatedQuestions <= 0) return e;

    const claimed = (e.estimatedCorrect / e.estimatedQuestions) * 100;
    if (real >= claimed) return e; // sadece aşağı çek

    const corrected = Math.round((e.estimatedQuestions * real) / 100);
    return {
      ...e,
      estimatedCorrect: corrected,
      calibrated: true,
      claimedAccuracy: Math.round(claimed),
      realAccuracy: Math.round(real),
    };
  });
}

/** Test sonucunun özeti — "Rota Hazır" ekranı için. */
export function summarizePlacement(estimates = [], subjects = []) {
  const totalTopics = subjects.reduce((n, s) => n + (s.topics?.length || 0), 0);
  const touched = estimates.length;
  const byLevel = {};
  for (const e of estimates) byLevel[e.level] = (byLevel[e.level] || 0) + 1;

  const strongSubjects = [];
  const weakSubjects = [];
  const bySubject = {};
  for (const e of estimates) {
    if (!bySubject[e.subjectKey]) bySubject[e.subjectKey] = [];
    bySubject[e.subjectKey].push(e);
  }
  for (const [key, list] of Object.entries(bySubject)) {
    const avg = list.reduce((n, e) => n + e.estimatedCorrect / Math.max(1, e.estimatedQuestions), 0) / list.length;
    const label = subjects.find((s) => s.key === key)?.label || key;
    if (avg >= 0.7) strongSubjects.push(label);
    else if (avg <= 0.4) weakSubjects.push(label);
  }

  return {
    totalTopics,
    touchedTopics: touched,
    untouchedTopics: Math.max(0, totalTopics - touched),
    byLevel,
    strongSubjects,
    weakSubjects,
  };
}

export const PLACEMENT_DISCLAIMER =
  "Bu bir tahmindir, sınav değil. Amacı rotanı sıfırdan değil, bulunduğun " +
  "yerden başlatmak. Çalıştıkça gerçek verinle güncellenir.";
