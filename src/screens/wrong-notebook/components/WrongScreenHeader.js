import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Defter akisinin ust satiri: geri oku ya da kapat carpisi, basik baslik
// (Bricolage 28) veya harf aralikli bolum etiketi, baslik rozeti, sagda istege bagli oge.
export function WrongScreenHeader({ icon = "arrowL", title, label, badge, right, onPress, a11yLabel }) {
  const C = useC();
  return (
    <View style={styles.row}>
      <Press
        haptic="none"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel || (icon === "x" ? "Kapat" : "Geri")}
        style={styles.hit}
      >
        <Icon name={icon} size={icon === "x" ? 16 : 18} color={C.text2} />
      </Press>
      {title ? (
        <View style={styles.titleRow}>
          <Text style={[TYPOGRAPHY.heading, styles.titleText, { color: C.text }]} numberOfLines={1}>
            {title}
          </Text>
          {badge !== undefined && badge !== null ? (
            <View style={[styles.badge, { backgroundColor: C.surface, borderColor: C.line }]}>
              <Text style={[TYPOGRAPHY.metaSemiBold, styles.badgeText, { color: C.text2 }]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
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
    paddingTop: STEP.s2,
  },
  hit: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  titleText: {
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontVariant: ["tabular-nums"],
  },
  flex: { flex: 1 },
});
