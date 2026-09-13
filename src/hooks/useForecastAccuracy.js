import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { selectStats } from "../store/slices/gamificationSlice";
import { buildForecastAccuracyView } from "../domain/exam/forecastAccuracyView";
import { forecastAccuracyChart } from "../domain/exam/forecastAccuracyChart";
import { buildExamRecap, recapHasContent } from "../domain/exam/examRecap";
import { formatNumber } from "../lib/format";
import { SCREENS } from "../constants/screens";
import { useExamResultEntry } from "./useExamResultEntry";
import { useMilestone } from "./useMilestone";

// "Tahmin Doğruluğu" + "Tahmin Şaştı". Varyant secimi bant olcumune bagli
// (forecastAccuracyView.inRange), gozle degil. Sayilarin kaynaklari
// examRecap.js ve forecastAccuracyView.js basliklarinda.
export function useForecastAccuracy() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { baselineNet, examDate } = useExam();
  const stats = useSelector(selectStats);
  const { done: completedStops } = useMilestone();
  const { status, entry, retry } = useExamResultEntry();

  const view = useMemo(() => buildForecastAccuracyView({
    forecast: entry?.forecast,
    actualNet: entry?.record?.primaryNet,
    baselineNet,
  }), [entry, baselineNet]);

  const chart = useMemo(() => {
    if (!view?.hasForecast) return null;
    const forecast = entry.forecast;
    return forecastAccuracyChart({
      start: view.start ?? forecast.first,
      predicted: view.predicted,
      actual: view.actual,
      range: view.range,
      waypoints: forecast.waypoints,
      inRange: view.inRange !== false,
    });
  }, [view, entry]);

  const recap = useMemo(() => {
    const r = buildExamRecap({ stats, completedStops, startedAt: user?.created_at, examDate });
    if (!recapHasContent(r)) return null;
    const items = [
      [r.questions, "soru"], [r.hours, "sa"], [r.stops, "durak"], [r.trials, "deneme"],
    ].filter(([v]) => v != null).map(([v, unit]) => ({ value: formatNumber(v), unit }));
    return { title: `${r.days} GÜNÜN KAYDI`, items };
  }, [stats, completedStops, user?.created_at, examDate]);

  return {
    status: status === "ready" && !view ? "empty" : status,
    view,
    chart,
    recap,
    retry,
    back: navigation.goBack,
    enterResult: () => navigation.replace(SCREENS.EXAM_RESULT),
    share: () => navigation.navigate(SCREENS.SHARE_CARD),
  };
}
