import { useEffect } from "react";
import { BrandMark } from "../../../components/design/BrandMark";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

function SegmentBar({ isActive, isPast, duration = 6000, C, reduced }) {
  const fill = useSharedValue(isPast ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      fill.value = isPast || isActive ? 1 : 0;
      return;
    }
    if (isActive) {
      fill.value = 0;
      fill.value = withTiming(1, { duration, easing: Easing.linear });
    } else if (isPast) {
      fill.value = 1;
    } else {
      fill.value = 0;
    }
  }, [isActive, isPast, duration, reduced]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    backgroundColor: isActive ? C.accent : isPast ? C.text2 : "transparent",
  }));

  return (
    <View style={[s.segmentTrack, { backgroundColor: C.track }]}>
      <Animated.View style={[s.segmentFill, barStyle]} />
    </View>
  );
}

export function OnboardingPagination({
  total = 3,
  current = 0,
  cycle = 0,
  duration = 6000,
  onSelect,
  C,
}) {
  const reduced = useReducedMotion();

  return (
    <View style={s.wrap}>
      <View style={s.topBar}>
        <BrandMark width={34} word wordSize={13} color={C.text} />
      </View>

      <View style={s.segments}>
        {Array.from({ length: total }).map((_, i) => (
          <Press
            // Tur degisince cubuklar sifirdan dolar (film basa sardi).
            key={`${cycle}-${i}`}
            haptic="none"
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`Sahne ${i + 1}`}
            style={s.segmentTouch}
          >
            <SegmentBar
              isActive={i === current}
              isPast={i < current}
              duration={duration}
              C={C}
              reduced={reduced}
            />
          </Press>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: CONTROL.tapMin,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  brandDot: { width: 7, height: 7, borderRadius: 3.5 },
  segments: {
    flexDirection: "row",
    gap: STEP.s1,
    marginTop: STEP.s1,
  },
  segmentTouch: { flex: 1, paddingVertical: 10 },
  segmentTrack: { height: 3, borderRadius: 1.5, overflow: "hidden" },
  segmentFill: { height: "100%", borderRadius: 1.5 },
});
