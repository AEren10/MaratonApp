import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../contexts/ThemeContext";
import * as H from "../../lib/haptics";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";

// Segment kontrolu (tasarim: Programım "Haftalık / Aylık"): surface kutu,
// secili segment elev zemin. Segment h36, dokunma alani 44.
function SegmentTabs({ options, value, onChange }) {
  const C = useC();
  const slop = (CONTROL.tapMin - CONTROL.segment) / 2;
  return (
    <View style={[s.box, { backgroundColor: C.surface, borderColor: C.elev }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Press haptic="none"
            key={o.key}
            onPress={() => { if (!on) { H.select(); onChange(o.key); } }}
            hitSlop={{ top: slop, bottom: slop }}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[s.seg, on && { backgroundColor: C.elev }]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, s.text, { color: on ? C.text : C.text3 }]}>{o.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

export default memo(SegmentTabs);

const s = StyleSheet.create({
  box: { flexDirection: "row", gap: STEP.s1 / 2, padding: STEP.s1 / 2, borderRadius: SHAPE.segment, borderWidth: 1 },
  seg: { flex: 1, height: CONTROL.segment, borderRadius: SHAPE.segment, alignItems: "center", justifyContent: "center" },
  text: { fontFamily: TYPOGRAPHY.button.fontFamily },
});
