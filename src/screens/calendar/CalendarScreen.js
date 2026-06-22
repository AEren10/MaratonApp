import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../components/design";
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

export default function CalendarScreen() {
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

  const monthStart = useMemo(() => startOfMonth(monthDate), [monthDate]);
  const monthEnd = useMemo(() => endOfMonth(monthDate), [monthDate]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    getStudyLogs(user.id, {
      from: toIsoDate(monthStart),
      to: toIsoDate(monthEnd),
    })
      .then((data) => {
        if (!cancelled) setLogs(data || []);
      })
      .catch((e) => {
        if (!cancelled) {
          setLogs([]);
          setLoadError(e?.message || "Veriler yüklenemedi");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user?.id, monthStart, monthEnd]);

  // Build day → activity map
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
    let activeDays = 0;
    let totalMinutes = 0;
    let totalQuestions = 0;
    let totalTrials = 0;
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
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Takvim</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(60).duration(400).springify()} style={s.monthHeader}>
          <Pressable onPress={prevMonth} hitSlop={12} accessibilityLabel="Önceki ay" accessibilityRole="button" style={s.monthBtn}>
            <Icon name="chevL" size={20} color={C.text} />
          </Pressable>
          <Text style={s.monthLabel}>{monthLabel(monthDate)}</Text>
          <Pressable onPress={nextMonth} hitSlop={12} accessibilityLabel="Sonraki ay" accessibilityRole="button" style={s.monthBtn}>
            <Icon name="chevR" size={20} color={C.text} />
          </Pressable>
        </Animated.View>

        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={C.accent} />
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
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
              <MonthStats stats={monthStats} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
              <DayDetails day={selectedDay} data={selectedDayData} onTrialPress={(t) => navigation.navigate(SCREENS.TRIAL_DETAIL, { trial: t })} />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: SPACING.lg,
    },
    monthBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: C.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabel: {
      ...TYPOGRAPHY.subheading,
      color: C.text,
      textTransform: "capitalize",
    },
    loadingBox: {
      paddingVertical: SPACING.huge,
      alignItems: "center",
    },
  });
}
