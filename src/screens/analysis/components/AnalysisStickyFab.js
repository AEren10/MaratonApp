import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { GUTTER, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export const AnalysisStickyFab = React.memo(function AnalysisStickyFab({ C, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Deneme gir"
      onPress={() => {
        H.tap();
        onPress();
      }}
      style={({ pressed }) => [
        s.fab,
        {
          backgroundColor: pressed ? (C.accentPress || C.accent) : C.accent,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <Icon name="plus" size={15} color={C.accentInk} sw={2.5} />
      <Text style={[TYPOGRAPHY.button, s.text, { color: C.accentInk }]}>Deneme gir</Text>
    </Pressable>
  );
});

const s = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: GUTTER,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  text: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
