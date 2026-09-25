import { View, Text, StyleSheet } from "react-native";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../themes/tokens";

export function OnboardingPagination({ total = 3, current = 0, onSelect, onSkip, C }) {
  return (
    <View style={s.wrap}>
      <View style={s.topBar}>
        <View style={s.brandRow}>
          <View style={[s.brandDot, { backgroundColor: C.accent }]} />
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright, letterSpacing: 2.2 }]}>
            MARATON
          </Text>
        </View>

        {current < total - 1 ? (
          <Press
            haptic="none"
            onPress={onSkip}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Tanıtımı atla"
            style={s.skipBtn}
          >
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Atla</Text>
          </Press>
        ) : (
          <View style={s.skipPlaceholder} />
        )}
      </View>

      <View style={s.segments}>
        {Array.from({ length: total }).map((_, i) => {
          const isActive = i === current;
          const isPast = i < current;
          return (
            <Press
              key={i}
              haptic="selection"
              onPress={() => onSelect(i)}
              accessibilityRole="button"
              accessibilityLabel={`Sayfa ${i + 1}`}
              style={s.segmentTouch}
            >
              <View
                style={[
                  s.segmentBar,
                  {
                    backgroundColor: isActive
                      ? C.accent
                      : isPast
                        ? C.text2
                        : C.track,
                  },
                ]}
              />
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: CONTROL.tapMin,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  brandDot: { width: 7, height: 7, borderRadius: 3.5 },
  skipBtn: {
    minHeight: CONTROL.tapMin,
    minWidth: CONTROL.tapMin,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  skipPlaceholder: { minHeight: CONTROL.tapMin, minWidth: CONTROL.tapMin },
  segments: {
    flexDirection: "row",
    gap: STEP.s1,
    marginTop: STEP.s1,
  },
  segmentTouch: { flex: 1, paddingVertical: 6 },
  segmentBar: { height: 3, borderRadius: 1.5 },
});
