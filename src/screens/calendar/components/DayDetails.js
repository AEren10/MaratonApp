import { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Card, Icon, EmptyState } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTrialTypes } from "../../../domain/trial/trialTypes";
import { DayTasks } from "./DayTasks";
import { todayTR } from "../../../lib/dateUtils";

function formatDayLabel(iso) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  const weekday = d.toLocaleDateString("tr-TR", { weekday: "long" });
  return `${day} · ${weekday}`;
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function SlotRow({ time, color, name, subject, dur, C }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: STEP.s2, paddingVertical: STEP.s2, marginTop: 4 }}>
      <Text style={[TYPOGRAPHY.metaSemiBold, { width: 36, color: C.text3, paddingTop: 1 }]}>{time}</Text>
      <View style={{ width: 2, height: 28, backgroundColor: color, borderRadius: 1, marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>{name}</Text>
        {subject ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{subject}</Text> : null}
      </View>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>{dur}</Text>
    </View>
  );
}

export function DayDetails({ day, data, calendarTasks, onAddTask, onToggleTask, onRemoveTask, onTrialPress, onOpenDetail, style }) {
  const C = useC();
  const trialTypes = getTrialTypes(C);
  const today = day === todayTR();

  // Tasarım Image 5: Mock veya gerçek veri. Durak, dakika, soru sayısı.
  const statMinutes = data?.totalMinutes || 70;
  const statStops = data?.studyLogs?.length || 2;
  const statQuestions = 81; // Mock, eklenebilir
  const streakStatus = "SERİ SÜRDÜ"; // Mock
  
  const slots = useMemo(() => {
    if (!data) return [];
    const logSlots = (data.studyLogs || []).map((l) => ({
      key: `log_${l.id || l.created_at}`,
      time: formatTime(l.created_at),
      color: getSubjectByKey(l.subject)?.color || C.accent,
      name: l.topic || l.subject,
      subject: l.topic ? getSubjectByKey(l.subject)?.label : null,
      dur: l.minutes ? `${l.minutes} dk` : "",
    }));
    const trialSlots = (data.trialLogs || []).map((t) => ({
      key: `trial_${t.id || t.created_at}`,
      time: formatTime(t.created_at),
      color: trialTypes[t.trialType]?.color || C.accent,
      name: trialTypes[t.trialType]?.label || t.name || "Deneme",
      subject: null,
      dur: `${t.totalNet || t.net || 0} net`,
      trial: t,
    }));
    return [...logSlots, ...trialSlots];
  }, [data, trialTypes, C.accent]);

  const isEmpty = slots.length === 0 && !calendarTasks.length;

  return (
    <Card tone="surface" radius="panel" style={[styles.card, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s2 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{formatDayLabel(day)}</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 0.8 }]}>{streakStatus}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: STEP.s4, marginBottom: STEP.s3 }}>
        <View>
          <Text style={[TYPOGRAPHY.hero, { fontSize: 28, color: C.text }]}>{statMinutes}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
        </View>
        <View>
          <Text style={[TYPOGRAPHY.hero, { fontSize: 28, color: C.text }]}>{statStops}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>durak</Text>
        </View>
        <View>
          <Text style={[TYPOGRAPHY.hero, { fontSize: 28, color: C.text }]}>{statQuestions}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>soru</Text>
        </View>
      </View>

      {isEmpty ? (
        <EmptyState
          preset="calendarEmptyDay"
          primary=""
          secondary=""
          style={{ paddingVertical: STEP.s3, alignItems: "center" }}
        />
      ) : (
        <View>
          {slots.map((s) => (
            <Pressable key={s.key} disabled={!s.trial} onPress={() => s.trial && onTrialPress?.(s.trial)}>
              <SlotRow time={s.time} color={s.color} name={s.name} subject={s.subject} dur={s.dur} C={C} />
            </Pressable>
          ))}
        </View>
      )}

      <DayTasks date={day} tasks={calendarTasks} onAdd={onAddTask} onToggle={onToggleTask} onRemove={onRemoveTask} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: STEP.s3 },
});
