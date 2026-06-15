import { View, Text, Pressable } from "react-native";
import { Icon, GlassCard } from "../../../components/design";
import { C } from "../../../themes/tokens";

export function WeakCard({ message, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard radius={24} intensity={36} style={{ padding: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: C.red + "22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="alert" size={20} color={C.red} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13.5,
                color: C.text,
                lineHeight: 18,
              }}
            >
              {message}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12.5, color: C.red }}>
                Analiz Et
              </Text>
              <Icon name="chevR" size={13} color={C.red} sw={2.5} />
            </View>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}
