import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { H } from "../../../lib/haptics";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function getBadge(name = "") {
  const clean = name.trim().toLocaleUpperCase("tr-TR");
  if (clean.startsWith("TÜRK") || clean === "TÜRKÇE") return "TR";
  if (clean.startsWith("MAT")) return "MAT";
  if (clean.startsWith("FİZ")) return "FİZ";
  if (clean.startsWith("KİM")) return "KİM";
  if (clean.startsWith("BİY")) return "BİY";
  if (clean.startsWith("TAR")) return "TAR";
  if (clean.startsWith("COĞ")) return "COĞ";
  if (clean.startsWith("FEL")) return "FEL";
  if (clean.startsWith("DİN")) return "DİN";
  if (clean.startsWith("GEO")) return "GEO";
  return clean.slice(0, 3);
}

// Ders karti: renkli rozet (TR, MAT..), 15.5px net baslik, tabular sayaç ve pürüzsüz ilerleme cubugu.
function CurriculumSubjectRow({ subject, onPress }) {
  const C = useC();
  const color = subjectColorOf(C, subject.key);
  const ratio = subject.total > 0 ? subject.done / subject.total : 0;
  const pct = Math.round(ratio * 100);

  const handlePress = () => {
    H.tap();
    onPress(subject);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${subject.name}, ${subject.done}/${subject.total} konu tamamlandı`}
      style={({ pressed }) => [
        s.card,
        {
          backgroundColor: C.surface,
          borderColor: pressed ? color : C.line,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[s.badge, { backgroundColor: `${color}18`, borderColor: `${color}35` }]}>
        <Text style={[s.badgeText, { color }]}>{getBadge(subject.name)}</Text>
      </View>
      <View style={s.body}>
        <View style={s.topRow}>
          <Text style={[s.name, { color: C.text }]} numberOfLines={1}>{subject.name}</Text>
          <Text style={[TYPOGRAPHY.tableValue, s.count, { color: subject.done > 0 ? C.text2 : C.text3 }]}>
            {subject.done > 0 ? `${subject.done}/${subject.total}` : `${subject.total} konu`}
          </Text>
        </View>
        <View style={[s.track, { backgroundColor: C.track }]}>
          <View style={[s.fill, { width: `${Math.max(ratio > 0 ? 5 : 0, pct)}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Icon name="chevR" size={13} color={C.text4} />
    </Pressable>
  );
}

export default memo(CurriculumSubjectRow);

const s = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: STEP.s2 + 2,
    paddingVertical: STEP.s2 + 1,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    marginBottom: STEP.s1,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "Archivo_700",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "Archivo_600",
    fontSize: 15.5,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  count: {
    fontSize: 12.5,
    letterSpacing: 0,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 5,
    borderRadius: 2.5,
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2.5,
  },
});
