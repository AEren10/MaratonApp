import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export function HomeHeader({ name, streak, onStreakPress }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingBottom: 18,
      }}
    >
      <View>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: C.muted }}>
          {greeting()},
        </Text>
        <Text
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 28,
            color: C.text,
            letterSpacing: -0.5,
            marginTop: 2,
          }}
        >
          {name}
        </Text>
      </View>
      <Pressable
        onPress={onStreakPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          backgroundColor: C.amber + "1C",
          borderWidth: 1,
          borderColor: C.amber + "40",
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Icon name="flame" size={16} color={C.amber} />
        <Text
          style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 17,
            color: C.amber,
          }}
        >
          {streak}
        </Text>
      </Pressable>
    </View>
  );
}
