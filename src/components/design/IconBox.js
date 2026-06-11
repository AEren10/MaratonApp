import { View } from "react-native";
import { Icon } from "./Icon";

export function IconBox({ icon, color = "#F5A623", size = 38, rounded = 12, iconSize, style }) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: rounded,
          backgroundColor: color + "22",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize ?? size * 0.5} color={color} />
    </View>
  );
}
