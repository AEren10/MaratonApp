import { spreadSubjects } from "./subjectSpread.js";

// Konuları haftalara KAPASİTEYE göre yerleştirir.
//
// Eski motor `Math.ceil(konuSayısı / haftaSayısı)` ile eşit bölüyordu; bu,
// haftanın gerçekten kaç soruya yettiğini hiç sormuyordu. Burada her hafta
// bir soru/dakika bütçesidir ve konular bütçe dolana kadar konur.

// Bir haftanın bütçesinin tamamı yeni konuya verilmez: tekrar, deneme ve
// yanlış defteri için pay ayrılır. Aksi halde plan "sadece yeni konu"ya
// dönüşür ve öğrenci öğrendiğini unutur.
const NEW_TOPIC_SHARE = 0.65;
// DERS PAYI: bir dersin haftalik payi sinavdaki agirligiyla orantili
// (koclarin programlarinda sure soru sayisini izler: TYT'de Matematik 40,
// Felsefe 5 soru). Pay = agirlik orani x 1.5, en az %12, en fazla %35.
// Baska ders kalmadiysa sinir gevser.
const SUBJECT_SHARE = { min: 0.12, max: 0.35, stretch: 1.5 };
// Cekirdek dersler her hafta en az bu kadar durakla (her gun calisilan dersler).
const CORE_SUBJECTS = new Set(["turkce", "matematik", "lgs_turkce", "lgs_matematik"]);
const CORE_MIN_STOPS = 2;

function subjectShares(queue) {
  const weights = new Map();
  for (const it of queue) if (!it.isReview && it.subject) weights.set(it.subject, Number(it.subjectWeight) || 10);
  const total = [...weights.values()].reduce((a, b) => a + b, 0) || 1;
  const out = new Map();
  for (const [k, w] of weights) out.set(k, Math.min(SUBJECT_SHARE.max, Math.max(SUBJECT_SHARE.min, (w / total) * SUBJECT_SHARE.stretch)));
  return out;
}

// Cekirdek derslerin ilk duraklari sira basina (oncelik sirasini koruyarak).
function pullCoreForward(queue) {
  const picked = [];
  for (const key of CORE_SUBJECTS) {
    let n = 0;
    for (let i = 0; i < queue.length && n < CORE_MIN_STOPS; i += 1) {
      if (queue[i].subject === key && !queue[i].isReview) { picked.push(i); n += 1; }
    }
  }
  picked.sort((a, b) => a - b);
  const front = picked.map((i) => queue[i]);
  for (let i = picked.length - 1; i >= 0; i -= 1) queue.splice(picked[i], 1);
  queue.unshift(...front);
}
// Oncelikli konu haftaya sigmiyorsa bolunur -- ama kalan butce bu kadardan
// azsa bolmek anlamsiz kucuk bir parca uretir; o zaman kucuk konularla doldurulur.
const MIN_CHUNK_QUESTIONS = 10;
const MIN_CHUNK_MINUTES = 15;

// OTURUM BOYU: bir durak tek oturumda bitmeli. Butun konu tek durak olunca
// 57 soruluk Paragraf bir haftanin tamamini yiyordu (hafta boyu tek ders).
// Buyuk konu kisinin gunluk tempo kadar parcalara onceden bolunur; parcalar
// sirali kalir, spreadSubjects araya baska dersleri serpistirir.
const SESSION_CLAMP = [12, 30];
export function sessionQuestions(capacity = {}) {
  const perDay = (Number(capacity.questionsPerWeek) || 140) / Math.max(1, Number(capacity.activeDaysPerWeek) || 5);
  return Math.round(Math.min(SESSION_CLAMP[1], Math.max(SESSION_CLAMP[0], perDay)));
}

export function segmentItems(items = [], maxQuestions = 25) {
  const out = [];
  for (const item of items) {
    const q = Math.max(1, Number(item.cost?.questions) || 1);
    const n = Math.ceil(q / maxQuestions);
    // Parca numarasi konuda cozulmus hacimden baslar (bkz. routeIdentity):
    // 17 soru cozulmus konunun kalan isi 1. parcadan devam eder.
    const segmentBase = item.isReview ? 0 : Math.round((Number(item.q) || 0) / maxQuestions);
    if (n <= 1) { out.push(segmentBase ? { ...item, segmentBase } : item); continue; }
    const m = Number(item.cost?.minutes) || 0;
    for (let i = 0; i < n; i += 1) {
      const qi = Math.round((q * (i + 1)) / n) - Math.round((q * i) / n);
      const mi = Math.round((m * (i + 1)) / n) - Math.round((m * i) / n);
      out.push({
        ...item,
        cost: { ...item.cost, questions: qi, minutes: mi },
        partial: true,
        plannedQuestions: qi,
        segmentBase,
        ...(i > 0 ? { continued: true } : {}),
      });
    }
  }
  return out;
}

// Konuyu kalan butceye sigacak kadar boler; kalani kuyrugun basina doner.
function takePartial(next, questionsLeft, minutesLeft, position) {
  const questionCost = Math.max(1, Number(next.cost.questions) || 1);
  const minuteCost = Math.max(1, Number(next.cost.minutes) || 1);
  const ratio = Math.min(1, questionsLeft / questionCost, minutesLeft / minuteCost);
  const allocatedQuestions = Math.min(questionsLeft, Math.max(1, Math.floor(questionCost * ratio)));
  const allocatedMinutes = Math.min(minutesLeft, Math.max(1, Math.ceil(minuteCost * ratio)));
  const stop = {
    ...next,
    cost: { ...next.cost, questions: allocatedQuestions, minutes: allocatedMinutes },
    partial: allocatedQuestions < questionCost || allocatedMinutes < minuteCost,
    plannedQuestions: allocatedQuestions,
    position,
  };
  const remainingQuestions = questionCost - allocatedQuestions;
  const remainingMinutes = minuteCost - allocatedMinutes;
  const rest = remainingQuestions > 0 || remainingMinutes > 0
    ? {
      ...next,
      cost: { ...next.cost, questions: Math.max(0, remainingQuestions), minutes: Math.max(0, remainingMinutes) },
      continued: true,
    }
    : null;
  return { stop, rest, allocatedQuestions, allocatedMinutes };
}

/**
 * @param items     [{ ...topic, cost, score }] öncelik sırasında
 * @param capacity  { questionsPerWeek, minutesPerWeek }
 * @param weeksLeft kaç hafta planlanacak
 */
// firstWeekFraction: bu haftanin kalan payi (carsamba basliyorsa 5/7).
// Hafta ortasinda baslayan ogrenciye tam hafta yuklenmesin.
export function scheduleWeeks(items, capacity, weeksLeft, { daysLeft = null, firstWeekFraction = 1 } = {}) {
  const fullQuestionBudget = Math.max(1, Math.round(capacity.questionsPerWeek * NEW_TOPIC_SHARE));
  const fullMinuteBudget = Math.max(1, Math.round(capacity.minutesPerWeek * NEW_TOPIC_SHARE));
  const weeks = [];
  // Oncelik sirasi ayni dersi ust uste yigiyordu: ilk gun acilan kullanici
  // dort Turkce duragi goruyordu. spreadSubjects onceligi bozmadan ayni
  // dersten ust uste en fazla ikiye izin verir.
  const queue = spreadSubjects(segmentItems(items, sessionQuestions(capacity)));
  let overflow = [];

  for (let w = 0; w < weeksLeft; w++) {
    const isPartialLastWeek = daysLeft != null && w === weeksLeft - 1 && daysLeft % 7 > 0;
    const lastFraction = isPartialLastWeek ? (daysLeft % 7) / 7 : 1;
    const fraction = w === 0 ? Math.min(lastFraction, Math.max(0.15, firstWeekFraction)) : lastFraction;
    const questionBudget = Math.max(1, Math.floor(fullQuestionBudget * fraction));
    const minuteBudget = Math.max(1, Math.floor(fullMinuteBudget * fraction));
    let questionsLeft = questionBudget;
    let minutesLeft = minuteBudget;
    const stops = [];
    const subjectQ = new Map();
    const shares = subjectShares(queue);
    pullCoreForward(queue);
    const capOf = (subject) => Math.max(Math.round(questionBudget * (shares.get(subject) || SUBJECT_SHARE.max)), 25);
    const overCap = (item) => !item.isReview
      && (subjectQ.get(item.subject) || 0) + (Number(item.cost.questions) || 0) > capOf(item.subject)
      && queue.some((x) => x.subject !== item.subject && !x.isReview);

    // Öncelik sırasını koruyarak bütçeye SIĞAN ilk konuyu al.
    //
    // EN ONCELIKLI konu sigmiyorsa BOLUNUR, atlanmaz. Eskiden sigmayan
    // konu atlanip kucuk konular aliniyordu; butceden buyuk konu (Paragraf:
    // yilda ~20 soru, en yuksek oncelik) her hafta kucuklere yer kaptirip
    // sinav sonrasina (overflow) dusuyordu. Kalan butce anlamli bir parcaya
    // yetmiyorsa bosluk kucuk konularla doldurulur.
    let idx = 0;
    while (idx < queue.length && questionsLeft > 0 && minutesLeft > 0) {
      const questionCost = Math.max(1, Number(queue[idx].cost.questions) || 1);
      const minuteCost = Math.max(1, Number(queue[idx].cost.minutes) || 1);
      if (overCap(queue[idx])) { idx += 1; continue; }
      if (questionCost <= questionsLeft && minuteCost <= minutesLeft) {
        const [picked] = queue.splice(idx, 1);
        subjectQ.set(picked.subject, (subjectQ.get(picked.subject) || 0) + questionCost);
        stops.push({ ...picked, position: stops.length });
        questionsLeft -= questionCost;
        minutesLeft -= minuteCost;
        idx = 0; // baştan tara: öncelik sırası korunsun
        continue;
      }
      // Bolmek kirinti birakacaksa (kalan < 10 soru) bolme; sonraki hafta
      // butun sigar. Bu arada bosluk kucuk konularla dolar.
      const splitLeavesChunk = questionCost - Math.min(questionsLeft, questionCost) >= MIN_CHUNK_QUESTIONS;
      if (idx === 0 && splitLeavesChunk && questionsLeft >= MIN_CHUNK_QUESTIONS && minutesLeft >= MIN_CHUNK_MINUTES) {
        const head = queue.shift();
        const part = takePartial(head, questionsLeft, minutesLeft, stops.length);
        stops.push(part.stop);
        if (part.rest) queue.unshift(part.rest);
        questionsLeft -= part.allocatedQuestions;
        minutesLeft -= part.allocatedMinutes;
        continue;
      }
      idx += 1;
    }

    // Hiçbiri sığmadıysa, en öncelikli konu tek başına bir haftadan büyüktür.
    // Bölerek koy ki plan tıkanmasın (tasarımda "devam eden durak").
    if (stops.length === 0 && queue.length > 0) {
      const part = takePartial(queue.shift(), questionsLeft, minutesLeft, 0);
      stops.push(part.stop);
      if (part.rest) queue.unshift(part.rest);
      questionsLeft -= part.allocatedQuestions;
      minutesLeft -= part.allocatedMinutes;
    }

    if (stops.length === 0 && queue.length === 0) break;

    weeks.push({
      weekNo: w + 1,
      isCurrent: w === 0,
      stops,
      plannedQuestions: questionBudget - questionsLeft,
      plannedMinutes: stops.reduce(
        (sum, stop) => sum + Number(stop.cost?.minutes || 0),
        0,
      ),
      budgetQuestions: questionBudget,
      budgetMinutes: minuteBudget,
      capacityFraction: fraction,
      focusSubjects: topFocus(stops),
    });
  }

  // Süreye sığmayanlar — kullanıcıya dürüstçe söylenecek.
  overflow = queue;

  return { weeks, overflow };
}

function topFocus(stops) {
  const counts = {};
  for (const s of stops) {
    const key = s.subjectLabel || s.subject;
    if (!key) continue;
    counts[key] = (counts[key] || 0) + (s.cost?.questions || 1);
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([name]) => name);
}

/**
 * Sınava kalan güne göre planlanacak hafta sayısı.
 * Eski motor 12 haftada sabitliyordu — YKS hazırlığı 6-12 ay sürüyor,
 * dolayısıyla 12 haftanın ötesi hiç planlanmıyordu.
 */
export function weeksUntilExam(daysLeft, { min = 1, max = 60 } = {}) {
  if (daysLeft == null) return 12;
  return Math.max(min, Math.min(max, Math.ceil(daysLeft / 7)));
}
