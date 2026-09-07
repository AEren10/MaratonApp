export const EMPTY_TRIAL_SCORE = { correct: "", wrong: "" };

function parseCount(value) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function buildTrialSubjectScores(subjects, values, wrongPenalty) {
  const subjectsMap = {};
  const subjectsArr = [];
  let hasAny = false;
  let solvedCount = 0;

  subjects.forEach((subject) => {
    const value = values[subject.key] || EMPTY_TRIAL_SCORE;
    const correct = clamp(parseCount(value.correct), 0, subject.max);
    const wrong = clamp(parseCount(value.wrong), 0, Math.max(0, subject.max - correct));
    const remaining = Math.max(0, subject.max - correct - wrong);
    const empty = value.empty == null || value.empty === ""
      ? remaining
      : clamp(parseCount(value.empty), 0, remaining);
    const net = correct - wrong * wrongPenalty;

    if (correct || wrong) hasAny = true;
    solvedCount += correct + wrong;
    subjectsMap[subject.key] = { correct, wrong, net, empty };
    subjectsArr.push({
      subject: subject.key,
      correct_count: correct,
      wrong_count: wrong,
      empty_count: empty,
    });
  });

  return { hasAny, solvedCount, subjectsArr, subjectsMap };
}

export function buildTrialName({ branchSubjectName, title, trialType, typeMeta }) {
  if (title?.trim()) return title.trim();
  if (trialType === "BRANCH") return `${branchSubjectName || "Branş"} Branş`;
  return typeMeta?.label || trialType;
}
