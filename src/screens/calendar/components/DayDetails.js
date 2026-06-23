import { View, Text, Pressable } from "react-native";
import { Icon, IconBox, GlassCard } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTrialTypes } from "../../trial/trialTypes";
import { DayTasks } from "./DayTasks";

function formatDay(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function isToday(iso) {
  return iso === new Date().toISOString().split("T")[0];
}

function SectionHeader({ label, C }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm }}>
      <Text style={[TYPOGRAPHY.label, { color: C.muted }]}>{label}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.borderSoft }} />
    </View>
  );
}

function LogRow({ log, C }) {
  const subj = getSubjectByKey(log.subject) || { label: log.subject, color: C.amber, icon: "bookOpen" };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.sm, minHeight: 44 }}>
      <IconBox icon={subj.icon} color={subj.color} size={32} rounded={8} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{subj.label}</Text>
        {log.topic && <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>{log.topic}</Text>}
      </View>
      <View style={{ alignItems: "flex-end", gap: 2 }}>
        {log.question_count > 0 && <Text style={[TYPOGRAPHY.captionMedium, { color: C.accent }]}>{log.question_count} soru</Text>}
        {log.duration_minutes > 0 && <Text style={[TYPOGRAPHY.captionMedium, { color: C.blue }]}>{log.duration_minutes}dk</Text>}
      </View>
    </View>
  );
}

function TrialRow({ trial, C, onPress }) {
  const meta = getTrialTypes(C)[trial.trialType];
  const color = meta?.color || C.amber;
  return (
    <Pressable onPress={() => onPress?.(trial)} style={({ pressed }) => ({
      flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.sm, minHeight: 44, opacity: pressed ? 0.6 : 1
    })}>
      <IconBox icon={meta?.icon || "chart"} color={color} size={32} rounded={8} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{meta?.label || trial.name || "Deneme"}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>{trial.totalNet?.toFixed(1) || "0.0"} net</Text>
      </View>
      <Icon name="chevR" size={14} color={C.muted} />
    </Pressable>
  );
}

export function DayDetails({ day, data, onTrialPress, calendarTasks = [], onAddTask, onToggleTask, onRemoveTask }) {
  const C = useC();
  const today = isToday(day);
  const hasLogs = data?.logs?.length > 0;
  const hasTrials = data?.trials?.length > 0;
  const isEmpty = !hasLogs && !hasTrials && !calendarTasks.length;

  return (
    <GlassCard style={{ padding: SPACING.lg, marginTop: SPACING.md }}>
      {/* Date header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: SPACING.md, borderBottomWidth: 1, borderBottomColor: C.borderSoft, marginBottom: SPACING.xs }}>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, textTransform: "capitalize", flex: 1 }]}>
          {formatDay(day)}
        </Text>
        {today && (
          <View style={{ paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.pill, backgroundColor: C.accentLight }}>
            <Text style={[TYPOGRAPHY.micro, { color: C.accent }]}>BUGÜN</Text>
          </View>
        )}
      </View>

      {/* Empty state */}
      {isEmpty && (
        <View style={{ alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.xl }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center", marginBottom: SPACING.xs }}>
            <Icon name="moon" size={22} color={C.muted} />
          </View>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted }]}>Kayıt yok</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.muted, textAlign: "center" }]}>Bu gün çalışma veya deneme kaydın yok</Text>
        </View>
      )}

      {hasTrials && (
        <View style={{ marginTop: SPACING.md }}>
          <SectionHeader label="DENEMELER" C={C} />
          {data.trials.map((t) => <TrialRow key={t.id} trial={t} C={C} onPress={onTrialPress} />)}
        </View>
      )}

      {hasLogs && (
        <View style={{ marginTop: SPACING.md }}>
          <SectionHeader label="ÇALIŞMALAR" C={C} />
          {data.logs.map((l) => <LogRow key={l.id} log={l} C={C} />)}
        </View>
      )}

      <DayTasks date={day} tasks={calendarTasks} onAdd={onAddTask} onToggle={onToggleTask} onRemove={onRemoveTask} />
    </GlassCard>
  );
}
