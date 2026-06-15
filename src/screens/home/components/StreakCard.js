import { View, Text, Pressable } from "react-native";
import { Stat, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

export function StreakCard({ streak, best, freezeCount = 0, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        padding: 16,
        borderRadius: 24,
        backgroundColor: C.coral + "16",
        borderWidth: 1,
        borderColor: C.coral + "30",
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{
          width: 36, height: 36, borderRadius: 12,
          backgroundColor: C.coral + "24",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="flame" size={20} color={C.coral} />
        </View>
        {freezeCount > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              backgroundColor: C.blue + "1A",
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 999,
            }}
          >
            <Icon name="shield" size={11} color={C.blue} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: C.blue }}>
              {freezeCount} joker
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ marginTop: 10 }}>
        <Stat size={38} color={C.text}>{streak}</Stat>
      </View>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: C.sec, marginTop: 2 }}>
        gün üst üste
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 10 }}>
        En iyi: {best}
      </Text>
    </Pressable>
  );
}
