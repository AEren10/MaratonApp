import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { useStudyRoute } from "./useStudyRoute";
import { selectLatestTrial } from "../store/slices/trialSlice";
import { getAllSubjectsFlat } from "../data/curriculum";

const SUBJECT_LABELS = Object.fromEntries(
  getAllSubjectsFlat().map((s) => [s.key, s.label]),
);

// "Rota Hazır" ekraninin veri montaji. Kaynaklar: useExam (kalan gun/hedef),
// useStudyRoute (durak listesi + kapasite), trials (guncel net).
// Route henuz olusturulmadigi icin (persist:false) computedRoute onizlemesi
// kullanilir — createRoute() ekranin "Ilk duraga basla" aksiyonunda cagrilir.
export function useRouteReadySummary() {
  const { daysUntilExam, targetNet } = useExam();
  const latestTrial = useSelector(selectLatestTrial);
  const currentNet = latestTrial?.normalizedTotalNet ?? latestTrial?.totalNet ?? null;
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
    const stop = allStops[0];
    if (!stop) return null;
    return {
      subjectLabel: (SUBJECT_LABELS[stop.subject] || stop.subject || "").toUpperCase(),
      topicName: stop.topic,
      questions: stop.cost?.questions || 0,
      minutes: stop.cost?.minutes || 0,
      subjectKey: stop.subject,
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
