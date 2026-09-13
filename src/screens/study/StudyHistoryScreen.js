import { useCallback, useMemo } from "react";
import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";

import { ErrorState, Skeleton } from "../../components/design";
import { useC } from "../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { RecordHeader } from "./components/record/RecordHeader";
import { HistoryEmpty } from "./components/history/HistoryEmpty";
import { HistoryRow } from "./components/history/HistoryRow";
import { HistoryTotals } from "./components/history/HistoryTotals";
import { useStudyHistoryController } from "./useStudyHistoryController";

// "Çalışma Geçmişi" — eski StudyHistory ve StudyLog ekranlarinin birlesimi.
// Iki rota adi da bu ekrana bagli (Ayarlar satiri, sayac linki, deep link).
export default function StudyHistoryScreen() {
  const C = useC();
  const h = useStudyHistoryController();
  const { sections, totals } = h.history;

  const items = useMemo(() => {
    const out = [];
    sections.forEach((section, si) => {
      out.push({ type: "header", key: `h-${section.key}`, title: section.title, first: si === 0 });
      section.rows.forEach((row, ri) => out.push({
        type: "row", key: String(row.log.id), row,
        last: si === sections.length - 1 && ri === section.rows.length - 1,
      }));
    });
    return out;
  }, [sections]);

  const renderItem = useCallback(({ item }) => {
    if (item.type === "header") {
      return (
        <Text style={[TYPOGRAPHY.label, styles.section, !item.first && styles.sectionGap, { color: C.text2 }]}>
          {item.title}
        </Text>
      );
    }
    return <HistoryRow row={item.row} last={item.last} onOpen={h.openLog} onDelete={h.deleteLog} />;
  }, [C, h.openLog, h.deleteLog]);

  let body;
  if (h.loading) {
    body = (
      <View style={styles.skeleton}>
        <Skeleton height={48} width="70%" radius={SHAPE.chip} />
        {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={56} radius={SHAPE.chip} />)}
      </View>
    );
  } else if (h.failed && !totals.count) {
    body = <ErrorState preset="server" secondary="" onPrimary={h.retry} style={styles.gutter} />;
  } else if (h.isEmpty) {
    body = <HistoryEmpty onStart={h.startTimer} onManual={h.addManual} />;
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={<Animated.View entering={FadeIn.duration(500)}><HistoryTotals totals={totals} /></Animated.View>}
        ListFooterComponent={
          <Text style={[TYPOGRAPHY.caption, styles.hint, { color: C.text3 }]}>Satıra dokun düzenle, sola kaydır sil.</Text>
        }
        contentContainerStyle={styles.list}
        windowSize={7}
        maxToRenderPerBatch={12}
        initialNumToRender={14}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={h.refreshing} onRefresh={h.onRefresh} tintColor={C.accent} colors={[C.accent]} />}
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.fill, { backgroundColor: C.bg }]}>
      <RecordHeader title="Çalışma geçmişi" onBack={h.goBack} />
      {body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  gutter: { paddingHorizontal: GUTTER },
  list: { paddingBottom: STEP.s4 + 6 },
  section: { paddingHorizontal: GUTTER, marginTop: STEP.s3 + 6, marginBottom: STEP.s1 },
  sectionGap: { marginTop: STEP.s3 + 4 },
  hint: { textAlign: "center", marginTop: STEP.s2 + 4, paddingHorizontal: GUTTER, fontSize: TYPOGRAPHY.meta.fontSize - 0.5 },
  skeleton: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2, gap: STEP.s2 },
});
