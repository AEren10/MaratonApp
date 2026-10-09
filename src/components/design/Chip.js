import { View, Text } from "react-native";
import { useC } from "../../contexts/ThemeContext";
import { alpha } from "../../themes/colorMix";
import { SHAPE } from "../../themes/tokens";

export function Chip({ children, color, bg, style }) {
  const C = useC();
  const chipColor = color || C.accent;
  const background = bg ?? alpha(chipColor, 12);
  const border = alpha(chipColor, 28);
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          backgroundColor: background,
          borderWidth: 1,
          borderColor: border,
          borderRadius: SHAPE.chip,
          paddingHorizontal: 10,
          paddingVertical: 5,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {typeof children === "string" ? (
        <Text
          style={{
            fontFamily: "Archivo_600",
            fontSize: 11.5,
            color: chipColor,
            letterSpacing: 0.6,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
