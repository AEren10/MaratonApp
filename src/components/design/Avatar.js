import { View, Text, Image } from "react-native";
import { useC } from "../../contexts/ThemeContext";

const PALETTE = ["#60a5fa", "#fb923c", "#34d399", "#c084fc", "#fbbf24", "#2dd4bf"];

function hashColor(text = "") {
  let sum = 0;
  for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

export function Avatar({ init = "??", size = 26, ring = 0, color, image, style }) {
  const C = useC();
  const bg = color ?? hashColor(init);

  if (image) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ring,
            borderColor: C.bg,
            overflow: "hidden",
          },
          style,
        ]}
      >
        <Image
          source={{ uri: image }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg + "33",
          borderWidth: ring,
          borderColor: C.bg,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: size * 0.4,
          color: bg,
        }}
      >
        {init}
      </Text>
    </View>
  );
}
