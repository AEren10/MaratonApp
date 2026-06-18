import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { getSubjectByKey } from "../../themes/subjects";
import { getAllSubjects } from "../trial/trialTypes";
import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap";
import { SCREENS } from "../../constants/screens";
import { selectTrials } from "../../store/slices/trialSlice";
import { useAuth } from "../../contexts/AuthContext";
import { getWrongQuestions } from "../../supabase/wrongQuestions";
import { TrendChart } from "./components/TrendChart";

function StatBox({ label, value, s }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function TopicRow({ topic, color, s, onPress }) {
  const barWidth = Math.round(Math.max(topic.acc, 5));
  return (
    <Pressable onPress={() => onPress?.(topic)} style={({ pressed }) => [s.topicRow, pressed && { opacity: 0.6 }]}>
      <View style={s.topicInfo}>
        <Text style={s.topicName} numberOfLines={1}>{topic.name}</Text>
        <Text style={s.topicQ}>{topic.q} soru</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${barWidth}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.topicAcc, { color }]}>{topic.acc}%</Text>
    </Pressable>
  );
}

export default function SubjectDetailScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const route = useRoute();
  const trials = useSelector(selectTrials);
  const { user } = useAuth();

  // Support both old and new param shapes
  const subjectKey = route.params?.subjectKey || route.params?.subject?.key || null;
  const subjectName = route.params?.subjectName || route.params?.subject?.name;

  useEffect(() => {
    if (!subjectKey) navigation.goBack();
  }, [subjectKey, navigation]);

  // Find subject color and meta
  const allSubjects = useMemo(() => getAllSubjects(C), [C]);
  const trialSubject = allSubjects.find((s) => s.key === subjectKey);

  // Map trial key → curriculum key for topics
  const curriculumKeys = TRIAL_TO_CURRICULUM[subjectKey] || [subjectKey];

  // En çok yanlış yapılan 5 konu (wrong_questions'tan)
  const [topWrongTopics, setTopWrongTopics] = useState([]);
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    getWrongQuestions(user.id)
      .then((rows) => {
        if (cancelled) return;
        const counts = {};
        (rows || []).forEach((r) => {
          if (!curriculumKeys.includes(r.subject) || !r.topic) return;
          counts[r.topic] = (counts[r.topic] || 0) + 1;
        });
        const top = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, n]) => ({ name, n }));
        setTopWrongTopics(top);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, subjectKey]);

  // Get history of this subject from trials
  const history = useMemo(() => {
    return [...trials]
      .filter((t) => t.subjects?.[subjectKey])
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
      .map((t) => ({
        date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        net: t.subjects[subjectKey].net || 0,
        correct: t.subjects[subjectKey].correct || 0,
        wrong: t.subjects[subjectKey].wrong || 0,
      }));
  }, [trials, subjectKey]);

  const trendData = useMemo(() => {
    if (history.length < 2) return { data: [], labels: [] };
    const reversed = [...history].reverse();
    return {
      data: reversed.map((h) => h.net),
      labels: reversed.map((h) => h.date),
    };
  }, [history]);

  const accuracy = useMemo(() => {
    const totalAnswered = (history[0]?.correct || 0) + (history[0]?.wrong || 0);
    if (history.length === 0 || totalAnswered === 0) return null;
    const totalC = history.reduce((s, h) => s + h.correct, 0);
    const totalW = history.reduce((s, h) => s + h.wrong, 0);
    const total = totalC + totalW;
    if (total === 0) return null;
    return Math.round((totalC / total) * 100);
  }, [history]);

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
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
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
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <View style={[s.colorBar, { backgroundColor: subjectColor }]} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.sm }]}>
          {subjectName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <StatBox label="Ort. Net" value={totals.netAvg} s={s} />
          <StatBox label="Doğru" value={totals.totalCorrect} s={s} />
          <StatBox label="Yanlış" value={totals.totalWrong} s={s} />
          {accuracy !== null && <StatBox label="Başarı %" value={`${accuracy}`} s={s} />}
        </View>

        {trendData.data.length >= 2 && (
          <View style={{ marginTop: SPACING.lg }}>
            <TrendChart
              data={trendData.data}
              labels={trendData.labels}
              color={subjectColor}
              title="Bu Derste Net Trendi"
            />
          </View>
        )}

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

        {topWrongTopics.length > 0 && (
          <>
            <Text style={s.sectionTitle}>EN ÇOK YANLIŞ YAPILAN KONULAR</Text>
            <View style={s.historyCard}>
              {topWrongTopics.map((t, i) => (
                <View key={t.name} style={s.wrongTopicRow}>
                  <Text style={[TYPOGRAPHY.captionMedium, { color: C.muted, width: 18 }]}>{i + 1}</Text>
                  <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <View style={s.wrongBadge}>
                    <Text style={[TYPOGRAPHY.micro, { color: C.red }]}>{t.n} yanlış</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {topics.length > 0 && (
          <>
            <Text style={s.sectionTitle}>KONULAR</Text>
            {topics.slice(0, 15).map((t, i) => (
              <TopicRow key={`${t.name}-${i}`} topic={t} color={subjectColor} s={s} onPress={(tp) => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey, topicName: tp.name })} />
            ))}
          </>
        )}

        <Pressable
          onPress={() => navigation.navigate(SCREENS.WEAK_AREAS, { subjectKey, subjectName })}
          style={({ pressed }) => [
            s.secondaryCta,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Icon name="alert" size={18} color={C.amber} />
          <Text style={[s.secondaryCtaText, { color: C.amber }]}>Zayıf Alanları Gör</Text>
        </Pressable>

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

function makeStyles(C) {
  return StyleSheet.create({
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
    wrongTopicRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.sm },
    wrongBadge: { backgroundColor: C.red + "18", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    topicRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
    topicInfo: { width: 110 },
    topicName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    topicQ: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
    barTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, marginHorizontal: SPACING.sm },
    barFill: { height: 6, borderRadius: 3 },
    topicAcc: { ...TYPOGRAPHY.bodySemiBold, width: 44, textAlign: "right" },
    secondaryCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: RADIUS.xl, paddingVertical: SPACING.md, marginTop: SPACING.xxl, gap: SPACING.sm, borderWidth: 1, borderColor: C.amber + "40", backgroundColor: C.amber + "10" },
    secondaryCtaText: { ...TYPOGRAPHY.button },
    cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.md, gap: SPACING.sm },
    ctaText: { ...TYPOGRAPHY.button, color: C.bg },
    emptyBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  });
}
