import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import { SCREENS } from "../../constants/screens";

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
  const { subject } = route.params;

  const ders = useMemo(() => {
    const found = getSubjectByKey(subject?.key);
    if (!found) return null;
    return {
      ...found,
      name: found.label,
      topics: (found.topics || []).map((t) => ({
        name: typeof t === "string" ? t : t.name,
        q: 0,
        acc: 0,
        pct: 0,
      })),
    };
  }, [subject?.key]);
  const totalQ = useMemo(() => (ders?.topics || []).reduce((s, t) => s + t.q, 0), [ders]);
  const avgAcc = useMemo(() => {
    const topics = ders?.topics || [];
    if (!topics.length) return 0;
    return Math.round(topics.reduce((s, t) => s + t.acc, 0) / topics.length);
  }, [ders]);

  if (!ders) return null;

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <View style={[s.colorBar, { backgroundColor: subject.color }]} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.sm }]}>
          {subject.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.statsRow}>
          <StatBox label="Toplam Soru" value={totalQ} />
          <StatBox label="Basari Orani" value={`${avgAcc}%`} />
          <StatBox label="Son Calisma" value={ders.last} />
        </View>

        <Text style={s.sectionTitle}>Konu Dagilimi</Text>
        {ders.topics.map((t) => (
          <TopicRow key={t.name} topic={t} color={subject.color} />
        ))}

        <Pressable
          onPress={() => navigation.navigate(SCREENS.STUDY_TIMER)}
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
        >
          <Icon name="play" size={18} color={C.bg} />
          <Text style={s.ctaText}>Bu Dersi Calis</Text>
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
  topicRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  topicInfo: { width: 110 },
  topicName: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  topicQ: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
  barTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, marginHorizontal: SPACING.sm },
  barFill: { height: 6, borderRadius: 3 },
  topicAcc: { ...TYPOGRAPHY.bodySemiBold, width: 44, textAlign: "right" },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.amber, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.xxxl, gap: SPACING.sm },
  ctaText: { ...TYPOGRAPHY.button, color: C.bg },
});
