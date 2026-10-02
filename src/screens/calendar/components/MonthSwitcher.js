import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { MONTHS_TR } from "../../../lib/trWords";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// streak > 0 ise ay adinin altinda ortada alevli seri sayisi.
export function MonthSwitcher({ monthDate, prevMonth, nextMonth, C, streak = 0 }) {
  const monthName = MONTHS_TR[monthDate.getMonth()];
  const year = monthDate.getFullYear();

  return (
    <View style={s.row}>
      <Press haptic="none"
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Önceki ay"
        onPress={prevMonth}
        style={s.tap}
      >
        <Icon name="chevL" size={16} color={C.text3} />
      </Press>
      <View style={s.center}>
        <Text style={[TYPOGRAPHY.topicName, s.title, { color: C.text, fontVariant: ["tabular-nums"] }]}>
          {`${monthName} ${year}`}
        </Text>
        {streak > 0 ? (
          <View style={s.streak} accessibilityLabel={`${streak} günlük seri`}>
            <Icon name="flame" size={13} color={C.accent} fill={C.accent} />
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentText }]}>{`${streak} günlük seri`}</Text>
          </View>
        ) : null}
      </View>
      <Press haptic="none"
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Sonraki ay"
        onPress={nextMonth}
        style={s.tap}
      >
        <Icon name="chevR" size={16} color={C.text3} />
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s2,
    marginTop: STEP.s3,
  },
  tap: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    letterSpacing: 0.2,
  },
  center: { alignItems: "center", gap: 2 },
  streak: { flexDirection: "row", alignItems: "center", gap: 4 },
});
