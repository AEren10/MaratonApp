import { View, Text, Pressable } from "react-native";

import { Icon, SectionLabel } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function AnalysisPracticeSection({ C, go, onSimulator, screens }) {
  return (
    <>
      <SectionLabel>DAHA DERİNE</SectionLabel>
      <AnimatedCard delay={380}>
        <View style={{ backgroundColor: C.surface, borderRadius: 22, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
          <DeepRow
            C={C}
            title="Konu ilerlemesi"
            sub="Altı konuda defter yükü veya çalışma açığı"
            onPress={() => go(screens.SUBJECT_LIST, undefined, "analysis_subject_progress")}
          />
          <DeepRow
            C={C}
            title="Defter"
            sub="Kendi yanlışların ve tekrar zamanı gelenler"
            onPress={() => go(screens.WRONG_NOTEBOOK, undefined, "analysis_wrong_notebook")}
          />
          <DeepRow
            C={C}
            title="Net Tahmini"
            sub="Bu tempoyla sınav günü tahmini"
            onPress={() => go(screens.NET_FORECAST, undefined, "analysis_net_forecast")}
          />
          <DeepRow
            C={C}
            title="Simülasyon"
            sub="Tam süreli TYT provası"
            onPress={onSimulator}
            last
          />
        </View>
      </AnimatedCard>

      <AnimatedCard delay={440}>
        <View style={{ flexDirection: "row", gap: SPACING.sm }}>
          <PracticeButton
            C={C}
            color={C.green}
            icon="target"
            label="5dk Quiz"
            onPress={() => go(screens.REVIEW_SESSION, { limit: 5, shuffle: true, source: "quick_practice" }, "analysis_quick_practice")}
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

function DeepRow({ C, title, sub, onPress, last }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 58,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: C.line,
        opacity: pressed ? 0.76 : 1,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>{title}</Text>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.text3, marginTop: 2 }}>{sub}</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Pressable>
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
