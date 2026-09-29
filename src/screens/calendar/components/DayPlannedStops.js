import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { mondayOf } from "../../../domain/program/dayKeys";
import { todayTR } from "../../../lib/dateUtils";
import { useDayRouteStops } from "../../../hooks/useDayRouteStops";
import { SelectedDayStopRow } from "../../dersler/components/SelectedDayStopRow";
import { StopActionModal } from "../../program/components/StopActionModal";

export function DayPlannedStops({ day, C }) {
  const [menuStop, setMenuStop] = useState(null);
  const navigation = useNavigation();
  const { stops } = useDayRouteStops(day);
  const isDraft = day ? mondayOf(day) > mondayOf(todayTR()) : false;
  // Durak eklemenin TEK yolu: o gunun tarihiyle Durak ekle. Eklenen durak
  // ana sayfada, Program Hafta'da ve burada ayni anda gorunur.
  const addRow = (
    <Press
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel="Bu güne durak ekle"
      onPress={() => navigation.navigate(SCREENS.ADD_TASK, { date: day })}
      style={s.add}
    >
      <Icon name="plus" size={14} color={C.accent} />
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.accentBright }]}>Bu güne durak ekle</Text>
    </Press>
  );

  if (!stops || stops.length === 0) {
    return (
      <View style={s.wrap}>
        <Text style={[TYPOGRAPHY.label, s.head, { color: C.text3 }]}>PLANLANAN</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
          Bu gün için planlanan durak yok.
        </Text>
        {addRow}
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
      {addRow}

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
  add: { flexDirection: "row", alignItems: "center", gap: STEP.s1, minHeight: 44, marginTop: STEP.s1 },
});
