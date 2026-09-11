import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SectionLabel } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export const RecentSearches = React.memo(function RecentSearches({ C, items, onPick, onClear }) {
  if (!items.length) return null;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <SectionLabel>SON ARAMALAR</SectionLabel>
        <Pressable onPress={onClear} hitSlop={10} accessibilityRole="button" accessibilityLabel="Son aramaları temizle">
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Temizle</Text>
        </Pressable>
      </View>
      <View style={styles.chips}>
        {items.map((term) => (
          <Pressable
            key={term}
            onPress={() => onPick(term)}
            accessibilityRole="button"
            accessibilityLabel={`${term} için ara`}
            hitSlop={{ top: 5, bottom: 5 }}
            style={({ pressed }) => [styles.chip, { borderColor: C.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{term}</Text>
          </Pressable>
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
