import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { formatMinutes } from "../../../lib/format";
import { todayTR } from "../../../lib/dateUtils";
import { mondayOf } from "../../../domain/program/dayKeys";
import { SelectedDayStopRow } from "./SelectedDayStopRow";
import { StopActionModal } from "../../program/components/StopActionModal";

export function SelectedDayPanel({ selectedDay, logs }) {
  const C = useC();
  const navigation = useNavigation();
  const [menuStop, setMenuStop] = useState(null);

  const displayLogs = Array.isArray(logs) ? logs : [];
  const totalMinutes = displayLogs.reduce((acc, l) => acc + (l.minutes || 0), 0);
  const meta = totalMinutes > 0 ? `${formatMinutes(totalMinutes)} planlı` : "";

  const isDraft = selectedDay?.key ? mondayOf(selectedDay.key) > mondayOf(todayTR()) : false;

  const openDetail = selectedDay?.isToday ? () => navigation.navigate(SCREENS.PLAN_DETAIL) : undefined;
  const addTask = () => navigation.navigate(
    SCREENS.ADD_TASK,
    selectedDay?.key && selectedDay.key >= todayTR() ? { date: selectedDay.key } : undefined,
  );

  return (
    <View style={s.wrap}>
      {isDraft ? (
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginBottom: STEP.s2 }]}>
          Taslak · hafta başlayınca kesinleşir
        </Text>
      ) : null}

      {displayLogs.length > 0 ? (
        <View style={s.summaryRow}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
            GÜNÜN DURAKLARI ({displayLogs.length})
          </Text>
          {meta ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{meta}</Text> : null}
        </View>
      ) : null}

      {displayLogs.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
            Bu gün için henüz durak planlanmadı.
          </Text>
          <Pressable
            onPress={addTask}
            style={({ pressed }) => [
              s.linkRow,
              { borderBottomColor: C.line, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentBright, flex: 1 }]}>Durak ekle</Text>
            <Icon name="chevR" size={14} color={C.text3} />
          </Pressable>
        </View>
      ) : (
        <View style={s.listWrap}>
          {displayLogs.map((log, i) => (
            <SelectedDayStopRow
              key={log.id || i}
              log={log}
              isLast={i === displayLogs.length - 1}
              isDraft={isDraft}
              C={C}
              onPress={openDetail}
              onOpenMenu={setMenuStop}
            />
          ))}
          <Pressable
            onPress={addTask}
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

      <StopActionModal
        visible={Boolean(menuStop)}
        stop={menuStop}
        dateKey={selectedDay?.key}
        onClose={() => setMenuStop(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  summaryRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: STEP.s2 },
  listWrap: { marginTop: STEP.s1 },
  emptyWrap: { marginTop: STEP.s1 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    borderBottomWidth: 1,
    minHeight: CONTROL.tapMin,
    marginTop: STEP.s1,
  },
});
