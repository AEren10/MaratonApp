import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";

// Ayin Ozeti · "DERS NETLERİ · AY BAŞINA GÖRE"
export function SubjectNetList({ subjects }) {
  const C = useC();
  if (!subjects?.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>DERS NETLERİ</Text>
        <View style={[styles.rule, { backgroundColor: C.line }]} />
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>AY BAŞINA GÖRE</Text>
      </View>
      <View style={styles.list}>
        {subjects.map((s) => (
          <View key={s.key} style={styles.row}>
            <Text style={[TYPOGRAPHY.tableHead, styles.name, { color: C.text3 }]} numberOfLines={1}>{s.name}</Text>
            <View style={[styles.track, { backgroundColor: C.track }]}>
              <View style={[styles.fill, { width: `${Math.round(s.ratio * 100)}%`, backgroundColor: s.color || C.accent }]} />
            </View>
            <Text style={[TYPOGRAPHY.tableValue, styles.value, { color: C.text }]}>{s.value}</Text>
            <Text style={[TYPOGRAPHY.tableHead, styles.delta, { color: s.delta > 0 ? C.up : C.down }]}>
              {s.deltaLabel || ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  header: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  rule: { flex: 1, height: 1 },
  list: { gap: STEP.s2, marginTop: STEP.s3 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  name: { width: 74, letterSpacing: 0.9 },
  track: { flex: 1, height: 10, borderRadius: STEP.s1 / 8, overflow: "hidden" },
  fill: { height: "100%", borderRadius: STEP.s1 / 4 },
  value: { width: 38, textAlign: "right" },
  delta: { width: 42, textAlign: "right", letterSpacing: 0 },
});
