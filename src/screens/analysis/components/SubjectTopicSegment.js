import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, GUTTER } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const TABS = [
  { key: "all", label: "Tümü" },
  { key: "done", label: "Biten" },
  { key: "remaining", label: "Kalan" },
];

export const SubjectTopicSegment = React.memo(function SubjectTopicSegment({ C, active, onChange }) {
  const handlePress = useCallback(
    (key) => { H.tap(); onChange(key); },
    [onChange],
  );

  return (
    <View style={[styles.wrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            style={[styles.tab, isActive && { backgroundColor: C.elev }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: isActive ? C.text : C.text3 }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    marginHorizontal: GUTTER,
    marginTop: STEP.s3,
    borderWidth: 1,
    borderRadius: SHAPE.segment,
  },
  tab: {
    flex: 1,
    height: CONTROL.segment,
    borderRadius: SHAPE.segment,
    alignItems: "center",
    justifyContent: "center",
  },
});
