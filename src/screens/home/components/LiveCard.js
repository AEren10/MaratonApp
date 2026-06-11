import { View, Text } from "react-native";
import { BentoCard, Stat, LiveDot, Avatar } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function LiveCard({ count, avatars, onPress }) {
  return (
    <BentoCard onPress={onPress} pad={16} accent={C.green} style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
        <LiveDot />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: C.green,
            letterSpacing: 0.6,
          }}
        >
          CANLI
        </Text>
      </View>
      <View style={{ marginTop: 10 }}>
        <Stat size={30} color={C.text}>
          {count}
        </Stat>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.sec, marginTop: 2 }}>
        öğrenci çalışıyor
      </Text>
      <View style={{ flexDirection: "row", marginTop: 12 }}>
        {avatars.map((a, i) => (
          <View key={i} style={{ marginLeft: i ? -8 : 0 }}>
            <Avatar init={a} size={26} ring={1.5} />
          </View>
        ))}
      </View>
    </BentoCard>
  );
}
