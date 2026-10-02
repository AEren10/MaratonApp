import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Press } from "../../../../components/design/Press";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "Nasildi?" -- istege bagli tek dokunus. Rota konunun zorlugunu buna gore
// ayarlar: "Zorladi" diyen konuya sonraki turda daha cok soru.
const OPTIONS = [
  { key: "easy", label: "Kolaydı" },
  { key: "ok", label: "Tam kıvamında" },
  { key: "hard", label: "Zorladı" },
];

export const FeelChips = memo(function FeelChips({ value, onChange }) {
  const C = useC();
  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>NASILDI?</Text>
      <View style={s.row}>
        {OPTIONS.map((o) => {
          const on = value === o.key;
          return (
            <Press
              key={o.key}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
              onPress={() => onChange?.(on ? null : o.key)}
              style={[s.chip, { borderColor: on ? C.selBorder : C.border, backgroundColor: on ? C.selFill : "transparent" }]}
            >
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: on ? C.selText : C.text2 }]} numberOfLines={1}>{o.label}</Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1, marginTop: STEP.s1 },
  chip: {
    flex: 1, minHeight: CONTROL.tapMin, borderWidth: 1, borderRadius: SHAPE.chip,
    alignItems: "center", justifyContent: "center", paddingHorizontal: STEP.s1,
  },
});
