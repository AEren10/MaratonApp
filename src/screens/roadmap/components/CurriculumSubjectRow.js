import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ders satiri: renk karesi, ad, ince ilerleme cubugu ve done/total.
function CurriculumSubjectRow({ subject, onPress }) {
  const C = useC();
  const color = subjectColorOf(C, subject.key);
  const ratio = subject.total > 0 ? subject.done / subject.total : 0;
  return (
    <Pressable
      onPress={() => onPress(subject)}
      accessibilityRole="button"
      accessibilityLabel={`${subject.name}, ${subject.done}/${subject.total} konu`}
      style={({ pressed }) => [s.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[s.swatch, { backgroundColor: color }]} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>{subject.name}</Text>
        <View style={s.barRow}>
          <View style={[s.track, { backgroundColor: C.track }]}>
            <View style={[s.fill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: color }]} />
          </View>
          <Text style={[TYPOGRAPHY.tableHead, s.count, { color: C.text3 }]}>{`${subject.done}/${subject.total}`}</Text>
        </View>
      </View>
      <Icon name="chevR" size={12} color={C.text5} />
    </Pressable>
  );
}

export default memo(CurriculumSubjectRow);

const HAIR = 1;

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s3 - 2, borderTopWidth: 1 },
  swatch: { width: 9, height: 9, borderRadius: HAIR },
  body: { flex: 1, minWidth: 0 },
  barRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  track: { flex: 1, height: 4, borderRadius: HAIR, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  count: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
});
