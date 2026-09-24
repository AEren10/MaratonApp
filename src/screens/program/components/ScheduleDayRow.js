import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { DAY_KINDS } from "../../../domain/program/classSchedule";
import { WEEKDAYS_SHORT_TR } from "../../../lib/trWords";
import { formatNumber } from "../../../lib/format";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import ScheduleChip from "./ScheduleChip";
import ScheduleDayEditor from "./ScheduleDayEditor";
import { Press } from "../../../components/design/Press";

const KIND_LABEL = { [DAY_KINDS.TRIAL]: "Deneme günü", [DAY_KINDS.OFF]: "Boş gün" };

function hoursLabel(day) {
  if (day.kind === DAY_KINDS.OFF || !day.minutes) return "—";
  return `${formatNumber(day.minutes / 60, day.minutes % 60 ? 1 : 0)} sa`;
}

function ScheduleDayRow({ day, isToday, isLast, open, editor }) {
  const C = useC();
  const kindLabel = KIND_LABEL[day.kind];
  const dayColor = isToday ? C.accentBright : day.kind === DAY_KINDS.OFF ? C.text3 : C.text2;

  return (
    <View style={[s.wrap, { borderTopColor: C.line }, isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Press haptic="none"
        onPress={() => editor.toggleOpen(day.weekday)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[s.row]}
      >
        <Text style={[TYPOGRAPHY.tableHead, s.day, { color: dayColor }]}>{WEEKDAYS_SHORT_TR[day.weekday]}</Text>
        <View style={s.chips}>
          {kindLabel ? (
            <ScheduleChip tone="dashed" label={kindLabel} />
          ) : (
            day.subjects.map((key) => (
              <ScheduleChip key={key} label={editor.labelOf(key)} color={C.subjects?.[key] || C.text} />
            ))
          )}
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{hoursLabel(day)}</Text>
      </Press>
      {open ? <ScheduleDayEditor day={day} editor={editor} /> : null}
    </View>
  );
}

export default memo(ScheduleDayRow);

const s = StyleSheet.create({
  wrap: { borderTopWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", minHeight: CONTROL.tapMin, paddingVertical: STEP.s2, gap: STEP.s2 },
  day: { width: 36 },
  chips: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
