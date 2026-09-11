import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Card, Icon, EmptyState } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTrialTypes } from "../../../domain/trial/trialTypes";
import { DayTasks } from "./DayTasks";
import { todayTR } from "../../../lib/dateUtils";

function formatDayLabel(iso) {
  return new Date(iso)
    .toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function totalMinutesLabel(min) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h} sa${m ? ` ${m} dk` : ""}`;
  return `${m} dk`;
}

function SlotRow({ time, color, name, dur, muted, C }) {
  return (
    <View style={[rowStyle, { borderTopColor: C.line }]}>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, width: 40, fontVariant: ["tabular-nums"] }]}>{time}</Text>
      <View style={{ width: 7, height: 7, borderRadius: 1, backgroundColor: color }} />
      <Text style={[TYPOGRAPHY.tableName, { color: muted ? C.text3 : C.text, flex: 1 }]} numberOfLines={1}>
        {name}
      </Text>
      {dur ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{dur}</Text> : null}
    </View>
  );
}

const rowStyle = { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: 11, borderTopWidth: 1 };

export function DayDetails({ day, data, onTrialPress, onOpenDetail, calendarTasks = [], onAddTask, onToggleTask, onRemoveTask }) {
  const C = useC();
  const today = day === todayTR();
  const trialTypes = useMemo(() => getTrialTypes(C), [C]);

  const slots = useMemo(() => {
    const logSlots = (data?.logs || []).map((l) => {
      const subj = getSubjectByKey(l.subject);
      return {
        key: `l_${l.id}`,
        time: formatTime(l.created_at),
        color: subj?.color || C.accent,
        name: `${subj?.label || l.subject}${l.topic ? ` · ${l.topic}` : ""}`,
        dur: totalMinutesLabel(l.duration_minutes ?? l.duration),
      };
    });
    const trialSlots = (data?.trials || []).map((t) => ({
      key: `t_${t.id}`,
      time: formatTime(t.created_at),
      color: trialTypes[t.trialType]?.color || C.accent,
      name: trialTypes[t.trialType]?.label || t.name || "Deneme",
      dur: `${t.totalNet?.toFixed(1) || "0.0"} net`,
      trial: t,
    }));
    return [...logSlots, ...trialSlots];
  }, [data, trialTypes, C.accent]);

  const isEmpty = slots.length === 0 && !calendarTasks.length;
  const totalMin = data?.totalMinutes || 0;

  return (
    <Card tone="surface" radius="panel">
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text, flex: 1 }]}>{formatDayLabel(day)}</Text>
        {today ? <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>BUGÜN</Text> : null}
        {onOpenDetail ? (
          <Pressable onPress={() => onOpenDetail(day)} hitSlop={10} accessibilityLabel="Gün detayını aç" accessibilityRole="button">
            <Icon name="chevR" size={16} color={C.text3} />
          </Pressable>
        ) : null}
      </View>

      {!isEmpty && (
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>
          {slots.length} kayıt{totalMin ? ` · ${totalMinutesLabel(totalMin)}` : ""}
        </Text>
      )}

      {isEmpty ? (
        <EmptyState
          preset="calendarEmptyDay"
          primary=""
          secondary=""
          style={{ paddingVertical: STEP.s3, alignItems: "center" }}
        />
      ) : (
        <View style={{ marginTop: STEP.s1 }}>
          {slots.map((s) => (
            <Pressable key={s.key} disabled={!s.trial} onPress={() => s.trial && onTrialPress?.(s.trial)}>
              <SlotRow time={s.time} color={s.color} name={s.name} dur={s.dur} C={C} />
            </Pressable>
          ))}
        </View>
      )}

      <DayTasks date={day} tasks={calendarTasks} onAdd={onAddTask} onToggle={onToggleTask} onRemove={onRemoveTask} />
    </Card>
  );
}
