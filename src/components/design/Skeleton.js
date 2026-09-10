import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";

// Yukleniyor iskeleti. Tasarimda parlama degil sessiz nefes: --void ile --track
// arasinda opaklik gidip gelir. Sistem "hareketi azalt" diyorsa sabit durur.
export function Skeleton({ width, height = 14, radius = 6, style }) {
  const C = useC();
  const reduced = useReducedMotion();
  const o = useSharedValue(reduced ? 0.6 : 0.35);

  useEffect(() => {
    if (reduced) {
      o.value = 0.6;
      return;
    }
    o.value = withRepeat(
      withTiming(0.85, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    return () => cancelAnimation(o);
  }, [reduced, o]);

  const animStyle = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: C.track },
        animStyle,
        style,
      ]}
    />
  );
}

// Kart seviyesi iskelet icin components/common/SkeletonCard kullanilir —
// 10 ekranda zaten kurulu, API'si width/height/rounded. Burada tekrarlanmaz.
