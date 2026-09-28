import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SectionLabel } from "../../../components/design";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Numarali adim listesi: numara kutusu + tek cumle.
export const GuideSteps = memo(function GuideSteps({ C, title, steps }) {
  return (
    <View style={s.wrap}>
      <SectionLabel>{title}</SectionLabel>
      {steps.map((step, i) => (
        <View key={step} style={s.row}>
          <View style={[s.num, { backgroundColor: C.surface, borderColor: C.line }]}>
            <Text style={[TYPOGRAPHY.metaSemiBold, s.tabular, { color: C.accentBright }]}>{i + 1}</Text>
          </View>
          <Text style={[TYPOGRAPHY.body, s.text, { color: C.text2 }]}>{step}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4, gap: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  num: { width: 28, height: 28, borderRadius: SHAPE.iconBox, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  tabular: { fontVariant: ["tabular-nums"] },
  text: { flex: 1 },
});
