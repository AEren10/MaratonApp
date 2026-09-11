import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Icon, SectionLabel } from "../../../components/design";
import { View } from "react-native";

export function AddTaskTopicField({ topic, onPress, C }) {
  return (
    <View>
      <SectionLabel>Konu</SectionLabel>
      <Pressable onPress={onPress} style={[st.btn, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.bodyMedium, st.label, { color: topic ? C.text : C.text3 }]} numberOfLines={1}>
          {topic || "Konu seç..."}
        </Text>
        <Icon name="chevDown" size={12} color={C.text3} />
      </Pressable>
    </View>
  );
}

const st = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    height: 56, paddingHorizontal: STEP.s3, borderRadius: SHAPE.card, borderWidth: 1, marginTop: 14,
  },
  label: { flex: 1 },
});
