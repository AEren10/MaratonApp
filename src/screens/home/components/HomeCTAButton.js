import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Iki satirli oldugu icin birincil buton olcusunden (52) yuksek, ama 74
// ekranin en agir blogu oluyordu: kizil alan kahraman sayidan cok yer
// kapliyordu. 64 iki satiri da rahat tasiyor, dokunma alani da fazlasiyla
// tabanin (44) uzerinde.
const HEIGHT = STEP.s5 + STEP.s2;

// Ana Sayfa birincil eylemi: iki satirli kizil blok (baslik + alt satir) ve
// sagda yuvarlak ok. "Çalışmaya Başla" / "Bugün ne çalıştın, kaydet".
export function HomeCTAButton({ title, subtitle, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => { H.tap(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: pressed ? C.accentPress : C.brandFill },
        pressed && s.pressed,
      ]}
    >
      <View style={s.texts}>
        <Text numberOfLines={1} style={[TYPOGRAPHY.button, s.title, { color: C.accentInk }]}>{title}</Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[TYPOGRAPHY.metaSemiBold, s.sub, { color: C.accentInk }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={[s.arrow, { backgroundColor: alpha(C.accentInk, 16) }]}>
        <Icon name="chevR" size={14} color={C.accentInk} sw={2.2} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, height: HEIGHT,
    paddingLeft: STEP.s3 + 2, paddingRight: STEP.s3 - 2, borderRadius: SHAPE.cardTight,
  },
  pressed: { transform: [{ scale: 0.985 }] },
  texts: { flex: 1, minWidth: 0, gap: STEP.s1 / 2 + 1 },
  title: { fontSize: TYPOGRAPHY.button.fontSize + 2.5, lineHeight: TYPOGRAPHY.button.lineHeight + 3, letterSpacing: -0.28 },
  sub: { fontSize: TYPOGRAPHY.micro.fontSize + 0.5, opacity: 0.8 },
  arrow: { width: STEP.s4 + 4, height: STEP.s4 + 4, borderRadius: SHAPE.phone, alignItems: "center", justifyContent: "center" },
});
