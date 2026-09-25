import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { StatBlock } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function StudySummaryHero({ C, duration, subjectColor, subjectLabel, topic, questions, wrongCount }) {
  return (
    <>
      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s2 }]}>Rota ilerledi</Text>
      </Animated.View>

      <Animated.View style={{ marginTop: STEP.s2 }}>
        <StatBlock value={String(duration)} unit="dakikalık çalışma tamamlandı" size="large" />
      </Animated.View>

      <Animated.View style={styles.metaRow}>
        <View style={[styles.dot, { backgroundColor: subjectColor }]} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]} numberOfLines={1}>
          {subjectLabel}{topic ? ` · ${topic}` : ""}{questions > 0 ? ` · ${questions} soru · ${wrongCount} yanlış` : ""}
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s2 },
  dot: { width: 7, height: 7, borderRadius: 1 },
});
