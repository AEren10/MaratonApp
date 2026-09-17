import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { GUTTER, SHAPE } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon } from "../../components/design";
import { SubjectProgressBanner } from "./components/SubjectProgressBanner";
import { SubjectProgressRow } from "./components/SubjectProgressRow";
import { SubjectProgressLockCard } from "./components/SubjectProgressLockCard";

const TABS = [
  { key: "PRIORITY", label: "Öncelikli" },
  { key: "PROGRESS", label: "Sürüyor" },
  { key: "CLOSED", label: "Kapandı" },
];

export default function SubjectListScreen() {
  const C = useC();
  const navigation = useNavigation();
  const [tab, setTab] = useState("PRIORITY");

  const topics = useMemo(() => [
    { key: "1", name: "Permütasyon - Kombinasyon", color: C.subjects?.matematik || "#E0A570", badge: "defter 5", badgeColor: C.warn, pct: "75%", barColor: C.accent, meta: "son çalışma 11 gün önce · 2 durak geride" },
    { key: "2", name: "Basınç ve Kaldırma Kuvveti", color: C.subjects?.fizik || "#6ECFC0", badge: "defter 3", badgeColor: C.warn, pct: "40%", barColor: C.accent, meta: "son çalışma 14 gün önce · 1 durak geride" },
    { key: "3", name: "Nükleik Asitler", color: C.subjects?.biyoloji || "#86CE92", badge: "defter 3", badgeColor: C.warn, pct: "35%", barColor: C.accent, meta: "son çalışma 9 gün önce · 1 durak geride" },
    { key: "4", name: "Paragraf - Ana Düşünce", color: C.subjects?.turkce || "#74A9E8", badge: "defter 2", badgeColor: C.warn, pct: "38%", barColor: C.accent, meta: "son çalışma 6 gün önce · rotada" },
    { key: "5", name: "Mol Kavramı", color: C.subjects?.kimya || "#E8A0C4", badge: "defter 1", badgeColor: C.warn, pct: "30%", barColor: C.accent, meta: "son çalışma 12 gün önce · rotada" },
    { key: "6", name: "İlk Çağ Uygarlıkları", color: C.subjects?.tarih || "#C9BE6A", badge: "defter 1", badgeColor: C.warn, pct: "25%", barColor: C.accent, meta: "son çalışma 17 gün önce · rotada" },
  ], [C]);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>Konu ilerlemesi</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Segment Tabs */}
        <View style={s.tabsWrap}>
          <View style={[s.tabsContainer, { backgroundColor: C.surface, borderColor: C.elev }]}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[s.tabItem, active && { backgroundColor: C.elev }]}
                >
                  <Text style={[s.tabText, { color: active ? C.text : C.text3 }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <SubjectProgressBanner
          C={C}
          onAddToRoute={() => navigation.navigate(SCREENS.ADD_TASK)}
        />

        <View style={s.listWrap}>
          <Text style={[s.sectionLabel, { color: C.text2 }]}>ROTA ÖNCELİĞİ</Text>
          <View style={s.list}>
            {topics.map((item) => (
              <SubjectProgressRow
                key={item.key}
                C={C}
                item={item}
                onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { topic: { name: item.name } })}
              />
            ))}
          </View>

          <SubjectProgressLockCard
            C={C}
            onPress={() => navigation.navigate(SCREENS.PRO_PREVIEW)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  title: { fontFamily: "Bricolage_400", fontSize: 22 },
  scroll: { paddingBottom: 50 },
  tabsWrap: { paddingHorizontal: GUTTER, paddingTop: 16 },
  tabsContainer: { flexDirection: "row", gap: 4, padding: 4, borderRadius: SHAPE.chip, borderWidth: 1 },
  tabItem: { flex: 1, height: 36, borderRadius: SHAPE.chip, alignItems: "center", justifyContent: "center" },
  tabText: { fontFamily: "Archivo_700", fontSize: 12.5 },
  listWrap: { paddingHorizontal: GUTTER, paddingTop: 30 },
  sectionLabel: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.84 },
  list: { marginTop: 6 },
});