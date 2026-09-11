import { View, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { STEP, CONTROL } from "../../../themes/tokens";

export function TrialDetailHeader({ C, onBack, onMenu }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
        <Icon name="arrowL" size={20} color={C.text2} />
      </Pressable>
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={onMenu}
        hitSlop={8}
        accessibilityLabel="Deneme seçenekleri"
        accessibilityRole="button"
        style={styles.menuBtn}
      >
        <Icon name="more" fill={C.text3} color="transparent" size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: STEP.s3, paddingTop: STEP.s1,
  },
  menuBtn: {
    width: CONTROL.tapMin, height: CONTROL.tapMin,
    alignItems: "center", justifyContent: "center",
  },
});
