import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { useC } from "../../../contexts/ThemeContext";
import { selectLongestStreak, selectStreak } from "../../../store/slices/studyLogSlice";
import { sinceMonthLabel } from "../../../lib/trWords";
import { STEP, SHAPE, TYPOGRAPHY } from "../../../themes/tokens";

// Takvim ve Seri kahramani: aktif seri (kahraman sayi), rekor cipi ve
// serinin basladigi gun. Donma gunu gun bazinda tutulmadigi icin tasarimdaki
// "13 Mayıs donduruldu" cumlesi yazilmaz.
export function StreakHero() {
  const C = useC();
  const streak = useSelector(selectStreak) || 0;
  const record = useSelector(selectLongestStreak) || 0;
  const since = streak >= 2 ? new Date(Date.now() - (streak - 1) * 86400000) : null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.statHero, { color: streak > 0 ? C.accentBright : C.text3 }]} allowFontScaling={false}>
        {streak}
      </Text>
      <View style={s.labelRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text }]}>AKTİF SERİ</Text>
        <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>gün</Text>
      </View>
      {record > 0 ? (
        <View style={[s.chip, { backgroundColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.tableHead, { color: C.text2, letterSpacing: 0 }]}>{`rekor ${record} gün`}</Text>
        </View>
      ) : null}
      {since ? (
        <Text style={[TYPOGRAPHY.caption, s.note, { color: C.text3 }]}>
          {`${sinceMonthLabel(since)} beri her gün en az bir oturum.`}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingTop: STEP.s4 - 8, paddingBottom: STEP.s2 },
  labelRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s2 + 2 },
  chip: { height: 26, justifyContent: "center", paddingHorizontal: STEP.s2, marginTop: STEP.s3 - 4, borderRadius: SHAPE.chip + 3 },
  note: { marginTop: STEP.s4 - 4, maxWidth: 300, textAlign: "center" },
});
