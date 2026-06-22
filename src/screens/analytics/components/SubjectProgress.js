import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, GlassCard } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const STATUS_CFG = {
  up: (C) => ({ bg: C.green + "15", color: C.green, icon: "trendUp", prefix: "+" }),
  down: (C) => ({ bg: C.red + "15", color: C.red, icon: "trendDown", prefix: "" }),
  stable: (C) => ({ bg: C.surface2, color: C.muted, icon: null, prefix: "±" }),
};

const DiffBadge = React.memo(function DiffBadge({ diff, status, C }) {
  const cfg = STATUS_CFG[status](C);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: cfg.bg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2, gap: 4 }}>
      <Text style={{ ...TYPOGRAPHY.micro, color: cfg.color }}>
        {cfg.prefix}{status === "stable" ? Math.abs(diff).toFixed(1) : diff.toFixed(1)}
      </Text>
      {cfg.icon && <Icon name={cfg.icon} size={10} color={cfg.color} />}
    </View>
  );
});

const Row = React.memo(function Row({ item, isLast, C }) {
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginRight: SPACING.md }}>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>{item.previousAvg.toFixed(1)}</Text>
          <Icon name="arrowR" size={12} color={C.muted} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text }}>{item.currentAvg.toFixed(1)}</Text>
        </View>
        <DiffBadge diff={item.diff} status={item.status} C={C} />
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: SPACING.lg }} />}
    </View>
  );
});

export function SubjectProgress({ subjects }) {
  const C = useC();

  if (!subjects?.length) return null;

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(420).springify()}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md }}>
        <Icon name="layers" size={18} color={C.sec} />
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Ders Bazlı Gelişim</Text>
      </View>
      <GlassCard radius={RADIUS.xxl}>
        {subjects.map((item, i) => (
          <Row key={item.key} item={item} isLast={i === subjects.length - 1} C={C} />
        ))}
      </GlassCard>
    </Animated.View>
  );
}
