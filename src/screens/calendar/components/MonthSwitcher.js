import { Pressable, StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { MONTHS_TR } from "../../../lib/trWords";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function MonthSwitcher({ monthDate, prevMonth, nextMonth, C }) {
  const monthName = MONTHS_TR[monthDate.getMonth()];
  const year = monthDate.getFullYear();

  return (
    <View style={s.row}>
      <Pressable
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Önceki ay"
        onPress={prevMonth}
        style={s.tap}
      >
        <Icon name="chevL" size={16} color={C.text3} />
      </Pressable>
      <Text style={[TYPOGRAPHY.topicName, s.title, { color: C.text, fontVariant: ["tabular-nums"] }]}>
        {`${monthName} ${year}`}
      </Text>
      <Pressable
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Sonraki ay"
        onPress={nextMonth}
        style={s.tap}
      >
        <Icon name="chevR" size={16} color={C.text3} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s2,
    marginTop: STEP.s2,
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
});
