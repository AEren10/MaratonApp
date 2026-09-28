import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { formatMinutes } from "../../../lib/format";
import { subjectColorOf } from "../../../themes/subjectPalette";

function StopRow({ log, isLast, C, onPress }) {
  const isDone = log.status === "done" || log.completed;
  const dotColor = subjectColorOf(C, log.subjectKey || log.subjectLabel);

  return (
    <Pressable onPress={onPress} style={s.timelineRow}>
      <View style={s.timeCol}>
        <Text style={[TYPOGRAPHY.tableName, s.tabular, { color: C.text }]}>{log.time || "—"}</Text>
      </View>

      <View style={s.lineTrack}>
        <View style={[s.dot, { backgroundColor: dotColor }]} />
        {!isLast ? <View style={[s.vertLine, { backgroundColor: C.line }]} /> : null}
      </View>

      <View style={[s.stopCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.cardHead}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]} numberOfLines={1}>
            <Text style={{ color: dotColor }}>{log.subjectLabel}</Text>
            {log.topic ? ` · ${log.topic}` : ""}
          </Text>
          {isDone ? (
            <View style={s.doneBadge}>
              <Icon name="check" size={12} color={C.text2} sw={1.5} />
              <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>Bitti</Text>
            </View>
          ) : log.minutes ? (
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${log.minutes} dk`}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function SelectedDayPanel({ selectedDay, logs }) {
  const C = useC();
  const navigation = useNavigation();

  const displayLogs = Array.isArray(logs) ? logs : [];
  const totalMinutes = displayLogs.reduce((acc, l) => acc + (l.minutes || 0), 0);
  const meta = totalMinutes > 0 ? `${formatMinutes(totalMinutes)} planlı` : "";

  // Gunun plani ekrani yalniz BUGUNU anlatir (ana sayfanin "tumu"su).
  // Baska gunun satiri eskiden oraya gidip bugunun duraklarini gosteriyordu.
  const openDetail = selectedDay?.isToday ? () => navigation.navigate(SCREENS.PLAN_DETAIL) : undefined;

  return (
    <View style={s.wrap}>
      {displayLogs.length > 0 ? (
        <View style={s.summaryRow}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
            GÜNÜN DURAKLARI ({displayLogs.length})
          </Text>
          {meta ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{meta}</Text> : null}
        </View>
      ) : null}

      {displayLogs.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={[TYPOGRAPHY.body, { color: C.text3, marginBottom: STEP.s2 }]}>
            Bu gün için henüz durak planlanmadı.
          </Text>
          <Pressable
            onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
            style={({ pressed }) => [
              s.addButton,
              { borderColor: C.border, backgroundColor: pressed ? C.elev : C.surface },
            ]}
          >
            <Icon name="plus" size={14} color={C.accent} sw={1.5} />
            <Text style={[TYPOGRAPHY.bodySemiBold, s.btnText, { color: C.accentBright }]}>
              Durak ekle
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={s.listWrap}>
          {displayLogs.map((log, i) => (
            <StopRow key={log.id || i} log={log} isLast={i === displayLogs.length - 1} C={C} onPress={openDetail} />
          ))}
          <Pressable
            onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
            style={({ pressed }) => [
              s.addButton,
              { borderColor: C.border, backgroundColor: pressed ? C.elev : C.surface, marginTop: STEP.s2 },
            ]}
          >
            <Icon name="plus" size={14} color={C.accent} sw={1.5} />
            <Text style={[TYPOGRAPHY.bodySemiBold, s.btnText, { color: C.accentBright }]}>
              Durak ekle
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  summaryRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: STEP.s2 },
  listWrap: { marginTop: STEP.s1 },
  emptyBox: { paddingVertical: STEP.s2, alignItems: "flex-start" },
  timelineRow: { flexDirection: "row", alignItems: "stretch", gap: STEP.s1 + 2, marginBottom: STEP.s2 },
  timeCol: { width: 44, alignItems: "flex-start", paddingTop: 4 },
  tabular: { fontVariant: ["tabular-nums"] },
  lineTrack: { width: 14, alignItems: "center", paddingTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  vertLine: { width: 1.5, flex: 1, marginTop: 4 },
  stopCard: { flex: 1, padding: STEP.s2 + 2, borderRadius: SHAPE.cardTight, borderWidth: 1 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    height: CONTROL.buttonTertiary,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  btnText: { letterSpacing: 0.2 },
});
