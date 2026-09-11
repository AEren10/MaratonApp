import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

const HOUR_OPTIONS = [
  { h: 8, label: "08:00" },
  { h: 13, label: "13:00" },
  { h: 19, label: "19:00" },
  { h: 21, label: "21:00" },
];

// Gunluk hatirlatma saati secimi. Tasarimda ayri bir artboard yok; segment
// chip dili (h38 r6) diger ekranlardan alindi.
export function ReminderHourPicker({ hour, onSelect }) {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: STEP.s1 }]}>
        HATIRLATMA SAATİ
      </Text>
      <View style={styles.row}>
        {HOUR_OPTIONS.map((o) => {
          const active = hour === o.h;
          return (
            <Pressable
              key={o.h}
              onPress={() => {
                H.select();
                onSelect(o.h);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                {
                  borderColor: active ? C.accent : C.border,
                  backgroundColor: active ? C.accent : "transparent",
                },
              ]}
            >
              <Text style={[TYPOGRAPHY.captionMedium, { color: active ? C.accentInk : C.text2 }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, paddingBottom: STEP.s2 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
  chip: {
    height: CONTROL.chip,
    paddingHorizontal: STEP.s2,
    borderWidth: 1,
    borderRadius: SHAPE.chip,
    alignItems: "center",
    justifyContent: "center",
  },
});
