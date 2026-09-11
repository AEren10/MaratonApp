import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const LABELS = { ALL: "Tümü", TYT: "TYT", AYT: "AYT", BRANCH: "Branş" };

export const TrialRecordFilters = React.memo(function TrialRecordFilters({ tabs, active, onChange, C }) {
  const handlePress = useCallback(
    (tab) => {
      H.tap();
      onChange(tab);
    },
    [onChange],
  );

  return (
    <View style={[styles.wrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => handlePress(tab)}
            style={[styles.tab, isActive && { backgroundColor: C.elev }]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={LABELS[tab]}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: isActive ? C.text : C.text3, fontWeight: "700" }]}>
              {LABELS[tab]}
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
