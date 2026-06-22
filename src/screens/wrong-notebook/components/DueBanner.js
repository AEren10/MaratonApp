import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function DueBanner({ dueCount, onClassic, onSwipe }) {
  const C = useC();
  if (dueCount <= 0) return null;

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 8, padding: 12,
      borderRadius: 18, borderWidth: 1,
      backgroundColor: C.coral + "12", borderColor: C.coral + "30",
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: C.coral + "22", alignItems: "center", justifyContent: "center" }}>
          <Icon name="refresh" size={18} color={C.coral} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPOGRAPHY.label, color: C.coral, letterSpacing: 0.6 }}>BUGÜN TEKRAR</Text>
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: 1 }}>{dueCount} sorunun tekrar zamanı geldi</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Pressable
          onPress={onClassic}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.coral + "18" }}
        >
          <Icon name="list" size={14} color={C.coral} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.coral }}>Klasik</Text>
        </Pressable>
        <Pressable
          onPress={onSwipe}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: C.accent + "18" }}
        >
          <Icon name="layers" size={14} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accent }}>Swipe</Text>
        </Pressable>
      </View>
    </View>
  );
}
