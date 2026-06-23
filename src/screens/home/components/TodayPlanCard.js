import { useMemo, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useUserTasks } from "../../../hooks/useUserTasks";
import { usePlanCompletion } from "../../../hooks/usePlanCompletion";
import { getSubjectByKey } from "../../../themes/subjects";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

function TaskRow({ item, C, isLast, onToggle }) {
  const color = getSubjectByKey(item.subject)?.color || C.accent;
  return (
    <Pressable onPress={onToggle} hitSlop={4} style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: C.border + "60" }]}>
      <View style={[s.checkBox, { borderColor: item.completed ? C.green : C.muted, backgroundColor: item.completed ? C.green : "transparent" }]}>
        {item.completed ? <Icon name="check" size={12} color="#FFF" sw={2.5} /> : null}
      </View>
      <View style={[s.dotMini, { backgroundColor: color }]} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={[s.rowLabel, { color: item.completed ? C.muted : C.text, textDecorationLine: item.completed ? "line-through" : "none" }]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {item.badge ? (
          <Text style={[s.badgeText, { color: item.rkind === "red" ? C.red : C.amber }]}>
            {item.badge}
          </Text>
        ) : null}
      </View>
      {item.source === "ai" ? (
        <View style={[s.aiTag, { backgroundColor: C.blue + "18" }]}>
          <Text style={[s.aiTagText, { color: C.blue }]}>önerilen</Text>
        </View>
      ) : item.source === "plan" ? (
        <View style={[s.aiTag, { backgroundColor: C.accent + "14" }]}>
          <Text style={[s.aiTagText, { color: C.accent }]}>öneri</Text>
        </View>
      ) : item.count > 0 ? (
        <Text style={[s.countText, { color: C.sec }]}>{item.count} soru</Text>
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
}) {
  const C = useC();
  const { tasks: userTasks, toggleTask } = useUserTasks();
  const { isDone: isPlanDone, toggle: togglePlan } = usePlanCompletion();

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
    generatedTasks.forEach((t, i) =>
      items.push({
        id: `plan_${i}`,
        subject: t.subject,
        label: t.topicLabel || t.subjectLabel,
        count: t.questionCount || 0,
        completed: isPlanDone(`plan_${i}`),
        badge: t.badge,
        rkind: t.rkind,
        source: "plan",
      }),
    );
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

  const preview = merged.slice(0, 3);
  const remaining = Math.max(0, merged.length - 3);
  const { total = 0, done = 0, dersler = 0, hours = "" } = planSummary || {};
  const pct = total > 0 ? Math.min(1, done / total) : 0;

  if (merged.length === 0) {
    return (
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
        <View style={{ alignItems: "center", paddingVertical: 20, gap: 8 }}>
          <Icon name="clipboard" size={28} color={C.sec} />
          <Text style={[s.emptyTitle, { color: C.text }]}>Bugün planın boş</Text>
          <Text style={[s.emptyMsg, { color: C.sec }]}>
            Bir görev ekleyerek başla
          </Text>
          <Pressable
            onPress={onAddTask}
            style={[s.emptyBtn, { backgroundColor: C.accent }]}
          >
            <Icon name="plus" size={14} color="#FFF" sw={2.5} />
            <Text style={s.emptyBtnText}>Görev Ekle</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={[s.title, { color: C.text }]}>Bugünkü Planın</Text>
          <Text style={[s.subtitle, { color: C.sec }]}>
            {dersler} ders · {hours}
          </Text>
        </View>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={[s.viewAll, { color: C.accent }]}>Tümünü Gör →</Text>
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
          <Icon name="plus" size={14} color="#FFF" sw={2.5} />
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
        <Text style={[s.progressText, { color: C.muted }]}>
          {done}/{total} soru
        </Text>
      </View>

      <View style={{ marginTop: 10 }}>
        {preview.map((item, i) => (
          <TaskRow
            key={item.id}
            item={item}
            C={C}
            isLast={i === preview.length - 1 && remaining === 0}
            onToggle={() => {
              H.select();
              if (item.source === "user") toggleTask(item.id);
              else togglePlan(item.id);
            }}
          />
        ))}
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
    gap: 10,
    marginTop: 14,
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
  progressBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { ...TYPOGRAPHY.micro, minWidth: 55 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 10,
  },
  dotMini: { width: 8, height: 8, borderRadius: 4 },
  checkBox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  rowLabel: { fontFamily: "Inter_500Medium", fontSize: 14 },
  badgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 0.3 },
  countText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  aiTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  aiTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  moreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  moreText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  emptyTitle: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 16 },
  emptyMsg: { ...TYPOGRAPHY.caption },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FFF" },
});
