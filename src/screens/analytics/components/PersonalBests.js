import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Stat } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function PersonalBests({ bests }) {
  const C = useC();
  if (!bests || !bests.subjects?.length) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(250).duration(420).springify()}
      style={{ gap: STEP.s3 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2 }}>
        <Icon name="star" size={18} color={C.accent} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>
          Kişisel Rekorlar
        </Text>
      </View>

      {bests.overall && (
        <View style={{ padding: STEP.s5, alignItems: "center", borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.accent + "40" }}>
          <Icon name="trophy" size={24} color={C.accent} />
          <Text style={[TYPOGRAPHY.label, { color: C.text3, marginTop: STEP.s2 }]}>
            En Yüksek Net
          </Text>
          <Stat size={36} color={C.text}>
            {bests.overall.bestNet}
          </Stat>
          <Text style={[TYPOGRAPHY.caption, { color: C.text2, marginTop: STEP.s1 }]}>
            {bests.overall.date}
          </Text>
        </View>
      )}

      <View style={{ overflow: "hidden", borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.elev }}>
        {bests.subjects.map((s, i) => (
          <View key={s.key}>
            {i > 0 && (
              <View
                style={{
                  height: 1,
                  backgroundColor: C.line,
                  marginHorizontal: STEP.s4,
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
