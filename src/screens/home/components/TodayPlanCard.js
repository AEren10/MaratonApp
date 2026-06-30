import { useMemo, useCallback, useRef, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon, AnimatedPressable, Button } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useUserTasks } from "../../../hooks/useUserTasks";
import { usePlanCompletion } from "../../../hooks/usePlanCompletion";
import { getSubjectByKey } from "../../../themes/subjects";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

function TaskRow({ item, C, isLast, isNext, onToggle, onStart }) {
  const subj = getSubjectByKey(item.subject);
  const color = subj?.color || C.accent;
  const dersLabel = subj?.label || item.subject;
  const topicLabel = item.label !== dersLabel ? item.label : null;
  const estMin = item.count > 0 ? Math.round(item.count * 1.2) : 0;

  return (
    <Pressable onPress={onToggle} hitSlop={4} style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }]}>
      <View style={[s.checkBox, { borderColor: item.completed ? C.green : C.muted, backgroundColor: item.completed ? C.green : "transparent" }]}>
        {item.completed ? <Icon name="check" size={12} color={C.textOnFill} sw={2.5} /> : null}
      </View>
      <View style={[s.dotMini, { backgroundColor: color }]} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={[s.rowLabel, { color: item.completed ? C.muted : C.text, textDecorationLine: item.completed ? "line-through" : "none" }]}
          numberOfLines={1}
        >
          {dersLabel}{topicLabel ? ` · ${topicLabel}` : ""}
        </Text>
        <Text style={[s.rowMeta, { color: C.muted }]}>
          {item.count > 0 ? `${item.count} soru` : ""}{item.count > 0 && estMin > 0 ? ` · ~${estMin} dk` : ""}
          {item.badge ? ` · ${item.badge}` : ""}
        </Text>
      </View>
      {isNext && onStart ? (
        <Pressable onPress={() => onStart(item)} style={[s.startBtn, { backgroundColor: C.accent, shadowColor: C.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 }]}>
          <Icon name="play" size={10} color={C.textOnFill} sw={2.5} />
          <Text style={[s.startBtnText, { color: C.textOnFill }]}>Başla</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

export function TodayPlanCard({
  generatedTasks = [],
  aiSuggestion,
  planSummary,
  onViewAll,
  onAddTask,
  onStart,
  onAllDone,
  onTaskDone,
}) {
  const C = useC();
  const { user } = useAuth();
  const { tasks: userTasks, toggleTask } = useUserTasks();
  const { isDone: isPlanDone, toggle: togglePlan } = usePlanCompletion(user?.id);
  const rewardedRef = useRef(false);

  const merged = useMemo(() => {
    const items = [];
    userTasks.forEach((t) => {
      const subj = getSubjectByKey(t.subject);
      items.push({
        id: t.id,
        subject: t.subject,
        label: t.topic || subj?.label || t.subject,
        count: t.question_count || 0,
        completed: t.completed,
        source: "user",
      });
    });
    generatedTasks.forEach((t) => {
      const pid = `plan_${t.subject}_${t.topic || "genel"}`;
      items.push({
        id: pid,
        subject: t.subject,
        label: t.topicLabel || t.subjectLabel,
        count: t.questionCount || 0,
        completed: isPlanDone(pid),
        badge: t.badge,
        rkind: t.rkind,
        source: "plan",
      });
    });
    if (aiSuggestion) {
      items.push({
        id: "ai_suggestion",
        subject: aiSuggestion.subjectKey,
        label: aiSuggestion.title,
        count: 0,
        completed: isPlanDone("ai_suggestion"),
        source: "ai",
      });
    }
    return items;
  }, [generatedTasks, userTasks, aiSuggestion, isPlanDone]);

  useEffect(() => {
    if (merged.length === 0 || rewardedRef.current) return;
    const allDone = merged.every((t) => t.completed);
    if (allDone) {
      rewardedRef.current = true;
      onAllDone?.();
    }
  }, [merged, onAllDone]);

  const preview = merged.slice(0, 4);
  const remaining = Math.max(0, merged.length - 4);
  const { total = 0, done = 0, dersler = 0, hours = "" } = planSummary || {};
  const pct = total > 0 ? Math.min(1, done / total) : 0;

  if (merged.length === 0) {
    return (
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={{ alignItems: "center", paddingVertical: SPACING.xl, gap: SPACING.sm }}>
          <Icon name="book" size={28} color={C.sec} />
          <Text style={[s.emptyTitle, { color: C.text }]}>Bugün planın boş</Text>
          <Text style={[s.emptyMsg, { color: C.sec }]}>
            Bir görev ekleyerek başla
          </Text>
          <Pressable
            onPress={onAddTask}
            style={[s.emptyBtn, { backgroundColor: C.accent }]}
          >
            <Icon name="plus" size={14} color={C.textOnFill} sw={2.5} />
            <Text style={[s.emptyBtnText, { color: C.textOnFill }]}>Görev Ekle</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          <Text style={[s.title, { color: C.text }]}>Bugünün Planı</Text>
          <View style={[s.countPill, { backgroundColor: C.surface2 }]}>
            <Text style={[s.countPillText, { color: C.sec }]}>{merged.filter((t) => t.completed).length}/{merged.length}</Text>
          </View>
        </View>
        <Pressable onPress={onViewAll} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text style={[s.viewAll, { color: C.accent }]}>Tümü</Text>
          <Icon name="arrowR" size={11} color={C.accent} />
        </Pressable>
      </View>

      {/* Add task — prominent dashed button at top of list */}
      <Pressable
        onPress={onAddTask}
        style={({ pressed }) => [
          s.addRow,
          { borderColor: C.accent + "50", opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[s.addIcon, { backgroundColor: C.accent }]}>
          <Icon name="plus" size={14} color={C.textOnFill} sw={2.5} />
        </View>
        <Text style={[s.addText, { color: C.accent }]}>Görev Ekle</Text>
      </Pressable>

      <View style={s.progressWrap}>
        <View style={[s.progressBg, { backgroundColor: C.border }]}>
          <View
            style={[
              s.progressFill,
              { width: `${Math.round(pct * 100)}%`, backgroundColor: C.accent },
            ]}
          />
        </View>
      </View>

      <View style={{ marginTop: SPACING.sm }}>
        {preview.map((item, i) => {
          const firstIncompleteIdx = preview.findIndex((t) => !t.completed);
          return (
            <TaskRow
              key={item.id}
              item={item}
              C={C}
              isLast={i === preview.length - 1 && remaining === 0}
              isNext={!item.completed && i === firstIncompleteIdx}
              onToggle={() => {
                H.select();
                if (item.source === "user") toggleTask(item.id);
                else togglePlan(item.id);
                if (!item.completed) onTaskDone?.();
              }}
              onStart={onStart}
            />
          );
        })}
      </View>

      {remaining > 0 ? (
        <Pressable onPress={onViewAll} hitSlop={8} style={s.moreRow}>
          <Text style={[s.moreText, { color: C.sec }]}>
            +{remaining} görev daha
          </Text>
          <Icon name="arrowR" size={14} color={C.sec} />
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 17 },
  subtitle: { ...TYPOGRAPHY.caption, marginTop: 2 },
  viewAll: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  addIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  progressBg: { flex: 1, height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, borderRadius: 2 },
  progressText: { ...TYPOGRAPHY.micro, minWidth: 55 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dotMini: { width: 7, height: 7, borderRadius: 2 },
  checkBox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  rowMeta: { ...TYPOGRAPHY.micro },
  headerCount: { ...TYPOGRAPHY.caption },
  countPill: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: 20 },
  countPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11, fontVariant: ["tabular-nums"] },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  startBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.3 },
  countText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  aiTag: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: SPACING.sm },
  aiTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  moreText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  emptyTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  emptyMsg: { ...TYPOGRAPHY.caption },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
