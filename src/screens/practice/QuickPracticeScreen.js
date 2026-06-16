import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { Icon } from "../../components/design";
import { useAuth } from "../../contexts/AuthContext";
import { useGamification } from "../../hooks/useGamification";
import { getDueWrongQuestions, reviewWrongQuestion } from "../../supabase/wrongQuestions";
import { computeNextReview } from "../../lib/spacedRepetition";
import * as haptic from "../../lib/haptics";
import QuizCard from "./QuizCard";

const TOTAL = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuickPracticeScreen() {
  const nav = useNavigation();
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const { user } = useAuth();
  const { reward } = useGamification();

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await getDueWrongQuestions(user.id);
      setQuestions(shuffle(data).slice(0, TOTAL));
      setLoading(false);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    })();
    return () => clearInterval(timerRef.current);
  }, [user.id]);

  const done = idx >= questions.length && questions.length > 0;
  const score = results.filter((r) => r).length;
  const current = questions[idx];

  const handleAnswer = useCallback((answer) => {
    if (feedback) return;
    const q = questions[idx];
    const correct = q.correct_answer ? answer === q.correct_answer : answer === "correct";
    correct ? haptic.success() : haptic.error();
    setSelected(answer);
    setFeedback(true);
    const next = computeNextReview(q, correct ? 3 : 0);
    reviewWrongQuestion(q.id, { ...next, is_resolved: correct || q.is_resolved });
    if (correct) reward("wrong_resolved", { subject: q.subject });
    setTimeout(() => {
      setResults((prev) => [...prev, correct]);
      setSelected(null);
      setFeedback(null);
      setIdx((i) => i + 1);
    }, 500);
  }, [feedback, questions, idx, reward]);

  const finish = useCallback(() => {
    clearInterval(timerRef.current);
    nav.goBack();
  }, [nav]);

  if (loading) {
    return (
      <SafeAreaView style={[s.container, s.center]}>
        <ActivityIndicator color={C.amber} size="large" />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[s.container, s.center]}>
        <Icon name="check-circle" size={48} color={C.green} />
        <Text style={s.emptyText}>Tekrar edilecek soru yok!</Text>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Text style={s.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={s.container}>
        <Animated.View entering={ZoomIn.duration(400)} style={[s.center, { flex: 1 }]}>
          <Text style={s.summaryScore}>{score}/{questions.length}</Text>
          <Text style={s.summaryLabel}>Doğru</Text>
          <Text style={s.summaryTime}>{elapsed}s</Text>
          <TouchableOpacity style={s.finishBtn} onPress={finish}>
            <Text style={s.finishText}>Bitir</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <View style={s.dots}>
          {questions.map((_, i) => {
            const bg = i < results.length ? (results[i] ? C.green : C.red) : i === idx ? C.amber : C.surface2;
            return <View key={i} style={[s.dot, { backgroundColor: bg }]} />;
          })}
        </View>
        <Text style={s.timer}>{elapsed}s</Text>
      </View>

      <QuizCard item={current} selected={selected} feedback={feedback} onAnswer={handleAnswer} />
    </SafeAreaView>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, padding: SPACING.lg },
    center: { alignItems: "center", justifyContent: "center", gap: SPACING.md },
    topBar: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
    dots: { flexDirection: "row", gap: SPACING.sm, flex: 1 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    timer: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, color: C.sec },
    emptyText: { ...TYPOGRAPHY.body, color: C.sec, marginTop: SPACING.sm },
    backBtn: { marginTop: SPACING.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, backgroundColor: C.surface, borderRadius: RADIUS.md },
    backBtnText: { ...TYPOGRAPHY.body, color: C.amber, fontWeight: "600" },
    summaryScore: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 56, color: C.amber },
    summaryLabel: { ...TYPOGRAPHY.body, color: C.sec },
    summaryTime: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 24, color: C.muted, marginTop: SPACING.sm },
    finishBtn: { marginTop: SPACING.xl, backgroundColor: C.amber, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.md },
    finishText: { ...TYPOGRAPHY.body, color: "#FFFFFF", fontWeight: "700" },
  });
