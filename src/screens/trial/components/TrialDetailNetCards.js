import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Card, StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function TrialDetailNetCards({ C, rawNet, normalizedNet, hasNormalization, publisherLabel, difficultyMultiplier }) {
  return (
    <Animated.View entering={FadeInDown.delay(70).duration(420)} style={styles.wrap}>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>HAM NET</Text>
          <StatBlock value={rawNet.toFixed(2).replace(".", ",")} size="value" style={{ marginTop: STEP.s1 }} />
        </Card>
        <Card style={[styles.card, hasNormalization && { borderColor: C.accent }]}>
          <Text style={[TYPOGRAPHY.label, { color: hasNormalization ? C.accentBright : C.text3 }]}>
            NORMALİZE
          </Text>
          <StatBlock value={normalizedNet.toFixed(2).replace(".", ",")} size="value" style={{ marginTop: STEP.s1 }} />
        </Card>
      </View>

      {hasNormalization ? (
        <>
          <Card tone="surface" style={styles.coeffRow}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, flex: 1 }]}>
              {publisherLabel} zorluk katsayısı
            </Text>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>
              {difficultyMultiplier.toFixed(2).replace(".", ",")}
            </Text>
          </Card>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 }]}>
            Rota hesabında normalize net kullanılır. Yayın kolay çıkarsa katsayı düşer.
          </Text>
        </>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: STEP.s3, marginTop: STEP.s4 },
  row: { flexDirection: "row", gap: STEP.s1 },
  card: { flex: 1 },
  coeffRow: {
    flexDirection: "row", alignItems: "center",
    marginTop: STEP.s2, paddingVertical: STEP.s1 + 6,
  },
});
