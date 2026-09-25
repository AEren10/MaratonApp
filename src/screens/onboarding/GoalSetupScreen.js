import { View, Text, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Button } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TargetNetField } from "./components/TargetNetField";
import { MultiNetSection } from "./components/MultiNetSection";
import { DailyPaceField } from "./components/DailyPaceField";
import {
  useGoalSetupForm,
  TYT_NET_MIN,
  TYT_NET_MAX,
  LGS_NET_MIN,
  LGS_NET_MAX,
  DAILY_Q_MIN,
  DAILY_Q_MAX,
  DAILY_Q_STEP,
} from "./useGoalSetupForm";

// Tasarim: "Hedef Sec" — 4 adimlik kurulumun 2. adimi.
// YKS (TYT+AYT veya TYT+YDT) ogrencileri icin TYT ve AYT netleri
// ayri ayri secilir; toplam net otomatik toplanir.
// Gunluk soru hedefi max 500'e kadar yukseltilebilir.
function GoalSetupContent() {
  const C = useC();
  const {
    isMulti,
    secondLabel,
    tytNet,
    setTytNet,
    aytNet,
    setAytNet,
    singleNet,
    setSingleNet,
    totalNet,
    dailyQuestions,
    setDailyQuestions,
    hours,
    netLabel,
    finish,
    skipToHome,
    targetNetPendingNote,
    isLgs,
  } = useGoalSetupForm();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.progressRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i <= 1 ? C.accent : C.track }]}
          />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(80)}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>KURULUM</Text>
          <Text style={[TYPOGRAPHY.heading, { color: C.text, marginTop: STEP.s1 }]}>
            Hedef netin ne?
          </Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
            Sonra istediğin zaman değiştirebilirsin.
          </Text>
        </Animated.View>

        {isMulti ? (
          <MultiNetSection
            tytNet={tytNet}
            setTytNet={setTytNet}
            aytNet={aytNet}
            setAytNet={setAytNet}
            totalNet={totalNet}
            secondLabel={secondLabel}
          />
        ) : (
          <TargetNetField
            title="Hedef Net"
            value={singleNet}
            onChange={setSingleNet}
            netLabel={netLabel}
            min={isLgs ? LGS_NET_MIN : TYT_NET_MIN}
            max={isLgs ? LGS_NET_MAX : TYT_NET_MAX}
            size="large"
          />
        )}

        <DailyPaceField
          value={dailyQuestions}
          onChange={setDailyQuestions}
          hours={hours}
          min={DAILY_Q_MIN}
          max={DAILY_Q_MAX}
          step={DAILY_Q_STEP}
        />
      </ScrollView>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={finish} size="lg" fullWidth>
          Devam
        </Button>
        <Button
          onPress={skipToHome}
          variant="ghost"
          size="md"
          fullWidth
          style={styles.skipBtn}
        >
          Şimdilik atla, ana sayfaya git
        </Button>
        {targetNetPendingNote ? (
          <Text style={[TYPOGRAPHY.micro, styles.pendingNote, { color: C.text3 }]}>
            {targetNetPendingNote}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default function GoalSetupScreen() {
  return (
    <ScreenErrorBoundary>
      <GoalSetupContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  segment:     { flex: 1, height: 3, borderRadius: 1.5 },
  scroll:      { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  cta:         { paddingTop: STEP.s2, paddingHorizontal: GUTTER, paddingBottom: STEP.s2, borderTopWidth: 1 },
  skipBtn:     { marginTop: STEP.s1 },
  pendingNote: { marginTop: STEP.s1, textAlign: "center" },
});
