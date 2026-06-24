import { useState, useCallback, useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getStudyLogs } from "../../supabase/studyLogs";
import { SessionCard } from "./components/SessionCard";

const formatDateHeader = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];
  if (dateStr === todayStr) return "Bugün";
  if (dateStr === yStr) return "Dün";
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "short" });
};

export default function StudyHistoryScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async (isRefresh = false) => {
    if (!user?.id) return;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const data = await getStudyLogs(user.id);
      setLogs((data || []).slice(0, 50));
    } catch (_) { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, [user?.id]);

  useFocusEffect(useCallback(() => { fetchLogs(); }, [fetchLogs]));

  const sections = useMemo(() => {
    const map = {};
    logs.forEach((l) => {
      const key = l.study_date || l.created_at?.split("T")[0] || "unknown";
      if (!map[key]) map[key] = { date: key, data: [] };
      map[key].data.push(l);
    });
    const result = [];
    Object.values(map)
      .sort((a, b) => b.date.localeCompare(a.date))
      .forEach((s) => {
        result.push({ type: "header", date: s.date, id: `h_${s.date}` });
        s.data.forEach((d) => result.push({ type: "item", ...d }));
      });
    return result;
  }, [logs]);

  const renderItem = useCallback(({ item }) => {
    if (item.type === "header") {
      return (
        <Text style={[styles.dateHeader, { color: C.sec }]}>
          {formatDateHeader(item.date)}
        </Text>
      );
    }
    return <SessionCard item={item} C={C} />;
  }, [C]);

  const keyExtractor = useCallback((item) =>
    item.type === "header" ? item.id : String(item.id), []);

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Çalışma Geçmişi</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, gap: SPACING.md }}>
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} height={64} />)}
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon="clock"
          title="Henüz kayıt yok"
          message="Çalışma zamanlayıcısıyla bir oturum tamamladığında burada görünecek."
          color="accent"
        />
      ) : (
        <FlatList
          data={sections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          windowSize={5}
          maxToRenderPerBatch={10}
          refreshing={refreshing}
          onRefresh={() => fetchLogs(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.huge },
  dateHeader: {
    ...TYPOGRAPHY.captionMedium,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    textTransform: "capitalize",
  },
});
