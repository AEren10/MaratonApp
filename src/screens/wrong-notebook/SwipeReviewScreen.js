import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, Extrapolation, 
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { Icon } from "../../components/design";
import { SwipeReviewSkeleton } from "./components/SwipeReviewSkeleton";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getDueWrongQuestions } from "../../supabase/wrongQuestions";
import { saveReviewOffline } from "../../lib/offlineQueue";
import SignedImage from "../../components/common/SignedImage";
import { getSubjectByKey } from "../../themes/subjects";
import { computeNextReview } from "../../lib/spacedRepetition";
import { useGamification } from "../../hooks/useGamification";
import * as haptic from "../../lib/haptics";
import { Press } from "../../components/design/Press";

const { width: SW } = Dimensions.get("window");
const SWIPE_THRESHOLD = SW * 0.3;

function resolveSubject(raw, C) {
  if (typeof raw === "string") {
    const f = getSubjectByKey(raw);
    return f ? { label: f.label, color: f.color, icon: f.icon } : { label: raw, color: C.text3, icon: "bookOpen" };
  }
  return raw || { label: "?", color: C.text3, icon: "bookOpen" };
}

export default function SwipeReviewScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { reward } = useGamification();
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ knew: 0, didnt: 0 });

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    getDueWrongQuestions(user.id)
      .then((rows) => setQueue(rows))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const current = queue[idx];
  const finished = idx >= queue.length;

  const handleGrade = useCallback((knew) => {
    if (!current || !user?.id) return;
    const g = knew ? 3 : 0;
    if (knew) haptic.success(); else haptic.error();
    // is_resolved EKSİKTİ: kullanıcı sağa kaydırıp "bildim" diyor, XP alıyor,
    // sayacı artıyor — ama soru yanlış defterinde açık kalmaya devam ediyordu.
    // QuickPracticeScreen aynı işi doğru yapıyor, oradaki desenle hizalandı.
    const updates = {
      ...computeNextReview(current, g),
      is_resolved: knew || current.is_resolved === true,
    };
    saveReviewOffline(current.id, user.id, updates).catch(() => {});
    if (knew && current.is_resolved !== true) {
      reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
    }
    setStats((prev) => knew ? { ...prev, knew: prev.knew + 1 } : { ...prev, didnt: prev.didnt + 1 });
    setIdx((i) => i + 1);
  }, [current, reward, user?.id]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SW * 1.5, { duration: 300 });
        scheduleOnRN(handleGrade, true);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SW * 1.5, { duration: 300 });
        scheduleOnRN(handleGrade, false);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [idx]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-SW, 0, SW], [-15, 0, 15], Extrapolation.CLAMP)}deg` },
    ],
  }));

  const leftOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));
  const rightOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <SwipeReviewSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Kapat" accessibilityRole="button">
          <Icon name="x" size={22} color={C.text} />
        </Press>
        <Text style={s.title}>Swipe Tekrar</Text>
        <Text style={s.counter}>{Math.min(idx + 1, queue.length)}/{queue.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${queue.length > 0 ? (idx / queue.length) * 100 : 0}%` }]} />
      </View>

      {finished ? (
        <Animated.View style={s.center}>
          <Icon name="checkCircle" size={56} color={C.up} />
          <Text style={s.doneTitle}>{queue.length ? "Tekrar Tamamlandı!" : "Bugün tekrar yok"}</Text>
          <View style={s.statsRow}>
            <View style={[s.statBadge, { backgroundColor: C.up + "18" }]}>
              <Icon name="check" size={14} color={C.up} />
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.up }}>{stats.knew}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.up }}>Bildim</Text>
            </View>
            <View style={[s.statBadge, { backgroundColor: C.red + "18" }]}>
              <Icon name="x" size={14} color={C.red} />
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.red }}>{stats.didnt}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>Bilmedim</Text>
            </View>
          </View>
          <Press haptic="none" onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeText}>Bitir</Text>
          </Press>
        </Animated.View>
      ) : current ? (
        <View style={s.cardArea}>
          {/* Swipe hints */}
          <View style={s.hintRow}>
            <Text style={[s.hint, { color: C.red }]}>← Bilmedim</Text>
            <Text style={[s.hint, { color: C.up }]}>Bildim →</Text>
          </View>

          <GestureDetector gesture={pan}>
            <Animated.View style={[s.card, cardStyle]}>
              {/* Overlays */}
              <Animated.View style={[s.overlay, s.overlayLeft, leftOverlay]}>
                <Icon name="x" size={40} color={C.red} />
              </Animated.View>
              <Animated.View style={[s.overlay, s.overlayRight, rightOverlay]}>
                <Icon name="check" size={40} color={C.up} />
              </Animated.View>

              {/* Card content */}
              {(() => {
                const subj = resolveSubject(current.subject, C);
                return (
                  <View style={[s.subjChip, { backgroundColor: subj.color + "18" }]}>
                    <Icon name={subj.icon} size={14} color={subj.color} />
                    <Text style={{ ...TYPOGRAPHY.captionMedium, color: subj.color }}>{subj.label}</Text>
                  </View>
                );
              })()}

              <Text style={s.topicText}>{current.topic}</Text>

              {current.image_path ? (
                <SignedImage bucket="wrong-questions" path={current.image_path} style={s.image} contentFit="contain" />
              ) : current.note ? (
                <View style={s.noteBox}>
                  <Text style={s.noteText}>{current.note}</Text>
                </View>
              ) : null}

              {current.correct_answer && (
                <View style={s.answerRow}>
                  <Text style={s.answerLabel}>Doğru cevap:</Text>
                  <View style={[s.answerBadge, { backgroundColor: C.up + "18" }]}>
                    <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.up }}>{current.correct_answer}</Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </GestureDetector>

          {/* Tap alternatives for accessibility */}
          <View style={s.tapRow}>
            <Press haptic="none"
              onPress={() => handleGrade(false)}
              accessibilityRole="button"
              accessibilityLabel="Bilmedim"
              style={[s.tapBtn, { borderColor: C.red + "40", backgroundColor: C.red + "14" }]}
            >
              <Icon name="x" size={18} color={C.red} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.red }}>Bilmedim</Text>
            </Press>
            <Press haptic="none"
              onPress={() => handleGrade(true)}
              accessibilityRole="button"
              accessibilityLabel="Bildim"
              style={[s.tapBtn, { borderColor: C.up + "40", backgroundColor: C.up + "14" }]}
            >
              <Icon name="check" size={18} color={C.up} />
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.up }}>Bildim</Text>
            </Press>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundcolor: C.accentInk },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingVertical: STEP.s3 },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    counter: { ...TYPOGRAPHY.captionMedium, color: C.text3 },
    progressBg: { height: 3, backgroundColor: C.track, marginHorizontal: GUTTER },
    progressFill: { height: 3, backgroundColor: C.accent, borderRadius: 2 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: STEP.s5, gap: STEP.s3 },
    cardArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: GUTTER },
    hintRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: STEP.s3 },
    hint: { ...TYPOGRAPHY.micro },
    card: {
      width: SW - 48, backgroundColor: C.surface, borderRadius: SHAPE.sheet,
      padding: STEP.s5, minHeight: 400, borderWidth: 1, borderColor: C.border,
    },
    overlay: { position: "absolute", top: 20, zIndex: 10 },
    overlayLeft: { right: 20 },
    overlayRight: { left: 20 },
    subjChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
    topicText: { ...TYPOGRAPHY.subheading, color: C.text, marginTop: STEP.s4 },
    image: { width: "100%", height: 240, borderRadius: SHAPE.cardTight, marginTop: STEP.s4, backgroundColor: C.elev },
    noteBox: { backgroundColor: C.elev, borderRadius: SHAPE.cardTight, padding: STEP.s4, marginTop: STEP.s4 },
    noteText: { ...TYPOGRAPHY.body, color: C.text2 },
    answerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s4 },
    answerLabel: { ...TYPOGRAPHY.captionMedium, color: C.text3 },
    answerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statsRow: { flexDirection: "row", gap: STEP.s4, marginTop: STEP.s3 },
    statBadge: { alignItems: "center", gap: 4, paddingHorizontal: STEP.s5, paddingVertical: STEP.s3, borderRadius: SHAPE.cardTight },
    doneTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    closeBtn: { backgroundColor: C.accent, borderRadius: SHAPE.cardTight, paddingVertical: STEP.s3, paddingHorizontal: STEP.s5, marginTop: STEP.s4 },
    closeText: { ...TYPOGRAPHY.button, color: C.accentInk },
    tapRow: { flexDirection: "row", gap: STEP.s3, marginTop: STEP.s4, width: "100%" },
    tapBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: STEP.s3, borderRadius: SHAPE.cardTight, borderWidth: 1 },
  });
}



