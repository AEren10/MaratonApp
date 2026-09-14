import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const STATUS_CFG = {
  up: (C) => ({ bg: C.up + "15", color: C.up, icon: "trendUp", prefix: "+" }),
  down: (C) => ({ bg: C.down + "15", color: C.down, icon: "trendDown", prefix: "" }),
  stable: (C) => ({ bg: C.surface, color: C.text3, icon: null, prefix: "±" }),
};

const DiffBadge = React.memo(function DiffBadge({ diff, status, C }) {
  const cfg = STATUS_CFG[status](C);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: cfg.bg, borderRadius: 100, paddingHorizontal: STEP.s2, paddingVertical: 2, gap: 4 }}>
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
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: STEP.s3, paddingHorizontal: STEP.s4 }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginRight: STEP.s3 }}>
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text3 }}>{item.previousAvg.toFixed(1)}</Text>
          <Icon name="arrowR" size={12} color={C.text3} />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.text }}>{item.currentAvg.toFixed(1)}</Text>
        </View>
        <DiffBadge diff={item.diff} status={item.status} C={C} />
      </View>
      {!isLast && <View style={{ height: 1, backgroundColor: C.line, marginHorizontal: STEP.s4 }} />}
    </View>
  );
});

export function SubjectProgress({ subjects }) {
  const C = useC();

  if (!subjects?.length) return null;

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(420).springify()}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2, marginBottom: STEP.s3 }}>
        <Icon name="layers" size={18} color={C.text2} />
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Ders Bazlı Gelişim</Text>
      </View>
      <View style={{ overflow: "hidden", borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.elev }}>
        {subjects.map((item, i) => (
          <Row key={item.key} item={item} isLast={i === subjects.length - 1} C={C} />
        ))}
      </View>
    </Animated.View>
  );
}
