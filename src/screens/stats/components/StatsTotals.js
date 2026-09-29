import { Fragment, memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, fmtInt } from "../statsFormat";

// Uc buyuk sayi: toplam soru, toplam saat, aktif gun. Ortalanmis hucreler ve 1px ayraclar.
export const StatsTotals = memo(function StatsTotals({ C, study }) {
  const cells = [
    { label: "soru", value: fmtInt(study?.totalQuestions) },
    { label: "saat", value: fmtHours(study?.totalMinutes) },
    { label: "aktif gün", value: fmtInt(study?.activeDays) },
  ];
  return (
    <View style={s.row}>
      {cells.map((c, i) => (
        <Fragment key={c.label}>
          {i > 0 ? <View style={[s.sep, { backgroundColor: C.line }]} /> : null}
          <View style={s.cell}>
            <Text style={[TYPOGRAPHY.stat, s.num, { color: C.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {c.value}
            </Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{c.label}</Text>
          </View>
        </Fragment>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: STEP.s2,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
  sep: {
    width: 1,
    height: 36,
    alignSelf: "center",
  },
});
