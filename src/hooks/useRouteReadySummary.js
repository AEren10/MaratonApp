import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { baselineTarget } from "../domain/forecast/forecastTarget";
import { useStudyRoute } from "./useStudyRoute";
import { selectTYTTrials, selectLGSTrials } from "../store/slices/trialSlice";
import { getAllSubjectsFlat } from "../data/curriculum";
import { firstRouteAction } from "../domain/route/routeStartAction";
import { resolveRouteReadyCurrentNet } from "../domain/route/routeReadySummary";
import { upcomingRouteStops } from "../domain/route/upcomingStops";

const SUBJECT_LABELS = Object.fromEntries(
  getAllSubjectsFlat().map((s) => [s.key, s.label]),
);

// "Rota Hazır" ekraninin veri montaji. Kaynaklar: useExam (kalan gun/hedef
// ve seviye testinden gelen baslangic neti), useStudyRoute (durak listesi +
// kapasite), trials (varsa gercek guncel net).
// Route henuz olusturulmadigi icin (persist:false) computedRoute onizlemesi
// kullanilir — createRoute() ekranin "Ilk duraga basla" aksiyonunda cagrilir.
export function useRouteReadySummary() {
  const { daysUntilExam, examType, targetNet: targetSum, targetNetTYT, baselineNet } = useExam();
  // BUGUN ve HEDEF ayni sinavdan: TYT (LGS'de LGS). Eskiden BUGUN herhangi
  // turden son deneme (brans dahil), HEDEF TYT+AYT toplamiydi.
  const targetNet = baselineTarget({ examType, targetNet: targetSum, targetNetTYT }).target;
  const sameExamTrials = useSelector(examType === "lgs" ? selectLGSTrials : selectTYTTrials);
  const latestTrial = sameExamTrials[0] || null;
  const currentNet = resolveRouteReadyCurrentNet(latestTrial, baselineNet);
  const route = useStudyRoute({ persist: false });

  const allStops = useMemo(
    () => (route.weeks || []).flatMap((week) => week.stops || []),
    [route.weeks],
  );

  const upcomingStops = useMemo(() => upcomingRouteStops(allStops), [allStops]);

  const firstStopAction = useMemo(() => firstRouteAction(allStops), [allStops]);

  const firstStop = useMemo(() => {
    const stop = firstStopAction;
    if (!stop) return null;
    return {
      subjectLabel: (SUBJECT_LABELS[stop.subjectKey] || stop.subjectLabel || stop.subjectKey || "").toUpperCase(),
      topicName: stop.topicName,
      questions: stop.questions,
      minutes: stop.minutes,
      subjectKey: stop.subjectKey,
      reasonText: stop.reasonText,
      confidenceLabel: stop.confidenceLabel,
      impact: stop.impact,
    };
  }, [firstStopAction]);

  return {
    daysUntilExam,
    targetNet,
    currentNet,
    route,
    createRoute: route.createRoute,
    stopCount: allStops.length,
    upcomingStops,
    firstStop,
    firstStopAction,
  };
}
