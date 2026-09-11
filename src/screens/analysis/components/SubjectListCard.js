import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { Card, Icon } from "../../../components/design";
import { SubjectTrendChart } from "./SubjectTrendChart";

const num = (v) => Number(v ?? 0).toFixed(1).replace(".", ",");

function DeltaChip({ delta, C }) {
  const first = delta == null;
  const up = !first && delta > 0;
  const flat = delta === 0;
  const color = first || flat ? C.text3 : up ? C.up : C.down;
  const label = first ? "ilk" : `${up ? "+" : delta < 0 ? "−" : ""}${num(Math.abs(delta))}`;
  return (
    <View style={[s.deltaChip, { backgroundColor: C.void }]}>
      {!first && !flat ? <Icon name={up ? "trendUp" : "trendDown"} size={9} color={color} /> : null}
      <Text style={[TYPOGRAPHY.micro, { color }]} allowFontScaling={false}>{label}</Text>
    </View>
  );
}

export const SubjectListCard = React.memo(function SubjectListCard({ item, index, onPress, C }) {
  const { name, color, net, delta, lo, hi, trend } = item;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name}, ${num(net)} net`}
        style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1, marginBottom: STEP.s1 }]}
      >
        <Card tone="surface" radius="cardTight" style={s.card}>
          <View style={s.cardTop}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]} allowFontScaling={false}>{num(net)}</Text>
            <DeltaChip delta={delta} C={C} />
          </View>

          <View style={s.chart}>
            <SubjectTrendChart data={trend} color={color} />
          </View>

          <View style={s.footer}>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{num(lo)} en düşük</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{num(hi)} en yüksek</Text>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  card: { gap: 0 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 9, height: 9, borderRadius: 1 },
  chart: { marginTop: STEP.s2 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
  deltaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 26,
    paddingHorizontal: STEP.s1,
    borderRadius: 6,
  },
});
