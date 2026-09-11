import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Card, Icon } from "../../../components/design";

function MiniTrend({ data, color }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 72; const H = 22; const dotR = 2.5;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (W - dotR * 2) + dotR,
    y: H - dotR - ((v - min) / range) * (H - dotR * 2),
  }));
  return (
    <View style={{ width: W, height: H }}>
      {pts.slice(1).map((pt, i) => {
        const prev = pts[i];
        const dx = pt.x - prev.x; const dy = pt.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={i} style={{ position: "absolute", left: prev.x, top: prev.y, width: len, height: 1.5, backgroundColor: color + "88", transformOrigin: "left center", transform: [{ rotate: `${angle}deg` }] }} />
        );
      })}
      {pts.map((pt, i) => (
        <View key={`d${i}`} style={{ position: "absolute", left: pt.x - dotR, top: pt.y - dotR, width: dotR * 2, height: dotR * 2, borderRadius: dotR, backgroundColor: color }} />
      ))}
    </View>
  );
}

function NetBar({ pct, color, delay }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(delay, withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) }));
  }, [pct, delay]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: color + "20", overflow: "hidden", marginTop: STEP.s1 }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color }, fillStyle]} />
    </View>
  );
}

export const SubjectListCard = React.memo(function SubjectListCard({ item, index, onPress, C }) {
  const { name, color, net, max, avgNet, accuracy, trialCount, trend } = item;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${Number(net).toFixed(1)} net`}
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, marginBottom: STEP.s1 }]}
      >
        <Card tone="surface" radius="cardTight" style={s.card}>
          <View style={s.cardTop}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]} numberOfLines={1}>{name}</Text>
            <Text style={[TYPOGRAPHY.statMedium, { color, fontSize: 22, lineHeight: 26 }]}>
              {Number(net).toFixed(1)}
              <Text style={{ ...TYPOGRAPHY.caption, color: C.text3 }}>/{max}</Text>
            </Text>
            <Icon name="chevR" size={13} color={C.text3} />
          </View>
          <NetBar pct={max > 0 ? Math.min(net / max, 1) : 0} color={color} delay={index * 60} />
          <View style={s.cardBottom}>
            <View style={s.statChip}>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text, fontSize: 13, lineHeight: 16 }]}>{Number(avgNet).toFixed(1)}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>ort net</Text>
            </View>
            <View style={s.statChip}>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text, fontSize: 13, lineHeight: 16 }]}>{accuracy}%</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>doğruluk</Text>
            </View>
            <View style={s.statChip}>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text, fontSize: 13, lineHeight: 16 }]}>{trialCount}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>deneme</Text>
            </View>
            <MiniTrend data={trend} color={color} />
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  card: { gap: STEP.s1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardBottom: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s1 },
  statChip: { alignItems: "center", gap: 1 },
});
