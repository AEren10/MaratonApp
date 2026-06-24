import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";

export function MinimalHeader() {
  const C = useC();
  const nav = useNavigation();

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    }}>
      <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Profil</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paylaş"
          hitSlop={8}
          onPress={() => { H.tap(); nav.navigate(SCREENS.SHARE_CARD, { type: "overall" }); }}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: C.surface,
            alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="share" size={18} color={C.sec} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ayarlar"
          hitSlop={8}
          onPress={() => { H.tap(); nav.navigate(SCREENS.SETTINGS); }}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: C.surface,
            alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="settings" size={18} color={C.sec} />
        </Pressable>
      </View>
    </View>
  );
}
