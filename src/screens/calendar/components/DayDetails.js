import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { getSubjectByKey } from "../../../themes/subjects";
import { getTrialTypes } from "../../../domain/trial/trialTypes";
import { DayTasks } from "./DayTasks";
import { DaySlotRow } from "./DaySlotRow";
import { todayTR } from "../../../lib/dateUtils";
import { Press } from "../../../components/design/Press";

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

export function DayDetails({ day, data, calendarTasks, onAddTask, onToggleTask, onRemoveTask, onTrialPress, onOpenDetail, style }) {
  const C = useC();
  const navigation = useNavigation();
  const trialTypes = getTrialTypes(C);
  const today = day === todayTR();

  // Gercek veri: Durak, dakika, soru sayisi.
  const statMinutes = data?.totalMinutes || 0;
  const statStops = (data?.studyLogs || data?.logs)?.length || 0;
  const statQuestions = data?.totalQuestions || 0;
  const hasActivity = statStops > 0 || (data?.trialLogs || data?.trials)?.length > 0;
  const streakStatus = hasActivity ? "SERİ SÜRDÜ" : "KAYIT YOK";
  
  const slots = useMemo(() => {
    if (!data) return [];
    const logs = data.studyLogs || data.logs || [];
    const trials = data.trialLogs || data.trials || [];
    const logSlots = logs.map((l) => ({
      key: `log_${l.id || l.created_at}`,
      time: formatTime(l.created_at),
      color: getSubjectByKey(l.subject)?.color || C.accent,
      name: l.topic || l.subject,
      subject: l.topic ? getSubjectByKey(l.subject)?.label : null,
      dur: (l.duration || l.duration_minutes || l.minutes) ? `${l.duration || l.duration_minutes || l.minutes} dk` : "",
    }));
    const trialSlots = trials.map((t) => ({
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

  return (
    <Card tone="surface" radius="panel" style={[styles.card, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: STEP.s2 }}>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{formatDayLabel(day)}</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3, letterSpacing: 0.8 }]}>{streakStatus}</Text>
      </View>

      {hasActivity ? (
        <>
          <View style={{ flexDirection: "row", gap: STEP.s4, marginBottom: STEP.s3 }}>
            <View>
              <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{statMinutes}</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>dk</Text>
            </View>
            <View>
              <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{statStops}</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>durak</Text>
            </View>
            <View>
              <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{statQuestions}</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>soru</Text>
            </View>
          </View>

          <View>
            {slots.map((s) => (
              <Press haptic="none"
                key={s.key}
                disabled={!s.trial}
                hitSlop={s.trial ? 8 : undefined}
                accessibilityRole={s.trial ? "button" : undefined}
                accessibilityLabel={s.trial ? `${s.name} deneme detayı` : undefined}
                onPress={() => s.trial && onTrialPress?.(s.trial)}
              >
                <DaySlotRow time={s.time} color={s.color} name={s.name} subject={s.subject} dur={s.dur} C={C} />
              </Press>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginBottom: STEP.s2 }]}>
            Bu güne ait çalışma kaydı yok.
          </Text>
          <Press
            haptic="tap"
            accessibilityRole="button"
            accessibilityLabel="Durak ekle"
            onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
            style={[styles.addStopBtn, { borderColor: C.border, backgroundColor: C.void }]}
          >
            <Icon name="plus" size={14} color={C.accent} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright }]}>Durak ekle</Text>
          </Press>
        </View>
      )}

      <DayTasks date={day} tasks={calendarTasks} onAdd={onAddTask} onToggle={onToggleTask} onRemove={onRemoveTask} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: STEP.s3 },
  emptyWrap: {
    paddingVertical: STEP.s2,
    alignItems: "flex-start",
  },
  addStopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    height: CONTROL.buttonTertiary,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
});
