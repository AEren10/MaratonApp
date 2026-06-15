import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

const TIER_GRADIENTS = {
  Bronz:    ["#C97C47", "#E0A26A"],
  Gümüş:    ["#9CA3AF", "#D1D5DB"],
  Altın:    ["#E8B547", "#FFD97D"],
  Elmas:    ["#5DD8C5", "#A0E8DA"],
  Obsidyen: ["#1B1530", "#3F2B73"],
};

const TIER_ICON = {
  Bronz: "medal",
  Gümüş: "medal",
  Altın: "trophy",
  Elmas: "award",
  Obsidyen: "crown",
};

export function LeagueCard({ league, onPress }) {
  const C = useC();
  const tier = league?.tier || "Bronz";
  const xp = league?.xp || 0;
  const [c1, c2] = TIER_GRADIENTS[tier] || TIER_GRADIENTS.Bronz;
  const icon = TIER_ICON[tier] || "medal";

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 22,
          padding: 16,
          overflow: "hidden",
          shadowColor: c1,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.30,
          shadowRadius: 14,
          elevation: 4,
        }}
      >
        {/* Trophy icon top right */}
        <View style={{
          position: "absolute", top: -8, right: -8,
          width: 80, height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.16)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={icon} size={32} color="rgba(255,255,255,0.7)" />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="shield" size={13} color="rgba(255,255,255,0.95)" sw={2.4} />
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: "rgba(255,255,255,0.95)",
            letterSpacing: 0.8,
          }}>
            {tier.toUpperCase()} LİG
          </Text>
        </View>

        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 30,
          color: "#FFFFFF",
          marginTop: 16,
          letterSpacing: -0.8,
        }}>
          {xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}
        </Text>
        <Text style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: "rgba(255,255,255,0.85)",
          marginTop: 1,
        }}>
          toplam XP
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 14 }}>
          <Text style={{
            fontFamily: "Inter_500Medium",
            fontSize: 11,
            color: "rgba(255,255,255,0.85)",
          }}>
            Sıralamayı gör
          </Text>
          <Icon name="arrowR" size={11} color="rgba(255,255,255,0.85)" sw={2.5} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}
