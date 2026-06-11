import { View, Text } from "react-native";
import { BentoCard, Stat, Trend } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function DenemeCard({ data, onPress }) {
  return (
    <BentoCard onPress={onPress} pad={16} style={{ flex: 1 }}>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.muted, letterSpacing: 0.6 }}>
        SON DENEME
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <Stat size={36} color={C.amber}>
          {data.net}
        </Stat>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: C.sec }}>net</Text>
      </View>
      <View style={{ marginTop: 8 }}>
        <Trend v={data.trend} />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 5,
          marginTop: 14,
          alignItems: "flex-end",
          height: 26,
        }}
      >
        {data.bars.map((b, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: `${30 + b.v * 70}%`,
              backgroundColor: b.c,
              borderRadius: 4,
              opacity: 0.9,
            }}
          />
        ))}
      </View>
    </BentoCard>
  );
}
