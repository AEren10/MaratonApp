import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, useReducedMotion, interpolate,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { draw, DRAW_MS } from "./filmMotion";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RAIL_W = 28;
const CX = RAIL_W / 2;

// Sahne 1: hat yukaridan asagi cizilir, hat her duraga vardiginda durak
// belirir. Son durak sinav gunu -- rotanin bittigi yer.
const STOPS = [
  { when: "BUGÜN", topic: "Türev · Geometrik yorum", subject: "matematik" },
  { when: "YARIN", topic: "Paragraf · Ana fikir", subject: "turkce" },
  { when: "PERŞEMBE", topic: "Kuvvet ve hareket", subject: "fizik" },
  { when: "SINAV GÜNÜ", topic: "Hedef: 96 net", finish: true },
];

function StopRow({ stop, index, progress, rowH, C }) {
  // Hat bu duraga vardiginda (ilerleme index/(n-1)) satir belirir.
  const at = index / (STOPS.length - 1);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [at - 0.08, at + 0.1], [0, 1], "clamp"),
  }));
  const tone = stop.finish ? C.accentBright : C.subjects?.[stop.subject] || C.text2;
  return (
    <Animated.View style={[s.row, { height: rowH }, style]}>
      <Text style={[TYPOGRAPHY.label, { color: tone }]}>{stop.when}</Text>
      <Text numberOfLines={1} style={[TYPOGRAPHY.topicName, { color: C.text }]}>
        {stop.topic}
      </Text>
    </Animated.View>
  );
}

function Node({ index, progress, rowH, C }) {
  const at = index / (STOPS.length - 1);
  const finish = index === STOPS.length - 1;
  const props = useAnimatedProps(() => ({
    opacity: interpolate(progress.get(), [at - 0.06, at + 0.04], [0, 1], "clamp"),
  }));
  const cy = rowH / 2 + index * rowH;
  return (
    <>
      <AnimatedCircle
        cx={CX} cy={cy} r={finish ? 8 : 6}
        fill={index === 0 ? C.accent : C.bg}
        stroke={finish || index === 0 ? C.accentBright : C.border}
        strokeWidth={2}
        animatedProps={props}
      />
      {finish ? <AnimatedCircle cx={CX} cy={cy} r={3} fill={C.accentBright} animatedProps={props} /> : null}
    </>
  );
}

export function SceneRoute({ C, compact }) {
  const ROW_H = compact ? 42 : 50;
  const LINE_LEN = ROW_H * (STOPS.length - 1);
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (!reduced) progress.set(draw(150, DRAW_MS + 500));
  }, [progress, reduced]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: LINE_LEN * (1 - progress.get()),
  }));

  const height = ROW_H * STOPS.length;
  return (
    <View style={s.wrap}>
      <Svg width={RAIL_W} height={height}>
        <Line x1={CX} y1={ROW_H / 2} x2={CX} y2={height - ROW_H / 2}
          stroke={C.track} strokeWidth={2} strokeDasharray="3 6" strokeLinecap="round" />
        <AnimatedLine x1={CX} y1={ROW_H / 2} x2={CX} y2={height - ROW_H / 2}
          stroke={C.accent} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={LINE_LEN} animatedProps={lineProps} />
        {STOPS.map((stop, i) => <Node key={stop.when} index={i} progress={progress} rowH={ROW_H} C={C} />)}
      </Svg>
      <View style={s.rows}>
        {STOPS.map((stop, i) => (
          <StopRow key={stop.when} stop={stop} index={i} progress={progress} rowH={ROW_H} C={C} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", gap: STEP.s2, alignItems: "flex-start" },
  rows: { flex: 1 },
  row: { justifyContent: "center", gap: 1 },
});
