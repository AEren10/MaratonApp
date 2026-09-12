import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { SCREENS } from "../../../constants/screens";
import { trackButtonTap } from "../../../lib/analytics";
import { selectStats } from "../../../store/slices/gamificationSlice";
import { getSubjectByKey } from "../../../themes/subjects";
import { DayCompleteModal } from "../../../components/common/completion/DayCompleteModal";
import { RouteCompleteModal } from "../../../components/common/completion/RouteCompleteModal";
import { HomeWeekComplete } from "./HomeWeekComplete";

function dayLabels(items = []) {
  const labels = items.map((item) => getSubjectByKey(item.subject)?.label || null);
  return labels.every(Boolean) ? labels : [];
}

// Tamamlama anlari (AKIS 16). Baska bir modal acikken ya da ekran odakta
// degilken cizilmez; an kaybolmaz, engel kalkinca gelir.
export function HomeCompletionOverlays({
  blocked,
  completion,
  daysLeft,
  minutesToday,
  navigation,
  solvedToday,
}) {
  const focused = useIsFocused();
  const stats = useSelector(selectStats);
  const { moment, week, day, dismiss } = completion;
  const labels = useMemo(() => dayLabels(day?.items), [day]);

  if (!moment || blocked || !focused) return null;

  const go = (id, screen, params) => () => {
    trackButtonTap(id, { targetScreen: screen });
    dismiss();
    navigation.navigate(screen, params);
  };

  if (moment === "route") {
    return (
      <RouteCompleteModal
        visible
        totalQuestions={stats?.totalQuestions || 0}
        totalMinutes={stats?.totalMinutes || 0}
        daysLeft={daysLeft}
        onClose={dismiss}
        onYearRoute={go("home_route_complete_roadmap", SCREENS.ROADMAP)}
      />
    );
  }

  if (moment === "week") {
    return (
      <HomeWeekComplete
        week={week}
        onClose={dismiss}
        onNextWeek={go("home_week_complete_next", SCREENS.ROADMAP)}
        onWeeklySummary={go("home_week_complete_summary", SCREENS.WEEKLY_REVIEW)}
      />
    );
  }

  return (
    <DayCompleteModal
      visible
      stopCount={day?.items?.length || 0}
      solvedToday={solvedToday}
      minutesToday={minutesToday}
      stopLabels={labels}
      onClose={dismiss}
      onSummary={go("home_day_complete_summary", SCREENS.SUMMARY, { period: "day" })}
      onShare={go("home_day_complete_share", SCREENS.SHARE_CARD)}
    />
  );
}
