import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { formatMinutes } from "../../../lib/format";
import { subjectColorOf } from "../../../themes/subjectPalette";

function StopRow({ log, C, onPress }) {
  const isDone = log.status === "done" || log.completed;
  const dotColor = subjectColorOf(C, log.subjectKey || log.subjectLabel);

  return (
    <Pressable onPress={onPress} style={s.timelineRow}>
      <View style={s.timeCol}>
        <Text style={[TYPOGRAPHY.label, s.tabular, { color: C.text }]}>{log.time || "—"}</Text>
        <Text style={[TYPOGRAPHY.micro, s.tabular, { color: C.text3 }]}>{log.minutes ? `${log.minutes} dk` : ""}</Text>
      </View>

      <View style={s.lineTrack}>
        <View style={[s.dot, { backgroundColor: dotColor }]} />
        <View style={[s.vertLine, { backgroundColor: C.line }]} />
      </View>

      <View style={[s.stopCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.cardHead}>
          <Text style={[TYPOGRAPHY.tableHead, { color: dotColor }]}>
            {(log.subjectLabel || "DERS").toUpperCase()}
          </Text>
          {isDone ? (
            <Text style={[TYPOGRAPHY.tableHead, { color: C.up }]}>BİTTİ</Text>
          ) : null}
        </View>
        <Text
          style={[
            TYPOGRAPHY.bodyMedium,
            { color: isDone ? C.text3 : C.text, textDecorationLine: isDone ? "line-through" : "none" },
          ]}
          numberOfLines={1}
        >
          {log.topic || log.subjectLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export function SelectedDayPanel({ selectedDay, logs }) {
  const C = useC();
  const navigation = useNavigation();

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDay.key);
    const weekday = d.toLocaleDateString("tr-TR", { weekday: "long" }).toUpperCase();
    const rest = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }).toUpperCase();
    return `${weekday} · ${rest}`;
  }, [selectedDay.key]);

  const displayLogs = logs && logs.length > 0 ? logs : [
    { time: "08:30", minutes: 45, subjectLabel: "Türkçe", topic: "Paragraf - Anlatım Biçimleri", completed: true, status: "done" },
    { time: "10:00", minutes: 50, subjectLabel: "Matematik", topic: "Permütasyon - Kombinasyon" },
    { time: "16:00", minutes: 40, subjectLabel: "Biyoloji", topic: "Nükleik Asitler" },
    { time: "19:30", minutes: 25, subjectLabel: "Matematik", topic: "Defter tekrarı · 6 soru" },
  ];

  const totalMinutes = displayLogs.reduce((s, l) => s + (l.minutes || 0), 0);
  const meta = `${formatMinutes(totalMinutes)} planlı`;

  const openDetail = () => navigation.navigate(SCREENS.PLAN_DETAIL, { date: selectedDay.key, dateLabel });

  return (
    <View style={s.wrap}>
      <Pressable onPress={openDetail} style={s.headerRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{dateLabel}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{meta}</Text>
      </Pressable>

      <View style={s.listWrap}>
        {displayLogs.map((log, i) => (
          <StopRow key={i} log={log} C={C} onPress={openDetail} />
        ))}
      </View>

      <Pressable
        onPress={() => navigation.navigate(SCREENS.ADD_TASK)}
        style={({ pressed }) => [
          s.addButton,
          { borderColor: C.elev, backgroundColor: pressed ? C.elev : "transparent" },
        ]}
      >
        <Icon name="plus" size={13} color={C.accent} />
        <Text style={[TYPOGRAPHY.bodySemiBold, s.btnText, { color: C.accentBright }]}>
          Durak ekle
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: STEP.s2 },
  listWrap: { marginTop: STEP.s1 },
  timelineRow: { flexDirection: "row", alignItems: "stretch", gap: STEP.s1 + 2, marginBottom: STEP.s2 },
  timeCol: { width: 44, alignItems: "flex-start", paddingTop: 2 },
  tabular: { fontVariant: ["tabular-nums"] },
  lineTrack: { width: 12, alignItems: "center", paddingTop: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  vertLine: { width: 1, flex: 1, marginTop: 4 },
  stopCard: { flex: 1, padding: STEP.s2, borderRadius: SHAPE.cardTight, borderWidth: 1 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginBottom: 2 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
    height: CONTROL.buttonTertiary,
    marginTop: STEP.s1,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  btnText: { letterSpacing: 0.2 },
});
