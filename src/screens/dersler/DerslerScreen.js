import React, { useMemo, useState, useCallback, useEffect } from "react";
import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, getSubjectIdentity } from "../../themes/tokens";
import { useC, useTheme } from "../../contexts/ThemeContext";
import { useCurriculum } from "../../hooks/useCurriculum";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { useAuth } from "../../contexts/AuthContext";
import { getTopicProgress } from "../../supabase/topicProgress";
import { captureError } from "../../lib/errorReporting";
import { FocusCard } from "./components/FocusCard";
import { SubjectRow } from "./components/SubjectRow";

const EXPECTED_QUESTIONS = 30;

function calcTopicProgress(tp) {
  const qScore = Math.min((tp.total_questions || 0) / EXPECTED_QUESTIONS, 1) * 40;
  const accScore = tp.total_questions > 0 ? ((tp.correct_count || 0) / tp.total_questions) * 30 : 0;
  const freqScore = Math.min((tp.study_count || 0) / 3, 1) * 30;
  return Math.min(100, Math.round(qScore + accScore + freqScore));
}

function buildDersler(subjects, progressMap) {
  return subjects.map((s) => {
    const subjectProgress = progressMap[s.key] || {};
    const topicsList = (s.topics || []).map((t) => {
      const tName = typeof t === "string" ? t : t.name;
      const tp = subjectProgress[tName];
      return { name: tName, pct: tp ? calcTopicProgress(tp) : 0 };
    });
    const done = topicsList.filter((t) => t.pct >= 100).length;
    const total = topicsList.length;
    return { ...s, name: s.label, pct: total > 0 ? Math.round((done / total) * 100) : 0, done, total };
  });
}

function DerslerSkeleton({ C }) {
  return (
    <View style={{ paddingHorizontal: SPACING.lg, paddingTop: 60, gap: SPACING.md }}>
      <SkeletonCard height={28} width={120} rounded={8} />
      <SkeletonCard height={6} rounded={3} />
      <SkeletonCard height={44} rounded={12} />
      <SkeletonCard height={120} rounded={22} />
      <SkeletonCard height={56} rounded={0} />
      <SkeletonCard height={56} rounded={0} />
      <SkeletonCard height={56} rounded={0} />
    </View>
  );
}

function EmptyState({ C, onPress }) {
  return (
    <View style={{ alignItems: "center", paddingTop: SPACING.huge, paddingHorizontal: SPACING.xxl, gap: SPACING.lg }}>
      <View style={{ width: 74, height: 74, borderRadius: 24, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" }}>
        <Icon name="bookOpen" size={34} color={C.accent} />
      </View>
      <Text style={{ ...TYPOGRAPHY.subheading, color: C.text, textAlign: "center" }}>
        Derslerini tanıyalım
      </Text>
      <Text style={{ ...TYPOGRAPHY.body, color: C.sec, textAlign: "center", lineHeight: 22 }}>
        {"İlk denemeni gir; en zayıf dersinden başlayıp konu konu ilerleyelim. Her dersin neti ve eksik konuların burada belirir."}
      </Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          backgroundColor: C.accent,
          borderRadius: RADIUS.lg,
          paddingHorizontal: SPACING.xxl,
          paddingVertical: SPACING.md,
          opacity: pressed ? 0.85 : 1,
          marginTop: SPACING.sm,
        })}
      >
        <Icon name="edit" size={16} color={C.textOnFill} />
        <Text style={{ ...TYPOGRAPHY.button, color: C.textOnFill }}>
          {"İlk Denemeni Gir"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function DerslerScreen() {
  const C = useC();
  const { scheme } = useTheme();
  const subjectId = useCallback((key) => getSubjectIdentity(scheme, key), [scheme]);
  const navigation = useNavigation();
  const { tytSubjects, aytSubjects, loading: currLoading, group1Label, group2Label } = useCurriculum();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [activeTab, setActiveTab] = useState("tyt");

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
    } catch (e) { captureError(e, { context: "dersler_loadProgress" }); }
  }, [user?.id]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProgress().finally(() => setRefreshing(false));
  }, [loadProgress]);

  const hasAyt = aytSubjects.length > 0;

  const activeSubjects = useMemo(
    () => buildDersler(activeTab === "tyt" ? tytSubjects : aytSubjects, progressMap),
    [activeTab, tytSubjects, aytSubjects, progressMap],
  );

  const { totalDone, totalAll, focusSubject } = useMemo(() => {
    if (!activeSubjects.length) return { totalDone: 0, totalAll: 0, focusSubject: null };
    const done = activeSubjects.reduce((s, d) => s + d.done, 0);
    const all = activeSubjects.reduce((s, d) => s + d.total, 0);
    const focus = [...activeSubjects].sort((a, b) => a.pct - b.pct)[0];
    return { totalDone: done, totalAll: all, focusSubject: focus };
  }, [activeSubjects]);

  const hasNoData = totalAll === 0;
  const progressPct = totalAll > 0 ? totalDone / totalAll : 0;

  if (currLoading) {
    return (
      <ScreenErrorBoundary>
        <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
          <DerslerSkeleton C={C} />
        </SafeAreaView>
      </ScreenErrorBoundary>
    );
  }

  return (
    <ScreenErrorBoundary>
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} colors={[C.accent]} />
          }
        >
          {/* Header */}
          <View style={{ paddingTop: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm }}>
            <Text style={{ fontFamily: "SpaceGrotesk_600SemiBold", fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: C.text }}>
              Dersler
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
              <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.surface2, overflow: "hidden" }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: C.accent, width: `${Math.round(progressPct * 100)}%` }} />
              </View>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 12, lineHeight: 16, color: C.sec }}>
                {totalDone}/{totalAll} konu
              </Text>
            </View>
          </View>

          {/* TYT/AYT Segmented Control */}
          {hasAyt && (
            <View style={{ flexDirection: "row", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg }}>
              {[{ key: "tyt", label: group1Label }, { key: "ayt", label: group2Label }].map((tab) => (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={{ flex: 1, borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: "center", backgroundColor: activeTab === tab.key ? C.accent : "transparent" }}
                >
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: activeTab === tab.key ? C.textOnFill : C.sec }}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {hasNoData ? (
            <EmptyState C={C} onPress={() => navigation.navigate(SCREENS.TRIAL_ENTRY)} />
          ) : (
            <>
              {/* Focus section */}
              {focusSubject && (
                <View style={{ marginBottom: SPACING.xl }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md }}>
                    <Icon name="alert" size={14} color={C.orange} />
                    <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 14, letterSpacing: 1, color: C.orange, textTransform: "uppercase" }}>
                      {"Önce Buna Odaklan"}
                    </Text>
                  </View>
                  <FocusCard
                    subject={focusSubject}
                    identity={subjectId(focusSubject.key)}
                    textColor={C.text}
                    mutedColor={C.muted}
                    surface2Color={C.surface2}
                    onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey: focusSubject.key })}
                  />
                </View>
              )}

              {/* All subjects */}
              <View style={{ marginBottom: SPACING.xxl }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 14, letterSpacing: 1.3, color: C.muted, textTransform: "uppercase", marginBottom: SPACING.md }}>
                  {"Tüm Dersler"}
                </Text>
                <View>
                  {activeSubjects.map((subject, i) => (
                    <SubjectRow
                      key={subject.key}
                      subject={subject}
                      identity={subjectId(subject.key)}
                      textColor={C.text}
                      mutedColor={C.muted}
                      surface2Color={C.surface2}
                      isLast={i === activeSubjects.length - 1}
                      onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { subjectKey: subject.key })}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
}
