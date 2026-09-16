import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC, useTheme } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { formatMinutes } from "../../../lib/format";

function StopRow({ log, C, solid }) {
  const isDone = log.status === "done" || log.completed;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: STEP.s2 + 2 }}>
      {log.time ? (
        <Text style={{ ...TYPOGRAPHY.metaSemiBold, width: 38, color: C.text3, fontVariant: ["tabular-nums"] }}>{log.time}</Text>
      ) : <View style={{ width: 38 }} />}
      <View style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: solid || C.text3 }} />
      <Text 
        style={{ ...TYPOGRAPHY.bodyMedium, color: isDone ? C.text3 : C.text, textDecorationLine: isDone ? "line-through" : "none", flex: 1 }} 
        numberOfLines={1}
      >
        {log.topic ? \\ · \\ : log.subjectLabel}
      </Text>
      {isDone ? (
        <Text style={{ fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.2, color: C.up }}>BİTTİ</Text>
      ) : (
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3 }}>{log.minutes ? \\ dk\ : ""}</Text>
      )}
    </View>
  );
}

export function SelectedDayPanel({ selectedDay, logs }) {
  const C = useC();
  const { subject: subjectId } = useTheme();
  const navigation = useNavigation();

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDay.key);
    const weekday = d.toLocaleDateString("tr-TR", { weekday: "long" }).toUpperCase();
    const rest = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }).toUpperCase();
    return \\ · \\;
  }, [selectedDay.key]);

  const displayLogs = logs.length > 0 ? logs : [
    { time: "09:30", subjectLabel: "Türkçe", topic: "Sözcükte Anlam", completed: true, status: "done" },
    { time: "14:00", subjectLabel: "Matematik", topic: "Permütasyon", completed: true, status: "done" },
    { time: "19:30", subjectLabel: "Matematik", topic: "Kombinasyon", completed: false, minutes: 50 },
    { time: "21:00", subjectLabel: "Felsefe", topic: "Bilgi Felsefesi", completed: false, minutes: 24 }
  ];

  const totalMinutes = displayLogs.reduce((s, l) => s + (l.minutes || 0), 0);
  const meta = \\ durak · \\;

  return (
    <View style={{ marginTop: STEP.s4 }}>
      <Pressable onPress={() => navigation.navigate(SCREENS.PLAN_DETAIL, { date: selectedDay.key })} style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginBottom: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.text3 }}>{dateLabel}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3 }}>{meta}</Text>
      </Pressable>
      
      <View style={{ marginTop: STEP.s1 }}>
        {displayLogs.map((log, i) => (
          <StopRow key={i} log={log} C={C} solid={C.brandTint} />
        ))}
      </View>
      
      <Pressable onPress={() => navigation.navigate(SCREENS.ADD_TASK)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: STEP.s3, borderTopWidth: 1, borderTopColor: C.line }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2 }}>
          <Icon name="plus" size={14} color={C.brandTint} />
          <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Bu güne durak ekle</Text>
        </View>
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3 }}>
          {new Date(selectedDay.key).toLocaleDateString("tr-TR", { weekday: "long" })}
        </Text>
      </Pressable>
    </View>
  );
}
