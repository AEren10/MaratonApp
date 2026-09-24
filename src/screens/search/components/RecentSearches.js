import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export const RecentSearches = React.memo(function RecentSearches({ C, items, onPick, onClear }) {
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <SectionLabel>SON ARAMALAR</SectionLabel>
        <Press haptic="none" onPress={onClear} hitSlop={10} accessibilityRole="button" accessibilityLabel="Son aramaları temizle">
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Temizle</Text>
        </Press>
      </View>
      <View style={styles.chips}>
        {items.map((term) => (
          <Press haptic="none"
            key={term}
            onPress={() => onPick(term)}
            accessibilityRole="button"
            accessibilityLabel={`${term} için ara`}
            hitSlop={{ top: 5, bottom: 5 }}
            style={[styles.chip, { borderColor: C.border}]}
          >
            <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{term}</Text>
          </Press>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginTop: 26 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: 14 },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
