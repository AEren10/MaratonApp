import { View, Text } from "react-native";
import { BentoCard, Stat, Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function StreakCard({ streak, best, freezeCount = 0, onPress }) {
  return (
    <BentoCard onPress={onPress} pad={16} style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Icon name="flame" size={26} color={C.amber} />
        {freezeCount > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: C.blue + "1A",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Icon name="shield" size={11} color={C.blue} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: C.blue }}>
              {freezeCount} joker
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 8 }}>
        <Stat size={38} color={C.text}>
          {streak}
        </Stat>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.sec, marginTop: 2 }}>
        gün üst üste
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 10 }}>
        En iyi: {best}
      </Text>
    </BentoCard>
  );
}
