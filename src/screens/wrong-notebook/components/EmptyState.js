import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function EmptyState({ resolved }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 80, paddingHorizontal: 24 }}>
      <Icon
        name={resolved ? "checkCircle" : "notebook"}
        size={56}
        color={resolved ? C.green : C.muted}
      />
      <Text
        style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 20,
          color: C.text,
          marginTop: 18,
          textAlign: "center",
        }}
      >
        {resolved ? "Henuz cozum yok" : "Defterin tertemiz"}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: C.muted,
          marginTop: 8,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {resolved
          ? "Yanlislarini tekrar ettikce burada birikecek."
          : "Yanlis yaptigin sorulari ekle, ben sana tekrar zamanlamasini hatirlataim."}
      </Text>
    </View>
  );
}
