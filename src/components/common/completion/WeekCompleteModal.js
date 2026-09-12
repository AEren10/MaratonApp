import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CompletionShell } from "./CompletionShell";
import { CompletionStats } from "./CompletionStats";
import { WeekDayBars } from "./WeekDayBars";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { formatNumber, formatMinutes } from "../../../lib/format";

// "Hafta Tamamlandi" (AKIS 16). Tetikleyici: rotanin ICINDE BULUNULAN
// haftasindaki tum duraklar COMPLETED (useCompletionMoments).
// Durak sayilari route.weeks[0].stops'tan, sure/gunler useWeekProgram'dan.
export const WeekCompleteModal = memo(function WeekCompleteModal({
  visible,
  rangeLabel,
  stopsPlanned = 0,
  stopsDone = 0,
  weekMinutes = 0,
  days = [],
  onClose,
  onNextWeek,
  onWeeklySummary,
}) {
  const C = useC();
  if (!visible) return null;

  const debt = Math.max(0, stopsPlanned - stopsDone);

  return (
    <CompletionShell
      visible
      onClose={onClose}
      eyebrow={rangeLabel ? `${rangeLabel} · HAFTA KAPANDI` : "HAFTA KAPANDI"}
      title={`Haftanın ${formatNumber(stopsDone)} durağı bitti.`}
      body="Programı eksiksiz kapattın. Borç satırın bu hafta boş."
      primaryLabel="Gelecek haftaya bak"
      onPrimary={onNextWeek}
      secondaryLabel={onWeeklySummary ? "Haftalık özeti gör" : null}
      onSecondary={onWeeklySummary}
    >
      <View style={s.pad}>
        <CompletionStats
          items={[
            { label: "DURAK", value: `${formatNumber(stopsDone)}/${formatNumber(stopsPlanned)}` },
            { label: "SÜRE", value: weekMinutes > 0 ? formatMinutes(weekMinutes) : null },
            { label: "BORÇ", value: formatNumber(debt) },
          ]}
        />
      </View>

      <View style={s.pad}>
        <WeekDayBars days={days} />
      </View>

      <View style={s.pad}>
        <View style={[s.panel, { backgroundColor: C.void, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>SÖZ VE GERÇEK</Text>
          <Text style={[TYPOGRAPHY.subheading, s.panelBody, { color: C.text }]}>
            Planladığın {formatNumber(stopsPlanned)} durak, tamamladığın{" "}
            {formatNumber(stopsDone)} durak. Fark yok.
          </Text>
        </View>
      </View>
    </CompletionShell>
  );
});

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  panel: {
    paddingVertical: STEP.s3,
    paddingHorizontal: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  panelBody: { marginTop: STEP.s1 + 2 },
});
