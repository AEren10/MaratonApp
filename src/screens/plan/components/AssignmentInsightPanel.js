import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Kutusuz bilgi satırları: Kaynak, Etki, Tempo, Güven + madde listesi.
// Eski surface2 hap kutuları kaldırıldı; düz metin + 1px çizgiyle ayrılıyor.
function AssignmentInsightPanel({ assignment, C }) {
  if (!assignment) return null;
  const items = [
    { label: "Kaynak", value: assignment.title },
    { label: "Etki", value: assignment.impact },
    { label: "Tempo", value: assignment.effort },
    { label: "Güven", value: assignment.confidenceLabel },
  ];

  return (
    <View style={s.wrap}>
      <View style={s.grid}>
        {items.map((it) => (
          <View key={it.label} style={s.cell}>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{it.label}</Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text }]} numberOfLines={2}>{it.value}</Text>
          </View>
        ))}
      </View>
      {assignment.bullets?.length > 0 ? (
        <View style={s.bullets}>
          {assignment.bullets.map((item) => (
            <View key={item} style={s.bulletRow}>
              <View style={[s.dot, { backgroundColor: C.accent }]} />
              <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default memo(AssignmentInsightPanel);

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s3 },
  cell: { width: "45%", gap: 2 },
  bullets: { gap: STEP.s1, marginTop: STEP.s3 },
  bulletRow: { flexDirection: "row", gap: STEP.s1, alignItems: "flex-start" },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
});
