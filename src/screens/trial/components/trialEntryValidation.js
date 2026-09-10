// Form hatasi kurali: hesabin kendisinde kontrol edilir, alanin yaninda degil.
// Dogru+yanlis+bos toplami soru sayisini gecemez; asim varsa "bos" alani
// fazlaligi tasir (dogru/yanlis girisleri zaten SubjectInput icinde sinirlanir).
function toCount(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function findSubjectOverflow(subjects = [], values = {}) {
  for (const subject of subjects) {
    const raw = values[subject.key];
    if (!raw) continue;
    const correct = toCount(raw.correct);
    const wrong = toCount(raw.wrong);
    const remaining = Math.max(0, subject.max - correct - wrong);
    const empty = raw.empty == null || raw.empty === "" ? remaining : toCount(raw.empty);
    const total = correct + wrong + empty;
    if (total > subject.max) {
      return {
        subjectKey: subject.key,
        subjectName: subject.name,
        max: subject.max,
        total,
        correct,
        wrong,
        empty,
        excess: total - subject.max,
        fixedEmpty: Math.max(0, subject.max - correct - wrong),
      };
    }
  }
  return null;
}
