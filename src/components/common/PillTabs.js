import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import * as H from "../../lib/haptics";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";

// Esit genislikte cerceveli sekmeler (tasarim: Aylik Plan "Hafta / Ay",
// Kart Modlari "Emek / İvme / Tam"). Secili: kizil tint + accent kenar.
// Gorsel yukseklik 40-42; dokunma alani 44.
function PillTabs({ options, value, onChange, height = 40 }) {
  const C = useC();
  return (
    <View style={s.row} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Press haptic="none"
            key={o.key}
            onPress={() => { if (!on) { H.select(); onChange(o.key); } }}
            hitSlop={{ top: (CONTROL.tapMin - height) / 2, bottom: (CONTROL.tapMin - height) / 2 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[
              s.pill,
              { height, borderColor: on ? C.accent : C.border, backgroundColor: on ? C.brandTint : "transparent" },
            ]}
          >
            <Text style={[on ? TYPOGRAPHY.metaSemiBold : TYPOGRAPHY.meta, { color: on ? C.text : C.text2 }]}>
              {o.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}

export default memo(PillTabs);

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 },
  pill: { flex: 1, borderRadius: SHAPE.button, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});
