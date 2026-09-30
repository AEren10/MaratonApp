import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
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
        <View style={[s.emptyBox, { borderColor: C.line, backgroundColor: C.surface + "20" }]}>
          <Text style={[TYPOGRAPHY.caption, { color: C.text3, marginBottom: STEP.s2 }]}>
            Bu gün için henüz durak planlanmadı.
          </Text>
          <Pressable
            onPress={addTask}
            style={({ pressed }) => [
              s.addButton,
              { borderColor: C.line, backgroundColor: pressed ? C.elev : C.surface },
            ]}
          >
            <Icon name="plus" size={13} color={C.accentBright} sw={1.5} />
            <Text style={[TYPOGRAPHY.captionSemiBold, s.btnText, { color: C.text }]}>
              Durak ekle
            </Text>
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
  emptyBox: { paddingVertical: STEP.s3, paddingHorizontal: STEP.s3, borderRadius: SHAPE.cardTight, borderWidth: 1, borderStyle: "dashed", alignItems: "flex-start" },
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
