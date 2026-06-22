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
  // Convert Sunday(0) → 6, Monday(1) → 0
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push(date);
  }
  // Fill to multiple of 7
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

function isToday(d) {
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate();
}

function completionLevel(data, dailyGoal) {
  if (!data || data.totalQuestions === 0) return 0;
  const pct = data.totalQuestions / (dailyGoal || 80);
  if (pct >= 1) return 4;
  if (pct >= 0.7) return 3;
  if (pct >= 0.4) return 2;
  return 1;
}

const getCompletionColor = (C) => [
  "transparent",
  C.amber + "30",
  C.amber + "60",
  C.green + "50",
  C.green + "90",
];

const makeStyles = (C) => ({
  wrap: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: C.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  weekLabel: {
    ...TYPOGRAPHY.micro,
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
  },
  dayText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: C.text,
    fontSize: 13,
  },
  selected: {
    backgroundColor: C.accent,
  },
  today: {
    borderWidth: 1.5,
    borderColor: C.accent,
  },
  trialDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});

export function MonthGrid({ monthDate, dayMap, selectedDay, onSelect, dailyGoal = 80 }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const COMP_COLOR = useMemo(() => getCompletionColor(C), [C]);
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
          if (!d) {
            return <View key={i} style={styles.cell} />;
          }
          const iso = isoDate(d);
          const data = dayMap[iso];
          const lvl = completionLevel(data, dailyGoal);
          const isSelected = selectedDay === iso;
          const today = isToday(d);
          const hasTrial = data?.trials?.length > 0;
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(iso)}
              style={[
                styles.cell,
                styles.dayCell,
                { backgroundColor: COMP_COLOR[lvl] },
                isSelected && styles.selected,
                today && styles.today,
              ]}
            >
              <Text style={[styles.dayText, isSelected && { color: C.bg }]}>
                {d.getDate()}
              </Text>
              {hasTrial && (
                <View style={[styles.trialDot, { backgroundColor: isSelected ? C.bg : C.teal }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

