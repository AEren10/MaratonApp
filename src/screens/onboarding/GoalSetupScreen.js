import { View, Text, ScrollView, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Button, Icon, Press } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TargetNetField } from "./components/TargetNetField";
import { MultiNetSection } from "./components/MultiNetSection";
import { DailyPaceField } from "./components/DailyPaceField";
import {
import { SetupRouteSteps } from "../../components/route/SetupRouteSteps";
  useGoalSetupForm, TYT_NET_MIN, TYT_NET_MAX, LGS_NET_MIN, LGS_NET_MAX,
  DAILY_Q_MIN, DAILY_Q_MAX, DAILY_Q_STEP,
} from "./useGoalSetupForm";

function GoalSetupContent() {
  const C = useC();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const {
    isMulti, secondLabel, tytNet, setTytNet, aytNet, setAytNet, singleNet, setSingleNet,
    totalNet, dailyQuestions, setDailyQuestions, hours, netLabel, finish, skipToHome,
    targetNetPendingNote, isLgs,
  } = useGoalSetupForm();

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
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Hedef Belirleme</Text>
        <View style={styles.backBtn} />
      </View>

      <SetupRouteSteps current={2} />

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
        <Press
          onPress={skipToHome}
          hitSlop={8}
          style={styles.skipBtn}
          accessibilityRole="button"
          accessibilityLabel="Şimdilik atla, ana sayfaya git"
        >
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2, textAlign: "center" }]}>
            Şimdilik atla, ana sayfaya git
          </Text>
        </Press>
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
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingVertical: STEP.s1, minHeight: CONTROL.tapMin },
  backBtn:     { width: CONTROL.tapMin, minHeight: CONTROL.tapMin, justifyContent: "center" },
  scroll:      { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 },
  cta:         { paddingTop: STEP.s2, paddingHorizontal: GUTTER, paddingBottom: STEP.s2, borderTopWidth: 1 },
  skipBtn:     { marginTop: STEP.s1, minHeight: CONTROL.tapMin, justifyContent: "center", alignItems: "center" },
  pendingNote: { marginTop: STEP.s1, textAlign: "center" },
});
