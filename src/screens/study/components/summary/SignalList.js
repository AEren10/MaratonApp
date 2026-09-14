import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

// Ayin Ozeti · "AYIN İŞARETLERİ": baslik, alt satir, sagda sayi.
export function SignalList({ signals = [] }) {
  const C = useC();
  if (!signals.length) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>AYIN İŞARETLERİ</Text>
      <View style={styles.list}>
        {signals.map((s) => (
          <View key={s.key} style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}>
            <View style={styles.flex}>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{s.title}</Text>
              {s.body ? <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 / 2 }]}>{s.body}</Text> : null}
            </View>
            <Text style={[TYPOGRAPHY.signalValue, { color: C.text }]}>{s.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  list: { gap: STEP.s1, marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2, borderRadius: SHAPE.panel, borderWidth: 1 },
  flex: { flex: 1 },
});
