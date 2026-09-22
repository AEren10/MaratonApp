import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes } from "../../../lib/format";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Program gundemi: sol sutunda sure, dikey hat + ders renkli dugum, sagda
// kart (DERS etiketi, BİTTİ, konu adi). Biten durak sonuk.
function ProgramAgendaItem({ item }) {
  const C = useC();
  const color = subjectColorOf(C, item.subject);
  return (
    <View style={[s.row, { borderTopColor: C.line }]}>
      <Text style={[TYPOGRAPHY.tableHead, s.time, { color: item.done ? C.text4 : C.text3 }]}>
        {formatMinutes(item.minutes)}
      </Text>
      <View style={[s.swatch, { backgroundColor: color, opacity: item.done ? 0.55 : 1 }]} />
      <View style={s.body}>
        <Text
          style={[TYPOGRAPHY.bodySemiBold, s.name, { color: item.done ? C.text3 : C.text }, item.done && s.doneText]}
          numberOfLines={1}
        >
          {item.subjectLabel} · {item.topic}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.tableHead, s.meta, { color: item.done ? C.up : C.text3 }]}>
        {item.done ? "BİTTİ" : formatMinutes(item.minutes)}
      </Text>
    </View>
  );
}

export default memo(ProgramAgendaItem);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 2,
    minHeight: 56,
    paddingVertical: 11,
    borderTopWidth: 1,
  },
  time: {
    width: 44,
    letterSpacing: 0,
    fontVariant: ["tabular-nums"],
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    paddingRight: STEP.s1,
  },
  name: {
    letterSpacing: -0.15,
    lineHeight: 20,
  },
  doneText: {
    textDecorationLine: "line-through",
  },
  meta: {
    width: 44,
    textAlign: "right",
    letterSpacing: 0,
    fontVariant: ["tabular-nums"],
  },
});
