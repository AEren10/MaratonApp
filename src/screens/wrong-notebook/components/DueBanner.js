import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/palette";

export function DueBanner({ dueCount, onClassic, onSwipe }) {
  const C = useC();
  if (dueCount <= 0) return null;

  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 8, padding: 12,
      borderRadius: SHAPE.card, borderWidth: 1,
      backgroundColor: alpha(C.accent, 8), borderColor: alpha(C.accent, 20),
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: alpha(C.accent, 14), alignItems: "center", justifyContent: "center" }}>
          <Icon name="refresh" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...TYPOGRAPHY.label, color: C.accentText, letterSpacing: 0.6 }}>Bugün tekrar</Text>
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: 1 }}>{dueCount} sorunun tekrar zamanı geldi</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
        <Pressable
          onPress={onClassic}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: alpha(C.accent, 12) }}
        >
          <Icon name="list" size={14} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accentText }}>Klasik</Text>
        </Pressable>
        <Pressable
          onPress={onSwipe}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: alpha(C.accent, 12) }}
        >
          <Icon name="layers" size={14} color={C.accent} />
          <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.accentText }}>Swipe</Text>
        </Pressable>
      </View>
    </View>
  );
}
