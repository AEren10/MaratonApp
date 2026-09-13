import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "50 dakika · 19:30 – 20:20   ölçüldü" — sure zamanlayicidan geldiginde.
export function MeasuredBanner({ minutes, range }) {
  const C = useC();
  const text = [`${minutes} dakika`, range].filter(Boolean).join(" · ");
  return (
    <View style={[styles.box, { backgroundColor: C.brandTint, borderColor: C.border }]}>
      <View style={[styles.dot, { backgroundColor: C.accent }]} />
      <Text style={[TYPOGRAPHY.meta, styles.text, { color: C.text2 }]}>{text}</Text>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, letterSpacing: 0 }]}>ölçüldü</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    paddingVertical: STEP.s2 + 3, paddingHorizontal: STEP.s3 - 2, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: SHAPE.chip / 6 },
  text: { flex: 1 },
});
