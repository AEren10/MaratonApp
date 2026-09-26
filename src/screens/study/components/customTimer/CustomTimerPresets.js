import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Press } from "../../../../components/design/Press";
import * as H from "../../../../lib/haptics";
import { STEP, SHAPE, TYPOGRAPHY } from "../../../../themes/tokens";

export function CustomTimerPresets({ presets, value, unit, onChange, C }) {
  if (!presets || presets.length === 0) return null;

  return (
    <View style={[s.chipsRow, { borderTopColor: C.line }]}>
      {presets.map((p) => {
        const active = value === p;
        return (
          <Press
            key={p}
            haptic="none"
            scaleTo={0.94}
            onPress={() => {
              H.select();
              onChange(p);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${p} ${unit}`}
            style={[
              s.chip,
              {
                backgroundColor: active ? C.accent + "22" : C.surface,
                borderColor: active ? C.accent : C.border,
              },
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.tableValue,
                { color: active ? (C.accentBright || C.accent) : C.text2 },
              ]}
            >
              {p}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: STEP.s1,
    marginTop: STEP.s2,
    paddingTop: STEP.s2,
    borderTopWidth: 1,
  },
  chip: {
    minWidth: 40,
    height: 32,
    paddingHorizontal: STEP.s1,
    borderRadius: SHAPE.chip + 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
