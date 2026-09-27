import { Text, View, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function QuickAddRow({ C, title, subtitle, onPress, accessibilityLabel, icon = "plus", iconColor }) {
  const icColor = iconColor || C.text2;
  return (
    <Press haptic="none"
      onPress={() => { H.tap(); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}
    >
      <View style={[styles.iconBox, { backgroundColor: C.elev }]}>
        <Icon name={icon} size={16} color={icColor} sw={1.5} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{title}</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{subtitle}</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Press>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    minHeight: CONTROL.tapMin, paddingVertical: STEP.s2, paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.card, borderWidth: 1,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
