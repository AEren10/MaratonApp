import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, CONTROL } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import * as H from "../../../lib/haptics";

// Profil > SEVIYE satiri. Dokunulunca tasarimin "Seviye" ekranini acar.
export function LevelRow({ level, xpInLevel, xpForNext }) {
  const C = useC();
  const navigation = useNavigation();
  const pct = xpForNext > 0 ? Math.min(1, xpInLevel / xpForNext) : 0;

  const open = () => {
    H.select();
    navigation.navigate(SCREENS.LEVEL);
  };

  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Seviye ${level ?? ""}, ${xpInLevel ?? 0} / ${xpForNext ?? 0} XP. Seviye yolunu aç`}
      style={{
        flexDirection: "row", alignItems: "center", gap: STEP.s2,
        minHeight: CONTROL.tapMin,
        marginHorizontal: GUTTER, marginTop: STEP.s3,
        paddingTop: STEP.s2 + 2, borderTopWidth: 1, borderTopColor: C.line,
      }}
    >
      <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 2, color: C.text3 }}>
        {`SEVİYE ${level ?? "–"}`}
      </Text>
      <View style={{ flex: 1, height: 5, borderRadius: 2, backgroundColor: C.track, overflow: "hidden" }}>
        <View style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 2, backgroundColor: C.accent }} />
      </View>
      <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.text2, fontVariant: ["tabular-nums"] }}>
        {`${xpInLevel ?? 0} / ${xpForNext ?? 0} XP`}
      </Text>
    </Pressable>
  );
}
