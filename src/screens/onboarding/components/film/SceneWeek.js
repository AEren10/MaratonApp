import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, useReducedMotion, interpolate,
} from "react-native-reanimated";
import { Icon } from "../../../../components/design/Icon";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { draw } from "./filmMotion";

// Sahne 3: haftanin emek cubuklari sirayla dolar (bugun kirmizi),
// sonra deneme sonucu belirir -- "deneme kaydedildi" imza aninin ozeti.
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const VALUES = [52, 74, 38, 88, 60, 0, 0];
const TODAY = 4;
const STAGGER = 0.09;

function Bar({ value, index, grow, barsH, C }) {
  const start = index * STAGGER;
  const style = useAnimatedStyle(() => {
    const t = interpolate(grow.get(), [start, start + 0.45], [0, 1], "clamp");
    return { height: Math.max(3, (value / 100) * barsH * t) };
  });
  const isToday = index === TODAY;
  const empty = value === 0;
  return (
    <View style={s.col}>
      <View style={[s.slot, { height: barsH }, empty && { borderColor: C.line, borderWidth: 1, borderStyle: "dashed" }]}>
        {!empty ? (
          <Animated.View style={[s.bar, { backgroundColor: isToday ? C.accent : C.border }, style]} />
        ) : null}
      </View>
      <Text style={[TYPOGRAPHY.micro, { color: isToday ? C.accentBright : C.text3 }]}>{DAYS[index]}</Text>
    </View>
  );
}

export function SceneWeek({ C, compact }) {
  const barsH = compact ? 62 : 96;
  const reduced = useReducedMotion();
  const grow = useSharedValue(reduced ? 1 : 0);
  const reveal = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    grow.set(draw(200, 900));
    reveal.set(draw(1300, 600));
  }, [grow, reveal, reduced]);

  const trialStyle = useAnimatedStyle(() => ({ opacity: reveal.get() }));

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU HAFTA</Text>
          <View style={s.total}>
            <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>312</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>soru · 9 sa 40 dk</Text>
          </View>
        </View>
      </View>

      <View style={s.bars}>
        {VALUES.map((v, i) => <Bar key={DAYS[i]} value={v} index={i} grow={grow} barsH={barsH} C={C} />)}
      </View>

      <Animated.View style={[s.trial, { borderTopColor: C.line }, trialStyle]}>
        <Icon name="trendUp" size={15} color={C.up} />
        <Text style={[TYPOGRAPHY.captionMedium, s.flex, { color: C.text2 }]}>Son deneme</Text>
        <Text style={[TYPOGRAPHY.tableValue, { color: C.text3 }]}>54,25</Text>
        <Icon name="arrowR" size={12} color={C.text3} />
        <Text style={[TYPOGRAPHY.statMedium, { color: C.up }]}>61,50</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>net</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s2 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  total: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  bars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  col: { alignItems: "center", gap: 6, flex: 1 },
  slot: { width: 18, borderRadius: 4, justifyContent: "flex-end", overflow: "hidden" },
  bar: { width: "100%", borderRadius: 4 },
  trial: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingTop: STEP.s2, borderTopWidth: 1,
  },
  flex: { flex: 1 },
});
