import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { formatDelta } from "../../../lib/format";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// SEÇİLEN YOLUN SONUCU: ŞİMDİ -> PLANLA ve net farki. Net bilinmiyorsa
// sayilar hic cizilmez, yalniz aciklama kalir.
export function GapResultCard({ result, body }) {
  const C = useC();
  if (!result && !body) return null;
  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SEÇİLEN YOLUN SONUCU</Text>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {result ? (
          <View style={s.nums}>
            <View>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>ŞİMDİ</Text>
              <Text style={[TYPOGRAPHY.statCount, s.num, { color: C.text3 }]}>{result.now}</Text>
            </View>
            <View style={s.arrow}><Icon name="arrowR" size={14} color={C.text4} /></View>
            <View>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>PLANLA</Text>
              <Text style={[TYPOGRAPHY.statCount, s.num, { color: C.text }]}>{result.planned}</Text>
            </View>
            <View style={s.delta}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: result.delta > 0 ? C.up : C.down }]}>
                {formatDelta(result.delta)}
              </Text>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, letterSpacing: 0 }]}>net</Text>
            </View>
          </View>
        ) : null}
        {body ? (
          <Text style={[TYPOGRAPHY.meta, result && s.body, { color: C.text2 }]}>{body}</Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 - 8 },
  card: { marginTop: STEP.s2 + 2, padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  nums: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2 + 2 },
  num: { marginTop: STEP.s1 },
  arrow: { paddingBottom: STEP.s1 },
  delta: { flex: 1, alignItems: "flex-end" },
  body: { marginTop: STEP.s3 - 4 },
});
