import { View, Text } from "react-native";

export function Chip({ children, color = "#F5A623", bg, style }) {
  const background = bg ?? color + "1C";
  const border = color + "40";
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
          borderRadius: 999,
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
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color,
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
