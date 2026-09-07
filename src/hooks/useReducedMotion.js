import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Cihaz "Hareketi Azalt" ayarını dinler. Redesign brief'i: kullanıcı hareketi
// kapattıysa animasyonlar sönümlenmeli, bilgi animasyona bağımlı olmamalı.
let cached = false;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(cached);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        cached = !!v;
        if (active) setReduced(cached);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => {
      cached = !!v;
      if (active) setReduced(cached);
    });

    return () => {
      active = false;
      sub?.remove?.();
    };
  }, []);

  return reduced;
}

/**
 * Süreyi hareket tercihine göre kısar.
 *   const d = useMotionDuration(ANIMATION.duration.normal); // kapalıysa 0
 */
export function useMotionDuration(duration) {
  const reduced = useReducedMotion();
  return reduced ? 0 : duration;
}
