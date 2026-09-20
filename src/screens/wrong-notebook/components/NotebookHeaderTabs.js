import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as H from "../../../lib/haptics";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";

export const WRONG_TABS = {
  MINE: "mine",
};

export function NotebookHeaderTabs({ C, count = 0 }) {
  return (
    <View style={[s.tabs, { borderBottomColor: C.line }]}>
      <View
        accessibilityRole="tab"
        accessibilityLabel={`Defterim, ${count} soru`}
        accessibilityState={{ selected: true }}
        style={s.tab}
      >
        <View style={s.tabLabelRow}>
          <Text style={[s.tabTitle, { color: C.text }]}>
            Defterim
          </Text>
          <Text style={[s.tabCount, { color: C.text3 }]}>
            {count}
          </Text>
        </View>
        <View style={[s.indicator, { backgroundColor: C.accent }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: STEP.s4 - 8,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3,
    borderBottomWidth: 1,
  },
  tab: {
    gap: STEP.s1 + 2,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s1,
  },
  tabTitle: {
    fontFamily: "Archivo_700",
    fontSize: 15,
  },
  tabCount: {
    fontFamily: "Archivo_500",
    fontSize: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 6,
    alignSelf: "center",
  },
  indicator: {
    height: 2,
    borderRadius: SHAPE.chip / 6,
  },
});

