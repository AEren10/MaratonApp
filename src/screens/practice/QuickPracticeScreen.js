import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useC } from "../../contexts/ThemeContext";
import { SPACING } from "../../themes/tokens";
import { useAuth } from "../../contexts/AuthContext";
import { useGamification } from "../../hooks/useGamification";
import { getDueWrongQuestions } from "../../supabase/wrongQuestions";
import { saveReviewOffline } from "../../lib/offlineQueue";
import { computeNextReview } from "../../lib/spacedRepetition";
import * as haptic from "../../lib/haptics";
import QuizCard from "./QuizCard";
import { shuffle } from "./components/shuffle";
import { QuickPracticeSkeleton } from "./components/QuickPracticeSkeleton";
import { QuickPracticeDone } from "./components/QuickPracticeDone";
import { QuickPracticeEmptyState } from "./components/QuickPracticeEmptyState";
import { QuickPracticeTopBar } from "./components/QuickPracticeTopBar";

const TOTAL = 5;

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
  const [loadError, setLoadError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const data = await getDueWrongQuestions(user.id);
        if (cancelled) return;
        setQuestions(shuffle(data || []).slice(0, TOTAL));
      } catch (e) {
        if (cancelled) return;
        setLoadError(e?.message || "Sorular yüklenemedi");
      }
      if (cancelled) return;
      setLoading(false);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    })();
    return () => { cancelled = true; if (timerRef.current) clearInterval(timerRef.current); };
  }, [user?.id]);

  const done = idx >= questions.length && questions.length > 0;
  const score = useMemo(() => results.filter((r) => r).length, [results]);
  const current = questions[idx];

  const handleAnswer = useCallback((answer) => {
    if (feedback || !user?.id) return;
    const q = questions[idx];
    if (!q) return;
    const correct = q.correct_answer ? answer === q.correct_answer : answer === "correct";
    correct ? haptic.success() : haptic.error();
    setSelected(answer);
    setFeedback(true);
    const next = computeNextReview(q, correct ? 3 : 0);
    saveReviewOffline(q.id, user.id, { ...next, is_resolved: correct || q.is_resolved }).catch(() => {});
    if (correct) reward("wrong_resolved", { subject: q.subject });
    setTimeout(() => {
      setResults((prev) => [...prev, correct]);
      setSelected(null);
      setFeedback(null);
      setIdx((i) => i + 1);
    }, 500);
  }, [feedback, questions, idx, reward, user?.id]);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    nav.goBack();
  }, [nav]);

  if (loading) {
    return <SafeAreaView edges={["top"]} style={s.container}><QuickPracticeSkeleton /></SafeAreaView>;
  }

  if (loadError) {
    return <QuickPracticeEmptyState icon="alert" iconColor={C.red} text={loadError} onBack={() => nav.goBack()} C={C} />;
  }

  if (questions.length === 0) {
    return <QuickPracticeEmptyState icon="check-circle" iconColor={C.green} text="Tekrar edilecek soru yok!" onBack={() => nav.goBack()} C={C} />;
  }

  if (done) {
    return (
      <SafeAreaView edges={["top"]} style={s.container}>
        <QuickPracticeDone score={score} total={questions.length} elapsed={elapsed} onFinish={finish} C={C} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.container}>
      <QuickPracticeTopBar
        questions={questions}
        results={results}
        currentIndex={idx}
        elapsed={elapsed}
        onClose={() => nav.goBack()}
        C={C}
      />
      <QuizCard item={current} selected={selected} feedback={feedback} onAnswer={handleAnswer} />
    </SafeAreaView>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, padding: SPACING.lg },
  });
