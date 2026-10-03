import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Line, Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, useReducedMotion,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { draw } from "./filmMotion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedLine = Animated.createAnimatedComponent(Line);

const RAIL_W = 28;
const CX = RAIL_W / 2;
const R = 10;
const checkD = (cy) => `M ${CX - 4.5} ${cy} L ${CX - 1.2} ${cy + 3.3} L ${CX + 4.8} ${cy - 3.6}`;
const CHECK_LEN = 14;

// Sahne 2 -- AGENTS.md imza ani: durak tamamlandi (dugum oturur, hat cizilir).
const ROWS = [
  { subject: "matematik", label: "MATEMATİK", topic: "Türev · Geometrik yorum", meta: "45 dk" },
  { subject: "turkce", label: "TÜRKÇE", topic: "Paragraf · Ana fikir", meta: "30 dk" },
  { subject: "fizik", label: "FİZİK", topic: "Kuvvet ve hareket", meta: "40 dk" },
];

export function SceneStop({ C, compact }) {
  const ROW_H = compact ? 46 : 58;
  const SEG_LEN = ROW_H - R * 2;
  const cyOf = (i) => ROW_H / 2 + i * ROW_H;
  const reduced = useReducedMotion();
  const tick = useSharedValue(reduced ? 1 : 0);
  const rail = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    tick.set(draw(900, 600));
    rail.set(draw(1600, 700));
  }, [tick, rail, reduced]);

  const fillProps = useAnimatedProps(() => ({ opacity: tick.get() }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LEN * (1 - tick.get()) }));
  const railProps = useAnimatedProps(() => ({ strokeDashoffset: SEG_LEN * (1 - rail.get()) }));
  const nextProps = useAnimatedProps(() => ({ opacity: rail.get() }));
  const oldCount = useAnimatedStyle(() => ({ opacity: 1 - tick.get() }));
  const newCount = useAnimatedStyle(() => ({ opacity: tick.get() }));
  const barStyle = useAnimatedStyle(() => ({ width: `${33 + tick.get() * 33}%` }));

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BUGÜNÜN DURAKLARI</Text>
        <View>
          <Animated.Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }, oldCount]}>1 / 3</Animated.Text>
          <Animated.Text style={[TYPOGRAPHY.metaSemiBold, s.abs, { color: C.up }, newCount]}>2 / 3</Animated.Text>
        </View>
      </View>

      <View style={s.body}>
        <Svg width={RAIL_W} height={ROW_H * ROWS.length}>
          <Line x1={CX} y1={cyOf(0) + R} x2={CX} y2={cyOf(1) - R} stroke={C.up} strokeWidth={2.5} />
          <Line x1={CX} y1={cyOf(1) + R} x2={CX} y2={cyOf(2) - R} stroke={C.track} strokeWidth={2} strokeDasharray="3 5" />
          <AnimatedLine x1={CX} y1={cyOf(1) + R} x2={CX} y2={cyOf(2) - R} stroke={C.accent} strokeWidth={2.5}
            strokeDasharray={SEG_LEN} animatedProps={railProps} />

          <Circle cx={CX} cy={cyOf(0)} r={R} fill={C.up} />
          <Path d={checkD(cyOf(0))} stroke={C.bg} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          <Circle cx={CX} cy={cyOf(1)} r={R - 0.75} fill={C.surface} stroke={C.accent} strokeWidth={1.5} />
          <AnimatedCircle cx={CX} cy={cyOf(1)} r={R} fill={C.up} animatedProps={fillProps} />
          <AnimatedPath d={checkD(cyOf(1))} stroke={C.bg} strokeWidth={2} fill="none" strokeLinecap="round"
            strokeLinejoin="round" strokeDasharray={CHECK_LEN} animatedProps={checkProps} />

          <Circle cx={CX} cy={cyOf(2)} r={R - 0.75} fill={C.surface} stroke={C.border} strokeWidth={1.5} />
          <AnimatedCircle cx={CX} cy={cyOf(2)} r={R - 1} fill="none" stroke={C.accent} strokeWidth={2} animatedProps={nextProps} />
        </Svg>

        <View style={s.rows}>
          {ROWS.map((row, i) => (
            <View key={row.subject} style={[s.row, { height: ROW_H }]}>
              <View style={s.flex}>
                <Text style={[TYPOGRAPHY.label, { color: i === 0 ? C.text3 : C.subjects?.[row.subject] || C.text2 }]}>
                  {row.label}
                </Text>
                <Text numberOfLines={1} style={[TYPOGRAPHY.tableName, { color: i === 0 ? C.text3 : C.text }]}>
                  {row.topic}
                </Text>
              </View>
              <Text style={[TYPOGRAPHY.tableValue, { color: C.text3 }]}>{row.meta}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[s.track, { backgroundColor: C.track }]}>
        <Animated.View style={[s.fill, { backgroundColor: C.up }, barStyle]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s2 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  abs: { position: "absolute", right: 0 },
  body: { flexDirection: "row", gap: STEP.s2 },
  rows: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  flex: { flex: 1, minWidth: 0, gap: 1 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});
