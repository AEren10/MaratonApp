import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../design";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL, ANIMATION } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import * as haptic from "../../lib/haptics";
import { Press } from "../../components/design/Press";

const POPUP_COLORS = {
  red: (C) => ({ bg: C.red, icon: C.red }),
  amber: (C) => ({ bg: C.amber, icon: C.amber }),
  green: (C) => ({ bg: C.green, icon: C.green }),
  blue: (C) => ({ bg: C.blue, icon: C.blue }),
  purple: (C) => ({ bg: C.purple, icon: C.purple }),
  coral: (C) => ({ bg: C.accent, icon: C.accent }),
};

const AUTO_DISMISS_MS = 4500;
const OFF_Y = 120;
const ENTER_MS = 220;
const EXIT_MS = 240;
const ENTER_SPRING = { duration: 420, dampingRatio: 0.85 };
const EASE_OUT = Easing.bezier(...ANIMATION.easing.easeOut);

export function NudgePopup({ nudge, visible, onDismiss, onAction }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const translateY = useSharedValue(OFF_Y);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible || !nudge) return;

    haptic.tap();

    if (reduced) {
      translateY.value = 0;
      opacity.value = withTiming(1, { duration: ENTER_MS });
      return;
    }

    // DIKKAT: burada iki ayri atama YAPILMAZ.
    //
    // Eskiden once withSpring(0), hemen ardindan translateY.value = withDelay(...)
    // yaziliyordu. Ikinci atama birinciyi ANINDA iptal ediyor, yani kart hic
    // yukari kaymiyor, 120px asagida 4.5 saniye bekliyordu. Ustune translateY
    // ve scale iki AYRI yayla farkli hizlarda gidiyor, kart eziliyordu.
    // Tek eksen, tek yay, withSequence ile sirali.
    translateY.value = withSequence(
      withSpring(0, ENTER_SPRING),
      withDelay(AUTO_DISMISS_MS, withTiming(OFF_Y, { duration: EXIT_MS, easing: EASE_OUT })),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: ENTER_MS }),
      withDelay(AUTO_DISMISS_MS, withTiming(0, { duration: EXIT_MS }, (finished) => {
        if (finished && onDismiss) scheduleOnRN(onDismiss);
      })),
    );
  }, [visible, nudge]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible || !nudge) return null;

  const colors = (POPUP_COLORS[nudge.color] || POPUP_COLORS.amber)(C);

  const handlePress = () => {
    haptic.tap();
    translateY.value = withTiming(OFF_Y, { duration: EXIT_MS, easing: EASE_OUT });
    opacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
      if (finished && onAction) scheduleOnRN(onAction, nudge);
    });
  };

  const handleDismiss = () => {
    translateY.value = withTiming(OFF_Y, { duration: EXIT_MS, easing: EASE_OUT });
    opacity.value = withTiming(0, { duration: EXIT_MS }, (finished) => {
      if (finished && onDismiss) scheduleOnRN(onDismiss);
    });
  };

  return (
    <Animated.View style={[styles.container, { bottom: insets.bottom + STEP.s4 }, animStyle]}>
      <Press haptic="none" onPress={handlePress} style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.bg + "20" }]}>
          <Icon name={nudge.icon || "bell"} size={20} color={colors.icon} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.message, { color: C.text }]}>{nudge.message}</Text>
          {nudge.actionLabel && (
            <Text style={[styles.action, { color: colors.icon }]}>{nudge.actionLabel.toUpperCase()}</Text>
          )}
        </View>
        <Press haptic="none" onPress={handleDismiss} hitSlop={12} style={styles.close}>
          <Icon name="x" size={16} color={C.text3} />
        </Press>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: GUTTER,
    right: GUTTER,
    zIndex: 10000,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SHAPE.card,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: SHAPE.badge,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: STEP.s2,
  },
  body: { flex: 1, paddingHorizontal: STEP.s2, paddingVertical: STEP.s3 },
  message: {
    fontFamily: "Archivo_600",
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    fontFamily: "Archivo_700",
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  close: {
    padding: STEP.s2,
    marginRight: 4,
  },
});
