import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { DAY_KINDS } from "../../../domain/program/classSchedule";
import { WEEKDAYS_SHORT_TR } from "../../../lib/trWords";
import { formatNumber } from "../../../lib/format";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import ScheduleChip from "./ScheduleChip";
import ScheduleDayEditor from "./ScheduleDayEditor";
import { Press } from "../../../components/design/Press";

const KIND_LABEL = { [DAY_KINDS.TRIAL]: "Deneme günü", [DAY_KINDS.OFF]: "Boş gün" };

function hoursLabel(day) {
  if (day.kind === DAY_KINDS.OFF || !day.minutes) return "—";
  return `${formatNumber(day.minutes / 60, day.minutes % 60 ? 1 : 0)} sa`;
}

function ScheduleDayRow({ day, isToday, isLast, open, editor, weekStops = [] }) {
  const C = useC();
  const kindLabel = KIND_LABEL[day.kind];
  const dayColor = isToday ? C.accentBright : day.kind === DAY_KINDS.OFF ? C.text3 : C.text;
  // Bu hafta o gune dusen duraklarin dersleri; ogrencinin sectikleri haric.
  const chosen = new Set(day.subjects.map((key) => subjectPaletteKey(key)));
  const extra = weekStops.filter((stop) => !chosen.has(stop.key));

  return (
    <View
      style={[
        s.wrap,
        {
          borderColor: open ? C.accent + "40" : C.line,
          backgroundColor: open ? C.void : "transparent",
        },
        isLast && { borderBottomWidth: 1 },
      ]}
    >
      <Press
        haptic="none"
        onPress={() => editor.toggleOpen(day.weekday)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={s.row}
      >
        <View style={s.dayCol}>
          <Text style={[TYPOGRAPHY.tableHead, s.dayText, { color: dayColor }]}>
            {WEEKDAYS_SHORT_TR[day.weekday]}
          </Text>
          {isToday ? <View style={[s.todayDot, { backgroundColor: C.accent }]} /> : null}
        </View>

        <View style={s.chips}>
          {kindLabel ? <ScheduleChip tone="dashed" label={kindLabel} /> : null}
          {!kindLabel ? day.subjects.map((key) => (
            <ScheduleChip
              key={key}
              label={editor.displayLabelOf ? editor.displayLabelOf(key) : editor.labelOf(key)}
              color={C.subjects?.[subjectPaletteKey(key)] || C.text}
            />
          )) : null}
          {extra.map((stop) => (
            <ScheduleChip key={`w-${stop.key}`} tone="ghost" label={stop.label} color={C.subjects?.[stop.key] || C.text2} />
          ))}
          {!kindLabel && day.subjects.length === 0 && extra.length === 0 ? (
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Ders seçilmedi</Text>
          ) : null}
        </View>

        <View style={s.endCol}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{hoursLabel(day)}</Text>
          <Icon name={open ? "chevUp" : "chevDown"} size={14} color={C.text3} />
        </View>
      </Press>
      {open ? <ScheduleDayEditor day={day} editor={editor} /> : null}
    </View>
  );
}

export default memo(ScheduleDayRow);

const s = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderRadius: SHAPE.cardTight,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s1,
    gap: STEP.s2,
  },
  dayCol: {
    width: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dayText: {
    fontVariant: ["tabular-nums"],
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  chips: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  endCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
