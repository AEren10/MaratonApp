import { Text } from "react-native";

export function Stat({ children, size = 46, color = "#FFFFFF", style }) {
  return (
    <Text
      style={[
        {
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: size,
          lineHeight: size * 1.05,
          letterSpacing: -size * 0.025,
          color,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
