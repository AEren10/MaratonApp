import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import SignedImage from "../../components/common/SignedImage";

const CHOICES = ["A", "B", "C", "D", "E"];

export default function QuizCard({ item, selected, feedback, onAnswer }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const subj = getSubjectByKey(item.subject);
  const hasAnswer = !!item.correct_answer;

  return (
    <Animated.View entering={FadeInDown.duration(300)} style={s.card}>
      <View style={s.chipRow}>
        <View style={[s.chip, { backgroundColor: subj?.color || C.amber }]}>
          <Text style={s.chipText}>{subj?.label || item.subject}</Text>
        </View>
        <Text style={s.topic} numberOfLines={1}>{item.topic}</Text>
      </View>

      {item.image_path ? (
        <SignedImage
          bucket="wrong-questions"
          path={item.image_path}
          style={s.image}
          contentFit="contain"
          transition={200}
        />
      ) : item.note ? (
        <Text style={s.note}>{item.note}</Text>
      ) : null}

      {hasAnswer ? (
        <View style={s.options}>
          {CHOICES.map((c) => {
            const isCorrect = feedback && c === item.correct_answer;
            const isWrong = feedback && c === selected && c !== item.correct_answer;
            const bg = isCorrect ? C.green : isWrong ? C.red : C.surface2;
            return (
              <TouchableOpacity
                key={c}
                style={[s.optBtn, { backgroundColor: bg }]}
                onPress={() => onAnswer(c)}
                disabled={!!feedback}
              >
                <Text style={[s.optText, (isCorrect || isWrong) && s.optBold]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={s.knowRow}>
          <TouchableOpacity
            style={[s.knowBtn, { backgroundColor: C.green }]}
            onPress={() => onAnswer("correct")}
            disabled={!!feedback}
          >
            <Text style={s.knowText}>Bildim</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.knowBtn, { backgroundColor: C.red }]}
            onPress={() => onAnswer("wrong")}
            disabled={!!feedback}
          >
            <Text style={s.knowText}>Bilmedim</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    card: {
      backgroundColor: C.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: C.border,
      padding: SPACING.lg,
      gap: SPACING.md,
    },
    chipRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
    chip: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
      borderRadius: RADIUS.sm,
    },
    chipText: { ...TYPOGRAPHY.caption, color: C.textOnFill, fontWeight: "700" },
    topic: { ...TYPOGRAPHY.body, color: C.sec, flex: 1 },
    image: { width: "100%", height: 200, borderRadius: RADIUS.md },
    note: { ...TYPOGRAPHY.body, color: C.text, lineHeight: 22 },
    options: { flexDirection: "row", gap: SPACING.sm },
    optBtn: {
      flex: 1,
      height: 48,
      borderRadius: RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
    },
    optText: { ...TYPOGRAPHY.body, color: C.text },
    optBold: { fontWeight: "700" },
    knowRow: { flexDirection: "row", gap: SPACING.md },
    knowBtn: {
      flex: 1,
      height: 52,
      borderRadius: RADIUS.md,
      alignItems: "center",
      justifyContent: "center",
    },
    knowText: { ...TYPOGRAPHY.body, color: C.textOnFill, fontWeight: "700" },
  });
