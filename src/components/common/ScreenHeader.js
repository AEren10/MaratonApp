import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../design/Press";
import { Icon } from "../design/Icon";

/**
 * Standard ScreenHeader for all screens across the app.
 *
 * Rules:
 * 1. Root screens (sekme kökü) have NO back arrow (isRoot=true).
 * 2. Pushed screens (içeri itilen) have a back arrow (onBack provided and !isRoot).
 * 3. Title size is uniform across the entire app: TYPOGRAPHY.heading (28px Bricolage_400).
 * 4. Spacing is uniform: paddingTop: STEP.s2, paddingHorizontal: GUTTER.
 */
export const ScreenHeader = memo(function ScreenHeader({
  title,
  subtitle,
  onBack,
  isRoot = false,
  close = false,
  right = null,
  style,
  titleStyle,
  backLabel,
}) {
  const C = useC();
  const showBack = !isRoot && Boolean(onBack);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <Press
            haptic="none"
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={backLabel || (close ? "Kapat" : "Geri")}
            style={styles.tap}
          >
            <Icon name={close ? "x" : "chevL"} size={close ? 16 : 18} color={C.text2} />
          </Press>
        ) : null}

        <View style={styles.titleWrap}>
          {subtitle ? (
            <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: 2 }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {title ? (
            <Text
              style={[
                TYPOGRAPHY.heading,
                styles.title,
                { color: C.text },
                titleStyle,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
        </View>
      </View>

      {right ? <View style={styles.rightWrap}>{right}</View> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s2,
    paddingBottom: STEP.s1,
    minHeight: CONTROL.tapMin,
  },
  leftRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  tap: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    marginLeft: -STEP.s1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    includeFontPadding: false,
  },
  rightWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
});

export default ScreenHeader;
