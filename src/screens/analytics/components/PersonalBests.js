import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, GlassCard, Stat } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function PersonalBests({ bests }) {
  const C = useC();
  if (!bests || !bests.subjects?.length) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(420).springify()}
      style={{ gap: SPACING.md }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
        <Icon name="star" size={18} color={C.accent} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>
          Kişisel Rekorlar
        </Text>
      </View>

      {bests.overall && (
        <GlassCard color={C.accent} style={{ padding: SPACING.xl, alignItems: "center" }}>
          <Icon name="trophy" size={24} color={C.accent} />
          <Text style={[TYPOGRAPHY.label, { color: C.muted, marginTop: SPACING.sm }]}>
            En Yüksek Net
          </Text>
          <Stat size={36} color={C.text}>
            {bests.overall.bestNet}
          </Stat>
          <Text style={[TYPOGRAPHY.caption, { color: C.sec, marginTop: SPACING.xs }]}>
            {bests.overall.date}
          </Text>
        </GlassCard>
      )}

      <GlassCard radius={RADIUS.xxl} style={{ overflow: "hidden" }}>
        {bests.subjects.map((s, i) => (
          <View key={s.key}>
            {i > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: C.border,
                  marginHorizontal: SPACING.lg,
                }}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: SPACING.md,
                paddingHorizontal: SPACING.lg,
              }}
            >
              <Text
                style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}
                numberOfLines={1}
              >
                {s.name}
              </Text>
              <Text
                style={[
                  TYPOGRAPHY.bodySemiBold,
                  { color: C.accent, marginRight: SPACING.md },
                ]}
              >
                {s.bestNet}
              </Text>
              <Text style={[TYPOGRAPHY.micro, { color: C.muted }]}>
                {s.date}
              </Text>
            </View>
          </View>
        ))}
      </GlassCard>
    </Animated.View>
  );
}
