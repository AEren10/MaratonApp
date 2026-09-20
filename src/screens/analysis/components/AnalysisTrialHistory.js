import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { GUTTER } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { TrialHistoryItem } from "./TrialHistoryItem";
import { PendingSection } from "../../../components/common/PendingSection";

export function AnalysisTrialHistory({ C, history = [], totalCount = 0, onSelectTrial, onSeeAll }) {
  // Deneme yoksa UYDURMA: burada bir zamanlar "TYT 23 Haziran 58,25" ve
  // "24 kayit" sabit yaziyordu, yeni acilan hesap bunlari kendi verisi
  // saniyordu. Deneme gecmisi olmayan birine gosterilecek gercek bir sey yok.
  if (!history.length) {
    return (
      <PendingSection
        label="DENEME KAYITLARI"
        title="Henüz deneme girmedin"
        note="İlk denemeni girdiğinde net değişimin burada görünmeye başlar."
      />
    );
  }

  const items = history.slice(0, 2).map((t, i) => ({
    id: t.id,
    type: t.trialType || "TYT",
    date: t.date || "",
    net: t.net || 0,
    trend: t.trend || 0,
    latest: i === 0,
    mood: (t.trend || 0) >= 0 ? "İYİ" : "ZOR",
    trial: t,
  }));

  const count = totalCount || history.length;
  const countText = `${count} kayıt`;
  const btnSubtitle = `${count} deneme · yayın ve tarihe göre süz`;

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