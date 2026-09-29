import { useEffect, useMemo, useState } from "react";

import { useWeekdayRhythm } from "../lib/weekdayRhythmStore";
import { useStopMoves } from "./useStopMoves";
import { useAuth } from "../contexts/AuthContext";
import { loadRehearsal } from "../lib/examRehearsalStore";

// Gun dagitiminin ortak girdileri: gun ritmi + ogrencinin tasimalari +
// deneme provasi gunu (o gun durak dusmez). Dagitim yapan HER ekran bunu
// gecmeli; yoksa ayni durak farkli gunde gorunur.
export function useDayPlanOptions() {
  const rhythm = useWeekdayRhythm();
  const { moves } = useStopMoves();
  const { user } = useAuth();
  const [rehearsalDate, setRehearsalDate] = useState(null);
  useEffect(() => {
    let alive = true;
    loadRehearsal(user?.id)
      .then((r) => { if (alive) setRehearsalDate(r?.dateKey || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, [user?.id]);
  return useMemo(
    () => ({ rhythm, moves, blockedDates: rehearsalDate ? [rehearsalDate] : null }),
    [rhythm, moves, rehearsalDate],
  );
}
