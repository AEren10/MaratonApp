import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, CONTROL } from "../../../themes/tokens";

// "DURAK TAMAMLANDI" yalniz durak gercekten kapandiysa; serbest ya da yarim
// calismada "CALISMA KAYDEDILDI".
export function StudySummaryHeader({ stopDone, onClose, C }) {
  return (
    <View style={s.row}>
      <Animated.Text entering={FadeInUp.duration(500)} style={[TYPOGRAPHY.label, { color: C.accentBright ?? C.accent }]}>
        {stopDone ? "DURAK TAMAMLANDI" : "ÇALIŞMA KAYDEDİLDİ"}
      </Animated.Text>
      <Press haptic="tap" onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Kapat" style={s.close}>
        <Icon name="x" size={NAV_ICON.close} color={C.text2} />
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s1,
  },
  close: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
});
