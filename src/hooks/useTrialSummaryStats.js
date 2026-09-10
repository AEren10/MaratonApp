import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";

// "EN İYİ DENEMEN / SON 5 ORTALAMAN" — son hafta hero varyantlarının
// ihtiyaç duyduğu tek veri. Deneme yoksa null döner, çağıran taraf o
// bloğu hiç render etmemeli (uydurma sayı yok).
export function useTrialSummaryStats() {
  const trials = useSelector(selectTrials);

  return useMemo(() => {
    if (!trials?.length) return null;
    const nets = trials
      .map((t) => t.normalizedTotalNet ?? t.totalNet)
      .filter((n) => Number.isFinite(n));
    if (!nets.length) return null;

    const best = Math.round(Math.max(...nets));
    const recent = nets.slice(0, 5);
    const average = Math.round(recent.reduce((s, n) => s + n, 0) / recent.length);

    return { best, average };
  }, [trials]);
}
