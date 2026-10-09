import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { LockedValue } from "../../../components/design/LockedValue";
import { Icon } from "../../../components/design/Icon";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { getSubjectGlyph } from "../../../themes/subjects";

export function ThresholdContributorRow({ item, locked }) {
  const C = useC();
  const pKey = subjectPaletteKey(item.subject);
  const subjectColor = C.subjects?.[pKey] || C.accent;
  const glyph = getSubjectGlyph(item.subject) || "bookOpen";

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={[styles.glyphBox, { backgroundColor: subjectColor + "14", borderColor: subjectColor + "28" }]}>
        <Icon name={glyph} size={15} color={subjectColor} />
      </View>

      <View style={styles.info}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {item.topic}
        </Text>
        <View style={styles.subRow}>
          <View style={[styles.dot, { backgroundColor: subjectColor }]} />
          <Text style={[styles.subText, { color: subjectColor }]} numberOfLines={1}>
            {item.subjectLabel}
          </Text>
        </View>
      </View>

      <View style={styles.stat}>
        <View style={[styles.gainBadge, { backgroundColor: C.up + "15", borderColor: C.up + "30" }]}>
          <LockedValue
            value={`+${item.netGain.toFixed(2)}`}
            locked={locked}
            variant="captionMedium"
            showLock={locked}
            style={{ color: C.up }}
          />
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 2 }]}>net katkı</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    padding: STEP.s2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  glyphBox: {
    width: 36,
    height: 36,
    borderRadius: SHAPE.icon,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  info: { flex: 1, minWidth: 0 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  subText: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  stat: { alignItems: "flex-end" },
  gainBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
});
