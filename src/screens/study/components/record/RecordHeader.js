import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Kayit akisinin ust satiri: geri chevron + Bricolage 22 baslik.
export function RecordHeader({ title, onBack }) {
  const C = useC();
  return (
    <View style={styles.row}>
      <Press haptic="none" onPress={onBack} accessibilityRole="button" accessibilityLabel="Geri" style={styles.hit}>
        <Icon name="chevL" size={16} color={C.text2} />
      </Press>
      <Text accessibilityRole="header" numberOfLines={1} style={[TYPOGRAPHY.subheading, styles.title, { color: C.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingLeft: GUTTER - STEP.s2, paddingRight: GUTTER, paddingTop: STEP.s1 / 2 },
  hit: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  title: { flex: 1 },
});
