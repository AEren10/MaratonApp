import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Deneme Gir ust bandi: geri, baslik, adim sayaci ve uc parcali ilerleme cizgisi.
export function TrialEntryHeader({ step, totalSteps, onBack, showCount = true }) {
  const C = useC();
  return (
    <View>
      <View style={styles.row}>
        <Press haptic="none" onPress={onBack} hitSlop={STEP.s1} style={styles.back}
          accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="chevL" size={20} color={C.text2} />
        </Press>
        <Text style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>Deneme Gir</Text>
        {showCount ? (
          <Text style={[TYPOGRAPHY.micro, styles.count, { color: C.text3 }]}>{`${step}/${totalSteps}`}</Text>
        ) : null}
      </View>
      <View style={styles.bars} accessible accessibilityLabel={`Adım ${step}/${totalSteps}`}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={[styles.bar, { backgroundColor: index < step ? C.accent : C.elev }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingHorizontal: GUTTER - STEP.s2, paddingTop: 4 },
  back: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
  count: { fontFamily: "Archivo_600", fontVariant: ["tabular-nums"], paddingRight: STEP.s2 },
  bars: { flexDirection: "row", gap: 4, paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  bar: { flex: 1, height: 4, borderRadius: 1 },
});
