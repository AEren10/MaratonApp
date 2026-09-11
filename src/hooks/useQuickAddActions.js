import { useMemo } from "react";

import { firstRouteAction, routeActionTimerParams } from "../domain/route/routeStartAction";
import { SCREENS } from "../constants/screens";
import { useStudyRoute } from "./useStudyRoute";

// Hızlı Ekle sheet'inin ŞİMDİ satırı: rotanın sıradaki durağı.
// Rota yoksa/durak yoksa satır "Serbest çalışma başlat" olur (tasarım notu).
export function useQuickAddActions() {
  const { weeks, routeCreated } = useStudyRoute({ persist: false });

  const nextAction = useMemo(
    () => (routeCreated ? firstRouteAction(weeks.flatMap((week) => week.stops || [])) : null),
    [routeCreated, weeks],
  );

  const startParams = useMemo(
    () => (nextAction ? routeActionTimerParams(nextAction) : undefined),
    [nextAction],
  );

  return {
    nextAction,
    startScreen: SCREENS.STUDY_TIMER,
    startParams,
  };
}
