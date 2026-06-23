import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { getAllSubjects } from "../trial/trialTypes";
import { Icon, IconBox, AnimatedPressable } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";

const SUGGESTIONS = {
  neglected: "Bu konuya uzun süredir çalışmadın, tekrar et.",
  weak: "Düşük başarı oranı, temel kavramlardan başla.",
};
const DEFAULT_SUGGESTION = "Bu konuda daha fazla pratik yapman gerekiyor.";

function computeWeakTopics(C, trials) {
  if (!trials.length) return [];
  const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);
  const weak = [];
  getAllSubjects(C).forEach((s) => {
    const nets = recent
      .map((t) => t.subjects?.[s.key]?.net)
      .filter((n) => n !== undefined && n !== null);
    if (nets.length === 0) return;
    const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
    const pct = Math.round((avg / s.max) * 100);
    if (pct < 50) {
      weak.push({
        name: s.parent ? `${s.parent} ${s.name}` : s.name,
        subject: { key: s.key, name: s.name, color: s.color, icon: s.icon },
        acc: Math.max(0, pct),
        status: pct < 25 ? "weak" : "neglected",
      });
    }
  });
  return weak.sort((a, b) => a.acc - b.acc);
}

const WeakCard = React.memo(function WeakCard({ item, s, C, onStudy }) {
  const suggestion = SUGGESTIONS[item.status] || DEFAULT_SUGGESTION;
  const color = item.subject.color;
  return (
    <View style={[s.card, { borderLeftColor: color }]}>
      <View style={s.cardHeader}>
        <IconBox icon={item.subject.icon} size={28} color={color} rounded={8} />
        <Text style={s.subjectName}>{item.subject.name}</Text>
        <Text style={[s.accBadge, { color: item.acc < 50 ? C.red : C.amber }]}>
          {item.acc}%
        </Text>
      </View>
      <Text style={s.topicName}>{item.name}</Text>
      <Text style={s.suggestion}>{suggestion}</Text>
      <AnimatedPressable
        onPress={() => onStudy(item)}
        haptic="medium"
        style={[s.studyBtn, { backgroundColor: color + "16", borderColor: color + "30" }]}
        accessibilityRole="button"
        accessibilityLabel={`${item.name} konusuna git çalış`}
      >
        <Icon name="arrowR" size={14} color={color} sw={2.5} />
        <Text style={[s.studyBtnText, { color }]}>Git Çalış</Text>
      </AnimatedPressable>
    </View>
  );
});

export default function WeakAreasScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const trials = useSelector(selectTrials);
  const weakTopics = useMemo(() => computeWeakTopics(C, trials), [C, trials]);

  const handleStudy = useCallback((item) => {
    navigation.navigate(SCREENS.TOPIC_STUDY, {
      topic: { name: item.name, acc: item.acc },
      subject: item.subject,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item }) => <WeakCard item={item} s={s} C={C} onStudy={handleStudy} />, [s, C, handleStudy]);
  const keyExtractor = useCallback((item, i) => `${item.subject.key}-${item.name}-${i}`, []);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Zayıf Alanlar
        </Text>
      </View>

      <FlatList
        data={weakTopics}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        windowSize={5}
        maxToRenderPerBatch={10}
        ListFooterComponent={
          weakTopics.length > 0 ? (
            <View style={s.footer}>
              <Icon name="alert" size={16} color={C.accent} />
              <Text style={s.footerText}>{weakTopics.length} zayıf alan tespit edildi</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="check" size={40} color={C.green} />
            <Text style={s.emptyText}>Zayıf alan bulunamadı</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    card: { backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 3 },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm, gap: SPACING.sm },
    subjectName: { ...TYPOGRAPHY.captionMedium, color: C.sec, flex: 1 },
    accBadge: { ...TYPOGRAPHY.bodySemiBold },
    topicName: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: SPACING.xs },
    suggestion: { ...TYPOGRAPHY.caption, color: C.sec },
    studyBtn: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      marginTop: SPACING.md,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: RADIUS.full,
      borderWidth: 1,
    },
    studyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
    footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.xl, gap: SPACING.sm },
    footerText: { ...TYPOGRAPHY.captionMedium, color: C.sec },
    empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
    emptyText: { ...TYPOGRAPHY.body, color: C.muted, marginTop: SPACING.md },
  });
}
