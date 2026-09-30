import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const TrialDetailLinks = memo(function TrialDetailLinks({ C, links }) {
  if (!links?.length) return null;
  return (
    <View style={s.links}>
      {links.map((l) => (
        <Press key={l.label} haptic="none" onPress={l.go} accessibilityRole="button" style={[s.link, { borderBottomColor: C.line }]}>
          <View style={s.textCol}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{l.label}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{l.note}</Text>
          </View>
          <Icon name="chevR" size={14} color={C.text3} />
        </Press>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  links: { marginTop: STEP.s4, paddingHorizontal: GUTTER },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: CONTROL.tapMin,
  },
  textCol: { flex: 1 },
});
