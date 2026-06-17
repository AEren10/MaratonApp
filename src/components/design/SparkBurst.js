import { useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
  withSequence, Easing, runOnJS,
} from "react-native-reanimated";
import * as haptic from "../../lib/haptics";

const SPARK_COUNT = 14;
const DURATION = 1200;
const ANGLES = Array.from({ length: SPARK_COUNT }, (_, i) => (i / SPARK_COUNT) * Math.PI * 2);
const COLORS = ["#FFD700", "#FFA500", "#FF6B35", "#FFEC8B", "#FFC125", "#FFE4B5"];
const SIZES = [5, 6, 7, 4, 8, 5, 6, 7, 5, 4, 6, 8, 5, 7];
const RADII = [55, 70, 48, 80, 60, 72, 50, 68, 58, 75, 52, 66, 62, 78];

function Spark({ angle, radius, size, color, progress }) {
  const aStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const ease = 1 - Math.pow(1 - p, 3);
    const tx = Math.cos(angle) * radius * ease;
    const ty = Math.sin(angle) * radius * ease;
    const sc = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: Math.max(0, sc) },
        { rotate: `${45 + p * 180}deg` },
      ],
      opacity: p < 0.2 ? p / 0.2 : Math.max(0, 1 - (p - 0.5) / 0.5),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: 1,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: size,
          elevation: 3,
        },
        aStyle,
      ]}
    />
  );
}

function CenterFlash({ progress }) {
  const aStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const sc = p < 0.25 ? (p / 0.25) * 1.6 : 1.6 * Math.max(0, 1 - (p - 0.25) / 0.4);
    return {
      transform: [{ scale: Math.max(0, sc) }],
      opacity: Math.max(0, 1 - p),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(255,215,0,0.35)",
          shadowColor: "#FFD700",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
        },
        aStyle,
      ]}
    />
  );
}

export function SparkBurst({ trigger, onDone }) {
  const progress = useSharedValue(0);

  const handleDone = useCallback(() => { onDone?.(); }, [onDone]);

  useEffect(() => {
    if (!trigger) return;
    haptic.success();
    progress.value = 0;
    progress.value = withDelay(
      50,
      withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) }, (fin) => {
        if (fin) runOnJS(handleDone)();
      }),
    );
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <CenterFlash progress={progress} />
      {ANGLES.map((angle, i) => (
        <Spark
          key={i}
          angle={angle}
          radius={RADII[i]}
          size={SIZES[i]}
          color={COLORS[i % COLORS.length]}
          progress={progress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
