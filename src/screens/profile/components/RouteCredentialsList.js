import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, TYPOGRAPHY } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";
import { TargetSvg, ClockSvg, FlameSvg } from "./RouteCredentialSvgs";

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
      svg: <TargetSvg color={C.accentBright} bg={alpha(C.accent, 16)} />,
    },
    {
      key: "hours",
      label: "Toplam Süre",
      value: String(totalHours),
      unit: "saat",
      svg: <ClockSvg color={matColor} bg={alpha(matColor, 16)} />,
    },
    {
      key: "streak",
      label: "En Uzun Seri",
      value: String(longestStreak || 0),
      unit: "gün",
      svg: <FlameSvg color={flameColor} bg={alpha(flameColor, 16)} />,
    },
  ];

  return (
    <View style={s.container}>
      <View style={s.headRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 1.2 }]}>YOL KÜNYESİ</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Kariyer Özeti</Text>
      </View>

      <View style={s.grid}>
        {stats.map((item, idx) => (
          <View key={item.key} style={[s.col, idx > 0 && [s.colDivider, { borderLeftColor: C.line }]]}>
            <View style={s.iconWrap}>
              {item.svg}
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
  );
}

const s = StyleSheet.create({
  container: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s3 + 4,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
    paddingHorizontal: 2,
  },
  grid: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    paddingVertical: STEP.s1,
  },
  col: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  colDivider: {
    borderLeftWidth: 1,
  },
  iconWrap: {
    marginBottom: STEP.s1,
    alignItems: "center",
    justifyContent: "center",
  },
  valRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  val: {
    fontFamily: "Bricolage_400",
    fontSize: 26,
    lineHeight: 30,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    ...TYPOGRAPHY.meta,
  },
  label: {
    ...TYPOGRAPHY.metaSemiBold,
    marginTop: 4,
    textAlign: "center",
  },
});
