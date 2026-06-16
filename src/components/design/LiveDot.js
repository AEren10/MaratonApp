import { View } from "react-native";
import { useC } from "../../contexts/ThemeContext";

export function LiveDot({ size = 8, color }) {
  const C = useC();
  const dotColor = color ?? C.green;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dotColor,
        }}
      />
    </View>
  );
}
