import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Icon } from "../../../components/design/Icon";

function getTrackConfig(type, C) {
  switch (type) {
    case "say":
      return {
        label: "SAY",
        color: C.subjects?.fizik || "#56C6D6",
        icon: "hash",
      };
    case "ea":
      return {
        label: "EA",
        color: C.subjects?.matematik || "#E0A570",
        icon: "chart",
      };
    case "soz":
      return {
        label: "SÖZ",
        color: C.subjects?.cografya || "#A27BF8",
        icon: "bookOpen",
      };
    case "dil":
      return {
        label: "DİL",
        color: C.subjects?.ydt_ingilizce || "#7DD3FC",
        icon: "globe",
      };
    default:
      return {
        label: "TYT",
        color: C.accentBright,
        icon: "target",
      };
  }
}

export const ThresholdDepartmentCard = memo(function ThresholdDepartmentCard({ program }) {
  const C = useC();
  if (!program) return null;

  const isAhead = program.diff >= 0;
  const isClose = !isAhead && program.diff >= -3;
  const diffSign = isAhead ? `+${program.diff}` : `${program.diff}`;
  const diffBadgeColor = isAhead ? C.up : isClose ? C.warn : C.text2;
  const diffBadgeBg = isAhead ? C.up + "18" : isClose ? C.warn + "18" : C.elev;
  const diffBadgeBorder = isAhead ? C.up + "30" : isClose ? C.warn + "30" : C.line;

  const track = getTrackConfig(program.type, C);
  const netLabel = program.aytNet
    ? `TYT ~${program.tytNet} · AYT ~${program.aytNet}`
    : `TYT ~${program.tytNet} net`;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={[styles.iconBox, { backgroundColor: track.color + "14", borderColor: track.color + "28" }]}>
        <Icon name={track.icon} size={15} color={track.color} />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.nameText, { color: C.text }]} numberOfLines={1}>
            {program.name}
          </Text>
          <View style={[styles.trackPill, { backgroundColor: track.color + "18", borderColor: track.color + "30" }]}>
            <Text style={[styles.trackText, { color: track.color }]}>{track.label}</Text>
          </View>
        </View>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]} numberOfLines={1}>
          {`${program.uni} · ${program.rank ? `${program.rank.toLocaleString("tr-TR")}. sıra` : "2025 tabanı"}`}
        </Text>
      </View>

      <View style={styles.stat}>
        <Text style={[TYPOGRAPHY.tableName, styles.netNum, { color: C.text }]}>
          {netLabel}
        </Text>
        <View style={[styles.diffBadge, { backgroundColor: diffBadgeBg, borderColor: diffBadgeBorder }]}>
          <Text style={[styles.diffText, { color: diffBadgeColor }]}>
            {`${diffSign} net`}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: SHAPE.icon,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  info: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 / 2 },
  nameText: { flexShrink: 1 },
  trackPill: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  trackText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  stat: { alignItems: "flex-end", flexShrink: 0, gap: 3 },
  netNum: { fontVariant: ["tabular-nums"] },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
  },
  diffText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
});
