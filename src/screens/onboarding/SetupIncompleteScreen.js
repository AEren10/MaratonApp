import { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Button, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { SetupProgressList } from "./components/SetupProgressList";
import { useSetupProgress } from "../../hooks/useSetupProgress";
import { ROOT_STACK } from "../../navigation/routes";
import * as H from "../../lib/haptics";
import { useAuth } from "../../contexts/AuthContext";
import { firstNameOf } from "../../lib/displayName";

function SetupIncompleteContent() {
  const C = useC();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { steps, doneCount, totalSteps, nextStep, loading } = useSetupProgress();

  const handleContinue = useCallback(() => {
    H.tap();
    if (!nextStep) {
      navigation.reset({ index: 0, routes: [{ name: ROOT_STACK.MAIN_TABS }] });
      return;
    }
    navigation.navigate(nextStep.screen);
  }, [navigation, nextStep]);

  const goHome = useCallback(() => {
    H.tap();
    navigation.reset({ index: 0, routes: [{ name: ROOT_STACK.MAIN_TABS }] });
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ paddingHorizontal: GUTTER, paddingTop: STEP.s4, gap: STEP.s2 }}>
          <Skeleton height={16} width={140} />
          <Skeleton height={34} width={260} />
          <Skeleton height={200} style={{ marginTop: STEP.s3 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(80)}>
          <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>
            {`HOŞ GELDİN ${firstNameOf(user).toLocaleUpperCase("tr-TR")}`}
          </Text>
          <Text style={[styles.title, { color: C.text }]}>Kaldığın yerden devam edelim.</Text>
          {nextStep ? (
            <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
              Sınavını seçmişsin ama hedefini belirlememişsin. Rotan hedef olmadan çizilemiyor.
            </Text>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160)} style={{ marginTop: STEP.s4 }}>
          <View style={styles.progressRow}>
            {steps.map((s) => (
              <View
                key={s.key}
                style={[styles.segment, { backgroundColor: s.done ? C.accent : C.track }]}
              />
            ))}
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>KURULUM</Text>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{`${doneCount} / ${totalSteps}`}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220)} style={{ marginTop: STEP.s3 }}>
          <SetupProgressList steps={steps} nextStepKey={nextStep?.key} />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(280)} style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={handleContinue} size="lg" fullWidth>
          Kurulumu tamamla
        </Button>
        <Button onPress={goHome} variant="ghost" size="md" fullWidth style={{ marginTop: STEP.s1 }}>
          Şimdi değil, ana sayfaya git
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

export default function SetupIncompleteScreen() {
  return (
    <ScreenErrorBoundary>
      <SetupIncompleteContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  title: { ...TYPOGRAPHY.heading, marginTop: STEP.s2 },
  progressRow: { flexDirection: "row", gap: STEP.s1 },
  segment: { flex: 1, height: 3, borderRadius: 1.5 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
  cta: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s2, borderTopWidth: 1 },
});
