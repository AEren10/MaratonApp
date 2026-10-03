import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon, Press } from "../../../components/design";
import { TYPOGRAPHY, NAV_ICON, CONTROL, GUTTER, STEP } from "../../../themes/tokens";

export function RouteReadyHeader({ C, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Press
          haptic="none"
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backBtn}
        >
          <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
        </Press>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Rotan Hazır</Text>
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s1,
    minHeight: CONTROL.tapMin,
  },
  backBtn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
});
