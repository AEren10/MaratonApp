import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export const SubjectDetailHeader = React.memo(function SubjectDetailHeader({ C, onBack, onSearch }) {
  return (
    <View style={styles.row}>
      <Press haptic="none" onPress={onBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
        <Icon name="arrowL" size={22} color={C.text2} />
      </Press>
      <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Yol haritası</Text>
      <Press haptic="none"
        onPress={onSearch}
        style={styles.searchBtn}
        accessibilityRole="button"
        accessibilityLabel="Ara"
      >
        <Icon name="search" size={16} color={C.text3} />
      </Press>
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
