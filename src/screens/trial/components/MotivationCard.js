import { View, Text, Pressable } from "react-native";
import { GlassCard, Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function MotivationCard({ diff, onNavigate, C }) {
  const isUp = diff > 0;
  const isFlat = diff === 0;
  const cardColor = isUp ? C.green : isFlat ? C.amber : C.accent;
  const message = isUp
    ? `Harika gidiyorsun! ${diff.toFixed(1)} net artış`
    : isFlat
    ? "Sabit gidiyorsun, hız kesmeden devam!"
    : "Her deneme bir fırsat! Zayıf alanlarına odaklan";
  return (
    <GlassCard color={cardColor} radius={RADIUS.xxl}>
      <View style={{ padding: SPACING.xl, gap: SPACING.md }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }}>{message}</Text>
        <Pressable
          onPress={onNavigate}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: SPACING.sm, backgroundColor: cardColor + "22",
            borderRadius: RADIUS.xl, paddingVertical: SPACING.md,
            opacity: pressed ? 0.75 : 1, minHeight: 44,
          })}
        >
          <Text style={{ ...TYPOGRAPHY.button, color: cardColor }}>Zayıf Alanları Gör</Text>
          <Icon name="chevR" size={16} color={cardColor} />
        </Pressable>
      </View>
    </GlassCard>
  );
}
