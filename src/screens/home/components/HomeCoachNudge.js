import { Pressable, Text, View } from "react-native";

import { Icon } from "../../../components/design";

export function HomeCoachNudge({ C, nudge, onPress }) {
  if (!nudge) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        marginTop: 14,
        padding: 12,
        paddingHorizontal: 14,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.surface,
        opacity: pressed ? 0.88 : 1,
      })}
    >
      <View style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: C.accent + "29",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Icon name="target" size={17} color={C.accent} />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: "Archivo_500",
          fontSize: 13,
          lineHeight: 18,
          color: C.sec,
        }}
        numberOfLines={2}
      >
        <Text style={{ fontFamily: "Archivo_600", color: C.text }}>Koç: </Text>
        {nudge.message || nudge.title}
      </Text>
      <Icon name="arrowR" size={14} color={C.muted} />
    </Pressable>
  );
}
