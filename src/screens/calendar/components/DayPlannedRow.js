import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { subjectColorOf } from "../../../themes/subjectPalette";

// Ay gorunumunde planli durak: YAPILAN satirlariyla (DaySlotRow) ayni hizada,
// kutusuz. Saat sutunu bos kalir -- duragin saati yok, "—" yazmiyoruz.
export const DayPlannedRow = memo(function DayPlannedRow({ stop, draft, C, onOpenMenu }) {
  const color = subjectColorOf(C, stop.subjectKey || stop.subjectLabel);
  const habit = stop.source === "habit";
  const name = stop.topic || stop.subjectLabel;
  const meta = habit ? `${stop.subjectLabel} · Günlük rutin` : stop.topic ? stop.subjectLabel : null;

  return (
    <View style={[s.row, draft && s.draft]}>
      <View style={s.timeCol} />
      <View style={[s.bar, { backgroundColor: color }]} />
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>{name}</Text>
        {meta ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>{meta}</Text> : null}
      </View>
      {stop.minutes ? (
        <Text style={[TYPOGRAPHY.metaSemiBold, s.tabular, { color: C.text3 }]}>{`${stop.minutes} dk`}</Text>
      ) : null}
      {stop.movable ? (
        <Press
          haptic="light"
          onPress={() => onOpenMenu?.(stop)}
          style={s.more}
          accessibilityRole="button"
          accessibilityLabel="Durak seçenekleri"
        >
          <Icon name="more" size={16} color={C.text3} fill={C.text3} />
        </Press>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin + STEP.s1 },
  draft: { opacity: 0.6 },
  timeCol: { width: 36 },
  bar: { width: 2, height: 28, borderRadius: 1 },
  body: { flex: 1 },
  tabular: { fontVariant: ["tabular-nums"] },
  more: { width: CONTROL.tapMin, height: CONTROL.tapMin, marginRight: -STEP.s2, alignItems: "center", justifyContent: "center" },
});
