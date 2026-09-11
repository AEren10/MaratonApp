import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";

// Ders bazli deneme istatistikleri (Ort. Net / Dogru / Yanlis / Basari %).
// Tasarimin "Ders Konulari" artboard'unda karsiligi yok ama gercek veriye
// dayaniyor ve kullanici icin degerli — ders basliginin altinda kompakt
// bir blok olarak korunuyor.
export function useSubjectTrialStats(subjectKey) {
  const trials = useSelector(selectTrials);

  return useMemo(() => {
    const history = trials
      .filter((t) => t.subjects?.[subjectKey])
      .map((t) => ({
        net: t.subjects?.[subjectKey]?.net || 0,
        correct: t.subjects?.[subjectKey]?.correct || 0,
        wrong: t.subjects?.[subjectKey]?.wrong || 0,
      }));

    if (!history.length) {
      return { netAvg: 0, totalCorrect: 0, totalWrong: 0, accuracy: null, hasData: false };
    }

    const sumNet = history.reduce((s, h) => s + h.net, 0);
    const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
    const totalWrong = history.reduce((s, h) => s + h.wrong, 0);
    const total = totalCorrect + totalWrong;

    return {
      netAvg: (sumNet / history.length).toFixed(1),
      totalCorrect,
      totalWrong,
      accuracy: total > 0 ? Math.round((totalCorrect / total) * 100) : null,
      hasData: true,
    };
  }, [trials, subjectKey]);
}
