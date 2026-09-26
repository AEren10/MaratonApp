import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { Press } from "../../../components/design/Press";

export const TopicWrongNoteRow = React.memo(function TopicWrongNoteRow({ item, C }) {
  const navigation = useNavigation();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => navigation.navigate(SCREENS.WRONG_DETAIL, { id: item.id, item: item.raw })}
      style={[s.row, { backgroundColor: "transparent", borderColor: C.line, borderBottomWidth: 1 }]}
    >
      <View style={[s.thumb, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.thumbLines}>
          <View style={[s.lineShort, { backgroundColor: C.elev }]} />
          <View style={[s.lineBlock, { backgroundColor: C.track }]} />
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3 }]} numberOfLines={2}>
          {item.source}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>
          {item.desc}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: item.badgeColor }]}>{item.badge}</Text>
    </Pressable>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: STEP.s2, gap: STEP.s3 },
  thumb: { width: 44, height: 44, borderRadius: SHAPE.cardTight, borderWidth: 1, padding: 6 },
  thumbLines: { flex: 1, gap: 4 },
  lineShort: { height: 4, width: "40%", borderRadius: 2 },
  lineBlock: { flex: 1, borderRadius: 3 },
});
