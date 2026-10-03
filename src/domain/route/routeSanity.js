// ROTA AKLI SELIM KURALLARI (saf). Ogrencilerin ve koclarin program kurma
// bicimine gore (2026-10 arastirmasi):
//  - Ders icinde konu sirasi atlanmaz: temel konular once (TYT Matematik'te
//    Temel Kavramlar'dan Olasilik'a ziplanmaz). Motorun puani "yuksek
//    getirili" diye mufredatin sonundan konu cekebiliyordu.
//  - Oturumlar yuvarlak: 25/30/45/50 dk, 10/15/20/25/30 soru. "19 dk 23 soru"
//    bir programda kimsenin yazmayacagi sayi.
//  - Veri guveni yalniz soru hacmine degil: dogruluk olculmus mu, kayit taze
//    mi, denemede bu dersin sinyali var mi.

// Bir derste en dusuk numarali bitmemis konudan en fazla bu kadar ileri
// konu one gecebilir: 0 = ders icinde mufredat sirasi (koclarin "sira
// atlamadan" kurali; hangi DERSIN sirasi geldigine puan karar verir). Turkce istisna:
// konular birbirine az bagli ve koclar paragrafi ilk gunden her gun
// calistiriyor (Paragraf mufredatta 6. konu).
const WINDOW = { TYT: 0, AYT: 0 };
const SUBJECT_WINDOW = { turkce: 5 };

const tierOf = (subjectKey) => {
  const k = String(subjectKey || "");
  return k.startsWith("ayt_") || k.startsWith("ydt_") ? "AYT" : "TYT";
};

/**
 * Puan sirasini bozmadan ders ici sirayi uygular: bir ogrenme duragi, ayni
 * dersin daha onceki (bitmemis) konularindan PENCERE kadar ilerideyse,
 * o konular yerlestirilene kadar bekletilir. Tekrarlar ve baslanmis konular
 * (q > 0) serbest: ogrenci zaten orada.
 * items[i]: { subject, topicIndex, isReview, q }
 */
export function orderWithinCurriculum(items = []) {
  const open = new Map(); // ders -> siralanmamis ogrenme duraklarinin konu numaralari
  for (const it of items) {
    if (it.isReview || !(it.topicIndex >= 0)) continue;
    if (!open.has(it.subject)) open.set(it.subject, []);
    open.get(it.subject).push(it.topicIndex);
  }
  for (const list of open.values()) list.sort((a, b) => a - b);

  const eligible = (it) => {
    if (it.isReview || !(it.topicIndex >= 0) || (Number(it.q) || 0) > 0) return true;
    const list = open.get(it.subject) || [];
    const w = SUBJECT_WINDOW[it.subject] ?? WINDOW[tierOf(it.subject)];
    return list.length === 0 || it.topicIndex <= list[0] + w;
  };
  const place = (it, out) => {
    out.push(it);
    if (it.isReview || !(it.topicIndex >= 0)) return;
    const list = open.get(it.subject);
    const i = list ? list.indexOf(it.topicIndex) : -1;
    if (i >= 0) list.splice(i, 1);
  };

  // Bloke olan yuksek puanli konu, kendi dersinin SIRADAKI konusunu kendi
  // yerine ceker: ders, en degerli konusunun puaniyla one cikar (Matematik'in
  // degerli konulari Temel Kavramlar'in dusuk puani yuzunden bekletilmez).
  const queue = items.slice();
  const out = [];
  const waiting = [];
  const flush = () => {
    let moved = true;
    while (moved) {
      moved = false;
      for (let j2 = 0; j2 < waiting.length; j2 += 1) {
        if (eligible(waiting[j2])) { place(waiting.splice(j2, 1)[0], out); moved = true; break; }
      }
    }
  };
  while (queue.length) {
    const it = queue.shift();
    if (eligible(it)) { place(it, out); flush(); continue; }
    waiting.push(it);
    const head = (open.get(it.subject) || [])[0];
    const k = queue.findIndex((x) => x.subject === it.subject && !x.isReview && x.topicIndex === head);
    if (k >= 0) queue.unshift(queue.splice(k, 1)[0]);
  }
  // Pencere hic acilmadiysa (veri tutarsizligi) kalanlar sona, sirayla.
  waiting.sort((a, b) => a.topicIndex - b.topicIndex).forEach((it) => out.push(it));
  return out;
}

/** Yuvarlak sayi: en yakin `step` katina, en az `min` (0 ise 0 kalir). */
export function niceNumber(n, step = 5, min = step) {
  const v = Number(n) || 0;
  if (v <= 0) return 0;
  return Math.max(min, Math.round(v / step) * step);
}

/** Duraklarin soru ve dakikasi yuvarlak: 10/15/20/25... soru, 15/20/25/30... dk. */
export function niceStop(stop) {
  if (!stop?.cost) return stop;
  const questions = niceNumber(stop.cost.questions, 5, 10);
  const minutes = niceNumber(stop.cost.minutes, 5, 15);
  return {
    ...stop,
    cost: { ...stop.cost, questions, minutes },
    ...(stop.plannedQuestions != null ? { plannedQuestions: questions } : null),
  };
}

/**
 * Veri guveni: high | medium | low. Hacim tek basina "yuksek" yapmaz.
 * +2 dogruluk olculmus · +1 20+ soru · +1 son 30 gunde calisilmis ·
 * +1 denemede bu dersin sinyali var. 4+ high, 2-3 medium.
 */
export function topicConfidence({ q = 0, accKnown = false, neglectedDays = null, hasTrialSignal = false } = {}) {
  const questions = Number(q) || 0;
  let score = 0;
  if (accKnown) score += 2;
  if (questions >= 20) score += 1;
  if (questions > 0 && neglectedDays != null && neglectedDays <= 30) score += 1;
  if (hasTrialSignal) score += 1;
  return score >= 4 ? "high" : score >= 2 ? "medium" : "low";
}
