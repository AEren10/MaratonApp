import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function MotivCard({ message, onPress }) {
  return (
    <Pressable onPress={onPress}>
    <LinearGradient
      colors={[C.green + "18", C.surface]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.green + "2E",
        padding: 15,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: C.green + "22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="target" size={18} color={C.green} />
        </View>
        <Text
          style={{
            flex: 1,
            fontFamily: "Inter_500Medium",
            fontSize: 13.5,
            color: C.text,
            lineHeight: 18,
          }}
        >
          {message}
        </Text>
      </View>
    </LinearGradient>
    </Pressable>
  );
}
