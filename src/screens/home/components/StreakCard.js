import { View, Text } from "react-native";
import { BentoCard, Stat, Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function StreakCard({ streak, best, onPress }) {
  return (
    <BentoCard onPress={onPress} pad={16} style={{ flex: 1 }}>
      <Icon name="flame" size={26} color={C.amber} />
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
