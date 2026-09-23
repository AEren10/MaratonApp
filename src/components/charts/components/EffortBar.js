import { useEffect, useRef } from "react";
import { Rect } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Acilista cubuklar SIRAYLA yukselir: Pazartesi once, Pazar en son. Hafta
// soldan saga birikiyor; hepsi ayni anda firlarsa birikme okunmaz.
const GROW_MS = 620;
const STAGGER_MS = 55;
// Sonradan gelen degisiklik daha kisa: bekleyen bir acilis degil, az once
// yaptigin seyin karsiligi.
const CHANGE_MS = 420;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// HER CUBUK KENDI YUKSEKLIGINI TASIR.
//
// Once tek bir paylasilan 0->1 ilerlemesi vardi. Acilista dogru calisiyordu
// ama durak tiklendiginde haftanin verisi degisince ilerleme sifirlanip
// YEDI cubuk birden sifirdan tekrar yukseliyordu: yapilan sey bir cubugun
// buyumesi degil, butun grafigin titremesi gibi okunuyordu.
//
// Simdi her cubuk kendi degerine dogru gidiyor. Acilista sirayla sifirdan,
// sonrasinda yalnizca DEGISEN cubuk eski boyundan yenisine.
//
// Yukseklik SVG icinde degisiyor (layout degil): Yoga yeniden calismaz,
// deger UI thread'inde hesaplanir.
export function EffortBar({ index, x, width, bottom, height, radius, fill, fillOpacity }) {
  const reduced = useReducedMotion();
  const drawn = useSharedValue(reduced ? height : 0);
  const mounted = useRef(false);

  useEffect(() => {
    if (reduced) {
      drawn.value = height;
      mounted.current = true;
      return;
    }
    if (mounted.current) {
      drawn.value = withTiming(height, { duration: CHANGE_MS, easing: EASE_OUT });
    } else {
      mounted.current = true;
      drawn.value = withDelay(
        index * STAGGER_MS,
        withTiming(height, { duration: GROW_MS, easing: EASE_OUT }),
      );
    }
  }, [height, index, reduced, drawn]);

  const animatedProps = useAnimatedProps(() => {
    const h = Math.max(0.01, drawn.value);
    return { height: h, y: bottom - h };
  });

  return (
    <AnimatedRect
      x={x}
      width={width}
      rx={radius}
      fill={fill}
      fillOpacity={fillOpacity}
      animatedProps={animatedProps}
    />
  );
}
