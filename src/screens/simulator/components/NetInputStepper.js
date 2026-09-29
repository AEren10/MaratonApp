import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const NetInputStepper = memo(function NetInputStepper({ label, value, onChange, min = 0, max = 120 }) {
  const C = useC();

  const adjust = (delta) => {
    const next = Math.min(max, Math.max(min, Math.round((value + delta) * 10) / 10));
    onChange(next);
  };

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={styles.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{label}</Text>
        <Text style={[TYPOGRAPHY.subheading, styles.valText, { color: C.text }]}>{value}</Text>
      </View>
      <View style={styles.controls}>
        <Press haptic="tap" onPress={() => adjust(-5)} style={[styles.btn, { borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>-5</Text>
        </Press>
        <Press haptic="tap" onPress={() => adjust(-1)} style={[styles.btn, { borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>-1</Text>
        </Press>
        <Press haptic="tap" onPress={() => adjust(1)} style={[styles.btn, { borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>+1</Text>
        </Press>
        <Press haptic="tap" onPress={() => adjust(5)} style={[styles.btn, { borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>+5</Text>
        </Press>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: STEP.s2 + 2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    marginTop: STEP.s2,
  },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: STEP.s1,
  },
  valText: { fontVariant: ["tabular-nums"] },
  controls: {
    flexDirection: "row",
    gap: STEP.s1,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
