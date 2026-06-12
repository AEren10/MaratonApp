import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogs } from "../../supabase/studyLogs";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
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
  const navigation = useNavigation();
  const { user } = useAuth();
  const trials = useSelector(selectTrials);
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
    getStudyLogs(user.id, {
      from: toIsoDate(monthStart),
      to: toIsoDate(monthEnd),
    })
      .then((data) => {
        if (!cancelled) setLogs(data || []);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
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
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Takvim</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.monthHeader}>
          <Pressable onPress={prevMonth} hitSlop={12} style={s.monthBtn}>
            <Icon name="chevL" size={20} color={C.text} />
          </Pressable>
          <Text style={s.monthLabel}>{monthLabel(monthDate)}</Text>
          <Pressable onPress={nextMonth} hitSlop={12} style={s.monthBtn}>
            <Icon name="chevR" size={20} color={C.text} />
          </Pressable>
        </View>

        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={C.amber} />
          </View>
        ) : (
          <>
            <MonthGrid
              monthDate={monthDate}
              dayMap={dayMap}
              selectedDay={selectedDay}
              onSelect={setSelectedDay}
            />

            <MonthStats stats={monthStats} />

            <DayDetails day={selectedDay} data={selectedDayData} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
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
