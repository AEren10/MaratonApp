import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button, StatBlock } from "../../components/design";
import RouteReadyStopRow from "./components/RouteReadyStopRow";
import RouteReadyFirstTask from "./components/RouteReadyFirstTask";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useRouteReadySummary } from "../../hooks/useRouteReadySummary";
import * as H from "../../lib/haptics";
import { useFinishOnboarding } from "../../hooks/useFinishOnboarding";
import { useAlert } from "../../contexts/AlertContext";
import { SCREENS } from "../../constants/screens";
import { routeActionTimerParams } from "../../domain/route/routeStartAction";

export default function RouteReadyScreen() {
  const syncPendingNote = useRoute().params?.syncPendingNote || null;
  const C = useC();
  const [starting, setStarting] = useState(false);
  const { finish } = useFinishOnboarding();
  const showAlert = useAlert();
  const { daysUntilExam, targetNet, currentNet, stopCount, upcomingStops, firstStop, firstStopAction, createRoute } =
    useRouteReadySummary();

  const finishOnboarding = useCallback((options = {}) => finish({
    daysUntilExam,
    stopCount,
    hasTargetNet: targetNet != null,
    hasBaselineNet: currentNet != null,
  }, options), [finish, daysUntilExam, stopCount, targetNet, currentNet]);

  // Rota kurulamadiysa kurulum BITMEZ: rotasiz iceri alinan kullanici hem
  // bos bir uygulama goruyor hem de neyin ters gittigini ogrenemiyordu.
  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      await createRoute();
    } catch {
      H.warn();
      setStarting(false);
      showAlert(
        "Rotan oluşturulamadı",
        "Bağlantını kontrol edip tekrar dener misin? Verdiğin bilgiler duruyor.",
      );
      return;
    }
    H.success();
    setStarting(false);
    const params = routeActionTimerParams(firstStopAction);
    finishOnboarding(params ? { then: { screen: SCREENS.STUDY_TIMER, params } } : {}).catch(() => {});
  }, [createRoute, finishOnboarding, firstStopAction, showAlert]);

  // Ikinci buton rotanin tamamina goturur. Varsayilan inis Ana Sayfa oldugu
  // icin Rota Detay'i acikca istemek gerekiyor.
  const handleViewRoute = useCallback(
    () => finishOnboarding({ screen: SCREENS.ROADMAP }),
    [finishOnboarding],
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.delay(60)}>
          <Text style={[TYPOGRAPHY.micro, styles.eyebrow, { color: C.accent }]}>ROTAN HAZIR</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(140)}>
          <StatBlock value={daysUntilExam ?? "-"} unit="gün" size="hero" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[TYPOGRAPHY.subheading, styles.headline, { color: C.text }]}>
            {stopCount > 0
              ? `${stopCount} durak, tek yol. Bugünden sınav gününe kadar.`
              : "Rotan tek yol. Bugünden sınav gününe kadar."}
          </Text>
        </Animated.View>

        {targetNet != null && currentNet != null ? (
          <Animated.View entering={FadeInDown.delay(260)} style={styles.compareRow}>
            <View>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>BUGÜN</Text>
              <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: 4 }]}>{currentNet}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>HEDEF</Text>
              <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: 4 }]}>{targetNet}</Text>
            </View>
          </Animated.View>
        ) : null}

        {upcomingStops.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320)} style={styles.stopList}>
            {upcomingStops.map((stop) => (
              <RouteReadyStopRow key={stop.key} stop={stop} />
            ))}
          </Animated.View>
        )}

        {firstStop && (
          <Animated.View entering={FadeInDown.delay(380)} style={styles.taskBlock}>
            <RouteReadyFirstTask task={firstStop} />
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <Button onPress={handleStart} size="lg" fullWidth loading={starting} disabled={!firstStop}>
          İlk durağa başla
        </Button>
        {syncPendingNote ? (
          <Text style={[TYPOGRAPHY.micro, styles.pendingNote, { color: C.text3 }]}>
            {syncPendingNote}
          </Text>
        ) : null}
        <Button onPress={handleViewRoute} variant="outline" size="md" fullWidth style={styles.secondaryBtn}>
          Rotanın tamamını gör
        </Button>
        <Text style={[TYPOGRAPHY.caption, styles.footnote, { color: C.text3 }]}>
          Rotanı her zaman değiştirebilirsin. Deneme girdikçe kendini de günceller.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s4 },
  eyebrow: { letterSpacing: 2.6 },
  headline: { marginTop: STEP.s2, maxWidth: 300 },
  compareRow: { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s3 },
  stopList: { marginTop: STEP.s3 },
  taskBlock: { marginTop: STEP.s3, marginBottom: STEP.s2 },
  cta: { paddingHorizontal: GUTTER, paddingBottom: STEP.s2, paddingTop: STEP.s1 },
  secondaryBtn: { marginTop: STEP.s1 },
  pendingNote:  { marginTop: STEP.s1, textAlign: "center" },
  footnote: { marginTop: STEP.s2, textAlign: "center" },
});
