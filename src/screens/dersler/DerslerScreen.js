import React, { useMemo, useState, useCallback, useEffect } from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useCurriculum } from "../../hooks/useCurriculum";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { AnimatedCard } from "../../components/design/AnimatedCard";
import { SubjectCard } from "./components/SubjectCard";
import { useAuth } from "../../contexts/AuthContext";
import { getTopicProgress } from "../../supabase/topicProgress";

const GROUP_META = {
  fen: { label: "Fen Bilimleri", color: "#34D399", icon: "activity" },
  sosyal: { label: "Sosyal Bilimler", color: "#A78BFA", icon: "layers" },
};

const FEN_KEYS = ["fizik", "kimya", "biyoloji"];
const SOSYAL_KEYS = ["tarih", "cografya", "felsefe", "din", "edebiyat"];

function inferGroup(subject) {
  if (subject.group) return subject.group;
  const k = subject.key.replace(/^ayt_/, "").replace(/^ea_/, "");
  if (FEN_KEYS.some((f) => k.startsWith(f))) return "fen";
  if (SOSYAL_KEYS.some((s) => k.startsWith(s))) return "sosyal";
  return null;
}

function buildSections(subjects, progressMap) {
  const dersler = subjects.map((s) => {
    const subjectProgress = progressMap[s.key] || {};
    const topicsList = (s.topics || []).map((t) => {
      const tName = typeof t === "string" ? t : t.name;
      const tp = subjectProgress[tName];
      return {
        name: tName,
        q: tp?.total_questions || 0,
        acc: tp && tp.total_questions > 0 ? Math.round((tp.correct_count / tp.total_questions) * 100) : 0,
        last: tp?.last_studied_at || null,
        pct: tp ? Math.min(100, Math.round((tp.study_count / 3) * 100)) : 0,
      };
    });
    const done = topicsList.filter((t) => t.pct >= 100).length;
    const total = topicsList.length;
    return {
      ...s,
      name: s.label,
      short: s.label,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
      done,
      total,
      last: null,
      topics: topicsList,
    };
  });

  const standalone = [];
  const grouped = {};

  dersler.forEach((d) => {
    const g = inferGroup(d);
    if (g && GROUP_META[g]) {
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(d);
    } else {
      standalone.push(d);
    }
  });

  const sections = [];

  standalone.forEach((d) => {
    sections.push({ type: "subject", data: d });
  });

  Object.keys(grouped).forEach((g) => {
    const meta = GROUP_META[g];
    sections.push({
      type: "group",
      key: g,
      label: meta.label,
      color: meta.color,
      icon: meta.icon,
      count: grouped[g].length,
      topicCount: grouped[g].reduce((s, d) => s + d.total, 0),
    });
    grouped[g].forEach((d) => {
      sections.push({ type: "subject", data: d, groupKey: g });
    });
  });

  return { sections, dersler };
}

function SectionHeader({ label, color, icon, count, topicCount }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xs,
        marginTop: SPACING.lg,
        marginBottom: SPACING.xs,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: color + "20",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>
          {label}
        </Text>
        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>
          {count} ders · {topicCount} konu
        </Text>
      </View>
      <View
        style={{
          height: 1,
          flex: 0.3,
          backgroundColor: color + "30",
        }}
      />
    </View>
  );
}

function PageHeader({ totalDone, totalAll }) {
  return (
    <View style={{ paddingTop: SPACING.lg, paddingBottom: SPACING.xl }}>
      <Text style={{ ...TYPOGRAPHY.heading, color: C.text }}>Dersler</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: SPACING.xs,
        }}
      >
        <Icon name="layers" size={14} color={C.sec} sw={1.5} />
        <Text
          style={{
            ...TYPOGRAPHY.caption,
            color: C.sec,
            marginLeft: SPACING.xs,
          }}
        >
          {totalDone}/{totalAll} konu tamamlandi
        </Text>
      </View>
    </View>
  );
}

function DerslerSkeleton() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.md }}>
      <SkeletonCard height={24} width={120} rounded={8} />
      <SkeletonCard height={14} width={180} rounded={6} />
      <View style={{ marginTop: SPACING.lg, gap: SPACING.md }}>
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
        <SkeletonCard height={24} width={140} rounded={8} />
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
        <SkeletonCard height={100} />
      </View>
    </View>
  );
}

export default function DerslerScreen() {
  const { tytSubjects, aytSubjects, loading: currLoading } = useCurriculum();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [progressMap, setProgressMap] = useState({});

  const loadProgress = useCallback(async () => {
    if (!user?.id || user.id === "dev") return;
    try {
      const rows = await getTopicProgress(user.id);
      const map = {};
      (rows || []).forEach((r) => {
        if (!map[r.subject_key]) map[r.subject_key] = {};
        map[r.subject_key][r.topic_name || r.topic_id] = r;
      });
      setProgressMap(map);
    } catch (_) {}
  }, [user?.id]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProgress().finally(() => setRefreshing(false));
  }, [loadProgress]);

  const hasTyt = tytSubjects.length > 0;
  const hasAyt = aytSubjects.length > 0;

  const tytData = useMemo(() => buildSections(tytSubjects, progressMap), [tytSubjects, progressMap]);
  const aytData = useMemo(() => buildSections(aytSubjects, progressMap), [aytSubjects, progressMap]);

  const totalDone = useMemo(() => {
    const all = [...tytData.dersler, ...aytData.dersler];
    return all.reduce((s, d) => s + d.done, 0);
  }, [tytData, aytData]);
  const totalAll = useMemo(() => {
    const all = [...tytData.dersler, ...aytData.dersler];
    return all.reduce((s, d) => s + d.total, 0);
  }, [tytData, aytData]);

  if (currLoading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <DerslerSkeleton />
      </SafeAreaView>
    );
  }

  let animIndex = 0;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SPACING.lg,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.amber}
            colors={[C.amber]}
          />
        }
      >
        <PageHeader totalDone={totalDone} totalAll={totalAll} />

        {hasTyt && hasAyt && (
          <ExamBadge label="TYT" color={C.amber} count={tytData.dersler.length} />
        )}

        <View style={{ gap: SPACING.md }}>
          {tytData.sections.map((item, i) => {
            if (item.type === "group") {
              return (
                <SectionHeader
                  key={item.key}
                  label={item.label}
                  color={item.color}
                  icon={item.icon}
                  count={item.count}
                  topicCount={item.topicCount}
                />
              );
            }
            const idx = animIndex++;
            return (
              <AnimatedCard key={item.data.key} delay={idx * 60}>
                <SubjectCard subject={item.data} />
              </AnimatedCard>
            );
          })}
        </View>

        {hasAyt && (
          <>
            <View style={{ marginTop: SPACING.xxxl }}>
              <ExamBadge label="AYT" color={C.blue} count={aytData.dersler.length} />
            </View>
            <View style={{ gap: SPACING.md }}>
              {aytData.sections.map((item, i) => {
                if (item.type === "group") {
                  return (
                    <SectionHeader
                      key={`ayt_${item.key}`}
                      label={item.label}
                      color={item.color}
                      icon={item.icon}
                      count={item.count}
                      topicCount={item.topicCount}
                    />
                  );
                }
                const idx = animIndex++;
                return (
                  <AnimatedCard key={item.data.key} delay={idx * 60}>
                    <SubjectCard subject={item.data} />
                  </AnimatedCard>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExamBadge({ label, color, count }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: SPACING.md,
        gap: SPACING.sm,
      }}
    >
      <View
        style={{
          backgroundColor: color + "20",
          borderRadius: RADIUS.lg,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.xs,
          borderWidth: 1,
          borderColor: color + "40",
        }}
      >
        <Text
          style={{
            ...TYPOGRAPHY.captionMedium,
            color,
            fontFamily: "SpaceGrotesk_700Bold",
            letterSpacing: 1,
          }}
        >
          {label}
        </Text>
      </View>
      <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>
        {count} ders
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );
}
