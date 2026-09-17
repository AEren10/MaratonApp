import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GUTTER, SHAPE } from "../../../themes/tokens";

const TABS = [
  { key: "ALL", label: "Tümü" },
  { key: "TYT", label: "TYT" },
  { key: "AYT", label: "AYT" },
  { key: "BRANCH", label: "Branş" },
];

export function AnalysisFilterPills({ C, value, onChange }) {
  return (
    <View style={s.wrap}>
      <View style={[s.container, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {TABS.map((tab) => {
          const active = value === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(tab.key)}
              style={[
                s.tab,
                { backgroundColor: active ? C.elev : "transparent" },
              ]}
            >
              <Text
                style={[
                  s.label,
                  { color: active ? C.text : C.text3 },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    paddingTop: 16,
  },
  container: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderRadius: SHAPE.chip, // 6px
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: SHAPE.chip, // 6px
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Archivo_700",
    fontSize: 12.5,
  },
});