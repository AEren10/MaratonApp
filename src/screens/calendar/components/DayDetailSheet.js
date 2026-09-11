import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";
import { Icon, Card, StatBlock, Chip, EmptyState } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { DayTasks } from "./DayTasks";
import { todayTR } from "../../../lib/dateUtils";

function formatDayLabel(iso) {
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" });
}

function subjectDurations(logs = []) {
  const map = {};
  logs.forEach((l) => {
    const key = l.subject;
    const min = l.duration_minutes ?? l.duration ?? 0;
    map[key] = (map[key] || 0) + min;
  });
  return Object.entries(map).map(([key, min]) => ({ key, min, subj: getSubjectByKey(key) }));
}

function buildDaySummary({ tasks, doneTasks, totalQuestions, totalMinutes }) {
  if (!totalMinutes && !totalQuestions && !tasks.length) return null;
  const parts = [];
  if (tasks.length) parts.push(`${doneTasks}/${tasks.length} görev tamamlandı`);
  if (totalQuestions) parts.push(`${totalQuestions} soru çözüldü`);
  const effort = totalMinutes ? `Gün ${Math.round(totalMinutes)} dk çalışmayla ilerledi.` : "";
  return `${parts.join(", ")}${parts.length ? ". " : ""}${effort}`.trim();
}

export function DayDetailSheet({ day, data, calendarTasks = [], visible, onClose, onAddTask, onToggleTask, onRemoveTask }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const [openAdd, setOpenAdd] = useState(false);
  if (!day) return null;

  const totalQuestions = data?.totalQuestions || 0;
  const totalMinutes = data?.totalMinutes || 0;
  const doneTasks = calendarTasks.filter((t) => t.done).length;
  const isEmpty = !data?.logs?.length && !data?.trials?.length && !calendarTasks.length;
  const durations = subjectDurations(data?.logs);
  const summary = buildDaySummary({ tasks: calendarTasks, doneTasks, totalQuestions, totalMinutes });
  const canAdd = day >= todayTR();

  return (
    <Modal visible={!!visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={s.handle} />
          <View style={s.headerRow}>
            <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>{formatDayLabel(day)}</Text>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Kapat" accessibilityRole="button">
              <Icon name="x" size={20} color={C.text3} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {isEmpty ? (
              <EmptyState
                preset="calendarEmptyDay"
                primary={canAdd ? undefined : ""}
                onPrimary={() => setOpenAdd(true)}
                onSecondary={onClose}
              />
            ) : (
              <>
                <View style={s.statRow}>
                  <Card tone="surface" radius="panel" style={{ flex: 1 }}>
                    <StatBlock label="GERÇEKLEŞEN" value={totalMinutes} unit="dk" size="value" />
                  </Card>
                  <Card tone="surface" radius="panel" style={{ flex: 1 }}>
                    <StatBlock label="SORU" value={totalQuestions} size="value" />
                  </Card>
                </View>

                {durations.length > 0 && (
                  <View style={s.chipRow}>
                    {durations.map(({ key, min, subj }) => (
                      <Chip key={key} color={subj?.color || C.accent}>
                        {`${subj?.label || key} · ${min} dk`}
                      </Chip>
                    ))}
                  </View>
                )}

                {summary ? (
                  <Card tone="surface" radius="panel" style={{ marginTop: STEP.s3 }}>
                    <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GÜNÜN ÖZETİ</Text>
                    <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{summary}</Text>
                  </Card>
                ) : null}
              </>
            )}

            <DayTasks
              date={day}
              tasks={calendarTasks}
              onAdd={onAddTask}
              onToggle={onToggleTask}
              onRemove={onRemoveTask}
              autoOpen={openAdd}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: C.bg,
      borderTopLeftRadius: SHAPE.sheet,
      borderTopRightRadius: SHAPE.sheet,
      padding: STEP.s3,
      paddingBottom: STEP.s4,
    },
    handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: STEP.s2 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginBottom: STEP.s2 },
    statRow: { flexDirection: "row", gap: STEP.s1 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  });
