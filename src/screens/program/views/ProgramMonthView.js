import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useCalendarMonth } from "../../../hooks/useCalendarMonth";
import { useCalendarTasks } from "../../../hooks/useCalendarTasks";
import { todayTR } from "../../../lib/dateUtils";
import { GUTTER } from "../../../themes/tokens";
import { MonthSwitcher } from "../../calendar/components/MonthSwitcher";
import { CalendarStreakHero } from "../../calendar/components/CalendarStreakHero";
import { useStreakWeek } from "../../../hooks/useStreakWeek";
import { MonthGrid } from "../../calendar/components/MonthGrid";
import { StreakLegend } from "../../calendar/components/StreakLegend";
import StreakMonthCard from "../../calendar/components/StreakMonthCard";
import { DayDetails } from "../../calendar/components/DayDetails";
import { CalendarSkeleton } from "../../calendar/components/CalendarSkeleton";
import { useTabScrollTop } from "../../../hooks/useTabScrollTop";

// Ay: eski Takvim ve Aylik plan tek gorunumde. Buyuk "0 AKTIF SERI" basligi
// kalkti (sifir kahraman olmaz); denemeye basinca detay bu sekmede acilir,
// eskiden kullaniciyi Analiz sekmesine atiyordu.
export function ProgramMonthView() {
  const scrollRef = useTabScrollTop();
  const { value: streak, longest } = useStreakWeek();
  const C = useC();
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(() => todayTR());
  const { monthDate, dayMap, stats, dailyGoal, loading, prevMonth, nextMonth } = useCalendarMonth();
  const { tasks, addTask, toggleTask, removeTask } = useCalendarTasks();

  const handleTrialPress = useCallback((trial) => {
    if (trial?.id) navigation.navigate(SCREENS.TRIAL_DETAIL, { id: trial.id, trialId: trial.id, trial });
  }, [navigation]);

  if (loading) {
    return <View style={s.pad}><CalendarSkeleton /></View>;
  }

  return (
    // Gorev ekle girisi sayfanin dibinde: klavye acilinca iOS kaydirip gorunur tutsun.
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <CalendarStreakHero streak={streak} longest={longest} C={C} />
      <MonthSwitcher monthDate={monthDate} prevMonth={prevMonth} nextMonth={nextMonth} C={C} />
      <MonthGrid
        monthDate={monthDate}
        dayMap={dayMap}
        selectedDay={selectedDay}
        onSelect={setSelectedDay}
        dailyGoal={dailyGoal}
      />
      <StreakLegend />
      <DayDetails
        day={selectedDay}
        data={dayMap[selectedDay]}
        calendarTasks={tasks[selectedDay] || []}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onRemoveTask={removeTask}
        onTrialPress={handleTrialPress}
      />
      <StreakMonthCard
        monthDate={monthDate}
        stats={stats}
        onPress={() => navigation.navigate(SCREENS.SUMMARY, { period: "month" })}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
});
