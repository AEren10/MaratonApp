import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import { ALL_SUBJECTS } from "../trial/trialTypes";
import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap";
import { SCREENS } from "../../constants/screens";
import { selectTrials } from "../../store/slices/trialSlice";

function StatBox({ label, value }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function TopicRow({ topic, color }) {
  const barWidth = Math.round(Math.max(topic.acc, 5));
  return (
    <View style={s.topicRow}>
      <View style={s.topicInfo}>
        <Text style={s.topicName} numberOfLines={1}>{topic.name}</Text>
        <Text style={s.topicQ}>{topic.q} soru</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${barWidth}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.topicAcc, { color }]}>{topic.acc}%</Text>
    </View>
  );
}

export default function SubjectDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const trials = useSelector(selectTrials);

  // Support both old and new param shapes
  const subjectKey = route.params?.subjectKey || route.params?.subject?.key;
  const subjectName = route.params?.subjectName || route.params?.subject?.name;

  // Find subject color and meta
  const trialSubject = ALL_SUBJECTS.find((s) => s.key === subjectKey);

  // Map trial key → curriculum key for topics
  const curriculumKeys = TRIAL_TO_CURRICULUM[subjectKey] || [subjectKey];

  // Get history of this subject from trials
  const history = useMemo(() => {
    return [...trials]
      .filter((t) => t.subjects?.[subjectKey])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((t) => ({
        date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        net: t.subjects[subjectKey].net || 0,
        correct: t.subjects[subjectKey].correct || 0,
        wrong: t.subjects[subjectKey].wrong || 0,
      }));
  }, [trials, subjectKey]);

  const totals = useMemo(() => {
    if (!history.length) return { netAvg: 0, totalCorrect: 0, totalWrong: 0 };
    const sumNet = history.reduce((s, h) => s + h.net, 0);
    const totalCorrect = history.reduce((s, h) => s + h.correct, 0);
    const totalWrong = history.reduce((s, h) => s + h.wrong, 0);
    return {
      netAvg: (sumNet / history.length).toFixed(1),
      totalCorrect,
      totalWrong,
    };
  }, [history]);

  const subjectColor = trialSubject?.color || C.amber;

  const topics = useMemo(() => {
    const list = [];
    curriculumKeys.forEach((ck) => {
      const found = getSubjectByKey(ck);
      if (found?.topics) {
        found.topics.forEach((t) => {
          list.push({
            name: typeof t === "string" ? t : t.name,
            q: 0,
            acc: 0,
          });
        });
      }
    });
    return list;
  }, [curriculumKeys]);

  if (!subjectKey) {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginLeft: SPACING.md }]}>
            Ders Detayı
          </Text>
        </View>
        <View style={s.emptyBox}>
          <Text style={[TYPOGRAPHY.body, { color: C.muted }]}>Ders bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <View style={[s.colorBar, { backgroundColor: subjectColor }]} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.sm }]}>
          {subjectName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <StatBox label="Ort. Net" value={totals.netAvg} />
          <StatBox label="Doğru" value={totals.totalCorrect} />
          <StatBox label="Yanlış" value={totals.totalWrong} />
        </View>

        {history.length > 0 && (
          <>
            <Text style={s.sectionTitle}>SON DENEMELER</Text>
            <View style={s.historyCard}>
              {history.map((h, i) => (
                <View key={i} style={s.histRow}>
                  <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec, width: 70 }]}>
                    {h.date}
                  </Text>
                  <View style={{ flex: 1, flexDirection: "row", gap: 6 }}>
                    <Text style={[TYPOGRAPHY.caption, { color: C.green }]}>
                      {h.correct}D
                    </Text>
                    <Text style={[TYPOGRAPHY.caption, { color: C.red }]}>
                      {h.wrong}Y
                    </Text>
                  </View>
                  <Text style={[TYPOGRAPHY.bodySemiBold, { color: subjectColor }]}>
                    {h.net.toFixed(1)} net
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {topics.length > 0 && (
          <>
            <Text style={s.sectionTitle}>KONULAR</Text>
            {topics.slice(0, 15).map((t) => (
              <TopicRow key={t.name} topic={t} color={subjectColor} />
            ))}
          </>
        )}

        <Pressable
          onPress={() => navigation.navigate(SCREENS.STUDY_TIMER)}
          style={({ pressed }) => [
            s.cta,
            { backgroundColor: subjectColor },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Icon name="play" size={18} color={C.bg} />
          <Text style={s.ctaText}>Bu Dersi Çalış</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  colorBar: { width: 4, height: 20, borderRadius: 2, marginLeft: SPACING.md },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  statBox: { flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: "center" },
  statValue: { ...TYPOGRAPHY.statSmall, color: C.text },
  statLabel: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
  sectionTitle: { ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  historyCard: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  topicRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  topicInfo: { width: 110 },
  topicName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  topicQ: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
  barTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, marginHorizontal: SPACING.sm },
  barFill: { height: 6, borderRadius: 3 },
  topicAcc: { ...TYPOGRAPHY.bodySemiBold, width: 44, textAlign: "right" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.xxxl, gap: SPACING.sm },
  ctaText: { ...TYPOGRAPHY.button, color: C.bg },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center" },
});
