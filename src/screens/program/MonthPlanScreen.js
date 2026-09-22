import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import { useC } from "../../contexts/ThemeContext";
import { useCalendarMonth } from "../../hooks/useCalendarMonth";
import { useCalendarTasks } from "../../hooks/useCalendarTasks";
import { dateKey, todayTR } from "../../lib/dateUtils";
import { GUTTER, STEP } from "../../themes/tokens";
import { CalendarFooter } from "../calendar/components/CalendarFooter";
import { CalendarHeader } from "../calendar/components/CalendarHeader";
import { CalendarSkeleton } from "../calendar/components/CalendarSkeleton";
import { DayDetails } from "../calendar/components/DayDetails";
import { MonthGrid } from "../calendar/components/MonthGrid";
import { MonthSwitcher } from "../calendar/components/MonthSwitcher";
import { StreakHero } from "../calendar/components/StreakHero";
import { StreakLegend } from "../calendar/components/StreakLegend";
import StreakMonthCard from "../calendar/components/StreakMonthCard";

function firstSelectableDay(monthDate, dayMap = {}) {
  const today = new Date();
  const sameMonth = today.getFullYear() === monthDate.getFullYear()
    && today.getMonth() === monthDate.getMonth();
  if (sameMonth) return dateKey(today);

  const lastActive = Object.keys(dayMap)
    .filter((key) => {
      const day = dayMap[key];
      return day?.logs?.length || day?.trials?.length;
    })
    .sort()
    .at(-1);

  return lastActive || dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
}

function MonthPlanInner() {
  const C = useC();
  const navigation = useNavigation();
  const { params } = useRoute();
  const initialOffset = Number(params?.monthOffset) || 0;
  const [selectedDay, setSelectedDay] = useState(() => todayTR());
  const {
    monthDate,
    dayMap,
    stats,
    dailyGoal,
    loading,
    isPastMonth,
    prevMonth,
    nextMonth,
  } = useCalendarMonth(initialOffset);
  const { tasks, addTask, toggleTask, removeTask } = useCalendarTasks();

  useEffect(() => {
    setSelectedDay(firstSelectableDay(monthDate, dayMap));
  }, [monthDate, dayMap]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.CURRICULUM_MAP_ROOT);
  }, [navigation]);

  const handleWeekTab = useCallback(() => {
    openInTab(navigation, TAB_KEYS.PROGRAM, SCREENS.DAILY_PLAN);
  }, [navigation]);

  const handleTrialPress = useCallback((trial) => {
    if (trial?.id) openInTab(navigation, TAB_KEYS.ANALIZ, SCREENS.TRIAL_DETAIL, { id: trial.id, trialId: trial.id, trial });
  }, [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <CalendarHeader C={C} isPastMonth={isPastMonth} onBack={handleBack} onWeekTab={handleWeekTab} />
        {loading ? (
          <CalendarSkeleton />
        ) : (
          <>
            <StreakHero />
            <MonthSwitcher monthDate={monthDate} prevMonth={prevMonth} nextMonth={nextMonth} C={C} />
            <MonthGrid
              monthDate={monthDate}
              dayMap={dayMap}
              selectedDay={selectedDay}
              onSelect={setSelectedDay}
              dailyGoal={dailyGoal}
            />
            <StreakLegend />
            <StreakMonthCard monthDate={monthDate} stats={stats} />
            <DayDetails
              day={selectedDay}
              data={dayMap[selectedDay]}
              calendarTasks={tasks[selectedDay] || []}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onRemoveTask={removeTask}
              onTrialPress={handleTrialPress}
            />
            <CalendarFooter tasksByDate={tasks} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MonthPlanScreen() {
  return (
    <ScreenErrorBoundary>
      <MonthPlanInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
});
