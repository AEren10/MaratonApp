import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";

export function LeagueMiniCard({ tier, nextTier, weeklyXP }) {
  const C = useC();
  const nav = useNavigation();
  const tierColor = tier?.color || C.accent;
  const xpToNext = nextTier ? nextTier.minXP - weeklyXP : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Haftalık Lig"
      onPress={() => { H.tap(); nav.navigate(SCREENS.LEAGUE); }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: RADIUS.xxl,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {/* Trophy icon */}
      <View style={{
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: C.accent + "16",
        alignItems: "center", justifyContent: "center",
        marginRight: SPACING.md,
      }}>
        <Icon name={tier?.icon || "trophy"} size={20} color={C.accent} />
      </View>

      {/* Title + subtitle */}
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text }}>
          Haftalık Lig
        </Text>
        {nextTier ? (
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 }}>
            Üst lige {xpToNext} XP
          </Text>
        ) : (
          <Text style={{ ...TYPOGRAPHY.caption, color: tierColor, marginTop: 2 }}>
            En üst ligdesin!
          </Text>
        )}
      </View>

      {/* Tier name + chevron */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.xs }}>
        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 13,
          color: C.accent,
          letterSpacing: 0.5,
        }}>
          {tier?.name?.toUpperCase() || "BRONZ"}
        </Text>
        <Icon name="chevR" size={16} color={C.muted} />
      </View>
    </Pressable>
  );
}
