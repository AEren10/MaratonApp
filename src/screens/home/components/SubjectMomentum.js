import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";

const SPARKLINE_W = 60;
const SPARKLINE_H = 24;

function Sparkline({ nets, color }) {
  if (!nets || nets.length < 2) return null;

  const min = Math.min(...nets);
  const max = Math.max(...nets);
  const range = max - min || 1;
  const stepX = SPARKLINE_W / (nets.length - 1);

  const points = nets
    .map((v, i) => {
      const x = i * stepX;
      const y = SPARKLINE_H - ((v - min) / range) * (SPARKLINE_H - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={SPARKLINE_W} height={SPARKLINE_H}>
      <Polyline
        points={points}
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SubjectRow({ item, C, isLast }) {
  const isPositive = item.delta >= 0;
  const trendColor = isPositive ? C.green : C.red;
  const arrowName = isPositive ? "trendUp" : "trendDown";
  const deltaLabel = `${isPositive ? "+" : ""}${item.delta.toFixed(1)}`;

  return (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: item.color }]} />
      <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Sparkline nets={item.nets} color={item.color} />
      <Text style={[styles.net, { color: C.text }]}>
        {item.currentNet.toFixed(1)}
      </Text>
      <View style={styles.trend}>
        <Icon name={arrowName} size={12} color={trendColor} />
        <Text style={[styles.delta, { color: trendColor }]}>{deltaLabel}</Text>
      </View>
    </View>
  );
}

export default function SubjectMomentum({ subjects }) {
  const C = useC();

  if (!subjects || subjects.length === 0) return null;

  const visible = subjects.slice(0, 4);

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.muted }]}>DERS İVMESİ</Text>
        <Text style={[styles.subtitle, { color: C.muted }]}>son 5 deneme</Text>
      </View>
      {visible.map((item, index) => (
        <SubjectRow
          key={item.name}
          item={item}
          C={C}
          isLast={index === visible.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.label,
    letterSpacing: 1.4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    lineHeight: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: 13,
    paddingHorizontal: 2,
    minHeight: 44,
  },
  dot:   { width: 9, height: 9, borderRadius: RADIUS.full },
  name:  { fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20, flex: 1 },
  net:   { fontFamily: "SpaceGrotesk_700Bold", fontSize: 14, lineHeight: 20, minWidth: 40, textAlign: "right" },
  trend: { flexDirection: "row", alignItems: "center", gap: 2, minWidth: 46 },
  delta: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 18 },
});
