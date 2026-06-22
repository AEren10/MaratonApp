import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, GlassCard } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const SubjectRow = React.memo(function SubjectRow({ item, isLast, C }) {
  const gainColor = item.improving ? C.green : C.red;
  const gainBg = gainColor + "15";
  const sign = item.improving ? "+" : "";
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }}>
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs }}>
          <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.muted }}>
            {item.current.toFixed(1)}
          </Text>
          <Icon name="arrowR" size={12} color={C.muted} />
          <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }}>
            {item.projected.toFixed(1)}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: gainBg,
            borderRadius: RADIUS.pill,
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            marginLeft: SPACING.md,
          }}
        >
          <Text style={{ ...TYPOGRAPHY.micro, color: gainColor }}>
            {sign}{item.weeklyGain.toFixed(1)}/h
          </Text>
        </View>
      </View>
      {!isLast && (
        <View style={{ height: 1, backgroundColor: C.border }} />
      )}
    </View>
  );
});

export function SubjectForecast({ subjects }) {
  const C = useC();
  if (!subjects || subjects.length === 0) return null;

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(420).springify()}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          marginBottom: SPACING.md,
        }}
      >
        <Icon name="layers" size={18} color={C.sec} />
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>
          Ders Bazlı Tahmin
        </Text>
      </View>
      <GlassCard radius={RADIUS.xxl}>
        {subjects.map((s, i) => (
          <SubjectRow
            key={s.key}
            item={s}
            isLast={i === subjects.length - 1}
            C={C}
          />
        ))}
      </GlassCard>
    </Animated.View>
  );
}
