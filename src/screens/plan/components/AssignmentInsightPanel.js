import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

function InfoPill({ label, value, s }) {
  return (
    <View style={s.infoPill}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function AssignmentInsightPanel({ assignment, C }) {
  if (!assignment) return null;
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <>
      <View style={s.grid}>
        <InfoPill label="Kaynak" value={assignment.title} s={s} />
        <InfoPill label="Etki" value={assignment.impact} s={s} />
        <InfoPill label="Tempo" value={assignment.effort} s={s} />
        <InfoPill label="Güven" value={assignment.confidenceLabel} s={s} />
      </View>
      <View style={s.bulletBox}>
        {assignment.bullets.map((item) => (
          <View key={item} style={s.bulletRow}>
            <View style={s.bulletDot} />
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export default memo(AssignmentInsightPanel);

const makeStyles = (C) => StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginTop: SPACING.md },
  infoPill: {
    width: "48%",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface2,
    padding: SPACING.md,
  },
  infoLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  infoValue: { ...TYPOGRAPHY.captionMedium, color: C.text, marginTop: SPACING.xs },
  bulletBox: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: C.elev,
    padding: SPACING.md,
  },
  bulletRow: { flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start" },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: C.accent,
    marginTop: SPACING.sm,
  },
  bulletText: { ...TYPOGRAPHY.caption, color: C.sec, flex: 1 },
});
