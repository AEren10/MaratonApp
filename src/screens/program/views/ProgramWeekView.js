import { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useWeekProgram } from "../../../hooks/useWeekProgram";
import { useDayRouteStops } from "../../../hooks/useDayRouteStops";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { DerslerSkeleton } from "../../dersler/components/DerslerSkeleton";
import { WeekDayStrip } from "../../dersler/components/WeekDayStrip";
import { SelectedDayPanel } from "../../dersler/components/SelectedDayPanel";
import { ProgramRulesSection } from "../../dersler/components/ProgramRulesSection";
import { ScheduleDiscoverCard } from "../components/ScheduleDiscoverCard";

function weekSummary({ weekRangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const parts = [weekRangeLabel, `${activeDaysCount || 0}/7 aktif gün`];
  if (totalMinutes > 0) parts.push(`${Math.floor(totalMinutes / 60)} sa ${totalMinutes % 60} dk`);
  if (totalQuestions > 0) parts.push(`${totalQuestions} soru`);
  return parts.filter(Boolean).join(" · ");
}

export function ProgramWeekView() {
  const C = useC();
  const navigation = useNavigation();
  const w = useWeekProgram();
  // Gunun listesi = rotanin o gune dusen duraklari (ders programi ve
  // "Durak ekle" ikisi de rotaya yazar) + o gun yapilmis kayitlar. Eskiden
  // yalniz kayitlar gorunuyordu; eklenen duraklar Program'da cikmiyordu.
  const dayRoute = useDayRouteStops(w.selectedDate);
  // Kayit ile durak AYNI anahtarla eslesir (duraklar paletin ders anahtarini
  // tasir, kayitlar ham anahtari). Duraga denk gelen kayit ayri satir olmaz,
  // duragi "bitti" yapar.
  const dayItems = useMemo(() => {
    const logs = w.selectedDayLogs || [];
    const keyOf = (subject, topic) => `${subjectPaletteKey(subject)}|${topic}`;
    const logKeys = new Set(logs.map((l) => keyOf(l.subjectKey, l.topic)));
    const stopKeys = new Set(dayRoute.stops.map((st) => keyOf(st.subjectKey, st.topic)));
    const stops = dayRoute.stops.map((st) => (!st.completed && logKeys.has(keyOf(st.subjectKey, st.topic))
      ? { ...st, completed: true, status: "done" } : st));
    return [...stops, ...logs.filter((l) => !stopKeys.has(keyOf(l.subjectKey, l.topic)))];
  }, [dayRoute.stops, w.selectedDayLogs]);

  const selectedDateObj = useMemo(() => {
    if (!w.selectedDate) return new Date();
    return new Date(w.selectedDate + "T12:00:00");
  }, [w.selectedDate]);

  const weekdayName = useMemo(() => {
    const raw = selectedDateObj.toLocaleDateString("tr-TR", { weekday: "long" });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDateObj]);

  const dateFormatted = useMemo(() => {
    return selectedDateObj.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  }, [selectedDateObj]);

  if (w.loading) {
    return <View style={s.pad}><DerslerSkeleton /></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={w.loading} onRefresh={w.refresh} tintColor={C.accent} colors={[C.accent]} />}
    >
      <Text style={[TYPOGRAPHY.metaSemiBold, s.weekRange, { color: C.text3 }]}>{w.weekRangeLabel}</Text>

      <View style={s.dayHeading}>
        <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>{weekdayName}</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, marginTop: 2 }]}>{dateFormatted}</Text>
      </View>

      <WeekDayStrip days={w.days} selectedDate={w.selectedDate} onSelect={w.setSelectedDate} />
      <ScheduleDiscoverCard style={{ marginTop: STEP.s3 }} />

      {w.selectedDay ? <SelectedDayPanel selectedDay={w.selectedDay} logs={dayItems} /> : null}

      <ProgramRulesSection onOpen={() => navigation.navigate(SCREENS.CLASS_SCHEDULE)} />
      <Press haptic="none"
        onPress={() => navigation.navigate(SCREENS.TOPIC_DEBT)}
        accessibilityRole="button"
        style={[s.row, { borderTopColor: C.line }]}
      >
        <View style={s.copy}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Geride kalan konular</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Yapılamayan durakları yeniden planla</Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 120 },
  weekRange: { marginTop: STEP.s2, letterSpacing: 0.3 },
  dayHeading: { marginTop: STEP.s1, marginBottom: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: STEP.s3, borderTopWidth: 1, marginTop: STEP.s4 },
  copy: { flex: 1, gap: 2 },
});
