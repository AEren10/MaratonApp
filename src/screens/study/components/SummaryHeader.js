import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

export function SummaryHeader({ dateLabel, onClose }) {
  const C = useC();

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Kapat"
        accessibilityRole="button"
        hitSlop={12}
        onPress={onClose}
        style={styles.closeBtn}
      >
        <Icon name="x" size={14} color={C.text2} />
      </Pressable>
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
