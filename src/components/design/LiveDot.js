import { View } from "react-native";
import { C } from "../../themes/tokens";

export function LiveDot({ size = 8, color = C.green }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
