// SINAV DONEMI: TYT / AYT DENGESI.
//
// Motor TYT ve AYT konularini yalniz puanla yaristiriyordu; donem hesaba
// girmiyordu. Eylulde AYT Kimya'nin ortasindan (Elektrokimya) durak cikiyordu.
// Hazirlik dogal sirasi (kullanici, 1 Ekim): once TYT temeli, ocaktan sonra
// AYT agirlik, sona dogru neredeyse tamamen AYT (TYT denemelerle canli tutulur).
//
// Uygulama: sirali listeyi, her donemin hedef AYT payina gore dakika
// bazinda harmanlar. Her tur (TYT / AYT) KENDI ICINDEKI puan sirasini korur;
// yalniz iki kuyrugun hangisinden sira gelecegi degisir. Bir tur biterse
// digeri kalan her yeri doldurur (bos gun uretilmez).
//
// YKS haziranda: ~150 gun kala ocak ortasi, ~60 gun kala nisan sonu.
export const EXAM_PHASES = Object.freeze([
  { minDays: 151, aytShare: 0.33 },   // temel: TYT ~%67
  { minDays: 61, aytShare: 0.70 },    // ocak sonrasi: AYT agirlik
  { minDays: 0, aytShare: 0.90 },     // son iki ay: neredeyse tamamen AYT
]);

// Iki turlu sinavlar. Yalniz TYT ve LGS'de denge yok.
const TWO_TIER = new Set(["tyt_ayt", "dil"]);

/** Dersin turu: AYT/YDT dersleri onekli, TYT dersleri oneksiz. */
export function subjectTier(subjectKey) {
  const k = String(subjectKey || "");
  return k.startsWith("ayt_") || k.startsWith("ydt_") ? "AYT" : "TYT";
}

/** Sinava kalan gune gore hedef AYT payi; denge uygulanmayacaksa null. */
export function aytTargetShare({ examType, daysLeft } = {}) {
  if (!TWO_TIER.has(examType) || daysLeft == null || !Number.isFinite(Number(daysLeft))) return null;
  const d = Math.max(0, Number(daysLeft));
  return (EXAM_PHASES.find((p) => d >= p.minDays) || EXAM_PHASES[EXAM_PHASES.length - 1]).aytShare;
}

const minutesOf = (item) => Math.max(1, Number(item?.cost?.minutes) || 1);

/**
 * Puan sirasindaki listeyi hedef AYT payina gore harmanlar (dakika bazli).
 * Her adimda, secilirse gerceklesen AYT payini hedefe en cok yaklastiran
 * turun siradaki ogesi alinir.
 */
export function interleaveByTier(items = [], aytShare = null) {
  if (aytShare == null || items.length < 2) return items;
  const queues = { TYT: [], AYT: [] };
  for (const it of items) queues[subjectTier(it.subject)].push(it);
  if (!queues.TYT.length || !queues.AYT.length) return items;
  const out = [];
  let ayt = 0;
  let total = 0;
  const qi = { TYT: 0, AYT: 0 };
  while (qi.TYT < queues.TYT.length || qi.AYT < queues.AYT.length) {
    const hasT = qi.TYT < queues.TYT.length;
    const hasA = qi.AYT < queues.AYT.length;
    let pick;
    if (!hasT) pick = "AYT";
    else if (!hasA) pick = "TYT";
    else {
      const mA = minutesOf(queues.AYT[qi.AYT]);
      const mT = minutesOf(queues.TYT[qi.TYT]);
      const errA = Math.abs((ayt + mA) / (total + mA) - aytShare);
      const errT = Math.abs(ayt / (total + mT) - aytShare);
      pick = errA <= errT ? "AYT" : "TYT";
    }
    const it = queues[pick][qi[pick]++];
    const m = minutesOf(it);
    total += m;
    if (pick === "AYT") ayt += m;
    out.push(it);
  }
  return out;
}

// OKUL SIRASI EGILIMI (yalniz AYT, yalniz hic calisilmamis konu).
// 12. sinif ogrencisi AYT konularini okulda sirayla goruyor; eylulde
// "Modern Fizik", "Bitki Biyolojisi" (yilin son konulari) SIK CIKTIGI icin
// one geciyordu. Yasak degil egilim: zayiflik/siklik puani yuksek konu yine
// one gecebilir. Sinav yaklastikca etkisi azalir, son iki ayda yok.
export function schoolOrderFactor({ subjectKey, topicIndex, topicCount, q = 0, daysLeft = null } = {}) {
  if (subjectTier(subjectKey) !== "AYT" || (Number(q) || 0) > 0) return 1;
  if (!(topicCount > 1) || !(topicIndex >= 0) || daysLeft == null) return 1;
  const strength = daysLeft > 150 ? 0.6 : daysLeft > 60 ? 0.3 : 0;
  return 1 - strength * (topicIndex / (topicCount - 1));
}

/**
 * On kosul sirasi (yalniz AYT): listede on kosulundan ONCE gelen konu, on kosulunun hemen
 * arkasina tasinir. Puan cezasi (sequencePenalty) tek basina yetmiyordu:
 * Elektrokimya 2. haftada, on kosulu Kimyasal Denge 25. haftadaydi.
 * missing: item.scoreComponents.missingPrerequisites ("Konu" ya da "ders:Konu").
 */
export function orderByPrerequisites(items = []) {
  const out = items.slice();
  const keyOf = (it) => `${it.subject}|${it.topic}`;
  for (let pass = 0; pass < 3; pass += 1) {
    let moved = false;
    for (let i = 0; i < out.length; i += 1) {
      const it = out[i];
      // Yalniz AYT: TYT konulari lisede gorulmus; sert sira Paragraf'i (TYT'nin
      // en degerli konusu) Cumlede Anlam'in arkasina itip ilk haftalardan siliyordu.
      const missing = it?.isReview || subjectTier(it?.subject) !== "AYT" ? [] : it?.scoreComponents?.missingPrerequisites || [];
      if (!missing.length) continue;
      let last = -1;
      for (const ref of missing) {
        const [s, t] = String(ref).includes(":") ? String(ref).split(":") : [it.subject, ref];
        const j = out.findIndex((x, k) => k > i && !x.isReview && keyOf(x) === `${s}|${t}`);
        if (j > last) last = j;
      }
      if (last > i) {
        out.splice(i, 1);
        out.splice(last, 0, it);
        moved = true;
        i -= 1;
      }
    }
    if (!moved) break;
  }
  return out;
}
