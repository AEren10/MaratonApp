import { View, Text } from "react-native";
import { useC } from "../../contexts/ThemeContext";

export function Trend({ v = 0, size = 12 }) {
  const C = useC();
  const up = v > 0;
  const flat = v === 0;
  const color = flat ? C.muted : up ? C.green : C.red;
  const arrow = flat ? "→" : up ? "↗" : "↘";
  const text = `${up ? "+" : ""}${v}`;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: color + "1A",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color, fontSize: size, fontFamily: "Inter_600SemiBold" }}>{arrow}</Text>
      <Text style={{ color, fontSize: size, fontFamily: "Inter_600SemiBold" }}>{text}</Text>
    </View>
  );
}
