import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { ErrorState } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { dayMonthLabel } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { RecordHeader } from "./RecordHeader";

function CloudIcon({ C }) {
  return (
    <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
      <Path d="M20 46a12 12 0 0 1 1.6-23.9 16 16 0 0 1 30.2 3.3A11 11 0 0 1 52 46H20Z" stroke={C.text4} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M36 40v16" stroke={C.warn} strokeWidth={2} strokeLinecap="round" />
      <Path d="M30 50l6 6 6-6" stroke={C.warn} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// "Oturum Kaydedilemedi" artboardi: bekleyen oturum karti + ErrorState preset + kuyruk satiri.
export function UnsavedSessionView({ unsaved, onBack }) {
  const C = useC();
  const { pending, queue } = unsaved;
  const headline = [`${pending.minutes} dk`, pending.questions ? `${pending.questions} soru` : null].filter(Boolean).join(" · ");
  const meta = [pending.topic, [dayMonthLabel(pending.studyDate), pending.clock].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  const queueText = [
    queue.sessions ? `Kuyrukta ${queue.sessions} oturum` : null,
    queue.notebook ? `${queue.notebook} defter kaydı` : null,
  ].filter(Boolean).join(", ");

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.fill, { backgroundColor: C.bg }]}>
      <RecordHeader title="Oturum" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>KAYDEDİLMEYİ BEKLEYEN OTURUM</Text>
          <Text style={[TYPOGRAPHY.statSmall, styles.headline, { color: C.text }]}>{headline}</Text>
          {meta ? <Text style={[TYPOGRAPHY.meta, styles.meta, { color: C.text3 }]}>{meta}</Text> : null}
        </Animated.View>
        <Animated.View style={styles.state}>
          <CloudIcon C={C} />
          <ErrorState
            preset="sessionUnsaved"
            onPrimary={unsaved.retry}
            onSecondary={unsaved.later}
            style={styles.error}
          />
        </Animated.View>
      </ScrollView>
      {queueText ? (
        <View style={[styles.queue, { backgroundColor: C.void, borderColor: C.elev }]}>
          <View style={[styles.dot, { backgroundColor: C.warn }]} />
          <Text style={[TYPOGRAPHY.meta, styles.fill, { color: C.text2 }]}>{queueText}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 6, paddingBottom: STEP.s4 },
  card: { padding: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  headline: { marginTop: STEP.s2, fontSize: TYPOGRAPHY.heading.fontSize + 2, lineHeight: TYPOGRAPHY.heading.lineHeight + 2 },
  meta: { marginTop: STEP.s1 },
  state: { alignItems: "stretch", paddingTop: STEP.s4 - 4 },
  error: { paddingTop: STEP.s3 },
  queue: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2, marginHorizontal: GUTTER, marginBottom: STEP.s2,
    paddingVertical: STEP.s2 + 3, paddingHorizontal: STEP.s3 - 2, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  dot: { width: 9, height: 9, borderRadius: SHAPE.chip / 6 },
});
