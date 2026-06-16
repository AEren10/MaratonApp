import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon, GlowBackground, WARM_GLOW, GlassCard } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getSubjectsForExam } from "../../data/curriculum";
import { getTopicProgress } from "../../supabase/topicProgress";
import { weightedWeakAreas } from "../../lib/buildPlanContext";
import { buildRoadmap } from "../../lib/roadmapEngine";

function WeekCard({ week }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <GlassCard radius={RADIUS.xl} color={week.isCurrent ? C.amber : undefined} style={s.weekCard}>
      <View style={s.weekHead}>
        <View style={[s.weekBadge, week.isCurrent && { backgroundColor: C.amber }]}>
          <Text style={[s.weekBadgeText, week.isCurrent && { color: C.bg }]}>{week.weekNo}</Text>
        </View>
        <Text style={[s.weekTitle, week.isCurrent && { color: C.amber }]}>
          {week.isCurrent ? "Bu hafta" : `${week.weekNo}. hafta`}
        </Text>
        <Text style={s.weekCount}>{week.topics.length} konu</Text>
      </View>
      <View style={s.topicWrap}>
        {week.topics.map((t, i) => (
          <View key={`${t.subject}-${t.topic}-${i}`} style={s.topicChip}>
            <View style={[s.dot, { backgroundColor: t.color }]} />
            <Text style={s.topicText} numberOfLines={1}>{t.topic}</Text>
          </View>
        ))}
        {week.topics.length === 0 ? <Text style={s.empty}>Boş</Text> : null}
      </View>
    </GlassCard>
  );
}

export default function RoadmapScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const { examType, field, daysUntilExam } = useExam();
  const { user } = useAuth();
  const trials = useSelector(selectTrials);

  const [progressByKey, setProgressByKey] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    getTopicProgress(user.id)
      .then((rows) => {
        const map = {};
        (rows || []).forEach((r) => {
          if (!map[r.subject_key]) map[r.subject_key] = {};
          if (r.topic_name) map[r.subject_key][r.topic_name] = r;
        });
        setProgressByKey(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const roadmap = useMemo(() => {
    const pool = getSubjectsForExam(examType || "tyt", field);
    const weakAreas = weightedWeakAreas(trials);
    return buildRoadmap({ pool, progressByKey, weakAreas, daysLeft: daysUntilExam });
  }, [examType, field, progressByKey, trials, daysUntilExam]);

  const masteryPct = roadmap.totalCount ? Math.round((roadmap.masteredCount / roadmap.totalCount) * 100) : 0;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.title}>Yol Haritası</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.amber} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard radius={RADIUS.xl} style={s.summary}>
            <View style={s.sumItem}>
              <Text style={s.sumValue}>{roadmap.weeksLeft}</Text>
              <Text style={s.sumLabel}>hafta kaldı</Text>
            </View>
            <View style={s.sumDivider} />
            <View style={s.sumItem}>
              <Text style={s.sumValue}>{roadmap.remainingCount}</Text>
              <Text style={s.sumLabel}>konu kaldı</Text>
            </View>
            <View style={s.sumDivider} />
            <View style={s.sumItem}>
              <Text style={[s.sumValue, { color: C.green }]}>%{masteryPct}</Text>
              <Text style={s.sumLabel}>ustalaşıldı</Text>
            </View>
          </GlassCard>

          <Text style={s.note}>
            Her açılışta güncellenir — ustalaştığın konular düşer, kalanlar haftalara yeniden yayılır.
          </Text>

          {roadmap.weeks.map((w) => (
            <WeekCard key={w.weekNo} week={w} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  title: { ...TYPOGRAPHY.subheading, color: C.text },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  summary: { flexDirection: "row", alignItems: "center", padding: SPACING.lg },
  sumItem: { flex: 1, alignItems: "center" },
  sumValue: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 26, color: C.text },
  sumLabel: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 },
  sumDivider: { width: 1, height: 36, backgroundColor: C.border },
  note: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: SPACING.md, marginBottom: SPACING.lg, lineHeight: 18 },
  weekCard: { padding: SPACING.lg, marginBottom: SPACING.md },
  weekHead: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md },
  weekBadge: { width: 28, height: 28, borderRadius: 9, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
  weekBadgeText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: C.sec },
  weekTitle: { ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 },
  weekCount: { ...TYPOGRAPHY.caption, color: C.muted },
  topicWrap: { gap: SPACING.sm },
  topicChip: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  dot: { width: 7, height: 7, borderRadius: 4 },
  topicText: { ...TYPOGRAPHY.bodyMedium, color: C.sec, flex: 1 },
  empty: { ...TYPOGRAPHY.caption, color: C.muted },
});
