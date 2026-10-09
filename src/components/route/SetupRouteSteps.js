import { memo, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { ANIMATION, GUTTER, SHAPE, STEP } from "../../themes/tokens";
import { peekPendingPreview } from "../../lib/routePreviewStore";
import { SetupRouteTrackSvg, NODE_R } from "./SetupRouteTrackSvg";

function edgeStyle(i, n, x) {
  if (i === 0) return { left: 0, width: 60, textAlign: "left" };
  if (i === n - 1) return { right: 0, width: 60, textAlign: "right" };
  return { left: x - 30, width: 60, textAlign: "center" };
}

export const SETUP_STEPS = ["Hesap", "Sınav", "Hedef", "Seviye", "Rota"];
export const PREVIEW_STEPS = ["Sınav", "Hesap", "Hedef", "Seviye", "Rota"];

const DRAW = { duration: 700, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export const SetupRouteSteps = memo(function SetupRouteSteps({ current = 0, preview }) {
  const C = useC();
  const steps = (preview ?? Boolean(peekPendingPreview())) ? PREVIEW_STEPS : SETUP_STEPS;
  const screenWidth = useWindowDimensions().width;
  const width = screenWidth - GUTTER * 2;
  const cardWidth = Math.max(260, width - 28);
  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced || current === 0 ? 1 : 0);

  useEffect(() => {
    if (!reduced && current > 0) draw.set(withDelay(150, withTiming(1, DRAW)));
  }, [current, draw, reduced]);

  const n = steps.length;
  const gap = (cardWidth - NODE_R * 2 - 2) / (n - 1);
  const xOf = (i) => NODE_R + 1 + i * gap;
  const segLen = gap - NODE_R * 2;

  const liveProps = useAnimatedProps(() => ({
    strokeDashoffset: segLen * (1 - draw.get()),
  }));

  return (
    <View
      style={s.wrap}
      accessible
      accessibilityLabel={`Kurulum, ${n} adımdan ${current + 1}.: ${steps[current]}`}
    >
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={s.topRow}>
          <View style={s.badge}>
            <View style={[s.beacon, { backgroundColor: C.accentBright }]} />
            <Text style={[s.badgeText, { color: C.text3 }]}>KURULUM ADIMI</Text>
          </View>
          <Text style={[s.counterText, { color: C.text2 }]}>
            <Text style={{ color: C.accentBright, fontFamily: "Archivo_600" }}>{current + 1}</Text>
            {` / ${n} · `}
            <Text style={{ color: C.text, fontFamily: "Archivo_600" }}>{steps[current]}</Text>
          </Text>
        </View>

        <SetupRouteTrackSvg
          steps={steps}
          current={current}
          cardWidth={cardWidth}
          C={C}
          liveProps={liveProps}
          xOf={xOf}
          segLen={segLen}
        />

        <View style={[s.labels, { width: cardWidth }]}>
          {steps.map((step, i) => (
            <Text
              key={step}
              style={[
                s.label,
                edgeStyle(i, n, xOf(i)),
                {
                  color: i === current ? C.text : i < current ? C.text2 : C.text4,
                  fontFamily: i === current ? "Archivo_600" : "Archivo_500",
                },
              ]}
            >
              {step}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  card: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  beacon: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    letterSpacing: 1.1,
  },
  counterText: {
    fontFamily: "Archivo_500",
    fontSize: 11.5,
  },
  labels: {
    height: 16,
    marginTop: 4,
    position: "relative",
  },
  label: {
    position: "absolute",
    fontSize: 11,
  },
});
