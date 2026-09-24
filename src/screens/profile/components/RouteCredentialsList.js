import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";

export function RouteCredentialsList({ totalQuestions = 0, totalHours = 0, longestStreak = 0 }) {
  const C = useC();
  const qDisplay = totalQuestions >= 1000
    ? totalQuestions.toLocaleString("tr-TR")
    : String(totalQuestions);

  const matColor = C.subjects?.matematik || C.warn;
  const flameColor = C.warn || C.accent;

  const stats = [
    {
      key: "questions",
      label: "Çözülen Soru",
      value: qDisplay,
      unit: "soru",
      icon: "target",
      iconColor: C.accentBright,
      iconBg: alpha(C.accent, 14),
    },
    {
      key: "hours",
      label: "Toplam Süre",
      value: String(totalHours),
      unit: "saat",
      icon: "clock",
      iconColor: matColor,
      iconBg: alpha(matColor, 14),
    },
    {
      key: "streak",
      label: "En Uzun Seri",
      value: String(longestStreak || 0),
      unit: "gün",
      icon: "flame",
      iconColor: flameColor,
      iconBg: alpha(flameColor, 14),
    },
  ];

  return (
    <View style={s.container}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={s.cardHead}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>YOL KÜNYESİ</Text>
          <View style={[s.badge, { backgroundColor: C.void, borderColor: C.line }]}>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Kariyer Özeti</Text>
          </View>
        </View>

        <View style={s.grid}>
          {stats.map((item, idx) => (
            <View key={item.key} style={[s.col, idx > 0 && [s.colDivider, { borderLeftColor: C.line }]]}>
              <View style={[s.iconBox, { backgroundColor: item.iconBg }]}>
                <Icon name={item.icon} size={15} color={item.iconColor} />
              </View>
              <View style={s.valRow}>
                <Text style={[s.val, { color: C.text }]} numberOfLines={1}>
                  {item.value}
                </Text>
                <Text style={[s.unit, { color: C.text3 }]}>{item.unit}</Text>
              </View>
              <Text style={[s.label, { color: C.text2 }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s3 + 4,
  },
  card: {
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    padding: STEP.s3,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s3 - 2,
  },
  badge: {
    paddingHorizontal: STEP.s1 + 2,
    paddingVertical: 2,
    borderRadius: SHAPE.chip / 4,
    borderWidth: 1,
  },
  grid: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  col: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  colDivider: {
    borderLeftWidth: 1,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: STEP.s1,
  },
  valRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  val: {
    fontFamily: "Bricolage_400",
    fontSize: 22,
    lineHeight: 26,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontFamily: "Archivo_500",
    fontSize: 11,
  },
  label: {
    fontFamily: "Archivo_500",
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },
});
