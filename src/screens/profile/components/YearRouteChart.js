import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useStatsOverview } from "../../../hooks/useStatsOverview";
import { formatNumber } from "../../../lib/format";
import { YearRhythmBars } from "./YearRhythmBars";

export function YearRouteChart() {
  const C = useC();
  const { data: statsData } = useStatsOverview();

  const study = statsData?.study;
  const activeDays = study?.activeDays ?? 0;
  const totalQuestions = study?.totalQuestions ?? 0;
  const totalMinutes = study?.totalMinutes ?? 0;
  const totalHours = Math.round(totalMinutes / 60);
  const last8Weeks = study?.last8Weeks || [];
  const bestWeek = study?.bestWeek;

  const hasActivity = activeDays >= 14;

  if (!hasActivity) {
    return (
      <View style={s.wrap}>
        <Text style={[TYPOGRAPHY.tableHead, s.sectionHead, { color: C.text2 }]}>
          YILIN ROTASI
        </Text>
        <View style={[s.card, { borderColor: C.line, backgroundColor: C.surface }]}>
          <Text style={[TYPOGRAPHY.subheading, s.title, { color: C.text }]}>
            Rota günlüğün ilk kayıtla başlayacak
          </Text>
          <Text style={[TYPOGRAPHY.caption, s.desc, { color: C.text2 }]}>
            {activeDays > 0
              ? `14 aktif güne ulaştığında yıllık rota özeti burada açılacak · Şu an ${activeDays}/14 gün.`
              : "Çalışma yaptığın günler yıl görünümünde gerçek iz olarak dolacak."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.headRow}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text2 }]}>YILIN ROTASI</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{activeDays} aktif gün</Text>
      </View>

      <View style={[s.card, { borderColor: C.line, backgroundColor: C.surface }]}>
        <View style={s.statsRow}>
          <View style={s.statCol}>
            <Text style={[TYPOGRAPHY.subheading, s.num, { color: C.text }]}>{activeDays}</Text>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>GÜN</Text>
          </View>
          <View style={[s.divider, { backgroundColor: C.line }]} />
          <View style={s.statCol}>
            <Text style={[TYPOGRAPHY.subheading, s.num, { color: C.text }]}>{totalHours} sa</Text>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>SÜRE</Text>
          </View>
          <View style={[s.divider, { backgroundColor: C.line }]} />
          <View style={s.statCol}>
            <Text style={[TYPOGRAPHY.subheading, s.num, { color: C.text }]}>{formatNumber(totalQuestions)}</Text>
            <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>SORU</Text>
          </View>
        </View>

        <YearRhythmBars last8Weeks={last8Weeks} bestWeek={bestWeek} />
      </View>
    </View>
  );
}

export default memo(YearRouteChart);

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: GUTTER,
    marginTop: STEP.s3 + STEP.s1,
  },
  sectionHead: {
    marginBottom: STEP.s2,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
  },
  card: {
    borderWidth: 1,
    borderRadius: SHAPE.card,
    padding: STEP.s3,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  desc: {
    marginTop: STEP.s1,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statCol: {
    alignItems: "center",
    gap: 4,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
  divider: {
    width: 1,
    height: 32,
  },
});
