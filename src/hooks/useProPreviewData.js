import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../store/slices/trialSlice";
import { getSubjectByKey } from "../themes/subjects";

const MAX_ROWS = 3;

const fmt = (n) => n.toFixed(1).replace(".", ",");

function subjectTotal(entry) {
  return (entry.correct || 0) + (entry.wrong || 0) + (entry.empty || 0);
}

// Pro Onizleme'nin ust blogu: kullanicinin KENDI ucretsiz verisi.
// Uydurma ornek yok — kayitli deneme yoksa satir da yok, ekran o blogu
// hic gostermez.
//
// trials Redux'ta yeniden eskiye sirali (bkz. selectLatestTrial).
export function useProPreviewData() {
  const trials = useSelector(selectTrials);

  return useMemo(() => {
    const latest = trials?.[0];
    if (!latest?.subjects) return { rows: [], trialCount: trials?.length || 0 };

    const rows = Object.entries(latest.subjects)
      .map(([key, entry]) => {
        const total = subjectTotal(entry);
        if (!total) return null;
        const previous = trials.slice(1).find((t) => t.subjects?.[key]);
        return {
          key,
          name: getSubjectByKey(key)?.name || key,
          ratio: Math.max(0, Math.min(1, (entry.net || 0) / total)),
          value: previous
            ? `${fmt(previous.subjects[key].net || 0)} › ${fmt(entry.net || 0)}`
            : fmt(entry.net || 0),
        };
      })
      .filter(Boolean)
      .slice(0, MAX_ROWS);

    return { rows, trialCount: trials.length };
  }, [trials]);
}
