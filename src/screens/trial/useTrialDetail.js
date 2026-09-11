import { useMemo } from "react";

import { getTrialTypes, getAllSubjects } from "../../domain/trial/trialTypes";
import { forecastNet } from "../../lib/netForecast";
import { useExam } from "../../contexts/ExamContext";

const DIFFICULTY_LABEL = {
  easy: "Kolay",
  standard: "Standart",
  hard: "Zor",
  very_hard: "Çok zor",
};

function getSubjectsForTrial(trial, C) {
  const ALL_SUBJECTS = getAllSubjects(C);
  const TRIAL_TYPES = getTrialTypes(C);
  if (!trial?.trialType) {
    return Object.keys(trial?.subjects || {}).map((k) => {
      const found = ALL_SUBJECTS.find((s) => s.key === k);
      return found || { key: k, name: k, color: C.amber, max: 40 };
    });
  }
  if (trial.trialType === "BRANCH" && trial.branchSubject) {
    return ALL_SUBJECTS.filter((s) => s.key === trial.branchSubject);
  }
  const type = TRIAL_TYPES[trial.trialType];
  return type?.subjects || [];
}

// Deneme Detayı ekranının tüm türetilmiş verisi burada — ekran dosyası
// sadece render eder. trialModel.normalizeTrial zaten ham/normalize net,
// yayın zorluk çarpanını hesaplıyor; burada sadece görüntüye uyarlanıyor.
export function useTrialDetail({ latest, trials, C }) {
  const { examDate } = useExam();

  const subjects = useMemo(() => getSubjectsForTrial(latest, C), [latest, C]);

  const sorted = useMemo(
    () => [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trials],
  );

  const { sameTypeTrials, prev } = useMemo(() => {
    const same = sorted.filter((t) => t.trialType === latest.trialType);
    const idx = same.findIndex((t) => t.id === latest.id);
    return { sameTypeTrials: same, prev: same[idx + 1] };
  }, [sorted, latest]);

  const totalMax = useMemo(() => subjects.reduce((sum, s) => sum + s.max, 0), [subjects]);
  const typeMeta = getTrialTypes(C)[latest.trialType];

  const rawNet = latest.rawTotalNet ?? latest.totalNet ?? 0;
  const normalizedNet = latest.normalizedTotalNet ?? rawNet;
  const hasNormalization = Math.abs(normalizedNet - rawNet) >= 0.01;

  const trend = prev ? rawNet - (prev.rawTotalNet ?? prev.totalNet ?? 0) : 0;

  const bars = useMemo(() => subjects.map((s) => ({
    key: s.key,
    name: s.name,
    c: s.color,
    net: latest.subjects?.[s.key]?.net || 0,
    correct: latest.subjects?.[s.key]?.correct || 0,
    wrong: latest.subjects?.[s.key]?.wrong || 0,
    empty: latest.subjects?.[s.key]?.empty || 0,
    max: s.max,
  })), [subjects, latest]);

  const difficultyLabel = DIFFICULTY_LABEL[latest.difficultyLevel] || null;
  // Tasarımın "zor" kartı yalnızca hard/very_hard için birebir kopya taşıyor;
  // diğer seviyeler için uydurma metin yazmıyoruz.
  const showDifficultyCard = latest.difficultyLevel === "hard" || latest.difficultyLevel === "very_hard";

  const routeImpact = useMemo(() => {
    if (!examDate || sameTypeTrials.length < 4) return null;
    const before = forecastNet(
      sameTypeTrials.filter((t) => t.id !== latest.id), examDate, totalMax || null, latest.trialType,
    );
    const after = forecastNet(sameTypeTrials, examDate, totalMax || null, latest.trialType);
    if (!before || !after) return null;
    return { before: Math.round(before.projected), after: Math.round(after.projected) };
  }, [examDate, sameTypeTrials, latest, totalMax]);

  return {
    subjects, bars, prev, totalMax, typeMeta,
    rawNet, normalizedNet, hasNormalization, trend,
    difficultyLabel, showDifficultyCard, routeImpact,
    publisherLabel: latest.publisherNameSnapshot || "Yayın",
    difficultyMultiplier: latest.difficultyMultiplier ?? 1,
  };
}
