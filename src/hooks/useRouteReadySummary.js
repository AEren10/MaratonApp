import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { useStudyRoute } from "./useStudyRoute";
import { selectLatestTrial } from "../store/slices/trialSlice";
import { getAllSubjectsFlat } from "../data/curriculum";
import { firstRouteAction } from "../domain/route/routeStartAction";
import { resolveRouteReadyCurrentNet } from "../domain/route/routeReadySummary";

const SUBJECT_LABELS = Object.fromEntries(
  getAllSubjectsFlat().map((s) => [s.key, s.label]),
);

// "Rota Hazır" ekraninin veri montaji. Kaynaklar: useExam (kalan gun/hedef
// ve seviye testinden gelen baslangic neti), useStudyRoute (durak listesi +
// kapasite), trials (varsa gercek guncel net).
// Route henuz olusturulmadigi icin (persist:false) computedRoute onizlemesi
// kullanilir — createRoute() ekranin "Ilk duraga basla" aksiyonunda cagrilir.
export function useRouteReadySummary() {
  const { daysUntilExam, targetNet, baselineNet } = useExam();
  const latestTrial = useSelector(selectLatestTrial);
  const currentNet = resolveRouteReadyCurrentNet(latestTrial, baselineNet);
  const route = useStudyRoute({ persist: false });

  const allStops = useMemo(
    () => (route.weeks || []).flatMap((week) => week.stops || []),
    [route.weeks],
  );

  const upcomingStops = useMemo(() => allStops.slice(0, 4).map((stop, index) => ({
    key: stop.stopId || `${stop.subject}-${stop.topic}-${index}`,
    position: index + 1,
    subject: stop.subject,
    name: stop.topic,
    when: index === 0 ? "Bugün" : `${index + 1}. durak`,
  })), [allStops]);

  const firstStop = useMemo(() => {
    const stop = firstRouteAction(allStops);
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
  }, [allStops]);

  return {
    daysUntilExam,
    targetNet,
    currentNet,
    route,
    createRoute: route.createRoute,
    stopCount: allStops.length,
    upcomingStops,
    firstStop,
  };
}
