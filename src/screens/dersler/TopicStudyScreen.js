import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { getMastery } from "../../lib/mastery";
import { TopicNoteCard } from "./components/TopicNoteCard";
import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogsByTopic } from "../../supabase/studyLogs";

function StatBox({ label, value, color, C }) {
  return (
    <View style={[s.statBox, { backgroundColor: color + "12", borderColor: color + "26" }]}>
      <Text style={[s.statValue, { color: C.text }]}>{value}</Text>
      <Text style={[s.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

function SubtopicRow({ item, C, color }) {
  return (
    <View style={[s.subtopicRow, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Icon
        name={item.done ? "check" : "circle"}
        size={20}
        color={item.done ? color : C.muted}
        sw={item.done ? 3 : 1.8}
      />
      <Text style={[
        s.subtopicName,
        { color: item.done ? C.muted : C.text },
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
            {studyCount} kez calisildi
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
  const { topic, subject, subtopics: paramSubtopics } = route.params;
  const mastery = topic.acc / 100;

  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!user?.id || user.id === "dev" || !subject.key) return;
    getStudyLogsByTopic(user.id, subject.key, topic.name)
      .then(setHistory)
      .catch(() => {});
  }, [user?.id, subject.key, topic.name]);
  const masteryLevel = getMastery({ q: topic.q, acc: topic.acc });
  const circumference = 2 * Math.PI * 40;
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

        {/* === Stat kartlar — her biri kimlik renkli soft === */}
        <View style={s.statsRow}>
          <StatBox C={C} label="Toplam Soru" value={topic.q || 0} color={color} />
          <StatBox C={C} label="Başarı" value={`%${topic.acc || 0}`} color={C.amber} />
          <StatBox C={C} label="Son Çalışma" value={topic.last || "—"} color={C.blue} />
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
              fontSize: 26,
              color: C.text,
              letterSpacing: -0.5,
            }}>
              %{topic.acc || 0}
            </Text>
          </View>
          <Text style={[s.ringLabel, { color: C.sec }]}>Hakimiyet</Text>
          <View style={[s.masteryBadge, { backgroundColor: masteryLevel.color + "1A" }]}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: masteryLevel.color }} />
            <Text style={[s.masteryText, { color: masteryLevel.color }]}>{masteryLevel.label}</Text>
          </View>
        </View>

        {/* Konu notu */}
        {subject.key ? <TopicNoteCard subjectKey={subject.key} topicName={topic.name} /> : null}

        {/* === Alt konular === */}
        {subtopics.length > 0 ? (
          <>
            <Text style={[s.sectionTitle, { color: C.muted }]}>ALT KONULAR</Text>
            {subtopics.map((st) => (
              <SubtopicRow key={st.name} item={st} C={C} color={color} />
            ))}
          </>
        ) : null}

        {/* === Çalışma Geçmişi === */}
        {history.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { color: C.muted }]}>ÇALIŞMA GEÇMİŞİ</Text>
            {history.map((h) => (
              <StudyHistoryRow key={h.id} item={h} C={C} color={color} />
            ))}
          </>
        )}

        {/* === Çalış CTA — purple pill === */}
        <Pressable
          onPress={() => navigation.navigate(SCREENS.STUDY_TIMER, { subjectKey: subject.key, topicName: topic.name })}
          style={({ pressed }) => [
            s.cta,
            {
              backgroundColor: C.purple,
              shadowColor: C.purple,
              opacity: pressed ? 0.92 : 1,
            },
          ]}
        >
          <Icon name="play" size={20} color="#FFFFFF" sw={2.5} />
          <Text style={s.ctaText}>Çalışmaya Başla</Text>
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
