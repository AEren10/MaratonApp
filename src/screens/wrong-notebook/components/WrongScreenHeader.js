import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Defter akisinin ust satiri: geri oku ya da kapat carpisi, basik baslik
// (Bricolage 22) veya harf aralikli bolum etiketi, sagda istege bagli oge.
export function WrongScreenHeader({ icon = "arrowL", title, label, right, onPress, a11yLabel }) {
  const C = useC();
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel || (icon === "x" ? "Kapat" : "Geri")}
        style={styles.hit}
      >
        <Icon name={icon} size={icon === "x" ? 16 : 18} color={C.text2} />
      </Pressable>
      {title ? (
        <Text style={[TYPOGRAPHY.subheading, styles.flex, { color: C.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <Text style={[TYPOGRAPHY.label, styles.flex, { color: C.text3 }]}>{label}</Text>
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingLeft: GUTTER - STEP.s2,
    paddingRight: GUTTER,
    paddingTop: 4,
  },
  hit: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
});
