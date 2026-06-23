import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getMastery } from "../../lib/mastery";
import { TopicNoteCard } from "./components/TopicNoteCard";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { getStudyLogsByTopic } from "../../supabase/studyLogs";
import { saveStudyLogOffline } from "../../lib/offlineQueue";
import * as H from "../../lib/haptics";

function StatBox({ label, value, color, C }) {
  return (
    <View style={[s.statBox, { backgroundColor: color + "12", borderColor: color + "26" }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={[s.statLabel, { color, opacity: 0.7 }]}>{label}</Text>
    </View>
  );
}

function SubtopicRow({ item, C, color }) {
  return (
    <View style={[s.subtopicRow, { backgroundColor: item.done ? color + "14" : C.surface, borderColor: item.done ? color + "20" : C.border }]}>
      <Icon
        name={item.done ? "checkCircle" : "circle"}
        size={20}
        color={item.done ? color : C.muted}
        sw={item.done ? 2.5 : 1.8}
      />
      <Text style={[
        s.subtopicName,
        { color: item.done ? C.sec : C.text },
        item.done && { textDecorationLine: "line-through" },
      ]}>
        {item.name}
      </Text>
    </View>
  );
}

function StudyHistoryRow({ item, C, color }) {
  const dateLabel = (() => {
    try {
      return new Date(item.study_date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    } catch { return item.study_date; }
  })();
  const acc = item.question_count > 0
    ? Math.round((item.correct_count / item.question_count) * 100)
    : null;

  return (
    <View style={[s.historyRow, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={[s.historyDateBox, { backgroundColor: color + "12" }]}>
        <Text style={[s.historyDate, { color }]}>{dateLabel}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, fontSize: 14 }]}>
          {item.duration_minutes} dk
          {item.question_count > 0 ? ` · ${item.question_count} soru` : ""}
        </Text>
        {acc !== null && (
          <Text style={[TYPOGRAPHY.caption, { color: acc >= 80 ? C.green : acc >= 60 ? C.amber : C.red, marginTop: 2 }]}>
            %{acc} başarı
          </Text>
        )}
      </View>
    </View>
  );
}

function getStudyTip(mastery, q, studyCount) {
  if (q === 0) return { icon: "play", text: "Bu konuda henüz soru çözmedin. İlk adımı at!", color: "blue" };
  if (mastery < 0.4) return { icon: "alert", text: "Bu konu zayıf alanın. Tekrar çalışıp soru çözmeye odaklan.", color: "red" };
  if (mastery < 0.7) return { icon: "target", text: "Orta seviyedesin. Düzenli tekrar ile ustalaş.", color: "amber" };
  if (studyCount < 3) return { icon: "refresh", text: "Başarı oranın iyi ama daha fazla tekrar gerekli.", color: "amber" };
  return { icon: "star", text: "Bu konuda güçlüsün! Arada tekrar ederek seviyeni koru.", color: "green" };
}

function StudyTip({ mastery, q, studyCount, color, C }) {
  const tip = getStudyTip(mastery, q, studyCount);
  const tipColor = C[tip.color] || color;
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: SPACING.sm,
      backgroundColor: tipColor + "12", borderRadius: RADIUS.lg,
      padding: SPACING.md, marginTop: SPACING.lg,
      borderWidth: 1, borderColor: tipColor + "25",
    }}>
      <Icon name={tip.icon} size={18} color={tipColor} sw={2} />
      <Text style={{ ...TYPOGRAPHY.caption, color: C.text, flex: 1, lineHeight: 18 }}>{tip.text}</Text>
    </View>
  );
}

function formatLastStudied(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Bugün";
    if (diff === 1) return "Dün";
    if (diff < 7) return `${diff} gün önce`;
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  } catch {
    return null;
  }
}

function ProgressHeader({ topic, color, C }) {
  const styles = useMemo(() => makeProgressStyles(C), [C]);
  const studyCount = topic.studyCount || 0;
  const pct = topic.pct || 0;
  const lastLabel = formatLastStudied(topic.last);

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <Text style={[styles.barLabel, { color: C.text }]}>İlerleme</Text>
        <Text style={[styles.barPct, { color }]}>%{pct}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon name="repeat" size={13} color={color} sw={1.8} />
          <Text style={[styles.metaText, { color: C.sec }]}>
            {studyCount} kez çalışıldı
          </Text>
        </View>
        {lastLabel ? (
          <View style={styles.metaItem}>
            <Icon name="clock" size={13} color={C.muted} sw={1.8} />
            <Text style={[styles.metaText, { color: C.muted }]}>{lastLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function makeProgressStyles(C) {
  return StyleSheet.create({
    container: {
      backgroundColor: C.surface,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: C.border,
      padding: SPACING.lg,
      marginTop: SPACING.xl,
    },
    barRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    barLabel: {
      ...TYPOGRAPHY.bodySemiBold,
      fontSize: 14,
    },
    barPct: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 15,
      letterSpacing: -0.3,
    },
    barTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: C.surface2,
      overflow: "hidden",
    },
    barFill: {
      height: 4,
      borderRadius: 2,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: SPACING.md,
      gap: SPACING.lg,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metaText: {
      ...TYPOGRAPHY.caption,
      fontSize: 12,
    },
  });
}

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const C = useC();
  const route = useRoute();
  const { user } = useAuth();
  const showAlert = useAlert();
  const { topic, subject, subtopics: paramSubtopics } = route.params ?? {};
  const mastery = (topic?.acc || 0) / 100;

  const [history, setHistory] = useState([]);
  const [completing, setCompleting] = useState(false);
  useEffect(() => {
    if (!user?.id || user.id === "dev" || !subject?.key || !topic?.name) return;
    getStudyLogsByTopic(user.id, subject.key, topic.name)
      .then(setHistory)
      .catch(() => {});
  }, [user?.id, subject.key, topic.name]);

  const handleMarkComplete = async () => {
    if (!user?.id || user.id === "dev") return;
    setCompleting(true);
    try {
      await saveStudyLogOffline({
        user_id: user.id,
        subject: subject.key,
        topic: topic.name,
        question_count: 0,
        correct_count: 0,
        duration_minutes: 0,
        study_date: new Date().toISOString().split("T")[0],
      });
      H.success();
      showAlert("Tamamlandı", "Bu konu çalışıldı olarak işaretlendi.");
    } catch {
      showAlert("Hata", "İşaretleme başarısız oldu.");
    } finally {
      setCompleting(false);
    }
  };
  const masteryLevel = getMastery({ q: topic?.q || 0, acc: topic?.acc || 0 });
  const subtopics = (paramSubtopics || []).map((name, i) => ({
    name,
    done: i < Math.floor((paramSubtopics?.length || 0) * mastery),
  }));

  const color = subject.color || C.purple;

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          {topic.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Ders chip */}
        <View style={[s.subjectChip, { backgroundColor: color + "18", borderColor: color + "30" }]}>
          <Icon name={subject.icon} size={14} color={color} />
          <Text style={[s.chipText, { color }]}>{subject.name}</Text>
        </View>

        {/* === Ilerleme header === */}
        <ProgressHeader topic={topic} color={color} C={C} />

        {/* === Stat kartlar === */}
        <View style={s.statsRow}>
          <StatBox C={C} label="Toplam Soru" value={topic.q || 0} color={C.blue} />
          <StatBox C={C} label="Başarı" value={`%${topic.acc || 0}`} color={C.green} />
          <StatBox C={C} label="Son Çalışma" value={topic.last || "—"} color={C.amber} />
        </View>

        {/* === Hakimiyet ring === */}
        <View style={s.ringWrapper}>
          <View style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}>
            <Svg width={120} height={120} style={{ position: "absolute" }}>
              <Circle cx={60} cy={60} r={50} stroke={color + "1A"} strokeWidth={9} fill="none" />
              <Circle cx={60} cy={60} r={50} stroke={color} strokeWidth={9} fill="none"
                strokeLinecap="round" strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - mastery)}
                transform="rotate(-90 60 60)" />
            </Svg>
            <Text style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: (topic?.q || 0) === 0 ? 22 : 26,
              color: (topic?.q || 0) === 0 ? C.muted : C.text,
              letterSpacing: -0.5,
            }}>
              {(topic?.q || 0) === 0 ? "—" : `%${topic.acc || 0}`}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[s.ringLabel, { color: C.sec }]}>
              {(topic?.q || 0) === 0 ? "Soru çözdükçe hakimiyetin oluşacak" : "Hakimiyet"}
            </Text>
            {(topic?.q || 0) > 0 && (
              <Pressable
                hitSlop={10}
                onPress={() => showAlert(
                  "Hakimiyet Nedir?",
                  "Hakimiyet, bu konudaki doğru cevap oranını ve çözülen soru sayısını birlikte değerlendirir.\n\n• %80+ → Uzman\n• %60-79 → İyi\n• %40-59 → Orta\n• %40 altı → Zayıf\n\nDaha çok soru çözdükçe hakimiyet seviyeni yukarı taşırsın."
                )}
              >
                <Icon name="info" size={15} color={C.muted} />
              </Pressable>
            )}
          </View>
          <View style={[s.masteryBadge, { backgroundColor: C[masteryLevel.colorKey] + "1A" }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C[masteryLevel.colorKey] }} />
            <Text style={[s.masteryText, { color: C[masteryLevel.colorKey] }]}>{masteryLevel.label}</Text>
          </View>
        </View>

        {/* Öneri kartı */}
        <StudyTip mastery={mastery} q={topic?.q || 0} studyCount={topic?.studyCount || 0} color={color} C={C} />

        {/* Konu notu */}
        {subject.key ? <TopicNoteCard subjectKey={subject.key} topicName={topic.name} /> : null}

        {/* === Alt konular === */}
        {subtopics.length > 0 ? (
          <>
            <Text style={[s.sectionTitle, { color: C.sec }]}>ALT KONULAR</Text>
            {subtopics.map((st) => (
              <SubtopicRow key={st.name} item={st} C={C} color={color} />
            ))}
          </>
        ) : null}

        {/* === Çalışma Geçmişi === */}
        {history.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: C.sec }]}>ÇALIŞMA GEÇMİŞİ</Text>
            {history.map((h) => (
              <StudyHistoryRow key={h.id} item={h} C={C} color={color} />
            ))}
          </>
        )}

        {/* === CTA buttons === */}
        <Pressable
          onPress={() => navigation.navigate(SCREENS.STUDY_TIMER, { subjectKey: subject.key, topicName: topic.name })}
          style={({ pressed }) => [
            s.cta,
            {
              backgroundColor: C.accent,
              shadowColor: C.accent,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Icon name="play" size={20} color="#FFFFFF" sw={2.5} />
          <Text style={s.ctaText}>Çalışmaya Başla</Text>
        </Pressable>

        <Pressable
          onPress={handleMarkComplete}
          disabled={completing}
          style={({ pressed }) => [
            s.secondaryCta,
            {
              borderColor: color + "40",
              opacity: pressed || completing ? 0.6 : 1,
            },
          ]}
        >
          <Icon name="check" size={18} color={color} sw={2} />
          <Text style={[s.secondaryCtaText, { color }]}>Konuyu Tamamla</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  subjectChip: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    borderRadius: 999, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    gap: SPACING.xs, marginTop: SPACING.sm, borderWidth: 1,
  },
  chipText: { ...TYPOGRAPHY.captionMedium },
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.xl },
  statBox: {
    flex: 1, padding: 14, alignItems: "center",
    borderRadius: 18, borderWidth: 1,
  },
  statValue: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 22,
    letterSpacing: -0.4,
  },
  statLabel: { ...TYPOGRAPHY.caption, fontSize: 11, marginTop: 4, fontFamily: "Inter_600SemiBold" },
  ringWrapper: { alignItems: "center", marginTop: SPACING.xxxl },
  ringLabel: { ...TYPOGRAPHY.caption, marginTop: SPACING.md },
  masteryBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: SPACING.sm,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 999,
  },
  masteryText: { ...TYPOGRAPHY.captionMedium },
  sectionTitle: { ...TYPOGRAPHY.label, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  subtopicRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, padding: 14, marginBottom: 8,
    gap: 12, borderWidth: 1,
  },
  subtopicName: { ...TYPOGRAPHY.body, flex: 1, fontSize: 14 },
  historyRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1,
  },
  historyDateBox: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
  },
  historyDate: { ...TYPOGRAPHY.captionMedium, fontSize: 12 },
  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 999, paddingVertical: 17, marginTop: SPACING.xxxl,
    gap: 8,
    ...SHADOWS.accent,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  secondaryCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 999, paddingVertical: 14, marginTop: SPACING.md,
    gap: 8, borderWidth: 1.5,
  },
  secondaryCtaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
