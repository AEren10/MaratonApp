import { View, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { STEP, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function TrialDetailHeader({ C, onBack, onMenu }) {
  return (
    <View style={styles.row}>
      <Press haptic="none" onPress={onBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
        <Icon name="arrowL" size={20} color={C.text2} />
      </Press>
      <View style={{ flex: 1 }} />
      <Press haptic="none"
        onPress={onMenu}
        hitSlop={8}
        accessibilityLabel="Deneme seçenekleri"
        accessibilityRole="button"
        style={styles.menuBtn}
      >
        <Icon name="more" fill={C.text3} color="transparent" size={16} />
      </Press>
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
