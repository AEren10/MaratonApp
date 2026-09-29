import { useEffect, useMemo, useState } from "react";

import { firstRouteAction, routeActionTimerParams } from "../domain/route/routeStartAction";
import { todayPlanStops } from "../domain/program/todayStops";
import { useWeekdayRhythm } from "../lib/weekdayRhythmStore";
import { isRehearsalDay } from "../domain/exam/examRehearsal";
import { loadRehearsal } from "../lib/examRehearsalStore";
import { todayTR } from "../lib/dateUtils";
import { SCREENS } from "../constants/screens";
import { useAuth } from "../contexts/AuthContext";
import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";

// + panelinin SIMDI karti: BUGUNUN siradaki duragi. Ana sayfa ve Program ile
// ayni liste ve ayni kural: ders programi sirasindaki ILK ACIK durak (ACTIVE
// durum onceligi yok; ana sayfa da sirayla gider). Bugun durak yoksa ya da
// deneme provasi gunuyse kart "Serbest calisma baslat" olur.
export function useQuickAddActions(visible = true) {
  const { user } = useAuth();
  const { currentWeek } = useStudyRoute({ persist: false });
  const { schedule, ready: scheduleReady } = useClassSchedule();
  const rhythm = useWeekdayRhythm();
  const [rehearsal, setRehearsal] = useState(false);

  // Panel her acildiginda tazelenir (TabBar'da ekran baglami yok, odak yok).
  useEffect(() => {
    if (!visible) return undefined;
    let alive = true;
    loadRehearsal(user?.id).then((r) => { if (alive) setRehearsal(isRehearsalDay(r)); }).catch(() => {});
    return () => { alive = false; };
  }, [visible, user?.id]);

  const nextAction = useMemo(() => {
    if (rehearsal || !scheduleReady) return null;
    for (const stop of todayPlanStops(currentWeek, schedule, todayTR(), { rhythm })) {
      const action = firstRouteAction([stop]);
      if (action) return action;
    }
    return null;
  }, [rehearsal, currentWeek, schedule, scheduleReady, rhythm]);

  const startParams = useMemo(
    () => (nextAction ? routeActionTimerParams(nextAction) : undefined),
    [nextAction],
  );

  return { nextAction, startScreen: SCREENS.STUDY_TIMER, startParams };
}
