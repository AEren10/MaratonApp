import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { TrialHistoryItem } from "./TrialHistoryItem";

export function AnalysisTrialHistory({ C, history = [], totalCount = 0, onSelectTrial, onSeeAll }) {
  const defaultItems = [
    { id: "t1", type: "TYT", date: "23 Haziran 2026", net: 58.25, trend: 2.3, latest: true, mood: "İYİ" },
    { id: "t2", type: "AYT SAY", date: "16 Haziran 2026", net: 55.95, trend: -1.4, latest: false, mood: "ZOR" },
  ];

  const items = history.length > 0
    ? history.slice(0, 2).map((t, i) => ({
        id: t.id,
        type: t.trialType || "TYT",
        date: t.date || "",
        net: t.net || 0,
        trend: t.trend || 0,
        latest: i === 0,
        mood: (t.trend || 0) >= 0 ? "İYİ" : "ZOR",
        trial: t,
      }))
    : defaultItems;

  const countText = `${totalCount || 24} kayıt`;
  const btnSubtitle = `${totalCount || 24} deneme · yayın ve tarihe göre süz`;

  return (
    <View style={s.wrap}>
      <View style={s.headerRow}>
        <Text style={[s.sectionLabel, { color: C.accentBright }]}>DENEME KAYITLARI</Text>
        <Text style={[s.countLabel, { color: C.text3 }]}>{countText}</Text>
      </View>

      <View style={s.list}>
        {items.map((item) => (
          <TrialHistoryItem
            key={item.id}
            C={C}
            item={item}
            onPress={() => onSelectTrial(item.trial || item)}
          />
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tüm deneme kayıtları"
        onPress={onSeeAll}
        style={({ pressed }) => [
          s.seeAllBtn,
          { backgroundColor: pressed ? C.elev : C.surface, borderColor: C.accent },
        ]}
      >
        <View style={s.btnTextWrap}>
          <Text style={[s.btnTitle, { color: C.text }]}>Tüm deneme kayıtları</Text>
          <Text style={[s.btnSub, { color: C.text3 }]}>{btnSubtitle}</Text>
        </View>
        <Icon name="chevR" size={16} color={C.accent} sw={2.2} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, paddingTop: 28 },
  headerRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 6 },
  sectionLabel: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.84 },
  countLabel: { fontFamily: "Archivo_500", fontSize: 11.5, fontVariant: ["tabular-nums"] },
  list: { marginTop: 4 },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 14,
  },
  btnTextWrap: { flex: 1 },
  btnTitle: { fontFamily: "Archivo_700", fontSize: 14 },
  btnSub: { fontFamily: "Archivo_500", fontSize: 11.5, marginTop: 3 },
});