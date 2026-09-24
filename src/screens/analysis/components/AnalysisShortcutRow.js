import { View, Text } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function AnalysisShortcutRow({ C, go, screens }) {
  return (
    <View>
      <SectionLabel>YAYIN KARŞILAŞTIRMASI</SectionLabel>
      <AnimatedCard delay={60}>
        <Shortcut
          C={C}
          color={C.accent}
          icon="chart"
          label="Yayın karşılaştırması"
          sub="Zor yayınlarda net düşüşün normal mi, panik mi?"
          onPress={() => go(screens.COMPARATIVE, undefined, "analysis_comparative")}
        />
      </AnimatedCard>
    </View>
  );
}

function Shortcut({ C, color, icon, label, sub, onPress }) {
  return (
    <Press haptic="none" scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: CONTROL.tapMin,
        alignItems: "center",
        gap: STEP.s1,
        padding: STEP.s3,
        borderRadius: SHAPE.sheet,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: SHAPE.iconBox, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text, textAlign: "center" }}>{label}</Text>
      {sub ? (
        <Text style={{ ...TYPOGRAPHY.micro, color: C.text3, textAlign: "center" }}>{sub}</Text>
      ) : null}
    </Press>
  );
}
