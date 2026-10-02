import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Press } from "../../../../components/design/Press";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import * as H from "../../../../lib/haptics";

const QUICK_DURATIONS = ["25", "50", "90"];

export function QuickDurationChips({ C, value, onSelect }) {
  return (
    <View style={[s.quickRow, { borderTopColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>HIZLI SÜRE</Text>
      <View style={s.chipsRow}>
        {QUICK_DURATIONS.map((mins) => {
          const active = value === mins;
          return (
            <Press
              key={mins}
              hitSlop={{ top: 6, bottom: 6 }}
              onPress={() => {
                H.select();
                onSelect(active ? "" : mins);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${mins} dakika`}
              style={[
                s.chip,
                {
                  backgroundColor: active ? C.elev : C.void,
                  borderColor: active ? C.accentBright : C.line,
                },
              ]}
            >
              <Text
                style={[
                  TYPOGRAPHY.tableHead,
                  s.chipText,
                  { color: active ? C.accentBright : C.text2 },
                ]}
              >
                {`${mins} dk`}
              </Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: STEP.s2,
    borderTopWidth: 1,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    letterSpacing: 0,
    textTransform: "none",
  },
});
