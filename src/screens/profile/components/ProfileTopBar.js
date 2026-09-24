import { View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { STEP, GUTTER, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function ProfileTopBar() {
  const C = useC();
  const nav = useNavigation();

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: GUTTER,
      paddingTop: STEP.s1,
    }}>
      <Text style={{ fontFamily: "Bricolage_400", fontSize: 26, color: C.text }}>
        Profil
      </Text>
      <Press haptic="none"
        accessibilityRole="button"
        accessibilityLabel="Ayarlar"
        hitSlop={STEP.s1}
        onPress={() => { H.tap(); nav.navigate(SCREENS.SETTINGS); }}
        style={{
          width: CONTROL.tapMin, height: CONTROL.tapMin,
          borderRadius: SHAPE.iconBox,
          borderWidth: 1, borderColor: C.border,
          alignItems: "center", justifyContent: "center"
        }}
      >
        <Icon name="settings" size={18} color={C.text2} />
      </Press>
    </View>
  );
}
