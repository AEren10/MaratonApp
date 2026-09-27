import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useWeekProgram } from "../../../hooks/useWeekProgram";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { DerslerSkeleton } from "../../dersler/components/DerslerSkeleton";
import { WeekDayStrip } from "../../dersler/components/WeekDayStrip";
import { SelectedDayPanel } from "../../dersler/components/SelectedDayPanel";
import { ProgramRulesSection } from "../../dersler/components/ProgramRulesSection";

function weekSummary({ weekRangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const parts = [weekRangeLabel, `${activeDaysCount || 0}/7 aktif gün`];
  if (totalMinutes > 0) parts.push(`${Math.floor(totalMinutes / 60)} sa ${totalMinutes % 60} dk`);
  if (totalQuestions > 0) parts.push(`${totalQuestions} soru`);
  return parts.filter(Boolean).join(" · ");
}

// Hafta: gun seridi ve secili gunun duraklari. Eskiden ustte ayri bir
// "BU HAFTA" karti, iki segment ve iki buyuk buton vardi; ozet tek satira indi.
export function ProgramWeekView() {
  const C = useC();
  const navigation = useNavigation();
  const w = useWeekProgram();

  if (w.loading) {
    return <View style={s.pad}><DerslerSkeleton /></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={s.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={w.loading} onRefresh={w.refresh} tintColor={C.accent} colors={[C.accent]} />}
    >
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{weekSummary(w)}</Text>
      <WeekDayStrip days={w.days} selectedDate={w.selectedDate} onSelect={w.setSelectedDate} />
      {w.selectedDay ? <SelectedDayPanel selectedDay={w.selectedDay} logs={w.selectedDayLogs} /> : null}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: STEP.s3,
    paddingTop: STEP.s2 + 2,
    borderTopWidth: 1,
    minHeight: CONTROL.tapMin,
  },
  copy: { gap: 2, flex: 1 },
});
