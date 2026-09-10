import { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Icon, Button, Card, StatBlock } from "../../components/design";
import LevelTestSubjectRow from "./components/LevelTestSubjectRow";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useLevelTestForm } from "../../hooks/useLevelTestForm";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";
import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";

export default function LevelTestScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { daysUntilExam } = useExam();
  const { subjects, values, setSubjectNet, hasAnyEntry, totalNet, targetNet, gapMonths, saving, submit } =
    useLevelTestForm();
  const { threshold } = useStudyRoute({ persist: false });

  const gap = targetNet != null ? threshold(totalNet, targetNet) : null;
  const months = gapMonths(daysUntilExam);

  const goNext = useCallback(() => navigation.navigate(SCREENS.ROUTE_READY), [navigation]);

  const handleContinue = useCallback(() => {
    H.tap();
    submit(goNext);
  }, [submit, goNext]);

  // Atlamak da bir sinyal: kullanicinin elinde deneme yok demek, rota
  // baslangic noktasi olmadan ciziliyor. Huni bunu gormeli.
  const handleSkip = useCallback(() => {
    H.select();
    track(EVENTS.LEVEL_TEST_SKIPPED);
    goNext();
  }, [goNext]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>3 / 4</Text>
      </View>
      <View style={styles.progressRow}>
        <View style={[styles.segment, { backgroundColor: C.accent }]} />
        <View style={[styles.segment, { backgroundColor: C.accent }]} />
        <View style={[styles.segment, { backgroundColor: C.accent }]} />
        <View style={[styles.segment, { backgroundColor: C.track }]} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.delay(80)}>
          <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Şu an neredesin?</Text>
          <Text style={[TYPOGRAPHY.body, styles.subtitle, { color: C.text3 }]}>
            Son denemeni gir, rotanın başlangıç noktasını oradan çizelim. Denemen yoksa atlayabilirsin.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160)} style={styles.list}>
          {subjects.map((subject) => (
            <LevelTestSubjectRow
              key={subject.key}
              subject={subject}
              value={values[subject.key]}
              onChangeText={(text) => setSubjectNet(subject.key, text)}
            />
          ))}
        </Animated.View>

        {hasAnyEntry && (
          <Animated.View entering={FadeInDown.delay(220)}>
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHead}>
                <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BAŞLANGIÇ</Text>
                <StatBlock value={totalNet.toFixed(2).replace(".", ",")} size="value" />
              </View>
              {gap && !gap.reached && months != null && (
                <Text style={[TYPOGRAPHY.caption, styles.gapText, { color: C.text3 }]}>
                  {`Hedefe ${gap.gap.toFixed(2).replace(".", ",")} net var. Bu mesafe ${months} aylık bir rota demek.`}
                </Text>
              )}
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <Button onPress={handleContinue} size="lg" fullWidth loading={saving} disabled={!hasAnyEntry}>
          Devam
        </Button>
        <Pressable onPress={handleSkip} hitSlop={8} style={styles.skip}>
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Denemem yok, atla</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: GUTTER, paddingTop: STEP.s1,
  },
  progressRow: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  segment: { flex: 1, height: 3, borderRadius: 1.5 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s3 },
  subtitle: { marginTop: STEP.s1, maxWidth: 300 },
  list: { gap: STEP.s1, marginTop: STEP.s3 },
  summaryCard: { marginTop: STEP.s3 },
  summaryHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  gapText: { marginTop: STEP.s1 },
  cta: { paddingHorizontal: GUTTER, paddingBottom: STEP.s2 },
  skip: { alignItems: "center", marginTop: STEP.s3, minHeight: 44, justifyContent: "center" },
});
