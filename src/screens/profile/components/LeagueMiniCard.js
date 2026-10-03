import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOW } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { FEATURES } from "../../../constants/features";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function LeagueMiniCard({ tier, nextTier, weeklyXP }) {
  const C = useC();
  const nav = useNavigation();
  const tierColor = tier?.color || C.accent;
  const xpToNext = nextTier ? nextTier.minXP - weeklyXP : 0;
  const isDark = C.scheme !== "light";

  return (
    <Press haptic="none"
      accessibilityRole="button"
      accessibilityLabel="Haftalık Lig"
      // Genel Lig kapaliysa (FEATURES.globalLeague) kademe arkadaslar tablosunda.
      onPress={() => { H.tap(); nav.navigate(SCREENS.LEAGUE, { tab: FEATURES.globalLeague ? "global" : "friends" }); }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.edgeStrong,
          borderRadius: RADIUS.xxl,
          padding: SPACING.lg,
          marginBottom: SPACING.lg
        },
        !isDark && SHADOW.cardLight,
      ]}
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
          fontFamily: "Bricolage_400",
          fontSize: 13,
          color: C.accentText,
          letterSpacing: 0.5,
        }}>
          {tier?.name?.toUpperCase() || "BRONZ"}
        </Text>
        <Icon name="chevR" size={16} color={C.muted} />
      </View>
    </Press>
  );
}
