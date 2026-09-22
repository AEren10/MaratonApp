import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { GUTTER, SHAPE } from "../../../themes/tokens";

export function AnalysisHeader({ C, onAddTrial }) {
  return (
    <View style={s.header}>
      <Text style={[s.title, { color: C.text }]}>Analiz</Text>
      {onAddTrial ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deneme gir"
          onPress={onAddTrial}
          style={({ pressed }) => [
            s.btn,
            { backgroundColor: pressed ? C.accentPress || C.accent : C.accent },
          ]}
        >
          <Icon name="plus" size={13} color={C.accentInk} sw={2.5} />
          <Text style={[s.btnText, { color: C.accentInk }]}>Deneme gir</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingTop: 6,
    paddingBottom: 4,
  },
  title: {
    fontFamily: "Bricolage_400",
    fontSize: 26,
    letterSpacing: -0.3,
  },
  btn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: SHAPE.chip * 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnText: {
    fontFamily: "Archivo_700",
    fontSize: 13,
  },
});