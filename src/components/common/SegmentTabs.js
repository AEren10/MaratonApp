import { memo, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import * as H from "../../lib/haptics";
import { ANIMATION, CONTROL, SHAPE, STEP, TYPOGRAPHY, SHADOW } from "../../themes/tokens";
import { Press } from "../../components/design/Press";

// Segment kontrolu (tasarim: Programım "Haftalık / Aylık"): surface kutu,
// secili segment elev zemin. Segment h36, dokunma alani 44.
//
// Secili zemin tek, mutlak konumlu bir parca; secim degisince yeni segmente
// KAYAR (mekansal sureklilik: neyin nereye gectigi gorunur). Eskiden zemin bir
// segmentten digerine sicriyordu. Yalniz transform: duzen hesabi tetiklenmez.
// Gunde onlarca kez -> kisa (200ms) ve ekranda hareket eden sey icin ease-in-out.
const SLIDE = { duration: ANIMATION.duration.fast, easing: Easing.bezier(...ANIMATION.easing.easeInOut) };

function SegmentTabs({ options, value, onChange, style }) {
  const C = useC();
  const reduced = useReducedMotion();
  const slop = (CONTROL.tapMin - CONTROL.segment) / 2;
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.key === value));
  const count = Math.max(1, options.length);
  const gap = STEP.s1 / 2;
  const segW = width > 0 ? (width - gap * (count + 1)) / count : 0;
  const x = useSharedValue(0);
  const ready = useSharedValue(0);

  useEffect(() => {
    if (!segW) return;
    const target = gap + index * (segW + gap);
    // Ilk olcumde kaymadan yerine otur; sonra yalniz degisimde kay.
    if (!ready.get() || reduced) { x.set(target); ready.set(1); return; }
    x.set(withTiming(target, SLIDE));
  }, [index, segW, gap, reduced, x, ready]);

  const pill = useAnimatedStyle(() => ({ opacity: ready.get(), transform: [{ translateX: x.get() }] }));

  const isDark = C.scheme !== "light";

  return (
    <View
      style={[
        s.box,
        {
          backgroundColor: isDark ? C.surface : C.void,
          borderColor: isDark ? C.elev : C.line,
        },
        style,
      ]}
      accessibilityRole="tablist"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width - 2)}
    >
      {segW ? (
        <Animated.View
          pointerEvents="none"
          style={[
            s.pill,
            { width: segW, backgroundColor: C.elev },
            !isDark && SHADOW.cardLight,
            pill,
          ]}
        />
      ) : null}
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Press haptic="none"
            key={o.key}
            onPress={() => { if (!on) { H.select(); onChange(o.key); } }}
            hitSlop={{ top: slop, bottom: slop }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[s.seg, !segW && on && { backgroundColor: C.elev }]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, s.text, { color: on ? C.text : C.text3 }]}>{o.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

export default memo(SegmentTabs);

const s = StyleSheet.create({
  box: { flexDirection: "row", gap: STEP.s1 / 2, padding: STEP.s1 / 2, borderRadius: SHAPE.segment, borderWidth: 1 },
  pill: { position: "absolute", top: STEP.s1 / 2, left: 0, height: CONTROL.segment, borderRadius: SHAPE.segment },
  seg: { flex: 1, height: CONTROL.segment, borderRadius: SHAPE.segment, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: TYPOGRAPHY.button.fontFamily },
});
