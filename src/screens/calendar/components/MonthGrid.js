import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { dateKey, todayTR } from "../../../lib/dateUtils";

const WEEKDAYS = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

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

// 0 = kayit yok, 1 = hafif, 2 = orta, 3 = hedefi tuttu
function activityLevel(data, dailyGoal) {
  if (!data || data.totalQuestions === 0) return 0;
  const pct = data.totalQuestions / (dailyGoal || 80);
  if (pct >= 1) return 3;
  if (pct >= 0.5) return 2;
  return 1;
}

// Gunun calisilan derslerinden en fazla 2 nokta — ders baglaminda renk,
// gun durumunu boyamaz.
function subjectDots(data) {
  if (!data?.logs?.length) return [];
  const seen = [];
  for (const l of data.logs) {
    const subj = getSubjectByKey(l.subject);
    const color = subj?.color;
    if (color && !seen.includes(color)) seen.push(color);
    if (seen.length === 2) break;
  }
  return seen;
}

function DayCell({ date, iso, data, dailyGoal, isSelected, isToday, onSelect, C, heat }) {
  const lvl = activityLevel(data, dailyGoal);
  const dots = subjectDots(data);
  const bg = lvl > 0 ? heat[lvl] : "transparent";
  const textColor = lvl > 0 ? C.text : C.text3;

  return (
    <Pressable
      onPress={() => onSelect(iso)}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityLabel={`${date.getDate()} — güne git`}
      style={[
        styles.dayCell,
        { backgroundColor: bg, borderColor: isSelected ? C.accent : "transparent" },
        isToday && !isSelected && { borderColor: C.accent, borderStyle: "dashed" },
      ]}
    >
      <Text style={[styles.dayText, { color: textColor }]}>{date.getDate()}</Text>
      <View style={styles.dotRow}>
        {dots.map((c) => (
          <View key={c} style={[styles.dot, { backgroundColor: c }]} />
        ))}
      </View>
    </Pressable>
  );
}

export const MonthGrid = React.memo(function MonthGrid({ monthDate, dayMap, selectedDay, onSelect, dailyGoal = 80 }) {
  const C = useC();
  const heat = useMemo(() => [null, C.heat1, C.heat3, C.heat4], [C]);
  const days = useMemo(() => getCalendarDays(monthDate), [monthDate]);
  const today = todayTR();

  const handleSelect = useCallback((iso) => onSelect(iso), [onSelect]);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={[styles.weekLabel, { color: C.text3 }]}>{w}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const iso = dateKey(d);
          return (
            <View key={iso} style={styles.cell}>
              <DayCell
                date={d}
                iso={iso}
                data={dayMap[iso]}
                dailyGoal={dailyGoal}
                isSelected={selectedDay === iso}
                isToday={iso === today}
                onSelect={handleSelect}
                C={C}
                heat={heat}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  weekRow: { flexDirection: "row", marginBottom: STEP.s1 },
  weekLabel: { flex: 1, textAlign: "center", ...TYPOGRAPHY.tableHead, letterSpacing: 1.1 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 2.5 },
  dayCell: {
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dayText: { ...TYPOGRAPHY.captionMedium, fontVariant: ["tabular-nums"] },
  dotRow: { flexDirection: "row", gap: 2.5, height: 5, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 1 },
});
