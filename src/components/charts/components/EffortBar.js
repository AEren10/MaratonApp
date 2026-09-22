import { Rect } from "react-native-svg";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// Cubuklar SIRAYLA yukselir: Pazartesi once, Pazar en son. Hafta soldan saga
// birikiyor; hepsi ayni anda firlarsa birikme okunmaz, yalnizca bir sicrama
// gorunur. Pay degerleri tek bir 0->1 ilerlemesinden turetiliyor, her cubuk
// icin ayri animasyon yok.
const STAGGER = 0.06;
const SPAN = 0.62;

// Yukseklik SVG icinde degisiyor (layout degil): Yoga yeniden calismaz,
// deger UI thread'de hesaplanir.
export function EffortBar({
  progress, index, x, width, bottom, height, radius, fill, fillOpacity,
}) {
  const animatedProps = useAnimatedProps(() => {
    const start = index * STAGGER;
    const local = interpolate(
      progress.value, [start, start + SPAN], [0, 1], Extrapolation.CLAMP,
    );
    const drawn = Math.max(0.01, height * local);
    return { height: drawn, y: bottom - drawn };
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
