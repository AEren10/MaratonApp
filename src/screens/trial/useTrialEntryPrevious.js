import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../../store/slices/trialSlice";

// "son denemeye gore" karsilastirmasinin kaynagi: ayni turdeki (brans ise
// ayni dersteki) en yeni kayitli deneme. Yoksa karsilastirma gosterilmez.
export function useTrialEntryPrevious({ trialType, branchSubject, excludeId = null }) {
  const trials = useSelector(selectTrials);
  return useMemo(() => {
    const same = (trials || [])
      .map((trial, index) => ({ trial, orderIndex: index }))
      .filter(({ trial }) => trial.trialType === trialType
        && trial.id !== excludeId
        && (trialType !== "BRANCH" || trial.branchSubject === branchSubject));
    if (!same.length) return null;
    return same.sort((a, b) => {
      const diff = new Date(b.trial.date) - new Date(a.trial.date);
      if (diff !== 0) return diff;
      const timeA = a.trial.created_at || a.trial.createdAt ? new Date(a.trial.created_at || a.trial.createdAt).getTime() : (Number(a.trial.id) > 1e9 ? Number(a.trial.id) : 0);
      const timeB = b.trial.created_at || b.trial.createdAt ? new Date(b.trial.created_at || b.trial.createdAt).getTime() : (Number(b.trial.id) > 1e9 ? Number(b.trial.id) : 0);
      if (timeA !== timeB) return timeB - timeA;
      return a.orderIndex - b.orderIndex;
    })[0]?.trial || null;
  }, [trials, trialType, branchSubject, excludeId]);
}
