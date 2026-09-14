import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../store/slices/trialSlice";
import { useAuth } from "../contexts/AuthContext";
import { firstWeekStatus, FIRST_WEEK_DAYS } from "../domain/premium/paywallGate";

const MAX_POINTS = 6;
const netOf = (t) => Number(t?.rawTotalNet ?? t?.totalNet ?? 0);

// Paywall Ani'nin sayilari: kullanicinin KENDI kaydi. Son denemenin neti,
// ayni turdeki bir oncekine gore farki ve o turun son netleri (cizgi).
// Kayit yoksa hero null; ekran sayi satirini hic cizmez.
export function usePaywallMomentData() {
  const trials = useSelector(selectTrials);
  const { user } = useAuth();

  return useMemo(() => {
    const { dayNumber } = firstWeekStatus(user?.created_at);
    const pastFirstWeek = dayNumber != null && dayNumber > FIRST_WEEK_DAYS;

    const sorted = [...(trials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sorted[0];
    if (!latest) return { dayNumber, pastFirstWeek, hero: null };

    const sameType = sorted.filter((t) => t.trialType === latest.trialType);
    const previous = sameType[1];
    const points = sameType.slice(0, MAX_POINTS).reverse().map(netOf);

    return {
      dayNumber,
      pastFirstWeek,
      hero: {
        net: netOf(latest),
        delta: previous ? netOf(latest) - netOf(previous) : null,
        points,
      },
    };
  }, [trials, user?.created_at]);
}
