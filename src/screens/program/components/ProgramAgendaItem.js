import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes } from "../../../lib/format";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Program gundemi: sol sutunda sure, dikey hat + ders renkli dugum, sagda
// kart (DERS etiketi, BİTTİ, konu adi). Biten durak sonuk.
function ProgramAgendaItem({ item }) {
  const C = useC();
  const color = subjectColorOf(C, item.subject);
  return (
    <View style={s.row}>
      <View style={s.side}>
        <Text style={[TYPOGRAPHY.tableHead, s.dur, { color: C.text3 }]}>{formatMinutes(item.minutes)}</Text>
      </View>
      <View style={[s.line, { backgroundColor: C.line }]}>
        <View style={[s.node, { backgroundColor: item.done ? C.text5 : color }]} />
      </View>
      <View style={s.cardWrap}>
        <View style={[s.card, item.done
          ? { backgroundColor: C.void, borderColor: C.line }
          : { backgroundColor: C.surface, borderColor: C.elev }]}
        >
          <View style={s.tags}>
            <Text style={[TYPOGRAPHY.tableHead, { color }]}>{item.subjectLabel.toLocaleUpperCase("tr-TR")}</Text>
            {item.done ? <Text style={[TYPOGRAPHY.tableHead, { color: C.up }]}>BİTTİ</Text> : null}
          </View>
          <Text style={[TYPOGRAPHY.topicName, s.name, { color: item.done ? C.text3 : C.text }]}>{item.topic}</Text>
        </View>
      </View>
    </View>
  );
}

export default memo(ProgramAgendaItem);

const NODE = 8;

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s2 + 4 },
  side: { width: 48, paddingTop: STEP.s3 - 4, alignItems: "flex-end" },
  dur: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  line: { width: 1 },
  node: { position: "absolute", left: -NODE / 2 + 0.5, top: STEP.s3, width: NODE, height: NODE, borderRadius: SHAPE.chip / 6 },
  cardWrap: { flex: 1, minWidth: 0, paddingTop: STEP.s2, paddingBottom: STEP.s1 },
  card: { paddingVertical: STEP.s3 - 5, paddingHorizontal: STEP.s3 - 3, borderRadius: SHAPE.cardTight + 2, borderWidth: 1 },
  tags: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  name: { marginTop: STEP.s1 - 2 },
});
