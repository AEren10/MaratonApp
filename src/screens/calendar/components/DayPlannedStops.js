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
import { DayPlannedRow } from "./DayPlannedRow";
import { StopActionModal } from "../../program/components/StopActionModal";

export function DayPlannedStops({ day, C }) {
  const [menuStop, setMenuStop] = useState(null);
  const navigation = useNavigation();
  const { stops: all } = useDayRouteStops(day);
  const isToday = day === todayTR();
  const isDraft = day ? mondayOf(day) > mondayOf(todayTR()) : false;
  // Bugun biten duraklar ustteki YAPILAN listesinde zaten var; burada ikinci
  // kez "Bitti" diye yazilmaz. Bugun yalniz kalanlar, ileri gunlerde plan.
  const stops = isToday ? (all || []).filter((x) => x.status !== "done") : all || [];
  const doneCount = isToday ? (all || []).length - stops.length : 0;
  const title = isToday ? "BUGÜN KALAN" : "PLANLANAN";
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
      <Icon name="plus" size={16} color={C.accent} />
      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.accentBright }]}>Bu güne durak ekle</Text>
    </Press>
  );

  if (stops.length === 0) {
    return (
      <View style={s.wrap}>
        <Text style={[TYPOGRAPHY.label, s.head, { color: C.text3 }]}>{title}</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text3 }]}>
          {doneCount > 0 ? "Bugünün durakları bitti." : "Bu gün için planlanan durak yok."}
        </Text>
        {addRow}
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <Text style={[TYPOGRAPHY.label, s.head, { color: C.text3 }]}>{`${title} (${stops.length})`}</Text>
        {isDraft ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Taslak · hafta başlayınca kesinleşir</Text>
        ) : null}
      </View>

      {stops.map((stop, i) => (
        <DayPlannedRow key={stop.id || i} stop={stop} draft={isDraft} C={C} onOpenMenu={setMenuStop} />
      ))}
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
  add: { flexDirection: "row", alignItems: "center", gap: STEP.s1, minHeight: 44, marginTop: STEP.s1 },
});
