import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StudyTimerControls({
  C,
  hasSubject,
  isPomodoro,
  running,
  onFinish,
  onSkip,
  onToggle,
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  }, [scale]);

  const handleToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onToggle?.();
  }, [onToggle]);

  const handleFinish = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onFinish?.();
  }, [onFinish]);

  const handleSkip = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    onSkip?.();
  }, [onSkip]);

  const btnBg = !hasSubject ? C.elev : running ? C.surface : C.accent;
  const btnText = !hasSubject ? C.text4 : running ? C.text : C.accentInk || "#F7F2F0";
  const btnBorder = running ? C.border : "transparent";

  return (
    <View style={s.wrap}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handleToggle}
        disabled={!hasSubject}
        accessibilityRole="button"
        accessibilityLabel={running ? "Duraklat" : "Başlat"}
        style={[
          animStyle,
          s.mainBtn,
          {
            backgroundColor: btnBg,
            borderColor: btnBorder,
            borderWidth: running ? 1 : 0,
            opacity: !hasSubject ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[TYPOGRAPHY.button, { color: btnText, letterSpacing: 0.3 }]}>
          {running ? "Duraklat" : "Başlat"}
        </Text>
      </AnimatedPressable>

      <Pressable
        onPress={handleFinish}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Durağı bitir"
        style={({ pressed }) => [
          s.linkBtn,
          { opacity: pressed ? 0.65 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>Durağı bitir</Text>
      </Pressable>

      {isPomodoro && (
        <Pressable
          onPress={handleSkip}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fazı atla"
          style={({ pressed }) => [s.skipBtn, { opacity: pressed ? 0.65 : 1 }]}
        >
          <Text style={[TYPOGRAPHY.caption, { color: C.text4 }]}>Fazı atla</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: GUTTER,
    marginTop: STEP.s4,
    alignItems: "center",
  },
  mainBtn: {
    width: "100%",
    height: CONTROL.buttonPrimary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtn: {
    height: CONTROL.buttonTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: STEP.s1 - 2,
    paddingHorizontal: STEP.s3,
  },
  skipBtn: {
    height: CONTROL.buttonTertiary - 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s3,
  },
});


