import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../../store/slices/trialSlice";

// "son denemeye gore" karsilastirmasinin kaynagi: ayni turdeki (brans ise
// ayni dersteki) en yeni kayitli deneme. Yoksa karsilastirma gosterilmez.
export function useTrialEntryPrevious({ trialType, branchSubject, excludeId = null }) {
  const trials = useSelector(selectTrials);
  return useMemo(() => {
    const same = (trials || []).filter((trial) => trial.trialType === trialType
      && trial.id !== excludeId
      && (trialType !== "BRANCH" || trial.branchSubject === branchSubject));
    if (!same.length) return null;
    return [...same].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [trials, trialType, branchSubject, excludeId]);
}
