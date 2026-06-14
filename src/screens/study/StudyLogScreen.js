import React, { useMemo, useCallback, useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { getSubjectByKey } from "../../themes/subjects";
import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogs } from "../../supabase/studyLogs";

const LogRow = React.memo(function LogRow({ item }) {
  const subj = getSubjectByKey(item.subject) || { icon: "bookOpen", color: "#9A9EAB", label: item.subject };
  const minutes = item.duration_minutes || item.duration || 0;
  const duration = minutes > 0 ? `${minutes} dk` : "";
  return (
    <View style={s.row}>
      <IconBox icon={subj.icon} size={32} color={subj.color} rounded={8} />
      <View style={s.rowContent}>
        <Text style={s.topic} numberOfLines={1}>{item.topic || subj.label || ""}</Text>
        <Text style={s.date}>{subj.label || item.subject}</Text>
      </View>
      {duration ? (
        <View style={[s.chip, { backgroundColor: subj.color + "18" }]}>
          <Text style={[s.chipText, { color: subj.color }]}>{duration}</Text>
        </View>
      ) : null}
      <View style={s.qBox}>
        <Text style={s.qCount}>{item.question_count || item.questionCount || 0}</Text>
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
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.floor((today.getTime() - inputDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Dün";
  if (diff < 7) return `${diff} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function StudyLogScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    try {
      const data = await getStudyLogs(user.id);
      setLogs(data || []);
    } catch (_) {
      setLogs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
  }, [loadLogs]);

  const sections = useMemo(() => {
    const grouped = {};
    logs.forEach((log) => {
      const label = relativeDate(log.study_date);
      if (!grouped[label]) grouped[label] = [];
      grouped[label].push(log);
    });
    const result = [];
    Object.entries(grouped).forEach(([date, items]) => {
      result.push({ type: "header", id: `h-${date}`, title: date });
      items.forEach((item) => result.push({ type: "item", ...item, id: item.id }));
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
          Çalışma Geçmişi
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={C.amber} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.amber}
              colors={[C.amber]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  section: { ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xl, marginBottom: SPACING.sm },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm },
  rowContent: { flex: 1 },
  topic: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  date: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: 2 },
  chip: { borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
  chipText: { ...TYPOGRAPHY.captionMedium },
  qBox: { alignItems: "center", minWidth: 40 },
  qCount: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
  qLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  empty: { alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { ...TYPOGRAPHY.body, color: C.muted, marginTop: SPACING.md },
});
