import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

export function MotivCard({ message, onPress }) {
  const C = useC();
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          borderRadius: 22,
          backgroundColor: C.green + "12",
          borderWidth: 1,
          borderColor: C.green + "2A",
          padding: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: C.green + "22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="target" size={20} color={C.green} />
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: C.text,
              lineHeight: 19,
            }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
