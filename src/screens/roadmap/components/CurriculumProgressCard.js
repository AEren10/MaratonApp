import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import CurriculumCurve from "./CurriculumCurve";

// Yol Haritasi ust karti: MÜFREDAT İLERLEMESİ + bitti/kaldi + egri.
export function CurriculumProgressCard({ done, total, left, pct }) {
  const C = useC();
  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.bodySemiBold, s.headLabel, { color: C.text2 }]}>MÜFREDAT İLERLEMESİ</Text>
        <Text style={[TYPOGRAPHY.bodySemiBold, s.headCount, { color: C.text2 }]}>{`${done}/${total} konu · %${pct}`}</Text>
      </View>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.stat, { color: C.text }]} allowFontScaling={false}>{done}</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>{`konu bitti · ${left} kaldı`}</Text>
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
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    borderWidth: 1,
  },
  head: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  headLabel: {
    letterSpacing: 1.1,
    textTransform: "uppercase",
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
