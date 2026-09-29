import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useWeekProgram } from "../../../hooks/useWeekProgram";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function RouteThisWeekStrip({ C, currentWeek, promiseText, onPress }) {
  const { days } = useWeekProgram();
  const stops = currentWeek?.stops || [];
  const completedStops = stops.filter(
    (s) => s.lifecycleStatus === "completed" || s.status === "completed"
  ).length;
  const totalStops = stops.length;

  const statusText = totalStops > 0
    ? `Bu hafta ${completedStops}/${totalStops} durak tamamlandı`
    : promiseText || "Bu haftanın programı";

  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${statusText}, haftalık programı aç`}
      style={({ pressed }) => [
        s.container,
        { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.line },
      ]}
    >
      <View style={s.topRow}>
        <View style={s.labelCol}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU HAFTA</Text>
          <Text style={[TYPOGRAPHY.topicName, s.title, { color: C.text }]}>{statusText}</Text>
        </View>
        <View style={s.arrowRow}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Hafta</Text>
          <Icon name="chevR" size={13} color={C.text3} />
        </View>
      </View>

      <View style={[s.daysRow, { borderTopColor: C.line }]}>
        {days.map((day) => {
          const bg = day.active ? C.accent : day.isToday ? C.elev : C.void;
          const border = day.isToday ? C.accent : C.line;
          const textColor = day.isToday ? C.accentBright : day.active ? C.text : C.text3;

          return (
            <View key={day.key} style={s.dayCol}>
              <View style={[s.dayDot, { backgroundColor: bg, borderColor: border }]}>
                {day.active ? <View style={[s.activePip, { backgroundColor: C.text }]} /> : null}
              </View>
              <Text style={[TYPOGRAPHY.micro, s.dayLetter, { color: textColor }]}>
                {day.letter.charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>
    </Press>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s3,
    padding: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  labelCol: {
    flex: 1,
  },
  title: {
    marginTop: STEP.s1 / 2,
  },
  arrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 2,
    paddingTop: STEP.s1 / 4,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s2 + STEP.s1 / 2,
    paddingTop: STEP.s2,
    borderTopWidth: 1,
  },
  dayCol: {
    alignItems: "center",
    gap: STEP.s1 / 2,
  },
  dayDot: {
    width: 22,
    height: 22,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activePip: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
  dayLetter: {
    letterSpacing: 0,
  },
});
