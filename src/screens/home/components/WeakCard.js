import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

export function WeakCard({ message, onPress }) {
  const C = useC();
  return (
    <Pressable onPress={onPress}>
      <View style={{
        padding: 16, borderRadius: 22,
        backgroundColor: C.red + "10",
        borderWidth: 1, borderColor: C.red + "26",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
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
                fontSize: 14,
                color: C.text,
                lineHeight: 19,
              }}
            >
              {message}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12.5, color: C.red }}>
                Analiz Et
              </Text>
              <Icon name="chevR" size={13} color={C.red} sw={2.5} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
