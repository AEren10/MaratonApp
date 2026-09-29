import { useMemo } from "react";

import { useWeekdayRhythm } from "../lib/weekdayRhythmStore";
import { useStopMoves } from "./useStopMoves";

// Gun dagitiminin ortak girdileri: gun ritmi + ogrencinin tasimalari.
// Dagitim yapan HER ekran bunu gecmeli; yoksa ayni durak farkli gunde gorunur.
export function useDayPlanOptions() {
  const rhythm = useWeekdayRhythm();
  const { moves } = useStopMoves();
  return useMemo(() => ({ rhythm, moves }), [rhythm, moves]);
}
