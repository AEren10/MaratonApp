import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { TAB_KEYS } from "../../navigation/tabAssignment";
import { openInTab } from "../../navigation/tabJump";
import { todayTR } from "../../lib/dateUtils";
import { GUTTER } from "../../themes/tokens";
import { useCalendarMonth } from "../../hooks/useCalendarMonth";
import { useCalendarTasks } from "../../hooks/useCalendarTasks";

import { CalendarHeader } from "./components/CalendarHeader";
import { MonthSwitcher } from "./components/MonthSwitcher";
import { StreakHero } from "./components/StreakHero";
import { MonthGrid } from "./components/MonthGrid";
import { StreakLegend } from "./components/StreakLegend";
import StreakMonthCard from "./components/StreakMonthCard";
import { DayDetails } from "./components/DayDetails";
import { CalendarFooter } from "./components/CalendarFooter";
import { CalendarSkeleton } from "./components/CalendarSkeleton";

function CalendarScreenInner() {
  const C = useC();
  const navigation = useNavigation();
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
  } = useCalendarMonth();

  const { tasks, addTask, toggleTask, removeTask } = useCalendarTasks();

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate(SCREENS.CURRICULUM_MAP);
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
        <CalendarHeader
          C={C}
          isPastMonth={isPastMonth}
          onBack={handleBack}
          onWeekTab={handleWeekTab}
        />

        {loading ? (
          <CalendarSkeleton />
        ) : (
          <>
            <StreakHero />
            <MonthSwitcher
              monthDate={monthDate}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              C={C}
            />
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

export default function CalendarScreen() {
  return (
    <ScreenErrorBoundary>
      <CalendarScreenInner />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
});
