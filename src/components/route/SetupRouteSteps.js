import { memo, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { ANIMATION, GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { peekPendingPreview } from "../../lib/routePreviewStore";

const AnimatedLine = Animated.createAnimatedComponent(Line);

// Uctaki etiketler kenara yaslanir, ortadakiler dugumun altinda ortalanir.
function edgeStyle(i, n, x) {
  if (i === 0) return { left: 0, textAlign: "left" };
  if (i === n - 1) return { right: 0, textAlign: "right" };
  return { left: x - 30, textAlign: "center" };
}

// Kurulumun kendisi bir rota: Hesap -> Sinav -> Hedef -> Seviye -> Rota.
// Her ekran bir durak; ekran acildiginda hat onceki duraktan buraya cizilir
// (AGENTS.md imza ani: hat cizilir, dugum oturur). Eskiden her ekran kendi
// ilerleme cubugunu ciziyordu ve sayilari tutmuyordu (2/2, 2/4, 3/4).
export const SETUP_STEPS = ["Hesap", "Sınav", "Hedef", "Seviye", "Rota"];
// Kayit oncesi rota onizlemesinden gelen kullanici sinavi hesaptan ONCE secer
// (RoutePreviewScreen); kurulumda Sinav ekrani atlanir. Hedef/Seviye/Rota
// ayni sirada kalir.
export const PREVIEW_STEPS = ["Sınav", "Hesap", "Hedef", "Seviye", "Rota"];

const H = 14;
const R = 5;
const DRAW = { duration: 700, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export const SetupRouteSteps = memo(function SetupRouteSteps({ current = 0, preview }) {
  const C = useC();
  const steps = (preview ?? Boolean(peekPendingPreview())) ? PREVIEW_STEPS : SETUP_STEPS;
  const width = useWindowDimensions().width - GUTTER * 2;
  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced || current === 0 ? 1 : 0);

  useEffect(() => {
    if (!reduced && current > 0) draw.set(withDelay(150, withTiming(1, DRAW)));
  }, [current, draw, reduced]);

  const n = steps.length;
  const gap = (width - R * 2 - 2) / (n - 1);
  const xOf = (i) => R + 1 + i * gap;
  const segLen = gap - R * 2;

  const liveProps = useAnimatedProps(() => ({
    strokeDashoffset: segLen * (1 - draw.get()),
  }));

  return (
    <View
      style={s.wrap}
      accessible
      accessibilityLabel={`Kurulum, ${n} adımdan ${current + 1}.: ${steps[current]}`}
    >
      <Svg width={width} height={H}>
        {steps.slice(1).map((step, i) => {
          const x1 = xOf(i) + R;
          const x2 = xOf(i + 1) - R;
          const done = i + 1 < current;
          const live = i + 1 === current;
          return (
            <Line key={step} x1={x1} y1={H / 2} x2={x2} y2={H / 2}
              stroke={done ? C.accent : C.track} strokeWidth={done ? 2 : 1.5}
              strokeDasharray={done || live ? undefined : "2 4"} strokeLinecap="round" />
          );
        })}
        {current > 0 ? (
          <AnimatedLine x1={xOf(current - 1) + R} y1={H / 2} x2={xOf(current) - R} y2={H / 2}
            stroke={C.accent} strokeWidth={2.5} strokeLinecap="round"
            strokeDasharray={segLen} animatedProps={liveProps} />
        ) : null}
        {steps.map((step, i) => (
          <Circle key={step} cx={xOf(i)} cy={H / 2} r={i === current ? R : R - 1}
            fill={i <= current ? C.accent : C.bg}
            stroke={i <= current ? C.accent : C.border} strokeWidth={i === current ? 2 : 1.5} />
        ))}
      </Svg>
      <View style={[s.labels, { width }]}>
        {steps.map((step, i) => (
          <Text
            key={step}
            style={[
              TYPOGRAPHY.micro,
              s.label,
              edgeStyle(i, n, xOf(i)),
              { color: i === current ? C.accentBright : i < current ? C.text2 : C.text3 },
            ]}
          >
            {step}
          </Text>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s1, gap: 4 },
  labels: { height: 16 },
  label: { position: "absolute", width: 60 },
});
