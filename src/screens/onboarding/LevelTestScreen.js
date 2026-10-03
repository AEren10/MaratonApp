import { useCallback } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon, Button, StatBlock, Press } from "../../components/design";
import LevelTestSubjectRow from "./components/LevelTestSubjectRow";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useLevelTestForm } from "../../hooks/useLevelTestForm";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";
import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { SetupRouteSteps } from "../../components/route/SetupRouteSteps";

export default function LevelTestScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { daysUntilExam, markLevelTestDone } = useExam();
  const {
    subjects, values, setSubjectNet, hasAnyEntry, totalNet, targetNet,
    gapMonths, saving, submit,
  } = useLevelTestForm();
  const { threshold } = useStudyRoute({ persist: false });

  const gap = targetNet != null ? threshold(totalNet, targetNet) : null;
  const months = gapMonths(daysUntilExam);

  const goNext = useCallback(
    (result) => navigation.navigate(SCREENS.ROUTE_READY, { syncPendingNote: result?.syncPendingNote || undefined }),
    [navigation],
  );

  const handleContinue = useCallback(() => {
    H.tap();
    submit(goNext);
  }, [submit, goNext]);

  const handleSkip = useCallback(() => {
    if (saving) return;
    H.select();
    track(EVENTS.LEVEL_TEST_SKIPPED);
    markLevelTestDone({ skipped: true }).catch(() => {});
    goNext(null);
  }, [goNext, markLevelTestDone, saving]);

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        {canGoBack ? (
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" style={styles.backBtn}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Seviye Belirleme</Text>
        <View style={styles.backBtn} />
      </View>

      <SetupRouteSteps current={3} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.delay(80)}>
          <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Şu an neredesin?</Text>
          <Text style={[TYPOGRAPHY.body, styles.subtitle, { color: C.text3 }]}>
            Son denemeni gir, rotanın başlangıç noktasını oradan çizelim. Denemen yoksa atlayabilirsin.
          </Text>
        </Animated.View>

        <Animated.View style={styles.list}>
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
          <Animated.View style={[styles.summaryGround, { borderTopColor: C.line }]}>
            <View style={styles.summaryHead}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BAŞLANGIÇ</Text>
              <StatBlock value={totalNet.toFixed(2).replace(".", ",")} size="value" />
            </View>
            {gap && !gap.reached && months != null && (
              <Text style={[TYPOGRAPHY.caption, styles.gapText, { color: C.text3 }]}>
                {`Hedefe ${gap.gap.toFixed(2).replace(".", ",")} net var. Bu mesafe ${months} aylık bir rota demek.`}
              </Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={handleContinue} size="lg" fullWidth loading={saving} disabled={!hasAnyEntry}>
          Devam
        </Button>
        <Press haptic="none" onPress={handleSkip} hitSlop={8} style={styles.skip} accessibilityRole="button">
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>Denemem yok, atla</Text>
        </Press>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingVertical: STEP.s1, minHeight: CONTROL.tapMin },
  backBtn: { width: CONTROL.tapMin, minHeight: CONTROL.tapMin, justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s3 },
  subtitle: { marginTop: STEP.s1, maxWidth: 300 },
  list: { gap: STEP.s1, marginTop: STEP.s3 },
  summaryGround: { marginTop: STEP.s3, paddingTop: STEP.s3, borderTopWidth: 1 },
  summaryHead: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  gapText: { marginTop: STEP.s1 },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2, borderTopWidth: 1 },
  skip: { alignItems: "center", marginTop: STEP.s1, minHeight: CONTROL.tapMin, justifyContent: "center" },
});
