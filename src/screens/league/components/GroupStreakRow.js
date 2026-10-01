import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { getGroupStreak } from "../../../supabase/groups";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { groupStreakLine } from "../../../domain/streak/groupStreakLine";

// GRUP SERISI -- kutusuz serit: etiket, sayi, ne eksik oldugunu soyleyen
// tek cumle (domain/streak/groupStreakLine).
export function GroupStreakRow({ groupId }) {
  const C = useC();
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    setData(null);
    getGroupStreak(groupId).then((d) => { if (alive) setData(d); }).catch(() => {});
    return () => { alive = false; };
  }, [groupId]);
  if (!data) return null;

  return (
    <View style={[s.wrap, { borderBottomColor: C.line }]} accessible accessibilityLabel={`Grup serisi ${data.streak} gün. ${groupStreakLine(data)}`}>
      <View style={s.row}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GRUP SERİSİ</Text>
        <View style={s.count}>
          <Text style={[TYPOGRAPHY.statSmall, { color: data.streak > 0 ? C.text : C.text3 }]}>{data.streak}</Text>
          <Text style={[TYPOGRAPHY.meta, s.unit, { color: C.text3 }]}>gün</Text>
        </View>
      </View>
      <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>{groupStreakLine(data)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: STEP.s2, gap: STEP.s1 / 2, borderBottomWidth: 1, marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  count: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  unit: { paddingBottom: 4 },
});
