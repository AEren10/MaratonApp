// DENEME PLANI (saf). Koclarin ritmi: sinava uzakken haftada bir TYT,
// son 6 ayda TYT + AYT, son 3 ayda haftada iki, son ayda uc gunde bir.
// Son denemede belirgin dusen ders varsa o hafta o dersten branş denemesi.
// Bu hafta o turden deneme girildiyse oneri "yapildi" sayilir.

const BRANCH_DROP = 2; // net

const dateOf = (t) => String(t?.date || t?.trial_date || "").slice(0, 10);
const typeOf = (t) => t?.trialType || t?.exam_type || "TYT";

/** Sinava kalan gune gore haftalik deneme sayisi. */
export function trialsPerWeek(daysLeft) {
  if (daysLeft == null) return 1;
  if (daysLeft <= 30) return 3;
  if (daysLeft <= 90) return 2;
  return 1;
}

function secondTypeOf(examType, field) {
  if (examType === "dil") return "YDT";
  if (examType !== "tyt_ayt") return null;
  return field === "ea" ? "AYT_EA" : field === "sozel" ? "AYT_SOZ" : "AYT_SAY";
}

// Haftanin gunleri (Pzt=0): deneme genelde hafta sonu; sikilastikca araya.
const DAY_SLOTS = { 1: [5], 2: [2, 5], 3: [1, 4, 6], 4: [0, 2, 4, 6] };

/** Son iki ayni turden tam denemede neti belirgin dusen ders (deneme ders anahtari). */
export function branchDrop(trials = []) {
  const full = [...(trials || [])]
    .filter((t) => !(t?.branchSubject || t?.branch_subject) && typeOf(t) !== "BRANCH")
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
  const [now] = full;
  const prev = full.find((t, i) => i > 0 && typeOf(t) === typeOf(now));
  if (!now || !prev) return null;
  let worst = null;
  for (const [key, data] of Object.entries(now.subjects || {})) {
    const a = Number(prev.subjects?.[key]?.net);
    const b = Number(data?.net);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    const drop = a - b;
    if (drop >= BRANCH_DROP && (!worst || drop > worst.drop)) worst = { key, drop };
  }
  return worst;
}

/**
 * @returns [{ id, kind: "full"|"branch", trialType, branchSubject, dayIndex, done, reason }]
 */
export function weekTrialPlan({ daysLeft, examType, field, trials = [], weekStart, weekEnd } = {}) {
  if (!weekStart || !weekEnd || daysLeft == null || daysLeft < 0) return [];
  const isLgs = examType === "lgs";
  const first = isLgs ? "LGS" : "TYT";
  const second = isLgs ? null : secondTypeOf(examType, field);
  const n = trialsPerWeek(daysLeft);
  // Iki turlu sinavda: son 6 ay her hafta ikinci tur de; daha erken iki haftada bir.
  const weekNo = Math.floor(new Date(`${weekStart}T12:00:00Z`).getTime() / (7 * 86400000));
  const wantSecond = second && (daysLeft <= 180 || weekNo % 2 === 0);
  const types = [];
  for (let i = 0; i < n; i += 1) types.push(wantSecond && i % 2 === 1 ? second : first);
  if (wantSecond && n === 1) types.push(second);

  const inWeek = (t) => { const d = dateOf(t); return d >= weekStart && d <= weekEnd; };
  const doneCount = new Map();
  for (const t of trials || []) if (inWeek(t)) doneCount.set(typeOf(t), (doneCount.get(typeOf(t)) || 0) + 1);
  const used = new Map();
  const slots = DAY_SLOTS[Math.min(4, types.length)] || DAY_SLOTS[1];

  const plan = types.map((trialType, i) => {
    const k = (used.get(trialType) || 0) + 1;
    used.set(trialType, k);
    return {
      id: `trial:${weekStart}:${trialType}:${k}`,
      kind: "full",
      trialType,
      branchSubject: null,
      dayIndex: slots[i] ?? 5,
      done: (doneCount.get(trialType) || 0) >= k,
      reason: daysLeft <= 90 ? "Sınava yaklaştıkça deneme sıklaşır." : "Haftalık deneme: rotan sonuca göre yeniden çizilir.",
    };
  });

  const drop = branchDrop(trials);
  if (drop) {
    plan.push({
      id: `trial:${weekStart}:BRANCH:${drop.key}`,
      kind: "branch",
      trialType: "BRANCH",
      branchSubject: drop.key,
      dayIndex: 3,
      done: (trials || []).some((t) => inWeek(t) && (t.branchSubject || t.branch_subject) === drop.key),
      reason: `Son denemede bu derste ${Math.round(drop.drop * 10) / 10} net düşüş var.`,
    });
  }
  return plan;
}
