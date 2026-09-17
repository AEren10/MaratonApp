import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import CurriculumCurve from "./CurriculumCurve";

// Yol Haritasi ust karti: MÜFREDAT İLERLEMESİ + bitti/kaldi + egri.
export function CurriculumProgressCard({ done, total, left, pct }) {
  const C = useC();
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>MÜFREDAT İLERLEMESİ</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>{`${done}/${total} konu · %${pct}`}</Text>
      </View>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.statPosterSide, { color: C.text }]} allowFontScaling={false}>{done}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>{`konu bitti · ${left} kaldı`}</Text>
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
  wrap: { paddingTop: STEP.s1, paddingBottom: STEP.s2 },
  head: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  hero: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: STEP.s2 },
  curve: { marginTop: STEP.s2 },
  foot: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
});
