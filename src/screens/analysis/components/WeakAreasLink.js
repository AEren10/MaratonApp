import { Pressable, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useWeakAreas } from "../../../hooks/useWeakAreas";
import * as H from "../../../lib/haptics";

// Tasarim "Konu İlerlemesi": konu kiriliminin altindaki baglanti
// Öncelikli Konular'a gider. Oncelikli konu yoksa cizilmez.
export function WeakAreasLink() {
  const C = useC();
  const navigation = useNavigation();
  const { weakTopics, isEmpty } = useWeakAreas();
  if (isEmpty || !weakTopics.length) return null;

  return (
    <Pressable
      onPress={() => { H.tap(); navigation.navigate(SCREENS.WEAK_AREAS); }}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        { borderColor: C.accent, backgroundColor: pressed ? C.brandTint : "transparent" },
      ]}
    >
      <Icon name="target" size={16} color={C.accentBright} />
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>
        {`${weakTopics.length} öncelikli konunu gör`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: CONTROL.tapMin + 2,
    marginTop: STEP.s3 - 2,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1 + 1,
  },
});
