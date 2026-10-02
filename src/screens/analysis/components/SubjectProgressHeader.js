import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatBlock } from "../../../components/design";
import { SubjectIcon } from "../../../components/common/SubjectIcon";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export const SubjectProgressHeader = React.memo(function SubjectProgressHeader({
  C,
  subjectName,
  subjectKey,
  subjectColor,
  doneCount,
  totalCount,
  totalQuestionsSum,
  progressPct,
}) {
  const questionsLabel = totalQuestionsSum.toLocaleString("tr-TR");

  return (
    <View style={styles.wrap}>
      <View style={styles.nameRow}>
        <SubjectIcon subject={subjectName} subjectKey={subjectKey} color={subjectColor} size={40} />
        <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{subjectName}</Text>
      </View>

      <StatBlock
        value={doneCount}
        unit={`/ ${totalCount} konu bitti · ${questionsLabel} soru çözüldü`}
        size="count"
        style={styles.stat}
      />

      <View style={styles.barRow}>
        <View style={[styles.track, { backgroundColor: C.track }]}>
          <View style={[styles.fill, { backgroundColor: subjectColor, width: `${progressPct}%` }]} />
        </View>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>%{progressPct}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2 },
  stat: { marginTop: STEP.s2 },
  barRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, marginTop: STEP.s2 },
  track: { flex: 1, height: 5, borderRadius: 2, overflow: "hidden" },
  fill: { height: 5, borderRadius: 2 },
});
