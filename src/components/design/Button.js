import { Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "./Icon";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL, ANIMATION } from "../../themes/tokens";
import * as H from "../../lib/haptics";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANTS = {
  primary:   (C) => ({ bg: C.accent,  text: C.textOnBrand, pressed: C.accentPressed }),
  orange:    (C) => ({ bg: C.orange,  text: C.textOnBrand, pressed: C.orangePressed }),
  secondary: (C) => ({ bg: C.accentLight, text: C.accent, pressed: C.surfacePressed }),
  outline:   (C) => ({ bg: "transparent", text: C.text,   pressed: C.surfacePressed, border: C.border }),
  ghost:     (C) => ({ bg: "transparent", text: C.accent, pressed: C.surfacePressed }),
  danger:    (C) => ({ bg: C.danger,  text: C.textOnBrand, pressed: C.red }),
  success:   (C) => ({ bg: C.success, text: C.textOnBrand, pressed: C.green }),
};

// Tasarimin uc kademesi: birincil/ikincil h52, ucuncul h44. Pill yok.
const SIZES = {
  sm: { height: CONTROL.chip,           px: 14, fontSize: 13, iconSize: 14, radius: SHAPE.chip },
  md: { height: CONTROL.buttonTertiary, px: 20, fontSize: 15, iconSize: 16, radius: SHAPE.button },
  lg: { height: CONTROL.buttonPrimary,  px: 24, fontSize: 16, iconSize: 18, radius: SHAPE.button },
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth,
  style,
}) {
  const C = useC();
  const v = (VARIANTS[variant] || VARIANTS.primary)(C);
  const s = SIZES[size] || SIZES.md;
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const isDisabled = disabled || loading;

  return (
    <ReanimatedPressable
      onPress={(e) => { if (!isDisabled) { H.tap(); onPress?.(e); } }}
      onPressIn={() => { scale.value = withSpring(0.97, ANIMATION.spring.default); }}
      onPressOut={() => { scale.value = withSpring(1, ANIMATION.spring.default); }}
      disabled={isDisabled}
      style={[
        animStyle,
        styles.base,
        {
          backgroundColor: v.bg,
          height: s.height,
          paddingHorizontal: s.px,
          borderRadius: s.radius,
          opacity: isDisabled ? 0.5 : 1,
        },
        v.border && { borderWidth: 1, borderColor: v.border },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && <Icon name={icon} size={s.iconSize} color={v.text} sw={2.5} />}
          {children ? (
            <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>
              {children}
            </Text>
          ) : null}
          {iconRight && <Icon name={iconRight} size={s.iconSize} color={v.text} sw={2.5} />}
        </>
      )}
    </ReanimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    minHeight: CONTROL.tapMin,
  },
  fullWidth: { width: "100%" },
  label: { ...TYPOGRAPHY.button },
});
