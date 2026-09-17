import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as H from "../../../lib/haptics";
import { GUTTER, SHAPE, STEP } from "../../../themes/tokens";

export const WRONG_TABS = {
  MINE: "mine",
  COMMUNITY: "community",
};

export function NotebookHeaderTabs({ C, activeTab, onChange, count = 0 }) {
  const isMine = activeTab === WRONG_TABS.MINE;
  const isComm = activeTab === WRONG_TABS.COMMUNITY;

  return (
    <View style={[s.tabs, { borderBottomColor: C.line }]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={`Defterim, ${count} soru`}
        accessibilityState={{ selected: isMine }}
        onPress={() => {
          if (isMine) return;
          H.select();
          onChange(WRONG_TABS.MINE);
        }}
        style={s.tab}
      >
        <View style={s.tabLabelRow}>
          <Text style={[s.tabTitle, { color: isMine ? C.text : C.text3 }]}>
            Defterim
          </Text>
          <Text style={[s.tabCount, { color: C.text3 }]}>
            {count}
          </Text>
        </View>
        <View style={[s.indicator, { backgroundColor: isMine ? C.accent : "transparent" }]} />
      </Pressable>

      <Pressable
        accessibilityRole="tab"
        accessibilityLabel="Topluluk"
        accessibilityState={{ selected: isComm }}
        onPress={() => {
          if (isComm) return;
          H.select();
          onChange(WRONG_TABS.COMMUNITY);
        }}
        style={s.tab}
      >
        <View style={s.tabLabelRow}>
          <Text style={[s.tabTitle, { color: isComm ? C.text : C.text3 }]}>
            Topluluk
          </Text>
          <View style={[s.dot, { backgroundColor: C.accent }]} />
        </View>
        <View style={[s.indicator, { backgroundColor: isComm ? C.accent : "transparent" }]} />
      </Pressable>
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

