import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Skeleton, ErrorState } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import SegmentTabs from "../../components/common/SegmentTabs";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { MonthGrid } from "./components/MonthGrid";
import { DayDetails } from "./components/DayDetails";
import { DayDetailSheet } from "./components/DayDetailSheet";
import { StreakHero } from "./components/StreakHero";
import { StreakLegend } from "./components/StreakLegend";
import StreakMonthCard from "./components/StreakMonthCard";
import { CalendarFooter } from "./components/CalendarFooter";
import { CalendarSummaryLinks } from "./components/CalendarSummaryLinks";
import { useCalendarTasks } from "../../hooks/useCalendarTasks";
import { useCalendarMonth } from "../../hooks/useCalendarMonth";
import { dateKey } from "../../lib/dateUtils";
import { MONTHS_TR } from "../../lib/trWords";

const TABS = [{ key: "week", label: "Haftalık" }, { key: "month", label: "Aylık" }];
const enter = (i) => FadeInDown.delay(i * 70).duration(500);

// Tasarim AKIS 7 · "Takvim ve Seri" (Programım'ın Aylık sekmesi).
function CalendarScreenInner() {
  const C = useC();
  const navigation = useNavigation();
  const m = useCalendarMonth();
  const [selectedDay, setSelectedDay] = useState(() => dateKey(new Date()));
  const [sheetDay, setSheetDay] = useState(null);
  const { tasks: calendarTasks, addTask, toggleTask, removeTask } = useCalendarTasks();
  const closeSheet = useCallback(() => setSheetDay(null), []);
  const taskProps = { onAddTask: addTask, onToggleTask: toggleTask, onRemoveTask: removeTask };

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} accessibilityLabel="Geri" accessibilityRole="button" style={s.tap}>
          <Icon name="chevL" size={16} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, s.flex, { color: C.text }]}>Programım</Text>
        {m.isPastMonth ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>geçmiş ay</Text> : null}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SegmentTabs options={TABS} value="month" onChange={() => navigation.navigate(SCREENS.DAILY_PLAN)} />
        <Animated.View entering={enter(0)}>
          <StreakHero />
        </Animated.View>

        <View style={s.monthHeader}>
          <Pressable onPress={m.prevMonth} accessibilityLabel="Önceki ay" accessibilityRole="button" style={s.tap}>
            <Icon name="chevL" size={14} color={C.text3} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, s.monthLabel, { color: C.text }]}>
            {`${MONTHS_TR[m.monthDate.getMonth()]} ${m.monthDate.getFullYear()}`}
          </Text>
          <Pressable onPress={m.nextMonth} accessibilityLabel="Sonraki ay" accessibilityRole="button" style={s.tap}>
            <Icon name="chevR" size={14} color={C.text3} />
          </Pressable>
        </View>

        {m.loading ? (
          <View style={s.gap}>
            <Skeleton height={280} radius={SHAPE.panel} />
            <Skeleton height={80} radius={SHAPE.panel} />
          </View>
        ) : m.error ? (
          <ErrorState preset="server" onPrimary={m.reload} />
        ) : (
          <Animated.View entering={enter(1)}>
            <MonthGrid monthDate={m.monthDate} dayMap={m.dayMap} selectedDay={selectedDay} onSelect={setSelectedDay} dailyGoal={m.dailyGoal} />
            <StreakLegend />
            <View style={s.block}>
              <DayDetails
                day={selectedDay}
                data={m.dayMap[selectedDay]}
                onTrialPress={(t) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial: t })}
                onOpenDetail={setSheetDay}
                calendarTasks={calendarTasks[selectedDay] || []}
                {...taskProps}
              />
            </View>
            <StreakMonthCard monthDate={m.monthDate} stats={m.stats} />
            <CalendarSummaryLinks
              showDay={selectedDay === dateKey(new Date())}
              onDay={() => navigation.navigate(SCREENS.SUMMARY, { period: "day" })}
              onMonth={() => navigation.navigate(SCREENS.SUMMARY, { period: "month" })}
            />
          </Animated.View>
        )}

        <CalendarFooter tasksByDate={calendarTasks} />
      </ScrollView>

      {sheetDay ? (
        <DayDetailSheet
          key={sheetDay}
          day={sheetDay}
          data={m.dayMap[sheetDay]}
          calendarTasks={calendarTasks[sheetDay] || []}
          visible={!!sheetDay}
          onClose={closeSheet}
          {...taskProps}
        />
      ) : null}
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
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: GUTTER - STEP.s2, paddingTop: STEP.s1 / 2 },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 - 2, paddingBottom: STEP.s5 },
  monthHeader: { flexDirection: "row", alignItems: "center", marginTop: STEP.s4 - 4, marginBottom: STEP.s2 },
  monthLabel: { flex: 1, textAlign: "center", fontSize: TYPOGRAPHY.subheading.fontSize - 3 },
  gap: { gap: STEP.s2 },
  block: { marginTop: STEP.s3 },
});
