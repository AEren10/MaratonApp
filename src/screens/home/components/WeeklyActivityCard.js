import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const BAR_TRACK_H = 36;

function ActivityBar({ count, max, isToday, green, greenDim }) {
  const fillH = max > 0 ? Math.max(6, Math.round((count / max) * BAR_TRACK_H)) : 6;
  return (
    <View style={styles.barTrack}>
      <View
        style={[
          styles.barFill,
          {
            height: fillH,
            backgroundColor: isToday ? green : greenDim,
          },
        ]}
      />
    </View>
  );
}

const MemoBar = React.memo(ActivityBar);

export function WeeklyActivityCard({ totalQuestions, percentChange, dailyCounts, onPress }) {
  const C = useC();

  if (!totalQuestions) return null;

  const max = Math.max(...dailyCounts, 1);
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  const isPositive = percentChange >= 0;
  const changeLabel = `geçen haftaya göre ${isPositive ? "+" : ""}%${Math.abs(percentChange)}`;
  const green = C.green;
  const greenDim = C.green + "80";
  const greenIconBg = C.green + "24";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: greenIconBg }]}>
            <Icon name="calendar" size={16} color={green} sw={2} />
          </View>
          <View style={{ gap: 1 }}>
            <Text style={[styles.title, { color: C.text }]}>
              Bu hafta {totalQuestions} soru
            </Text>
            <Text style={[styles.subtitle, { color: isPositive ? green : C.red }]}>
              {changeLabel}
            </Text>
          </View>
        </View>
        <Icon name="arrowR" size={18} color={C.muted} sw={2} />
      </View>

      {/* Bar chart */}
      <View style={styles.barsRow}>
        {dailyCounts.map((count, i) => {
          const isToday = i === todayIdx;
          return (
            <View key={i} style={styles.barCol}>
              <MemoBar count={count} max={max} isToday={isToday} green={green} greenDim={greenDim} />
              <Text style={[styles.dayLabel, { color: isToday ? green : C.muted }]}>
                {DAY_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 14,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: SPACING.xs,
    gap: 7,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 7,
  },
  barTrack: {
    height: BAR_TRACK_H,
    width: "100%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  dayLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    lineHeight: 11,
  },
});
