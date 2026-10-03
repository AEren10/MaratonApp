import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { DISCOVER_TIPS, useDiscoverTips } from "../../../hooks/useDiscoverTips";
import { SHAPE, STEP, TYPOGRAPHY, SHADOW } from "../../../themes/tokens";

const COPY = {
  [DISCOVER_TIPS.WIDGET]: {
    title: "Maraton'u ana ekranına al",
    line: "Bugünün işi, serin ve sınav sayacı; uygulamayı açmadan.",
    action: "Nasıl eklenir",
    screen: SCREENS.WIDGET_GUIDE,
  },
  [DISCOVER_TIPS.STORY]: {
    title: "Haftanı hikâyende paylaş",
    line: "Çalıştığın saatleri arkadaşların görsün. Netin görünmez.",
    action: "Kartı hazırla",
    screen: SCREENS.SHARE_CARD,
  },
};

// Ana sayfada TEK kesif ipucu: once widget, sonra hikaye. Kapatilan ya da
// acilan bir daha gelmez (useDiscoverTips). Ilk gun gosterilmez.
export const HomeDiscoverTip = React.memo(function HomeDiscoverTip({ eligible }) {
  const C = useC();
  const navigation = useNavigation();
  const { tip, close } = useDiscoverTips({ eligible });
  if (!tip) return null;
  const copy = COPY[tip];

  const open = () => { close(tip); navigation.navigate(copy.screen); };

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{copy.title}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{copy.line}</Text>
        <Press haptic="tap" onPress={open} accessibilityRole="button" hitSlop={10} style={s.action}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>{`${copy.action} ›`}</Text>
        </Press>
      </View>
      <Press haptic="none" onPress={() => close(tip)} hitSlop={12}
        accessibilityRole="button" accessibilityLabel="İpucunu kapat">
        <Icon name="x" size={16} color={C.text3} />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "flex-start", gap: STEP.s2,
    marginTop: STEP.s3, padding: STEP.s3, borderRadius: SHAPE.cardTight, borderWidth: 1,
  },
  body: { flex: 1, gap: STEP.s1 / 2 },
  action: { marginTop: STEP.s1, alignSelf: "flex-start" },
});
