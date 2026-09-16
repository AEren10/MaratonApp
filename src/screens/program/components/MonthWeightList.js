import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Konu agirligi: sol yanda ders adi, ortada progress bar, sagda n durak.
// weights dizisi: { key, label, stops, ratio }
function MonthWeightList({ C, weights }) {
  // Image 3 mockup weights if weights is undefined
  const defaultWeights = [
    { key: "matematik", label: "MATEMATİK", stops: 14, ratio: 1.0 },
    { key: "fizik", label: "FİZİK", stops: 9, ratio: 0.65 },
    { key: "kimya", label: "KİMYA", stops: 8, ratio: 0.58 },
    { key: "biyoloji", label: "BİYOLOJİ", stops: 7, ratio: 0.5 },
    { key: "turkce", label: "TÜRKÇE", stops: 5, ratio: 0.35 },
  ];
  const list = weights?.length ? weights : defaultWeights;

  return (
    <View style={s.wrap}>
      {list.map((w) => {
        const color = subjectColorOf(C, w.key);
        return (
          <View key={w.key} style={s.row}>
            <Text style={[TYPOGRAPHY.tableHead, s.label, { color: C.text3 }]} numberOfLines={1}>
              {w.label}
            </Text>
            <View style={[s.track, { backgroundColor: C.track }]}>
              <View style={[s.fill, { backgroundColor: color, width: `${Math.round(w.ratio * 100)}%` }]} />
            </View>
            <Text style={[TYPOGRAPHY.metaSemiBold, s.val, { color: C.text }]} allowFontScaling={false}>
              {w.stops} dr
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default memo(MonthWeightList);

const s = StyleSheet.create({
  wrap: { gap: STEP.s2 + 2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  label: { width: 90 },
  track: { flex: 1, height: 8, borderRadius: 2 },
  fill: { height: "100%", borderRadius: 2 },
  val: { width: 36, textAlign: "right" },
});
