import { View, Text, Pressable } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTrialTypes } from "../../trial/trialTypes";
import { DayTasks } from "./DayTasks";

function formatDayLabel(iso) {
  return new Date(iso)
    .toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function isToday(iso) {
  return iso === new Date().toISOString().split("T")[0];
}

function SectionLabel({ label, C }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 11,
        lineHeight: 14,
        letterSpacing: 1.3,
        color: C.muted,
        marginBottom: 12,
        marginTop: 22,
      }}
    >
      {label}
    </Text>
  );
}

function LogCard({ log, C }) {
  const subj = getSubjectByKey(log.subject) || { label: log.subject, color: C.amber };
  const detail = [
    log.question_count > 0 ? `${log.question_count} soru` : null,
    log.duration_minutes > 0 ? `${log.duration_minutes}dk` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 8,
          height: 38,
          borderRadius: 4,
          backgroundColor: subj.color,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 18, color: C.text }}>
          {subj.label}
        </Text>
        {detail ? (
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16, color: C.muted, marginTop: 2 }}>
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function TrialCard({ trial, C, onPress }) {
  const meta = getTrialTypes(C)[trial.trialType];
  const color = meta?.color || C.amber;
  return (
    <Pressable
      onPress={() => onPress?.(trial)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 14,
        padding: SPACING.md,
        paddingHorizontal: 14,
        gap: 9,
        opacity: pressed ? 0.65 : 1,
      })}
    >
      <View style={{ width: 8, height: 38, borderRadius: 4, backgroundColor: color }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 18, color: C.text }}>
          {meta?.label || trial.name || "Deneme"}
        </Text>
        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 16, color: C.muted, marginTop: 2 }}>
          {trial.totalNet?.toFixed(1) || "0.0"} net
        </Text>
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
    <View style={{ marginTop: 22 }}>
      {/* Section date label */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            lineHeight: 14,
            letterSpacing: 1.3,
            color: C.muted,
          }}
        >
          {formatDayLabel(day)}
        </Text>
        {today && (
          <View
            style={{
              paddingHorizontal: SPACING.sm,
              paddingVertical: 3,
              borderRadius: RADIUS.pill,
              backgroundColor: C.accentLight,
            }}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 10, color: C.accent }}>BUGÜN</Text>
          </View>
        )}
      </View>

      {isEmpty && (
        <View style={{ alignItems: "center", gap: SPACING.sm, paddingVertical: SPACING.xl }}>
          <Icon name="moon" size={22} color={C.muted} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.muted }]}>Kayıt yok</Text>
          <Text style={[TYPOGRAPHY.caption, { color: C.muted, textAlign: "center" }]}>
            Bu gün çalışma veya deneme kaydın yok
          </Text>
        </View>
      )}

      {hasTrials && (
        <>
          <SectionLabel label="DENEMELER" C={C} />
          <View style={{ gap: 12 }}>
            {data.trials.map((t) => (
              <TrialCard key={t.id} trial={t} C={C} onPress={onTrialPress} />
            ))}
          </View>
        </>
      )}

      {hasLogs && (
        <>
          <SectionLabel label="ÇALIŞMALAR" C={C} />
          <View style={{ gap: 12 }}>
            {data.logs.map((l) => (
              <LogCard key={l.id} log={l} C={C} />
            ))}
          </View>
        </>
      )}

      <DayTasks
        date={day}
        tasks={calendarTasks}
        onAdd={onAddTask}
        onToggle={onToggleTask}
        onRemove={onRemoveTask}
      />
    </View>
  );
}
