import { Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { caseSuffix, numberLastWord } from "../../../lib/turkishSuffix";

// "60'tan 64,5'e": ondalik korunur; ek okunusun son sozcugune gore
// (64,5 -> "...virgul bes" -> 'e). numberWithCase yuvarliyordu.
function netWithCase(value, kind) {
  const n = Number(value) || 0;
  const text = Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  const tail = text.includes(",") ? text.split(",")[1] : text;
  return `${text}'${caseSuffix(numberLastWord(tail), kind)}`;
}

export function TrialDetailRouteImpact({ C, routeImpact }) {
  if (!routeImpact) return null;
  const { before, after } = routeImpact;
  const same = Number(after) === Number(before);
  const verb = after > before ? "çıkardı" : "düşürdü";
  return (
    <Animated.View style={styles.wrap}>
      <Card tone="tint" style={[styles.card, { borderWidth: 1, borderColor: C.border }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>ROTAYA ETKİSİ</Text>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text, marginTop: STEP.s1 }]}>
          {same
            ? `Bu deneme tahmini değiştirmedi: ${before}.`
            : `Bu deneme tahmini ${netWithCase(before, "ablative")} ${netWithCase(after, "dative")} ${verb}.`}
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4 },
  card: {},
});
