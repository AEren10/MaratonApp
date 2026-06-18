import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInLeft, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon, GlowBackground, WARM_GLOW } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { selectTrials } from "../../store/slices/trialSlice";
import { getSubjectsForExam } from "../../data/curriculum";
import { getTopicProgress } from "../../supabase/topicProgress";
import { weightedWeakAreas } from "../../lib/buildPlanContext";
import { buildRoadmap } from "../../lib/roadmapEngine";

function ProgressHeader({ roadmap, C, s }) {
  const pct = Math.round(roadmap.progress * 100);
  return (
    <Animated.View entering={FadeInDown.duration(440).springify().damping(16)} style={s.progressCard}>
      <View style={s.progressTop}>
        <View style={{ flex: 1 }}>
          <Text style={[s.progressPct, { color: C.text }]}>%{pct}</Text>
          <Text style={[s.progressLabel, { color: C.sec }]}>tamamlandı</Text>
        </View>
        <View style={s.progressStats}>
          <View style={s.miniStat}>
            <Text style={[s.miniVal, { color: C.green }]}>{roadmap.masteredCount}</Text>
            <Text style={[s.miniLabel, { color: C.muted }]}>bitti</Text>
          </View>
          <View style={[s.miniDivider, { backgroundColor: C.border }]} />
          <View style={s.miniStat}>
            <Text style={[s.miniVal, { color: C.amber }]}>{roadmap.improvingCount}</Text>
            <Text style={[s.miniLabel, { color: C.muted }]}>devam</Text>
          </View>
          <View style={[s.miniDivider, { backgroundColor: C.border }]} />
          <View style={s.miniStat}>
            <Text style={[s.miniVal, { color: C.text }]}>{roadmap.remainingCount}</Text>
            <Text style={[s.miniLabel, { color: C.muted }]}>kaldı</Text>
          </View>
        </View>
      </View>
      <View style={[s.barTrack, { backgroundColor: C.surface2 }]}>
        <View style={[s.barFill, { width: `${Math.max(2, pct)}%`, backgroundColor: C.green }]} />
      </View>
      {roadmap.nextMilestone ? (
        <View style={s.milestoneHint}>
          <Icon name={roadmap.nextMilestone.icon} size={14} color={C.amber} />
          <Text style={[s.milestoneHintText, { color: C.sec }]}>
            Sonraki hedef: {roadmap.nextMilestone.label} (%{Math.round(roadmap.nextMilestone.at * 100)})
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

function MilestoneNode({ milestone, C, s, delay }) {
  return (
    <Animated.View entering={FadeInLeft.delay(delay).duration(380).springify().damping(16)} style={s.milestoneRow}>
      <View style={s.timelineCol}>
        <View style={[s.milestoneDot, { backgroundColor: C.green }]}>
          <Icon name={milestone.icon} size={14} color="#FFFFFF" />
        </View>
      </View>
      <View style={[s.milestoneCard, { backgroundColor: C.green + "12", borderColor: C.green + "26" }]}>
        <Text style={[s.milestoneTitle, { color: C.green }]}>{milestone.label}</Text>
        <Text style={[s.milestoneTip, { color: C.sec }]}>{milestone.tip}</Text>
      </View>
    </Animated.View>
  );
}

function WeekNode({ week, C, s, delay }) {
  const [expanded, setExpanded] = useState(week.isCurrent);
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const dotColor = week.isCurrent ? C.accent : C.surface2;
  const completedInWeek = week.topics.filter((t) => t.mastery === "improving").length;
  const total = week.topics.length;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(420).springify().damping(16)}>
      <View style={s.weekRow}>
        <View style={s.timelineCol}>
          <View style={[s.weekDot, { backgroundColor: dotColor, borderColor: week.isCurrent ? C.accent : C.border }]}>
            <Text style={[s.weekDotText, { color: week.isCurrent ? "#FFFFFF" : C.muted }]}>
              {week.weekNo}
            </Text>
          </View>
          <View style={[s.timelineLine, { backgroundColor: C.border }]} />
        </View>

        <Animated.View style={[s.weekContent, pressStyle]}>
          <Pressable
            onPressIn={() => { scale.value = withSpring(0.98, { damping: 16 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 16 }); }}
            onPress={() => setExpanded((v) => !v)}
          >
            <View style={[s.weekCard, {
              backgroundColor: week.isCurrent ? C.accent + "10" : C.surface,
              borderColor: week.isCurrent ? C.accent + "28" : C.border,
            }]}>
              <View style={s.weekHeader}>
                <View style={{ flex: 1 }}>
                  <View style={s.weekTitleRow}>
                    <Text style={[s.weekTitle, { color: week.isCurrent ? C.accent : C.text }]}>
                      {week.isCurrent ? "Bu Hafta" : `${week.weekNo}. Hafta`}
                    </Text>
                    {week.isCurrent ? (
                      <View style={[s.currentBadge, { backgroundColor: C.accent }]}>
                        <Text style={s.currentBadgeText}>AKTİF</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[s.weekSub, { color: C.muted }]}>
                    {total} konu · {week.focusSubjects.join(", ")}
                  </Text>
                </View>
                <Icon name={expanded ? "chevDown" : "chevR"} size={18} color={C.muted} />
              </View>

              {expanded ? (
                <View style={s.topicList}>
                  {week.topics.map((t, i) => (
                    <View key={`${t.subject}-${t.topic}-${i}`} style={s.topicRow}>
                      <View style={[s.topicDot, { backgroundColor: t.color }]} />
                      <Text style={[s.topicName, { color: C.text }]} numberOfLines={1}>{t.topic}</Text>
                      <View style={[s.masteryChip, { backgroundColor: t.masteryColor + "22" }]}>
                        <Text style={[s.masteryText, { color: t.masteryColor }]}>{t.masteryLabel}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={[s.weekTipRow, { backgroundColor: C.amber + "0A" }]}>
                <Icon name="lightbulb" size={13} color={C.amber} />
                <Text style={[s.weekTipText, { color: C.sec }]}>{week.tip}</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
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

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <GlowBackground blobs={WARM_GLOW} />
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={s.headerTitle}>Yol Haritası</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={C.amber} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <ProgressHeader roadmap={roadmap} C={C} s={s} />

          {roadmap.milestones.map((m, i) => (
            <MilestoneNode key={m.label} milestone={m} C={C} s={s} delay={i * 60} />
          ))}

          {roadmap.weeks.map((w, i) => (
            <WeekNode key={w.weekNo} week={w} C={C} s={s} delay={200 + i * 60} />
          ))}

          <View style={s.endMark}>
            <View style={[s.endDot, { backgroundColor: C.green }]}>
              <Icon name="checkCircle" size={18} color="#FFFFFF" />
            </View>
            <Text style={[s.endText, { color: C.green }]}>Sınav Günü</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (C) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 80 },

  // Progress header
  progressCard: { backgroundColor: C.surface, borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: C.border, padding: SPACING.xl, marginBottom: SPACING.xl },
  progressTop: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
  progressPct: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 42, letterSpacing: -1 },
  progressLabel: { ...TYPOGRAPHY.caption },
  progressStats: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  miniStat: { alignItems: "center" },
  miniVal: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, letterSpacing: -0.4 },
  miniLabel: { ...TYPOGRAPHY.micro },
  miniDivider: { width: 1, height: 24 },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  milestoneHint: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.md },
  milestoneHintText: { ...TYPOGRAPHY.caption },

  // Timeline
  timelineCol: { width: 40, alignItems: "center" },
  timelineLine: { width: 2, flex: 1, minHeight: 20 },

  // Milestone
  milestoneRow: { flexDirection: "row", marginBottom: SPACING.md },
  milestoneDot: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", zIndex: 1 },
  milestoneCard: { flex: 1, marginLeft: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1 },
  milestoneTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  milestoneTip: { ...TYPOGRAPHY.caption, marginTop: 2 },

  // Week
  weekRow: { flexDirection: "row", marginBottom: 0 },
  weekDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center", zIndex: 1 },
  weekDotText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13 },
  weekContent: { flex: 1, marginLeft: SPACING.md, marginBottom: SPACING.lg },
  weekCard: { borderRadius: RADIUS.xxl, borderWidth: 1, overflow: "hidden" },
  weekHeader: { flexDirection: "row", alignItems: "center", padding: SPACING.lg },
  weekTitleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  weekTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 17, letterSpacing: -0.3 },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill },
  currentBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#FFFFFF", letterSpacing: 0.6 },
  weekSub: { ...TYPOGRAPHY.caption, marginTop: 2 },
  topicList: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm },
  topicRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  topicDot: { width: 8, height: 8, borderRadius: 4 },
  topicName: { ...TYPOGRAPHY.bodyMedium, flex: 1 },
  masteryChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.pill },
  masteryText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  weekTipRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderTopWidth: 1, borderTopColor: C.border },
  weekTipText: { ...TYPOGRAPHY.caption, flex: 1, lineHeight: 17 },

  // End mark
  endMark: { alignItems: "center", paddingTop: SPACING.md, gap: SPACING.sm },
  endDot: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  endText: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
});
