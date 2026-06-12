import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useAuth } from "../../contexts/AuthContext";
import { getDueWrongQuestions, reviewWrongQuestion } from "../../supabase/wrongQuestions";
import { getSubjectByKey } from "../../themes/subjects";
import { computeNextReview } from "../../lib/spacedRepetition";

const GRADES = [
  { grade: 0, label: "Hatırlamıyorum", color: "#EF4444", icon: "x" },
  { grade: 1, label: "Zorlandım", color: "#F5A623", icon: "alert" },
  { grade: 3, label: "Biliyorum", color: "#34D399", icon: "check" },
];

function resolveSubject(raw) {
  if (typeof raw === "string") {
    const f = getSubjectByKey(raw);
    return f ? { label: f.label, color: f.color, icon: f.icon } : { label: raw, color: "#A0A0B0", icon: "bookOpen" };
  }
  return raw || { label: "?", color: "#A0A0B0", icon: "bookOpen" };
}

export default function ReviewSessionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    getDueWrongQuestions(user.id)
      .then((rows) => setQueue(rows))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const current = queue[idx];

  const grade = useCallback(async (g) => {
    if (!current) return;
    const updates = computeNextReview(current, g);
    reviewWrongQuestion(current.id, updates).catch(() => {});
    setDone((d) => d + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
  }, [current]);

  if (loading) {
    return <SafeAreaView edges={["top"]} style={s.safe}><View style={s.center}><ActivityIndicator color={C.amber} size="large" /></View></SafeAreaView>;
  }

  const finished = idx >= queue.length;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="x" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Tekrar</Text>
        <Text style={s.counter}>{Math.min(idx + (finished ? 0 : 1), queue.length)}/{queue.length}</Text>
      </View>

      {finished ? (
        <View style={s.center}>
          <Icon name="checkCircle" size={56} color={C.green} />
          <Text style={s.doneTitle}>{queue.length ? "Tekrar tamamlandı!" : "Bugün tekrar yok"}</Text>
          <Text style={s.doneSub}>
            {queue.length ? `${done} soruyu tekrar ettin. Aralıklar güncellendi.` : "Yeni yanlışlar zamanı gelince burada belirir."}
          </Text>
          <Pressable onPress={() => navigation.goBack()} style={s.closeBtn}>
            <Text style={s.closeText}>Bitir</Text>
          </Pressable>
        </View>
      ) : current ? (
        <ScrollView contentContainerStyle={s.scroll}>
          {(() => {
            const subj = resolveSubject(current.subject);
            return (
              <View style={[s.chip, { backgroundColor: subj.color + "18" }]}>
                <Icon name={subj.icon} size={14} color={subj.color} />
                <Text style={[s.chipText, { color: subj.color }]}>{subj.label} · {current.topic}</Text>
              </View>
            );
          })()}

          {current.image_path ? (
            <Image source={{ uri: current.image_path }} style={s.image} contentFit="contain" cachePolicy="memory-disk" />
          ) : (
            <View style={s.noImage}>
              <Icon name="notebook" size={32} color={C.muted} />
              <Text style={s.noImageText}>{current.note || "Bu konuyu hatırlamaya çalış"}</Text>
            </View>
          )}

          {revealed ? (
            <View style={s.answerBox}>
              {current.note ? <Text style={s.note}>{current.note}</Text> : null}
              {current.correct_answer ? (
                <Text style={s.answerText}>
                  Senin: <Text style={{ color: C.red }}>{current.my_answer || "—"}</Text>  →  Doğru: <Text style={{ color: C.green }}>{current.correct_answer}</Text>
                </Text>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      ) : null}

      {!finished && current ? (
        <View style={s.footer}>
          {!revealed ? (
            <Pressable onPress={() => setRevealed(true)} style={s.revealBtn}>
              <Text style={s.revealText}>Cevabı Göster</Text>
            </Pressable>
          ) : (
            <View style={s.gradeRow}>
              {GRADES.map((g) => (
                <Pressable key={g.grade} onPress={() => grade(g.grade)} style={[s.gradeBtn, { backgroundColor: g.color + "1A", borderColor: g.color }]}>
                  <Icon name={g.icon} size={18} color={g.color} />
                  <Text style={[s.gradeText, { color: g.color }]}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  counter: { ...TYPOGRAPHY.captionMedium, color: C.muted },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, gap: SPACING.sm },
  scroll: { padding: SPACING.lg, gap: SPACING.lg },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  chipText: { ...TYPOGRAPHY.captionMedium },
  image: { width: "100%", height: 300, borderRadius: RADIUS.lg, backgroundColor: C.surface },
  noImage: { height: 200, borderRadius: RADIUS.lg, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", gap: SPACING.md, padding: SPACING.lg },
  noImageText: { ...TYPOGRAPHY.bodyMedium, color: C.sec, textAlign: "center" },
  answerBox: { backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm, borderWidth: 1, borderColor: C.border },
  note: { ...TYPOGRAPHY.body, color: C.text },
  answerText: { ...TYPOGRAPHY.bodyMedium, color: C.sec },
  footer: { padding: SPACING.lg, borderTopWidth: 1, borderTopColor: C.border },
  revealBtn: { backgroundColor: C.amber, borderRadius: RADIUS.lg, paddingVertical: SPACING.lg, alignItems: "center" },
  revealText: { ...TYPOGRAPHY.button, color: C.bg },
  gradeRow: { flexDirection: "row", gap: SPACING.sm },
  gradeBtn: { flex: 1, alignItems: "center", gap: 4, paddingVertical: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  gradeText: { ...TYPOGRAPHY.micro },
  doneTitle: { ...TYPOGRAPHY.subheading, color: C.text, marginTop: SPACING.md },
  doneSub: { ...TYPOGRAPHY.caption, color: C.muted, textAlign: "center" },
  closeBtn: { backgroundColor: C.amber, borderRadius: RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxxl, marginTop: SPACING.lg },
  closeText: { ...TYPOGRAPHY.button, color: C.bg },
});
