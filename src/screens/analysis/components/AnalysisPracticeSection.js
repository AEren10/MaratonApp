import { View, Text, Pressable } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function AnalysisPracticeSection({ C, go, onSimulator, screens }) {
  return (
    <>
      <SectionLabel>PRATİK</SectionLabel>
      <AnimatedCard delay={380}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Yanlış Defteri"
          onPress={() => go(screens.WRONG_NOTEBOOK, undefined, "analysis_wrong_notebook")}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: SPACING.md,
            borderRadius: 22,
            backgroundColor: C.coral + "14",
            borderWidth: 1,
            borderColor: C.coral + "28",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: C.coral + "24", alignItems: "center", justifyContent: "center" }}>
            <Icon name="notebook" size={22} color={C.coral} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Yanlış Defteri</Text>
            <Text style={{ ...TYPOGRAPHY.caption, color: C.sec, marginTop: 1 }}>Yanlışlarını tekrar edip güçlen</Text>
          </View>
          <Icon name="arrowR" size={18} color={C.coral} />
        </Pressable>
      </AnimatedCard>

      <AnimatedCard delay={440}>
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          <PracticeButton
            C={C}
            color={C.green}
            icon="target"
            label="5dk Quiz"
            onPress={() => go(screens.QUICK_PRACTICE, undefined, "analysis_quick_practice")}
          />
          <PracticeButton
            C={C}
            color={C.orange}
            icon="clock"
            label="Simülasyon"
            onPress={onSimulator}
          />
        </View>
      </AnimatedCard>
    </>
  );
}

function PracticeButton({ C, color, icon, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        backgroundColor: color + "12",
        borderWidth: 1,
        borderColor: color + "25",
      }}
    >
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: color + "20", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={15} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text }}>{label}</Text>
    </Pressable>
  );
}
