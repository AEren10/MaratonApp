import { Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function TrialDetailRouteImpact({ C, routeImpact }) {
  if (!routeImpact) return null;
  const { before, after } = routeImpact;
  const verb = after >= before ? "çıkardı" : "düşürdü";
  return (
    <Animated.View entering={FadeInDown.delay(260).duration(420)} style={styles.wrap}>
      <Card tone="tint" style={[styles.card, { borderWidth: 1, borderColor: C.border }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>ROTAYA ETKİSİ</Text>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text, marginTop: STEP.s1 }]}>
          Bu deneme tahmini {before}'den {after}'e {verb}.
        </Text>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4 },
  card: {},
});
