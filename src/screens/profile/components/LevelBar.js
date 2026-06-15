import { View, Text } from "react-native";
import { C, SPACING, RADIUS } from "../../../themes/tokens";
import { GlassCard } from "../../../components/design";

export function LevelBar({ level, title, progress, xpInLevel, xpForNext }) {
  return (
    <GlassCard
      radius={20}
      color={C.amber}
      style={{
        padding: SPACING.lg,
        marginBottom: SPACING.xxl,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: C.amber }}>
            Lv.{level}
          </Text>
          <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec }}>
            {title}
          </Text>
        </View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted }}>
          {xpInLevel}/{xpForNext} XP
        </Text>
      </View>

      <View
        style={{
          height: 8,
          borderRadius: RADIUS.sm,
          backgroundColor: C.amber + "20",
          marginTop: SPACING.md,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: RADIUS.sm,
            backgroundColor: C.amber,
          }}
        />
      </View>

      {xpForNext > 0 && (
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            color: C.muted,
            marginTop: SPACING.xs,
            textAlign: "right",
          }}
        >
          Sonraki seviyeye {xpForNext - xpInLevel} XP
        </Text>
      )}
    </GlassCard>
  );
}
