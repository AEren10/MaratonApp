import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// AYIN AĞIRLIĞI: ders basina planlanan durak sayisi, en coguna oranli cubuk.
function MonthWeightList({ weights }) {
  const C = useC();
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>AYIN AĞIRLIĞI</Text>
      <View style={s.list}>
        {weights.map((w) => {
          const color = subjectColorOf(C, w.subject);
          return (
            <View key={w.key} style={s.row}>
              <Text style={[TYPOGRAPHY.tableHead, s.name, { color: C.text3 }]} numberOfLines={1}>
                {String(w.label).toLocaleUpperCase("tr-TR")}
              </Text>
              <View style={[s.track, { backgroundColor: C.track }]}>
                <View style={[s.fill, { width: `${Math.round(w.ratio * 100)}%`, backgroundColor: color }]} />
              </View>
              <Text style={[TYPOGRAPHY.meta, s.count, { color: C.text }]}>{`${w.count} dr`}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default memo(MonthWeightList);

const HAIR = 1;

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 - 4 },
  list: { gap: STEP.s2 + 1, marginTop: STEP.s3 - 4 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  name: { width: 74, letterSpacing: 1.3 },
  track: { flex: 1, height: 10, borderRadius: HAIR, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  count: { width: 44, textAlign: "right", fontVariant: ["tabular-nums"] },
});
