import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { mondayOf } from "../../../domain/program/dayKeys";
import { todayTR } from "../../../lib/dateUtils";
import { useDayRouteStops } from "../../../hooks/useDayRouteStops";
import { SelectedDayStopRow } from "../../dersler/components/SelectedDayStopRow";
import { StopActionModal } from "../../program/components/StopActionModal";

export function DayPlannedStops({ day, C }) {
  const [menuStop, setMenuStop] = useState(null);
  const { stops } = useDayRouteStops(day);
  const isDraft = day ? mondayOf(day) > mondayOf(todayTR()) : false;

  if (!stops || stops.length === 0) {
    return (
      <View style={s.wrap}>
        <Text style={[TYPOGRAPHY.label, s.head, { color: C.text3 }]}>PLANLANAN</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
          Bu gün için planlanan rota durağı yok.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <Text style={[TYPOGRAPHY.label, s.head, { color: C.text3 }]}>
          PLANLANAN ({stops.length})
        </Text>
        {isDraft ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Taslak</Text>
        ) : null}
      </View>

      {isDraft ? (
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginBottom: STEP.s2 }]}>
          Taslak · hafta başlayınca kesinleşir
        </Text>
      ) : null}

      <View style={s.list}>
        {stops.map((stop, i) => (
          <SelectedDayStopRow
            key={stop.id || i}
            log={stop}
            isLast={i === stops.length - 1}
            isDraft={isDraft}
            C={C}
            onOpenMenu={setMenuStop}
          />
        ))}
      </View>

      <StopActionModal
        visible={Boolean(menuStop)}
        stop={menuStop}
        dateKey={day}
        onClose={() => setMenuStop(null)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, marginBottom: STEP.s2 },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
  },
  head: { letterSpacing: 1.1 },
  list: { marginTop: STEP.s1 },
});
