import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { SUBJECTS } from "../trial/trialSubjects";
import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";

const SUGGESTIONS = {
  neglected: "Bu konuya uzun süredir çalışmadın, tekrar et.",
  weak: "Düşük başarı oranı, temel kavramlardan başla.",
};
const DEFAULT_SUGGESTION = "Bu konuda daha fazla pratik yapman gerekiyor.";

function computeWeakTopics(trials) {
  if (!trials.length) return [];
  const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);
  const weak = [];
  SUBJECTS.forEach((s) => {
    const nets = recent.map((t) => t.subjects?.[s.key]?.net || 0);
    const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
    const pct = Math.round((avg / s.max) * 100);
    if (pct < 50) {
      weak.push({
        name: s.name,
        subject: { key: s.key, name: s.name, color: s.color, icon: s.icon },
        acc: Math.max(0, pct),
        status: pct < 25 ? "weak" : "neglected",
      });
    }
  });
  return weak.sort((a, b) => a.acc - b.acc);
}

const WeakCard = React.memo(function WeakCard({ item }) {
  const suggestion = SUGGESTIONS[item.status] || DEFAULT_SUGGESTION;
  return (
    <View style={[s.card, { borderLeftColor: item.subject.color }]}>
      <View style={s.cardHeader}>
        <IconBox name={item.subject.icon} size={16} color={item.subject.color} />
        <Text style={s.subjectName}>{item.subject.name}</Text>
        <Text style={[s.accBadge, { color: item.acc < 50 ? C.red : C.amber }]}>
          {item.acc}%
        </Text>
      </View>
      <Text style={s.topicName}>{item.name}</Text>
      <Text style={s.suggestion}>{suggestion}</Text>
    </View>
  );
});

export default function WeakAreasScreen() {
  const navigation = useNavigation();
  const trials = useSelector(selectTrials);
  const weakTopics = useMemo(() => computeWeakTopics(trials), [trials]);

  const renderItem = useCallback(({ item }) => <WeakCard item={item} />, []);
  const keyExtractor = useCallback((item, i) => `${item.subject.key}-${item.name}-${i}`, []);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Zayif Alanlar
        </Text>
      </View>

      <FlatList
        data={weakTopics}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          weakTopics.length > 0 ? (
            <View style={s.footer}>
              <Icon name="alert" size={16} color={C.amber} />
              <Text style={s.footerText}>{weakTopics.length} zayif alan tespit edildi</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Icon name="checkCircle" size={40} color={C.green} />
            <Text style={s.emptyText}>Zayif alan bulunamadi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  card: { backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm },
  subjectName: { ...TYPOGRAPHY.captionMedium, color: C.sec, flex: 1, marginLeft: SPACING.sm },
  accBadge: { ...TYPOGRAPHY.bodySemiBold },
  topicName: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginBottom: SPACING.xs },
  suggestion: { ...TYPOGRAPHY.caption, color: C.sec },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: SPACING.xl, gap: SPACING.sm },
  footerText: { ...TYPOGRAPHY.captionMedium, color: C.amber },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { ...TYPOGRAPHY.body, color: C.muted, marginTop: SPACING.md },
});
