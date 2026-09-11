import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

export const SubjectDetailHeader = React.memo(function SubjectDetailHeader({ C, onBack, onSearch }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
        <Icon name="arrowL" size={22} color={C.text2} />
      </Pressable>
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Yol haritası</Text>
      <Pressable
        onPress={onSearch}
        style={styles.searchBtn}
        accessibilityRole="button"
        accessibilityLabel="Ara"
      >
        <Icon name="search" size={16} color={C.text3} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s1,
  },
  searchBtn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
});
