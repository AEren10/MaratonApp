import { useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { useSelector } from "react-redux";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

import * as H from "../../lib/haptics";
import { Icon, Spot } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { selectDailyQuestionsGoal } from "../../store/slices/goalsSlice";
import { XP_REWARDS } from "../../constants/gamification";
import { usePaywallTrigger } from "../../hooks/usePaywallTrigger";
import { useInAppReview } from "../../hooks/useInAppReview";

export default function StudySummaryScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();

  const {
    subjectLabel = "Çalışma",
    subjectColor = C.accent,
    subjectIcon = "bookOpen",
    topic = "",
    duration = 0,
    questions = 0,
  } = route.params ?? {};

  const streak = useSelector((state) => state.studyLog.streak);
  const todayLogs = useSelector((state) => state.studyLog.todayLogs);
  const dailyGoal = useSelector(selectDailyQuestionsGoal);

  const todaySolved = useMemo(
    () => todayLogs.reduce((sum, l) => sum + (l.questionCount || 0), 0),
    [todayLogs],
  );
  const todayMinutes = useMemo(
    () => todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0),
    [todayLogs],
  );

  const xpEarned = useMemo(() => {
    let xp = Math.floor(duration / 15) * XP_REWARDS.study_15min;
    xp += questions * XP_REWARDS.question_solved;
    return xp;
  }, [duration, questions]);

  const { incrementAndCheck, showDelayedPaywall, cleanup } = usePaywallTrigger();
  const { maybeRequestReview } = useInAppReview();

  useEffect(() => {
    H.success();
    incrementAndCheck().then((shouldShowPaywall) => {
      if (shouldShowPaywall) {
        showDelayedPaywall(2000);
      } else {
        setTimeout(() => maybeRequestReview(), 2500);
      }
    });
    return cleanup;
  }, []);

  const safeGoal = dailyGoal > 0 ? dailyGoal : 100;
  const goalPct = Math.min(todaySolved / safeGoal, 1);
  const goalReached = todaySolved >= safeGoal;

  const dismiss = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTabs", state: { routes: [{ name: SCREENS.HOME }] } }],
      }),
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.container}>
        {/* Success icon */}
        <Animated.View entering={ZoomIn.delay(100).springify()} style={[s.successCircle, { backgroundColor: subjectColor + "20" }]}>
          <View style={[s.successInner, { backgroundColor: subjectColor }]}>
            <Icon name="check" size={36} color="#FFFFFF" sw={3} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text entering={FadeInUp.delay(200)} style={s.title}>
          Harika!
        </Animated.Text>
        <Animated.View entering={FadeInUp.delay(250)} style={s.topicRow}>
          <View style={[s.dot, { backgroundColor: subjectColor }]} />
          <Text style={s.topicText}>{subjectLabel}{topic ? ` · ${topic}` : ""}</Text>
        </Animated.View>

        {/* Stats grid */}
        <Animated.View entering={FadeInDown.delay(350)} style={s.statsGrid}>
          <StatBox icon="clock" label="Süre" value={`${duration} dk`} color={C.purple} C={C} />
          <StatBox icon="hash" label="Soru" value={String(questions)} color={C.orange} C={C} />
          <StatBox icon="zap" label="XP" value={`+${xpEarned}`} color={C.amber} C={C} />
          <StatBox icon="activity" label="Streak" value={`${streak} gün`} color={C.green} C={C} />
        </Animated.View>

        {/* Daily goal progress */}
        <Animated.View entering={FadeInDown.delay(450)} style={s.goalCard}>
          <View style={s.goalHeader}>
            <Text style={s.goalLabel}>Günlük Hedef</Text>
            <Text style={[s.goalCount, { color: goalReached ? C.green : C.text }]}>
              {todaySolved}/{safeGoal} soru
            </Text>
          </View>
          <View style={s.goalBarBg}>
            <View style={[s.goalBarFill, { width: `${goalPct * 100}%`, backgroundColor: goalReached ? C.green : C.accent }]} />
          </View>
          {goalReached && (
            <Animated.View entering={ZoomIn.delay(550).springify()} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: SPACING.sm }}>
              <Spot name="trophy" size={40} color={C.green} />
              <Text style={[s.goalDone, { color: C.green, marginTop: 0 }]}>Hedefini tamamladın!</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Today totals */}
        <Animated.View entering={FadeInDown.delay(500)} style={s.todayRow}>
          <Text style={s.todayLabel}>Bugün toplam</Text>
          <Text style={s.todayValue}>{todayMinutes} dk · {todaySolved} soru</Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Dismiss button */}
        <Animated.View entering={FadeInDown.delay(600)} style={{ width: "100%" }}>
          <Pressable onPress={dismiss} style={({ pressed }) => [s.btn, { backgroundColor: subjectColor, opacity: pressed ? 0.9 : 1 }]}>
            <Text style={s.btnText}>Devam Et</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, color, C }) {
  return (
    <View style={{
      flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.md, alignItems: "center", gap: 6,
      borderWidth: 1, borderColor: C.border,
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 12,
        backgroundColor: color + "18", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.stat, fontSize: 20, color }}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.caption, color, opacity: 0.7 }}>{label}</Text>
    </View>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    container: { flex: 1, alignItems: "center", paddingHorizontal: SPACING.xl, paddingTop: 40, paddingBottom: SPACING.xxl },
    successCircle: {
      width: 100, height: 100, borderRadius: 50,
      alignItems: "center", justifyContent: "center",
    },
    successInner: {
      width: 68, height: 68, borderRadius: 34,
      alignItems: "center", justifyContent: "center",
      ...SHADOWS.card,
    },
    title: { ...TYPOGRAPHY.heading, color: C.text, fontSize: 28, marginTop: SPACING.lg },
    topicRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.sm },
    dot: { width: 8, height: 8, borderRadius: 4 },
    topicText: { ...TYPOGRAPHY.bodyMedium, color: C.sec },

    statsGrid: {
      flexDirection: "row", gap: SPACING.sm, width: "100%", marginTop: SPACING.xxxl,
    },

    goalCard: {
      width: "100%", backgroundColor: C.surface,
      borderRadius: RADIUS.xl, padding: SPACING.lg,
      marginTop: SPACING.lg, borderWidth: 1, borderColor: C.border,
    },
    goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    goalLabel: { ...TYPOGRAPHY.captionMedium, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
    goalCount: { ...TYPOGRAPHY.bodySemiBold, fontSize: 14 },
    goalBarBg: {
      height: 8, borderRadius: 4, backgroundColor: C.surface2, marginTop: SPACING.sm, overflow: "hidden",
    },
    goalBarFill: { height: 8, borderRadius: 4 },
    goalDone: { ...TYPOGRAPHY.captionMedium, marginTop: SPACING.xs, textAlign: "center" },

    todayRow: {
      flexDirection: "row", justifyContent: "space-between", width: "100%",
      marginTop: SPACING.md, paddingVertical: SPACING.sm,
    },
    todayLabel: { ...TYPOGRAPHY.caption, color: C.muted },
    todayValue: { ...TYPOGRAPHY.captionMedium, color: C.sec },

    btn: {
      borderRadius: RADIUS.xl, paddingVertical: SPACING.lg,
      alignItems: "center", ...SHADOWS.amber,
    },
    btnText: { ...TYPOGRAPHY.button, color: "#FFFFFF", fontSize: 16 },
  });
}
