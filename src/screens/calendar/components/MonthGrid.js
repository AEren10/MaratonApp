import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
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

// Tasarim (Takvim ve Seri) lejandi: hedef tuttu = kizil dolgu, seri surdu
// (calisildi, hedefin altinda) = tint + kenar, gelecek = ince kenar.
function cellLook(data, dailyGoal, isFuture, C) {
  if (data?.logs?.length && data.totalQuestions >= dailyGoal) {
    return { backgroundColor: C.brandFill, borderColor: C.brandFill, color: C.accentInk };
  }
  if (data?.logs?.length) return { backgroundColor: C.brandTint, borderColor: C.bandEdge, color: C.text };
  if (isFuture) return { backgroundColor: "transparent", borderColor: C.line, color: C.text3 };
  return { backgroundColor: "transparent", borderColor: "transparent", color: C.text3 };
}

function DayCell({ date, iso, data, dailyGoal, isSelected, isToday, isFuture, onSelect, C }) {
  const look = cellLook(data, dailyGoal, isFuture, C);
  return (
    <Pressable
      onPress={() => onSelect(iso)}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${date.getDate()} — güne git`}
      style={[
        styles.dayCell,
        { backgroundColor: look.backgroundColor, borderColor: look.borderColor },
        isToday && !isSelected && { borderColor: C.accent, borderStyle: "dashed" },
        isSelected && { borderColor: look.backgroundColor === C.brandFill ? C.text : C.accent, borderWidth: 1.5 },
      ]}
    >
      <Text style={[styles.dayText, { color: look.color }]}>{date.getDate()}</Text>
    </Pressable>
  );
}

export const MonthGrid = React.memo(function MonthGrid({ monthDate, dayMap, selectedDay, onSelect, dailyGoal = 80 }) {
  const C = useC();
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
                isFuture={iso > today}
                onSelect={handleSelect}
                C={C}
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
  },
  dayText: { ...TYPOGRAPHY.captionMedium, fontVariant: ["tabular-nums"] },
});
