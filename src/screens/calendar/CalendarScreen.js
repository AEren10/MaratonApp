import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../components/design";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogs } from "../../supabase/studyLogs";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { SCREENS } from "../../constants/screens";
import { MonthGrid } from "./components/MonthGrid";
import { DayDetails } from "./components/DayDetails";
import { MonthStats } from "./components/MonthStats";
import { useCalendarTasks } from "../../hooks/useCalendarTasks";

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function toIsoDate(d) {
  return d.toISOString().split("T")[0];
}
function monthLabel(date) {
  return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

function CalendarScreenInner() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => toIsoDate(new Date()));
  const { tasks: calendarTasks, addTask, toggleTask, removeTask } = useCalendarTasks();

  const monthStart = useMemo(() => startOfMonth(monthDate), [monthDate]);
  const monthEnd = useMemo(() => endOfMonth(monthDate), [monthDate]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getStudyLogs(user.id, { from: toIsoDate(monthStart), to: toIsoDate(monthEnd) })
      .then((data) => { if (!cancelled) setLogs(data || []); })
      .catch((e) => { if (!cancelled) { setLogs([]); setLoadError(e?.message || "Veriler yüklenemedi"); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, monthStart, monthEnd]);

  const dayMap = useMemo(() => {
    const map = {};
    logs.forEach((l) => {
      const d = l.study_date;
      if (!map[d]) map[d] = { logs: [], trials: [], totalMinutes: 0, totalQuestions: 0 };
      map[d].logs.push(l);
      map[d].totalMinutes += l.duration_minutes || 0;
      map[d].totalQuestions += l.question_count || 0;
    });
    trials.forEach((t) => {
      const d = t.date;
      if (d >= toIsoDate(monthStart) && d <= toIsoDate(monthEnd)) {
        if (!map[d]) map[d] = { logs: [], trials: [], totalMinutes: 0, totalQuestions: 0 };
        map[d].trials.push(t);
      }
    });
    return map;
  }, [logs, trials, monthStart, monthEnd]);

  const monthStats = useMemo(() => {
    let activeDays = 0, totalMinutes = 0, totalQuestions = 0, totalTrials = 0;
    Object.values(dayMap).forEach((d) => {
      activeDays += 1;
      totalMinutes += d.totalMinutes;
      totalQuestions += d.totalQuestions;
      totalTrials += d.trials.length;
    });
    return { activeDays, totalMinutes, totalQuestions, totalTrials };
  }, [dayMap]);

  const prevMonth = useCallback(() => {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);
  const nextMonth = useCallback(() => {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const selectedDayData = dayMap[selectedDay];

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityLabel="Geri"
          accessibilityRole="button"
          style={s.backBtn}
        >
          <Icon name="arrowL" size={18} color={C.text} />
        </Pressable>
        <Text style={s.title}>Takvim</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Month navigation */}
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={s.monthHeader}>
          <Pressable
            onPress={prevMonth}
            hitSlop={12}
            accessibilityLabel="Önceki ay"
            accessibilityRole="button"
            style={s.monthBtn}
          >
            <Icon name="arrowL" size={16} color={C.sec} />
          </Pressable>
          <Text style={s.monthLabel}>{monthLabel(monthDate)}</Text>
          <Pressable
            onPress={nextMonth}
            hitSlop={12}
            accessibilityLabel="Sonraki ay"
            accessibilityRole="button"
            style={s.monthBtn}
          >
            <Icon name="arrowR" size={16} color={C.sec} />
          </Pressable>
        </Animated.View>

        {loading ? (
          <View style={{ gap: SPACING.md }}>
            <SkeletonCard height={240} />
            <SkeletonCard height={80} />
          </View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(120).duration(400).springify()}>
              <MonthGrid
                monthDate={monthDate}
                dayMap={dayMap}
                selectedDay={selectedDay}
                onSelect={setSelectedDay}
                dailyGoal={dailyGoal}
                calendarTasks={calendarTasks}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
              <MonthStats stats={monthStats} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
              <DayDetails
                day={selectedDay}
                data={selectedDayData}
                onTrialPress={(t) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial: t })}
                calendarTasks={calendarTasks[selectedDay] || []}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onRemoveTask={removeTask}
              />
            </Animated.View>
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

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: "SpaceGrotesk_600SemiBold",
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.3,
      color: C.text,
    },
    scroll: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: 100,
    },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.lg,
    },
    monthBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabel: {
      fontFamily: "SpaceGrotesk_600SemiBold",
      fontSize: 17,
      lineHeight: 22,
      color: C.text,
      textTransform: "capitalize",
    },
  });
}
