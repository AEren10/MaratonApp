import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Card, Button, Skeleton } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { PlanDetailHeader } from "./components/PlanDetailHeader";
import { PlanDetailStopRow } from "./components/PlanDetailStopRow";
import { PlanDetailEmptyState } from "./components/PlanDetailEmptyState";
import { PlanDetailSubjects } from "./components/PlanDetailSubjects";
import { ReorganizeDayModal } from "./components/ReorganizeDayModal";
import { formatMinutes, usePlanDetailViewModel } from "./usePlanDetailViewModel";

function PlanDetailInner({ route }) {
  const C = useC();
  const [reorganizeOpen, setReorganizeOpen] = useState(false);
  const isEmpty = Boolean(route?.params?.isEmpty);
  const dayLabel = route?.params?.dateLabel || (isEmpty ? "Perşembe, 25 Haziran" : "Salı, 23 Haziran");
  const { detail, doneMinutes, hasTasks, loading, navigation, plannedMinutes } = usePlanDetailViewModel({
    C,
    forceEmpty: isEmpty,
  });

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <PlanDetailHeader dayLabel={dayLabel} onBack={() => navigation.goBack()} C={C} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={s.cardsRow}>
          <Card tone="surface" radius="panel" style={s.statCard}>
            <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>PLANLANAN</Text>
            <Text style={[TYPOGRAPHY.statSmall, s.statNum, { color: C.text }]}>
              {hasTasks ? formatMinutes(plannedMinutes) : "―"}
            </Text>
          </Card>
          <Card tone="surface" radius="panel" style={s.statCard}>
            <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>GERÇEKLEŞEN</Text>
            <Text style={[TYPOGRAPHY.statSmall, s.statNum, { color: C.text }]}>
              {hasTasks ? formatMinutes(doneMinutes) : "―"}
            </Text>
          </Card>
        </Animated.View>

        {hasTasks ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={s.progressBarWrap}>
              <View style={[s.progressBase, { backgroundColor: C.track }]}>
                <View style={[s.progressFill, { backgroundColor: C.accent, width: `${Math.round((detail.doneCount / detail.tasks.length) * 100)}%` }]} />
              </View>
            </View>

            <PlanDetailSubjects C={C} tasks={detail.tasks} />

            <View style={s.listHeader}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>GÜNÜN DURAKLARI</Text>
              <View style={[s.rule, { backgroundColor: C.line }]} />
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{detail.doneCount}/{detail.tasks.length}</Text>
            </View>

            <View style={s.stopsList}>
              {detail.tasks.map((task, idx) => (
                <PlanDetailStopRow
                  key={task.id}
                  done={task.done}
                  C={C}
                  subject={task.s?.label || task.s?.key || "Durak"}
                  title={task.topic}
                  meta={`${task.time ? `${task.time} · ` : ""}${formatMinutes(task.minutes ?? ((task.q || 0) * 2))}${task.q ? ` · ${task.q} soru` : ""}`}
                  hasStart={!task.done}
                  isLast={idx === detail.tasks.length - 1}
                  onStart={() => detail.startTask(task.id)}
                  onToggle={() => detail.toggleTask(task.id)}
                />
              ))}
            </View>

            <Card tone="surface" radius="panel" style={s.summaryCard}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3, marginBottom: STEP.s1 }]}>GÜNÜN ÖZETİ</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>
                {detail.doneCount} durak kapandı. Kalanları başlattığında rota ve günlük plan aynı kaynaktan güncellenir.
              </Text>
            </Card>
          </Animated.View>
        ) : loading ? (
          <View style={s.loading}>
            <Skeleton width="100%" height={72} radius={SHAPE.card} />
            <Skeleton width="100%" height={72} radius={SHAPE.card} style={{ marginTop: STEP.s2 }} />
            <Skeleton width="100%" height={72} radius={SHAPE.card} style={{ marginTop: STEP.s2 }} />
          </View>
        ) : (
          <PlanDetailEmptyState C={C} />
        )}

        {!loading ? (
          <View style={s.actionsWrap}>
            <Button variant="primary" size="lg" fullWidth onPress={() => navigation.navigate(SCREENS.ADD_TASK)}>
              Bugüne durak ekle
            </Button>
            <Button
              variant={hasTasks ? "outline" : "ghost"}
              size="md"
              fullWidth
              onPress={() => (hasTasks ? setReorganizeOpen(true) : navigation.goBack())}
            >
              {hasTasks ? "Günü yeniden düzenle" : "Bu günü boş bırak"}
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <ReorganizeDayModal
        visible={reorganizeOpen}
        onClose={() => setReorganizeOpen(false)}
        dayLabel={dayLabel}
        tasks={detail.tasks}
        onMoveTask={detail.moveTask}
        onRemoveTask={detail.removeTask}
        onClearRemaining={detail.clearRemaining}
        onOpenSchedule={() => navigation.navigate(SCREENS.CLASS_SCHEDULE)}
        C={C}
      />
    </SafeAreaView>
  );
}

export default function PlanDetailScreen(props) {
  return (
    <ScreenErrorBoundary>
      <PlanDetailInner {...props} />
    </ScreenErrorBoundary>
  );
}

const s = StyleSheet.create({
  loading: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s5 },
  cardsRow: { flexDirection: "row", gap: STEP.s1 },
  statCard: { flex: 1, padding: STEP.s2 }, statNum: { marginTop: STEP.s1 },
  progressBarWrap: { marginTop: STEP.s2, height: 5 }, progressBase: { height: 5, borderRadius: STEP.s1 / 4, overflow: "hidden" }, progressFill: { height: "100%", borderRadius: STEP.s1 / 4 },
  listHeader: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s3, paddingBottom: STEP.s1 },
  rule: { flex: 1, height: 1 }, stopsList: { marginTop: STEP.s1 },
  summaryCard: { marginTop: STEP.s3, padding: STEP.s2 },
  actionsWrap: { marginTop: STEP.s3, paddingBottom: STEP.s3, gap: STEP.s2 },
});
