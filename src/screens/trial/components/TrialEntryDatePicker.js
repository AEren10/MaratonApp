import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatDateISO } from "../trialEntryDates";

// TARIH satirinin acilan son 14 gun seridi.
export function TrialEntryDatePicker({ recentDays, trialDate, onChangeDate }) {
  const C = useC();
  const selected = formatDateISO(trialDate);
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.wrap}>
      {recentDays.map((day) => {
        const active = selected === day.iso;
        return (
          <Pressable key={day.iso} onPress={() => onChangeDate(day.date)}
            accessibilityRole="radio" accessibilityLabel={`${day.dayName} ${day.day}`}
            accessibilityState={{ selected: active }}
            style={[styles.chip, {
              backgroundColor: active ? C.brandTint : C.void,
              borderColor: active ? C.accent : C.border,
            }]}>
            <Text style={[TYPOGRAPHY.tableHead, { color: active ? C.accentBright : C.text3, letterSpacing: 0 }]}>
              {day.dayName}
            </Text>
            <Text style={[TYPOGRAPHY.topicName, { color: C.text, fontVariant: ["tabular-nums"] }]}>{day.day}</Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  chip: {
    minWidth: CONTROL.buttonPrimary, minHeight: CONTROL.buttonPrimary, paddingHorizontal: STEP.s1,
    borderRadius: SHAPE.button, borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
});
