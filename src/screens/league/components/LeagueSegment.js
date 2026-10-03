import { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { useC } from "../../../contexts/ThemeContext";
import { Press } from "../../../components/design/Press";
import { ANIMATION, CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const PAD = 3;
const SLIDE = { duration: 260, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

// Tasarimin segment kontrolu: h36 r6, secili yuzey bir kademe yukarida ve
// sekmeler arasinda KAYAR (tabbar'daki hapla ayni hareket). Eskiden secili
// sekme dolu kirmiziydi -- kirmizi aksiyonun rengi, durumun degil.
export const LeagueSegment = memo(function LeagueSegment({ tabs, value, onChange }) {
  const C = useC();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, tabs.findIndex((t) => t.key === value));
  const slot = width ? (width - PAD * 2) / tabs.length : 0;
  const x = useSharedValue(0);
  const shown = useSharedValue(0);

  useEffect(() => {
    if (!slot) return;
    if (!shown.get() || reduced) { x.set(index * slot); shown.set(1); } else x.set(withTiming(index * slot, SLIDE));
  }, [index, slot, reduced, x, shown]);

  const pill = useAnimatedStyle(() => ({ opacity: shown.get(), transform: [{ translateX: x.get() }] }));

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[s.wrap, { backgroundColor: C.void, borderColor: C.line }]}
      accessibilityRole="tablist"
    >
      <Animated.View pointerEvents="none" style={[s.pill, { width: slot, backgroundColor: C.elev, borderColor: C.border }, pill]} />
      {tabs.map((t) => {
        const on = t.key === value;
        return (
          <Press
            key={t.key}
            haptic="select"
            onPress={() => onChange(t.key)}
            hitSlop={{ top: 4, bottom: 4 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={s.item}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: on ? C.text : C.text3 }]}>{t.label}</Text>
          </Press>
        );
      })}
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: GUTTER,
    marginBottom: STEP.s3,
    padding: PAD,
    borderRadius: SHAPE.segment + PAD,
    borderWidth: 1,
  },
  pill: { position: "absolute", top: PAD, bottom: PAD, left: PAD, borderRadius: SHAPE.segment, borderWidth: 1 },
  item: { flex: 1, minHeight: CONTROL.segment, alignItems: "center", justifyContent: "center" },
});
