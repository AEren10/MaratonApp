import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function SummaryHeader({ dateLabel, onClose }) {
  const C = useC();

  return (
    <View style={styles.row}>
      <Press haptic="none"
        accessibilityLabel="Kapat"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onClose}
        style={styles.closeBtn}
      >
        <Icon name="x" size={14} color={C.text2} />
      </Press>
      <Text style={[TYPOGRAPHY.label, { color: C.text3, flex: 1 }]}>{dateLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
  },
  closeBtn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    marginLeft: -STEP.s2,
    alignItems: "center",
    justifyContent: "center",
  },
});
