import { useMemo } from "react";

import { firstRouteAction, routeActionTimerParams } from "../domain/route/routeStartAction";
import { todayPlanStops } from "../domain/program/todayStops";
import { todayTR } from "../lib/dateUtils";
import { SCREENS } from "../constants/screens";
import { useStudyRoute } from "./useStudyRoute";
import { useClassSchedule } from "./useClassSchedule";

// + panelinin SIMDI karti: BUGUNUN siradaki duragi. Ana sayfa ve Program ile
// ayni liste (ders programinin bugune dusurdugu duraklar). Eskiden rotanin
// tamamindan secildigi icin ana sayfada Turkce yazarken burada Felsefe
// cikabiliyordu. Bugun durak yoksa kart "Serbest calisma baslat" olur.
export function useQuickAddActions() {
  const { currentWeek, routeCreated } = useStudyRoute({ persist: false });
  const { schedule } = useClassSchedule();

  const nextAction = useMemo(
    () => (routeCreated ? firstRouteAction(todayPlanStops(currentWeek, schedule, todayTR())) : null),
    [routeCreated, currentWeek, schedule],
  );

  const startParams = useMemo(
    () => (nextAction ? routeActionTimerParams(nextAction) : undefined),
    [nextAction],
  );

  return { nextAction, startScreen: SCREENS.STUDY_TIMER, startParams };
}
