import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { parseDayKey } from "../../../domain/program/dayKeys";
import { todayTR } from "../../../lib/dateUtils";
import { MONTHS_SHORT_TR } from "../../../lib/trWords";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

const LIMIT = 3;

// YAKLAŞAN TARİHLER: kullanicinin takvime yazdigi, henuz yapilmamis gelecek
// isler (useCalendarTasks). Kaynak yoksa bolum hic cizilmez.
function UpcomingDates({ tasksByDate }) {
  const C = useC();
  const today = todayTR();
  const rows = useMemo(() => Object.entries(tasksByDate || {})
    .filter(([date]) => date >= today)
    .flatMap(([date, list]) => (list || []).filter((t) => !t.done).map((t) => ({ date, id: t.id, title: t.title })))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, LIMIT), [tasksByDate, today]);

  if (!rows.length) return null;
  const todayMs = parseDayKey(today).getTime();

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>YAKLAŞAN TARİHLER</Text>
        <View style={[s.rule, { backgroundColor: C.line }]} />
      </View>
      {rows.map((r, i) => {
        const d = parseDayKey(r.date);
        const days = Math.round((d.getTime() - todayMs) / 86400000);
        return (
          <View
            key={`${r.date}-${r.id}`}
            style={[s.row, { borderTopColor: C.line }, i === rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.line }]}
          >
            <Text style={[TYPOGRAPHY.micro, s.date, { color: i === 0 ? C.accentBright : C.text3 }]}>
              {`${d.getUTCDate()} ${MONTHS_SHORT_TR[d.getUTCMonth()].toLocaleUpperCase("tr-TR")}`}
            </Text>
            <Text style={[TYPOGRAPHY.tableName, s.flex, { color: C.text }]} numberOfLines={1}>{r.title}</Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{days === 0 ? "bugün" : `${days} gün`}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default memo(UpcomingDates);

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 - 8 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2 - 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 1, paddingVertical: STEP.s2 + 3, borderTopWidth: 1 },
  date: { width: 50, fontFamily: TYPOGRAPHY.metaSemiBold.fontFamily },
  flex: { flex: 1 },
});
