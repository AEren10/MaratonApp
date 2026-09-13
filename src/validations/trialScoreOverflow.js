// Form Hatasi kurali: hata alanin yaninda degil, hesabin kendisinde.
// Dogru+yanlis+bos toplami soru sayisini gecemez. Asim, fazlaligi tasiyabilen
// alana yazilir: elle girilmis bos yeterliyse bos, degilse yanlis, sonra dogru.
function toCount(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function blameField({ correct, wrong, manualEmpty, excess }) {
  if (manualEmpty != null && manualEmpty >= excess) return "empty";
  if (wrong >= excess) return "wrong";
  return "correct";
}

export function findSubjectOverflow(subjects = [], values = {}) {
  for (const subject of subjects) {
    const raw = values[subject.key];
    if (!raw) continue;
    const correct = toCount(raw.correct);
    const wrong = toCount(raw.wrong);
    const manualEmpty = raw.empty == null || raw.empty === "" ? null : toCount(raw.empty);
    const empty = manualEmpty ?? Math.max(0, subject.max - correct - wrong);
    const total = correct + wrong + empty;
    if (total <= subject.max) continue;
    const excess = total - subject.max;
    const field = blameField({ correct, wrong, manualEmpty, excess });
    const current = { correct, wrong, empty }[field];
    return {
      subjectKey: subject.key,
      subjectName: subject.name,
      max: subject.max,
      total,
      correct,
      wrong,
      empty,
      excess,
      field,
      fixedValue: Math.max(0, current - excess),
    };
  }
  return null;
}
