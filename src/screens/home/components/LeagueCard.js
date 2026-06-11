import { View, Text } from "react-native";
import { BentoCard, Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function LeagueCard({ league, onPress }) {
  const tierName = league.tier + " Lig";
  return (
    <BentoCard onPress={onPress} pad={16} style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon name="shield" size={22} color={C.amber} />
        <Text style={{ fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 15, color: C.amber }}>
          {tierName}
        </Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 28, color: C.text }}>
          {league.xp || 0}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.muted, marginTop: 2 }}>
          toplam XP
        </Text>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.sec, marginTop: 10 }}>
        Sıralamayı gör →
      </Text>
    </BentoCard>
  );
}
