import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import { Icon } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { getMastery } from "../../lib/mastery";

function StatBox({ label, value }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function SubtopicRow({ item }) {
  return (
    <View style={s.subtopicRow}>
      <Icon
        name={item.done ? "checkCircle" : "radio"}
        size={20}
        color={item.done ? C.green : C.muted}
      />
      <Text style={[s.subtopicName, item.done && { color: C.sec }]}>{item.name}</Text>
    </View>
  );
}

export default function TopicStudyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { topic, subject, subtopics: paramSubtopics } = route.params;
  const mastery = topic.acc / 100;
  const masteryLevel = getMastery({ q: topic.q, acc: topic.acc });
  const circumference = 2 * Math.PI * 40;
  const subtopics = (paramSubtopics || []).map((name, i) => ({
    name,
    done: i < Math.floor((paramSubtopics?.length || 0) * mastery),
  }));

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          {topic.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={[s.subjectChip, { backgroundColor: subject.color + "18" }]}>
          <Icon name={subject.icon} size={14} color={subject.color} />
          <Text style={[s.chipText, { color: subject.color }]}>{subject.name}</Text>
        </View>

        <View style={s.statsRow}>
          <StatBox label="Toplam Soru" value={topic.q} />
          <StatBox label="Basari Orani" value={`${topic.acc}%`} />
          <StatBox label="Son Calisma" value={topic.last} />
        </View>

        <View style={s.ringWrapper}>
          <View style={{ width: 96, height: 96, alignItems: "center", justifyContent: "center" }}>
            <Svg width={96} height={96} style={{ position: "absolute" }}>
              <Circle cx={48} cy={48} r={40} stroke={C.border} strokeWidth={8} fill="none" />
              <Circle cx={48} cy={48} r={40} stroke={subject.color} strokeWidth={8} fill="none"
                strokeLinecap="round" strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - mastery)}
                transform="rotate(-90 48 48)" />
            </Svg>
            <Text style={s.ringText}>{topic.acc}%</Text>
          </View>
          <Text style={s.ringLabel}>Hakimiyet</Text>
          <View style={s.masteryBadge}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: masteryLevel.color }} />
            <Text style={[s.masteryText, { color: masteryLevel.color }]}>{masteryLevel.label}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Alt Konular</Text>
        {subtopics.length > 0 ? subtopics.map((st) => (
          <SubtopicRow key={st.name} item={st} />
        )) : (
          <Text style={[TYPOGRAPHY.caption, { color: C.muted, textAlign: "center", padding: SPACING.lg }]}>
            Alt konu bilgisi bulunamadi
          </Text>
        )}

        <Pressable
          onPress={() => navigation.navigate(SCREENS.STUDY_TIMER)}
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]}
        >
          <Icon name="play" size={18} color={C.bg} />
          <Text style={s.ctaText}>Calis</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  subjectChip: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, gap: SPACING.xs, marginTop: SPACING.sm },
  chipText: { ...TYPOGRAPHY.captionMedium },
  statsRow: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.xl },
  statBox: { flex: 1, backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: "center" },
  statValue: { ...TYPOGRAPHY.statSmall, color: C.text },
  statLabel: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
  ringWrapper: { alignItems: "center", marginTop: SPACING.xxl },
  ringText: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  ringLabel: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.sm },
  masteryBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: SPACING.sm },
  masteryText: { ...TYPOGRAPHY.captionMedium },
  sectionTitle: { ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  subtopicRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  subtopicName: { ...TYPOGRAPHY.body, color: C.text, flex: 1 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: C.amber, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.xxxl, gap: SPACING.sm },
  ctaText: { ...TYPOGRAPHY.button, color: C.bg },
});
