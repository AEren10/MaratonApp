import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { Button, StatBlock } from "../../components/design";
import RouteReadyStopRow from "./components/RouteReadyStopRow";
import RouteReadyFirstTask from "./components/RouteReadyFirstTask";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useRouteReadySummary } from "../../hooks/useRouteReadySummary";
import { SCREENS } from "../../constants/screens";
import { ROOT_STACK } from "../../navigation/routes";
import * as H from "../../lib/haptics";
import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { useExam } from "../../contexts/ExamContext";

export default function RouteReadyScreen() {
  // Seviye Testi sunucuya yazamadiysa notu buraya tasiyor (o ekran submit
  // sonrasi kapandigi icin orada gosterilemiyor).
  const syncPendingNote = useRoute().params?.syncPendingNote || null;
  const C = useC();
  const navigation = useNavigation();
  const [starting, setStarting] = useState(false);
  const { completeOnboarding } = useExam();
  const { daysUntilExam, targetNet, currentNet, stopCount, upcomingStops, firstStop, createRoute } =
    useRouteReadySummary();

  // Onboarding kok stack'ten cikiyor; StudyTimer MainTabs icindeki bir
  // yigina ait oldugundan dogrudan reset ile hedeflenmez (navigasyon
  // dosyalarina dokunma kurali). Bunun yerine MainTabs -> Roadmap sekmesine
  // donulur; ilk aksiyon orada zaten hazir bekliyor (useRoadmapNextAction).
  // ONBOARDING_COMPLETE huni olayi BURADA atiliyor. Onceden GoalSetup'ta
  // atiliyordu ama kurulum orada bitmiyor — tasarim dort adim tanimliyor ve
  // gercek tamamlanma noktasi burasi. GoalSetup'ta biraksaydik huni son iki
  // adimi hic gormezdi.
  const finishOnboarding = useCallback(async () => {
    track(EVENTS.ONBOARDING_COMPLETE, {
      daysUntilExam,
      stopCount,
      hasTargetNet: targetNet != null,
      hasBaselineNet: currentNet != null,
    });
    await completeOnboarding();
    navigation.reset({
      index: 0,
      routes: [{ name: ROOT_STACK.MAIN_TABS, params: { screen: SCREENS.ROADMAP } }],
    });
  }, [completeOnboarding, navigation, daysUntilExam, stopCount, targetNet, currentNet]);

  const handleStart = useCallback(async () => {
    setStarting(true);
    try {
      await createRoute();
      H.success();
    } catch {
      H.warn();
    } finally {
      setStarting(false);
      finishOnboarding().catch(() => {});
    }
  }, [createRoute, finishOnboarding]);

  const handleViewRoute = finishOnboarding;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.delay(60)}>
          <Text style={[TYPOGRAPHY.micro, styles.eyebrow, { color: C.accent }]}>ROTAN HAZIR</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(140)}>
          <StatBlock value={daysUntilExam ?? "—"} unit="gün" size="hero" />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={[TYPOGRAPHY.subheading, styles.headline, { color: C.text }]}>
            {stopCount > 0
              ? `${stopCount} durak, tek yol. Bugünden sınav gününe kadar.`
              : "Rotan tek yol. Bugünden sınav gününe kadar."}
          </Text>
        </Animated.View>

        {(currentNet != null || targetNet != null) && (
          <Animated.View entering={FadeInDown.delay(260)} style={styles.compareRow}>
            {currentNet != null && (
              <Text style={[TYPOGRAPHY.micro, { color: C.accent }]}>{`BUGÜN · ${currentNet.toFixed(2).replace(".", ",")}`}</Text>
            )}
            {targetNet != null && (
              <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>{`HEDEF · ${targetNet}`}</Text>
            )}
          </Animated.View>
        )}

        {upcomingStops.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320)} style={styles.stopList}>
            {upcomingStops.map((stop) => <RouteReadyStopRow key={stop.key} stop={stop} />)}
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
