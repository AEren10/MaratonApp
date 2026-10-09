import { View } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { Icon } from "./Icon";

export function IconBox({ icon, color, size = 38, rounded = 12, iconSize, style }) {
  const C = useC();
  const boxColor = color || C.accent;
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: rounded,
          backgroundColor: alpha(boxColor, 14),
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize ?? size * 0.5} color={boxColor} />
    </View>
  );
}
