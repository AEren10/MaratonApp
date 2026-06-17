import { View, Text, Pressable } from "react-native";
import { Stat, Trend } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

export function DenemeCard({ data, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        padding: 16,
        borderRadius: 24,
        backgroundColor: C.blue + "12",
        borderWidth: 1,
        borderColor: C.blue + "28",
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.blue, letterSpacing: 0.6 }}>
        SON DENEME
      </Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <Stat size={36} color={C.text}>{data.net}</Stat>
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
              height: Math.max(4, 26 * (0.3 + b.v * 0.7)),
              backgroundColor: b.c,
              borderRadius: 4,
              opacity: 0.9,
            }}
          />
        ))}
      </View>
    </Pressable>
  );
}
