import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Bolum etiketi + saga uzanan ince cizgi (Deneme Gir 1/3).
export function TrialEntryRuleLabel({ children }) {
  const C = useC();
  return (
    <View style={styles.row}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{children}</Text>
      <View style={[styles.line, { backgroundColor: C.line }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingBottom: STEP.s2 },
  line: { flex: 1, height: 1 },
});
