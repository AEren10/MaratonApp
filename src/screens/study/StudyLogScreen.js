import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";

const LogRow = React.memo(function LogRow({ item }) {
  const subj = getSubjectByKey(item.subject) || { icon: "bookOpen", color: "#A0A0B0" };
  const duration = item.minutes ? `${item.minutes} dk` : item.duration || "";
  return (
    <View style={s.row}>
      <IconBox icon={subj.icon} size={18} color={subj.color} />
      <View style={s.rowContent}>
        <Text style={s.topic} numberOfLines={1}>{item.topic || subj.label || ""}</Text>
        <Text style={s.date}>{item.dateLabel || ""}</Text>
      </View>
      <View style={[s.chip, { backgroundColor: subj.color + "18" }]}>
        <Text style={[s.chipText, { color: subj.color }]}>{duration}</Text>
      </View>
      <View style={s.qBox}>
        <Text style={s.qCount}>{item.questionCount || item.questions || 0}</Text>
        <Text style={s.qLabel}>soru</Text>
      </View>
    </View>
  );
});

function SectionHeader({ title }) {
  return <Text style={s.section}>{title}</Text>;
}

function EmptyState() {
  return (
    <View style={s.empty}>
      <Icon name="clock" size={40} color={C.muted} />
      <Text style={s.emptyText}>Henuz calisma kaydedilmedi</Text>
    </View>
  );
}

function relativeDate(iso) {
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Dün";
  if (diff < 7) return `${diff} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function StudyLogScreen() {
  const navigation = useNavigation();
  const logs = useSelector((state) => state.studyLog.todayLogs || []);

  const sections = useMemo(() => {
    const items = logs.map((log, i) => ({
      ...log,
      id: log.id || `log-${i}`,
      dateLabel: relativeDate(log.date || log.created_at),
    }));
    const grouped = {};
    items.forEach((log) => {
      const label = log.dateLabel;
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(log);
    });
    const result = [];
    Object.entries(grouped).forEach(([date, items]) => {
      result.push({ type: "header", id: `h-${date}`, title: date });
      items.forEach((item) => result.push({ type: "item", ...item }));
    });
    return result;
  }, [logs]);

  const renderItem = useCallback(({ item }) => {
    if (item.type === "header") return <SectionHeader title={item.title} />;
    return <LogRow item={item} />;
  }, []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1, marginLeft: SPACING.md }]}>
          Calisma Gecmisi
        </Text>
      </View>
      <FlatList
        data={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  section: { ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  rowContent: { flex: 1, marginLeft: SPACING.md },
  topic: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  date: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
  chip: { borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, marginRight: SPACING.sm },
  chipText: { ...TYPOGRAPHY.captionMedium },
  qBox: { alignItems: "center", minWidth: 36 },
  qCount: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  qLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { ...TYPOGRAPHY.body, color: C.muted, marginTop: SPACING.md },
});
