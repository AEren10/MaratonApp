import { Text } from "react-native";
import { useC } from "../../contexts/ThemeContext";

export function Stat({ children, size = 46, color, style }) {
  const C = useC();
  const textColor = color || C.text;
  return (
    <Text
      style={[
        {
          fontFamily: "Bricolage_400",
          fontSize: size,
          lineHeight: size * 1.05,
          letterSpacing: -size * 0.025,
          color: textColor,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
