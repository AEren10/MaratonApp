import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

function isToday(d) {
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

// Returns 0–3: 0 = no activity, 1 = light, 2 = medium, 3 = heavy
function activityLevel(data, dailyGoal) {
  if (!data || data.totalQuestions === 0) return 0;
  const pct = data.totalQuestions / (dailyGoal || 80);
  if (pct >= 1) return 3;
  if (pct >= 0.5) return 2;
  return 1;
}

const HEATMAP = [
  "transparent",
  "rgba(139,92,246,0.15)",
  "rgba(139,92,246,0.35)",
  "rgba(139,92,246,0.6)",
];

const makeStyles = (C) => ({
  wrap: {
    marginBottom: SPACING.lg,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    lineHeight: 14,
    color: C.muted,
    flex: 1,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flex: 1,
    borderWidth: 1,
    borderColor: "transparent",
  },
  dayText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
  trialDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export function MonthGrid({ monthDate, dayMap, selectedDay, onSelect, dailyGoal = 80, calendarTasks = {} }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const days = getCalendarDays(monthDate);

  return (
    <View style={styles.wrap}>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekLabel}>{w}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const iso = isoDate(d);
          const data = dayMap[iso];
          const lvl = activityLevel(data, dailyGoal);
          const isSelected = selectedDay === iso;
          const today = isToday(d);
          const hasTrial = data?.trials?.length > 0;
          const hasTask = calendarTasks[iso]?.length > 0;
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(iso)}
              style={[
                styles.cell,
                styles.dayCell,
                { backgroundColor: isSelected ? C.accent : HEATMAP[lvl] },
                today && !isSelected && { borderWidth: 1, borderColor: C.accent },
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? C.textOnFill : lvl > 0 ? C.text : C.muted },
                ]}
              >
                {d.getDate()}
              </Text>
              <View style={{ position: "absolute", bottom: 4, flexDirection: "row", gap: 3 }}>
                {hasTrial && (
                  <View style={[styles.trialDot, { backgroundColor: isSelected ? C.textOnFill : C.teal }]} />
                )}
                {hasTask && (
                  <View style={[styles.trialDot, { backgroundColor: isSelected ? C.textOnFill : C.accent }]} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
