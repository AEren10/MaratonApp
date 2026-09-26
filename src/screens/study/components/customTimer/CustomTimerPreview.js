import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Press } from "../../../../components/design/Press";
import * as H from "../../../../lib/haptics";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../../themes/tokens";

export function CustomTimerPreview({ focus, breakMin, cycles, onApply, C }) {
  const handleApply = () => {
    H.success();
    onApply();
  };

  return (
    <>
      <View style={[s.previewCard, { backgroundColor: C.void, borderColor: C.line }]}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
          {focus} dk odak · {breakMin} dk mola · {cycles} seans
        </Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginTop: STEP.s1 / 2 }]}>
          Toplam seans süresi: {focus * cycles} dk
        </Text>
      </View>

      <Press
        haptic="none"
        scaleTo={0.97}
        onPress={handleApply}
        accessibilityRole="button"
        accessibilityLabel="Özel süreyi uygula"
        style={[s.applyBtn, { backgroundColor: C.brandFill || C.accent }]}
      >
        <Text style={[TYPOGRAPHY.button, { color: C.accentInk }]}>
          Uygula
        </Text>
      </Press>
    </>
  );
}

const s = StyleSheet.create({
  previewCard: {
    marginTop: STEP.s3,
    padding: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    alignItems: "center",
  },
  applyBtn: {
    height: 52,
    borderRadius: SHAPE.button,
    alignItems: "center",
    justifyContent: "center",
    marginTop: STEP.s3,
  },
});
