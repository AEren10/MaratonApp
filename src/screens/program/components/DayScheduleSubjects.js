import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { DAY_KINDS } from "../../../domain/program/classSchedule";
import { weekdayIndex } from "../../../domain/program/dayKeys";
import { useClassSchedule } from "../../../hooks/useClassSchedule";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { getSubjectLabel } from "../../../themes/subjects";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import ScheduleChip from "./ScheduleChip";

const KIND_LABEL = { [DAY_KINDS.TRIAL]: "Deneme günü", [DAY_KINDS.OFF]: "Boş gün" };

// Secili gunun DERS PROGRAMI: Haftalik ders programinda o gune yazilan
// dersler burada da gorunur (12 Ekim: programa ders eklenince Program ve
// takvimde hicbir sey degismiyordu). Dokununca ders programi acilir.
function DayScheduleSubjects({ dateKey, style }) {
  const C = useC();
  const navigation = useNavigation();
  const { schedule, defined } = useClassSchedule();
  if (!dateKey || !defined) return null;
  const day = schedule[weekdayIndex(dateKey)];
  const kindLabel = KIND_LABEL[day?.kind];
  if (!day || (!kindLabel && day.subjects.length === 0)) return null;

  return (
    <Press
      haptic="none"
      onPress={() => navigation.navigate(SCREENS.CLASS_SCHEDULE)}
      accessibilityRole="button"
      accessibilityLabel="Ders programını aç"
      style={style}
    >
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU GÜNÜN DERSLERİ</Text>
      <View style={s.chips}>
        {kindLabel ? (
          <ScheduleChip tone="dashed" label={kindLabel} />
        ) : day.subjects.map((key) => (
          <ScheduleChip key={key} label={getSubjectLabel(key)} color={C.subjects?.[subjectPaletteKey(key)] || C.text} />
        ))}
      </View>
    </Press>
  );
}

export default memo(DayScheduleSubjects);

const s = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 - 2, marginTop: STEP.s1 },
});
