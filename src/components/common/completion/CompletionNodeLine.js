import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Line, Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../../contexts/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const W = 390;
const H = 96;
const BASE_Y = 48;

// Gunun duraklari: hat cizili, dugumler oturmus, SON dugum BIR KEZ parlar.
// Tasarimin izin verdigi imza ani ("dugum bir kez parlar") -- tekrar etmez.
export function CompletionNodeLine({ count = 0, labels = [] }) {
  const C = useC();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (reduced || count < 1) return;
    pulse.value = 0;
    pulse.value = withSequence(
      withTiming(0, { duration: 320 }),
      withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }),
    );
  }, [count, pulse, reduced]);

  const haloProps = useAnimatedProps(() => ({
    r: 15 + 12 * pulse.value,
    fillOpacity: 0.24 * (1 - pulse.value),
  }));

  if (count < 1) return null;

  const step = (W - 124) / Math.max(1, count - 1);
  const xs = count === 1
    ? [W / 2]
    : Array.from({ length: count }, (_, i) => 62 + i * step);
  const showLabels = count <= 5 && labels.length === count;

  return (
    <View style={{ width: "100%", aspectRatio: W / H }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        <Line x1={34} y1={BASE_Y} x2={W - 24} y2={BASE_Y} stroke={C.line} strokeWidth={1} />
        {xs.map((x) => (
          <Circle key={`n${x}`} cx={x} cy={BASE_Y} r={9} fill={C.accent} />
        ))}
        <AnimatedCircle
          cx={xs[xs.length - 1]}
          cy={BASE_Y}
          fill={C.accent}
          animatedProps={haloProps}
        />
        {showLabels
          ? xs.map((x, i) => (
            <SvgText
              key={`l${x}`}
              x={x}
              y={76}
              textAnchor="middle"
              fontFamily="Archivo_600"
              fontSize={11}
              fill={i === xs.length - 1 ? C.accent : C.text4}
            >
              {String(labels[i] || "").toLocaleUpperCase("tr-TR")}
            </SvgText>
          ))
          : null}
      </Svg>
    </View>
  );
}
