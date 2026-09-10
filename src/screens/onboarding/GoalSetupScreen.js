import { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import { TYPOGRAPHY, SPACING, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Button } from "../../components/design";
import { GoalSlider } from "./components/GoalSlider";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import { requestNotificationPermissions, applyNotifPrefs, getNotifPrefs, ensurePushTokenRegistered } from "../../lib/notifications";
import * as H from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";

const MIN_Q = 20;
const MAX_Q = 200;
const SLIDER_STEP = 5;

function estimateHours(q) {
  const h = q / 50;
  return h % 1 === 0 ? `${h}` : h.toFixed(1);
}

export default function GoalSetupScreen() {
  const C = useC();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { updateGoal } = useExam();
  const [dailyQuestions, setDailyQuestions] = useState(80);

  const trackWidth = width - GUTTER * 2 - SPACING.sm * 2;
  const hours = useMemo(() => estimateHours(dailyQuestions), [dailyQuestions]);

  const finish = useCallback(async () => {
    H.success();
    const goals = { dailyQuestions, weeklyTrials: 2, weeklyMinutes: 1200 };
    dispatch(setGoals(goals));
    saveGoalsToStorage(goals).catch(() => {});
    updateGoal(dailyQuestions).catch(() => {});

    requestNotificationPermissions().then(async (granted) => {
      if (granted) {
        const prefs = await getNotifPrefs();
        await applyNotifPrefs(prefs);
        // İzin verildiği AN token'ı kaydet. Aksi halde sunucu tarafındaki
        // re-engagement push'u yeni kullanıcıya hiç ulaşmıyor: loadAll bu
        // noktadan önce çalışmış ve izin yokken token null dönmüş oluyor.
        await ensurePushTokenRegistered(user?.id);
      }
    }).catch(() => {});

    // Kurulum BURADA BITMIYOR. Tasarim AKIS 12 dort adim:
    // Karsilama -> Hedef Sec -> Seviye Testi -> Rota Hazir.
    // Onceden burada MAIN_TABS'a reset ediliyordu, yani son iki adima
    // hic ulasilmiyordu. ONBOARDING_COMPLETE olayi da buradan kaldirildi:
    // kurulum gercekten Rota Hazir'da tamamlaniyor.
    navigation.navigate(SCREENS.LEVEL_TEST);
  }, [dailyQuestions, dispatch, updateGoal, navigation, user?.id]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Tasarim dort adim gosteriyor ("2 / 4"); bu ikinci adim. */}
      <View style={styles.progressRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.segment, { backgroundColor: i <= 1 ? C.accent : C.track }]}
          />
        ))}
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(100)}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GÜNLÜK TEMPO</Text>
          <Text style={[styles.title, { color: C.text }]}>Günlük hedefin?</Text>
          <Text style={[styles.subtitle, { color: C.text3 }]}>
            Sonra istediğin zaman değiştirebilirsin.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.center}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
            <Text style={[styles.bigNumber, { color: C.text }]}>{dailyQuestions}</Text>
            <Text style={[styles.unit, { color: C.text2 }]}>soru</Text>
          </View>
          <Text style={[styles.estimate, { color: C.text3 }]}>
            {`günde ~${hours} saat çalışma`}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.sliderWrap}>
          <GoalSlider
            value={dailyQuestions}
            onChange={setDailyQuestions}
            C={C}
            trackWidth={trackWidth}
            min={MIN_Q}
            max={MAX_Q}
            step={SLIDER_STEP}
          />
          <View style={styles.rangeRow}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{MIN_Q}</Text>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{MAX_Q}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.cta, { borderTopColor: C.line }]}>
        <Button onPress={finish} size="lg" fullWidth>
          Maraton'a Başla
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  segment:    { flex: 1, height: 3, borderRadius: 1.5 },
  content:    { flex: 1, paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: SPACING.md },
  title:      { fontFamily: "Bricolage_400", fontSize: 26, letterSpacing: -0.6, marginTop: STEP.s1 },
  subtitle:   { fontFamily: "Archivo_400", fontSize: 14, lineHeight: 20, marginTop: STEP.s1 },
  center:     { flex: 1, alignItems: "center", justifyContent: "center" },
  bigNumber:  { ...TYPOGRAPHY.statLarge, fontSize: 88, letterSpacing: -4, lineHeight: 88 },
  unit:       { fontFamily: "Bricolage_400", fontSize: 20, lineHeight: 26 },
  estimate:   { fontFamily: "Archivo_500", fontSize: 13, lineHeight: 18, marginTop: STEP.s1 },
  sliderWrap: { paddingHorizontal: SPACING.sm, marginTop: STEP.s4, marginBottom: STEP.s3 },
  rangeRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s1 },
  cta:        { paddingTop: STEP.s2, paddingHorizontal: GUTTER, paddingBottom: STEP.s2, borderTopWidth: 1 },
});
