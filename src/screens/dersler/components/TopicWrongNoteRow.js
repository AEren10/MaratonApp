import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";

function formatWhen(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// Defterdeki tek bir yanlis satiri. Tasarimin soyut not onizlemesi (gercek
// gorsel degil) birebir korunuyor — resim getirmek ek yuk, mock da soyut.
export const TopicWrongNoteRow = React.memo(function TopicWrongNoteRow({ item }) {
  const C = useC();
  const navigation = useNavigation();
  const dueColor = item.due.tone === "warn" ? C.warn : C.text3;

  return (
    <Pressable
      onPress={() => navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item })}
      style={[s.row, { borderTopColor: C.line }]}
      hitSlop={4}
    >
      <View style={[s.thumb, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.thumbLines}>
          <View style={[s.lineShort, { backgroundColor: C.elev }]} />
          <View style={[s.lineShorter, { backgroundColor: C.elev }]} />
          <View style={[s.lineBlock, { backgroundColor: C.track }]} />
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {item.note ? (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]} numberOfLines={1}>
            {item.note}
          </Text>
        ) : null}
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>
          {formatWhen(item.created_at)}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: dueColor }]}>{item.due.label}</Text>
    </Pressable>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 1, paddingVertical: STEP.s2 + 1, borderTopWidth: 1 },
  thumb: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  thumbLines: { flex: 1, margin: 8, gap: 4 },
  lineShort: { height: 3, width: "80%", borderRadius: 1 },
  lineShorter: { height: 3, width: "60%", borderRadius: 1 },
  lineBlock: { flex: 1, borderRadius: 5 },
});
