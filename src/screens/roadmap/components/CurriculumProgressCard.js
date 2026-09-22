import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import CurriculumCurve from "./CurriculumCurve";

// Yol Haritasi editoryal hero alani: MÜFREDAT İLERLEMESİ + bitti/kaldi + egri.
// Kutu/kart arkasi kaldirildi; grafik dogrudan sayfa zemininde (C.bg) nefes aliyor.
export function CurriculumProgressCard({ done, total, left, pct }) {
  const C = useC();
  return (
    <View style={s.wrap} accessible accessibilityLabel={`Müfredat ilerlemesi: ${done}/${total} konu, yüzde ${pct}`}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, s.headLabel, { color: C.text3 }]}>MÜFREDAT İLERLEMESİ</Text>
        <Text style={[TYPOGRAPHY.tableValue, s.headCount, { color: C.text2 }]}>{`${done}/${total} konu · %${pct}`}</Text>
      </View>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.stat, { color: C.text }]} allowFontScaling={false}>{done}</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, s.heroSub, { color: C.text3 }]}>{`konu bitti · ${left} kaldı`}</Text>
      </View>
      <View style={s.curve}>
        <CurriculumCurve ratio={total > 0 ? done / total : 0} />
      </View>
      <View style={s.foot}>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${done} konu bitti`}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${left} konu kaldı`}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingVertical: STEP.s2,
  },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  headLabel: {
    letterSpacing: 1.6,
  },
  headCount: {
    letterSpacing: 0,
    fontVariant: ["tabular-nums"],
  },
  hero: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s1 + 2,
    marginTop: STEP.s2,
  },
  heroSub: {
    lineHeight: 24,
  },
  curve: {
    marginTop: STEP.s2,
    marginBottom: STEP.s1,
  },
  foot: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s1,
  },
});
