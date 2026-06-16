import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, interpolate, Extrapolation, FadeInDown,
} from "react-native-reanimated";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getDueWrongQuestions, reviewWrongQuestion } from "../../supabase/wrongQuestions";
import { getWrongQuestionImageUrl } from "../../supabase/storage";
import { getSubjectByKey } from "../../themes/subjects";
import { computeNextReview } from "../../lib/spacedRepetition";
import { useGamification } from "../../hooks/useGamification";
import * as haptic from "../../lib/haptics";

const { width: SW } = Dimensions.get("window");
const SWIPE_THRESHOLD = SW * 0.3;

function resolveSubject(raw) {
  if (typeof raw === "string") {
    const f = getSubjectByKey(raw);
    return f ? { label: f.label, color: f.color, icon: f.icon } : { label: raw, color: "#9A9EAB", icon: "bookOpen" };
  }
  return raw || { label: "?", color: "#9A9EAB", icon: "bookOpen" };
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
    if (!current) return;
    const g = knew ? 3 : 0;
    if (knew) haptic.success(); else haptic.error();
    const updates = computeNextReview(current, g);
    reviewWrongQuestion(current.id, updates).catch(() => {});
    if (knew && current.is_resolved !== true) {
      reward("wrong_resolved", { statUpdates: [{ type: "increment", key: "wrongsResolved" }] });
    }
    setStats((prev) => knew ? { ...prev, knew: prev.knew + 1 } : { ...prev, didnt: prev.didnt + 1 });
    setIdx((i) => i + 1);
  }, [current, reward]);

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
        runOnJS(handleGrade)(true);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SW * 1.5, { duration: 300 });
        runOnJS(handleGrade)(false);
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
    return <SafeAreaView style={s.safe}><View style={s.center}><ActivityIndicator color={C.amber} size="large" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Swipe Tekrar</Text>
        <Text style={s.counter}>{Math.min(idx + 1, queue.length)}/{queue.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${queue.length > 0 ? (idx / queue.length) * 100 : 0}%` }]} />
      </View>

      {finished ? (
        <Animated.View entering={FadeInDown} style={s.center}>
          <Icon name="checkCircle" size={56} color={C.green} />
          <Text style={s.doneTitle}>{queue.length ? "Tekrar Tamamlandı!" : "Bugün tekrar yok"}</Text>
          <View style={s.statsRow}>
            <View style={[s.statBadge, { backgroundColor: C.green + "18" }]}>
              <Icon name="check" size={14} color={C.green} />
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.green }}>{stats.knew}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.green }}>Bildim</Text>
            </View>
            <View style={[s.statBadge, { backgroundColor: C.red + "18" }]}>
              <Icon name="x" size={14} color={C.red} />
              <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.red }}>{stats.didnt}</Text>
              <Text style={{ ...TYPOGRAPHY.micro, color: C.red }}>Bilmedim</Text>
            </View>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeText}>Bitir</Text>
          </Pressable>
        </Animated.View>
      ) : current ? (
        <View style={s.cardArea}>
          {/* Swipe hints */}
          <View style={s.hintRow}>
            <Text style={[s.hint, { color: C.red }]}>← Bilmedim</Text>
            <Text style={[s.hint, { color: C.green }]}>Bildim →</Text>
          </View>

          <GestureDetector gesture={pan}>
            <Animated.View style={[s.card, cardStyle]}>
              {/* Overlays */}
              <Animated.View style={[s.overlay, s.overlayLeft, leftOverlay]}>
                <Icon name="x" size={40} color={C.red} />
              </Animated.View>
              <Animated.View style={[s.overlay, s.overlayRight, rightOverlay]}>
                <Icon name="check" size={40} color={C.green} />
              </Animated.View>

              {/* Card content */}
              {(() => {
                const subj = resolveSubject(current.subject);
                return (
                  <View style={[s.subjChip, { backgroundColor: subj.color + "18" }]}>
                    <Icon name={subj.icon} size={14} color={subj.color} />
                    <Text style={{ ...TYPOGRAPHY.captionMedium, color: subj.color }}>{subj.label}</Text>
                  </View>
                );
              })()}

              <Text style={s.topicText}>{current.topic}</Text>

              {current.image_path ? (
                <Image source={{ uri: getWrongQuestionImageUrl(current.image_path) }} style={s.image} contentFit="contain" cachePolicy="memory-disk" />
              ) : current.note ? (
                <View style={s.noteBox}>
                  <Text style={s.noteText}>{current.note}</Text>
                </View>
              ) : null}

              {current.correct_answer && (
                <View style={s.answerRow}>
                  <Text style={s.answerLabel}>Doğru cevap:</Text>
                  <View style={[s.answerBadge, { backgroundColor: C.green + "18" }]}>
                    <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.green }}>{current.correct_answer}</Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </GestureDetector>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    counter: { ...TYPOGRAPHY.captionMedium, color: C.muted },
    progressBg: { height: 3, backgroundColor: C.surface2, marginHorizontal: SPACING.lg },
    progressFill: { height: 3, backgroundColor: C.amber, borderRadius: 2 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.md },
    cardArea: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SPACING.lg },
    hintRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: SPACING.md },
    hint: { ...TYPOGRAPHY.micro },
    card: {
      width: SW - 48, backgroundColor: C.surface, borderRadius: RADIUS.xxl,
      padding: SPACING.xl, minHeight: 400, borderWidth: 1, borderColor: C.border,
    },
    overlay: { position: "absolute", top: 20, zIndex: 10 },
    overlayLeft: { right: 20 },
    overlayRight: { left: 20 },
    subjChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
    topicText: { ...TYPOGRAPHY.subheading, color: C.text, marginTop: SPACING.lg },
    image: { width: "100%", height: 240, borderRadius: RADIUS.lg, marginTop: SPACING.lg, backgroundColor: C.surface2 },
    noteBox: { backgroundColor: C.surface2, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.lg },
    noteText: { ...TYPOGRAPHY.body, color: C.sec },
    answerRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.lg },
    answerLabel: { ...TYPOGRAPHY.captionMedium, color: C.muted },
    answerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statsRow: { flexDirection: "row", gap: SPACING.lg, marginTop: SPACING.md },
    statBadge: { alignItems: "center", gap: 4, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
    doneTitle: { ...TYPOGRAPHY.subheading, color: C.text },
    closeBtn: { backgroundColor: C.amber, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxxl, marginTop: SPACING.lg },
    closeText: { ...TYPOGRAPHY.button, color: C.bg },
  });
}
