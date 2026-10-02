import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/palette";
import { dateKey, todayTR } from "../../../lib/dateUtils";
import { useMonthRoutePlan } from "../../../hooks/useMonthRoutePlan";
import { Press } from "../../../components/design/Press";
import { Icon } from "../../../components/design/Icon";

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

// Takvim ve Seri ısı haritası:
// Hedef tuttu = dolu accent, Seri sürdü = accent tonu, Bugün = halka.
function cellLook(data, dailyGoal, isFuture, C) {
  const hasWorked = Boolean(data?.logs?.length || data?.trials?.length || (data?.totalQuestions && data.totalQuestions > 0));
  if (hasWorked && data.totalQuestions >= dailyGoal) {
    return { backgroundColor: C.accent, borderColor: C.accent, color: C.accentInk };
  }
  if (hasWorked) {
    return { backgroundColor: alpha(C.accent, 24), borderColor: alpha(C.accent, 45), color: C.accentBright || C.text };
  }
  if (isFuture) return { backgroundColor: "transparent", borderColor: C.line, color: C.text3 };
  return { backgroundColor: "transparent", borderColor: "transparent", color: C.text3 };
}

function DayCell({ date, iso, data, planData, dailyGoal, isSelected, isToday, isFuture, onSelect, C }) {
  const look = cellLook(data, dailyGoal, isFuture, C);
  const isFilled = look.backgroundColor === C.accent;
  const worked = Boolean(data?.logs?.length || data?.trials?.length || data?.totalQuestions > 0);
  const dotCount = planData?.count ? Math.min(planData.count, 3) : 0;
  const isDraft = Boolean(planData?.draft);

  return (
    <Press haptic="none"
      onPress={() => onSelect(iso)}
      hitSlop={2}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${date.getDate()} — güne git`}
      style={[
        styles.dayCell,
        { backgroundColor: look.backgroundColor, borderColor: look.borderColor },
        isToday && { borderColor: C.accent, borderWidth: 1.5 },
        isSelected && { borderColor: isFilled ? C.text : C.accent, borderWidth: 2 },
      ]}
    >
      {/* Calisilan gun: kosede alev -- seri takvimde zincir gibi okunur. */}
      {worked ? (
        <View style={styles.flame} pointerEvents="none">
          <Icon name="flame" size={10} color={isFilled ? C.accentInk : C.accent} fill={isFilled ? C.accentInk : C.accent} />
        </View>
      ) : null}
      <Text style={[styles.dayText, { color: isToday && !isFilled ? C.accentText : look.color }]}>{date.getDate()}</Text>
      {dotCount > 0 ? (
        <View style={[styles.dotsRow, isDraft && styles.draftDots]}>
          {Array.from({ length: dotCount }).map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.planDot,
                { backgroundColor: isFilled ? C.accentInk : C.accent },
              ]}
            />
          ))}
        </View>
      ) : null}
    </Press>
  );
}

export const MonthGrid = React.memo(function MonthGrid({ monthDate, dayMap, selectedDay, onSelect, dailyGoal = 80 }) {
  const C = useC();
  const days = useMemo(() => getCalendarDays(monthDate), [monthDate]);
  const today = todayTR();
  const routePlan = useMonthRoutePlan();

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
                planData={routePlan[iso]}
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
  dotsRow: {
    position: "absolute",
    bottom: SPACING.xs,
    flexDirection: "row",
    gap: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  flame: { position: "absolute", top: 3, right: 4 },
  draftDots: {
    opacity: 0.45,
  },
  planDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: SHAPE.chip,
  },
});
