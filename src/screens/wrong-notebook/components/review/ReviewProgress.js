import { memo } from "react";
import { View, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { GUTTER, STEP } from "../../../../themes/tokens";

// Seans ilerleme seridi: gecilen ve mevcut soru kizil, kalanlar iz rengi.
// Cok uzun seansta her soru icin cizgi okunmaz -- 20 ustu tek serit olur.
export const ReviewProgress = memo(function ReviewProgress({ index, total }) {
  const C = useC();
  if (!total) return null;
  if (total > 20) {
    const pct = `${Math.round(((index + 1) / total) * 100)}%`;
    return (
      <View style={styles.wrap}>
        <View style={[styles.bar, styles.full, { backgroundColor: C.track }]}>
          <View style={[styles.bar, { width: pct, backgroundColor: C.accent }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.bar, styles.seg, { backgroundColor: i <= index ? C.accent : C.track }]} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 5, paddingHorizontal: GUTTER, paddingTop: STEP.s2 + 2 },
  bar: { height: 3, borderRadius: 1 },
  seg: { flex: 1 },
  full: { flex: 1, overflow: "hidden" },
});
