import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

// Tasarimin segment kontrolu: surface zemin, 4px ic bosluk, secili dilim elev.
// Dilim h36; dokunma alani dikeyde 44'e seffaf olarak buyutulur.
export const Segmented = memo(function Segmented({ options, value, onChange }) {
  const C = useC();
  return (
    <View style={[styles.wrap, { backgroundColor: C.surface, borderColor: C.elev }]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Press haptic="none"
            key={opt.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            hitSlop={{ top: 4, bottom: 4 }}
            onPress={() => {
              if (active) return;
              H.select();
              onChange(opt.key);
            }}
            style={[styles.item, active && { backgroundColor: C.elev }]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, styles.text, { color: active ? C.text : C.text3 }]}>
              {opt.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderRadius: SHAPE.segment,
  },
  item: {
    flex: 1,
    height: CONTROL.segment,
    borderRadius: SHAPE.segment,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontFamily: TYPOGRAPHY.button.fontFamily },
});
