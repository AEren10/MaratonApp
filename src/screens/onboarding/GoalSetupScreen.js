import { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from "react-native";
import Animated, {
  FadeIn, FadeInDown,
  useSharedValue, useAnimatedStyle, runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";

import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import { requestNotificationPermissions, applyNotifPrefs, getNotifPrefs } from "../../lib/notifications";
import * as H from "../../lib/haptics";

const MIN_Q = 20;
const MAX_Q = 200;
const STEP = 5;
const THUMB_R = 14;
const TRACK_H = 6;

function snap(val) {
  return Math.round(val / STEP) * STEP;
}

function estimateHours(q) {
  const h = q / 50;
  return h % 1 === 0 ? `${h}` : h.toFixed(1);
}

function GoalSlider({ value, onChange, C, trackWidth }) {
  const pct = (value - MIN_Q) / (MAX_Q - MIN_Q);
  const thumbX = useSharedValue(pct * trackWidth);
  const startX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => { startX.value = thumbX.value; })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackWidth, startX.value + e.translationX));
      thumbX.value = nx;
      const raw = MIN_Q + (nx / trackWidth) * (MAX_Q - MIN_Q);
      const snapped = Math.max(MIN_Q, Math.min(MAX_Q, snap(raw)));
      runOnJS(onChange)(snapped);
    })
    .onEnd(() => {
      const raw = MIN_Q + (thumbX.value / trackWidth) * (MAX_Q - MIN_Q);
      const snapped = Math.max(MIN_Q, Math.min(MAX_Q, snap(raw)));
      thumbX.value = ((snapped - MIN_Q) / (MAX_Q - MIN_Q)) * trackWidth;
      runOnJS(H.select)();
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - THUMB_R }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: thumbX.value,
  }));

  const hitArea = THUMB_R * 2 + 20;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.trackWrap, { height: hitArea }]}>
        <View style={[styles.trackBg, { backgroundColor: C.surface2, width: trackWidth }]}>
          <Animated.View style={[styles.trackFill, { backgroundColor: C.accent }, fillStyle]} />
        </View>
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: C.text, shadowColor: C.accent, left: 0, top: (hitArea - THUMB_R * 2) / 2 },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

export default function GoalSetupScreen() {
  const C = useC();
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { updateGoal } = useExam();
  const [dailyQuestions, setDailyQuestions] = useState(80);

  const trackWidth = width - 24 * 2 - SPACING.sm * 2;
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
      }
    }).catch(() => {});

    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  }, [dailyQuestions, dispatch, updateGoal, navigation]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(100)}>
          <Text style={[styles.stepLabel, { color: C.accent }]}>ADIM 2 / 2</Text>
          <Text style={[styles.title, { color: C.text }]}>Günlük hedefin?</Text>
          <Text style={[styles.subtitle, { color: C.muted }]}>
            Sonra istediğin zaman değiştirebilirsin.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.center}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
            <Text style={[styles.bigNumber, { color: C.text }]}>{dailyQuestions}</Text>
            <Text style={[styles.unit, { color: C.sec }]}>soru</Text>
          </View>
          <Text style={[styles.estimate, { color: C.muted }]}>
            {`günde ~${hours} saat çalışma`}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.sliderWrap}>
          <GoalSlider
            value={dailyQuestions}
            onChange={setDailyQuestions}
            C={C}
            trackWidth={trackWidth}
          />
          <View style={styles.rangeRow}>
            <Text style={[styles.rangeLabel, { color: C.muted }]}>{MIN_Q}</Text>
            <Text style={[styles.rangeLabel, { color: C.muted }]}>{MAX_Q}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.cta, { borderTopColor: C.border }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={finish}
          style={[styles.ctaButton, { backgroundColor: C.accent }]}
        >
          <Text style={[styles.ctaText, { color: C.textOnFill }]}>Maraton'a Başla</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content:    { flex: 1, paddingHorizontal: 24, paddingTop: 36, paddingBottom: 16 },
  stepLabel:  { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" },
  title:      { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, letterSpacing: -0.6, marginTop: 10 },
  subtitle:   { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20, marginTop: 6 },
  center:     { flex: 1, alignItems: "center", justifyContent: "center" },
  bigNumber:  { fontFamily: "SpaceGrotesk_700Bold", fontSize: 88, letterSpacing: -4, lineHeight: 88 },
  unit:       { fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 20, lineHeight: 26 },
  estimate:   { fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 18, marginTop: 10 },
  sliderWrap: { paddingHorizontal: SPACING.sm, marginTop: 40, marginBottom: SPACING.xl },
  rangeRow:   { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  rangeLabel: { fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 14 },
  trackWrap:  { justifyContent: "center" },
  trackBg:    { height: TRACK_H, borderRadius: TRACK_H / 2, overflow: "hidden" },
  trackFill:  { height: TRACK_H, borderRadius: TRACK_H / 2 },
  thumb:      {
    position: "absolute",
    width: THUMB_R * 2, height: THUMB_R * 2, borderRadius: THUMB_R,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  cta:        { paddingTop: 13, paddingHorizontal: 24, paddingBottom: 20 },
  ctaButton:  { paddingVertical: 17, borderRadius: RADIUS.lg, alignItems: "center" },
  ctaText:    { fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 20 },
});
