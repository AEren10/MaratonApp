import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useC } from "../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP } from "../../themes/tokens";
import { SCREENS } from "../../constants/screens";
import { Icon } from "../../components/design";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonCard";
import { useSubjectProgressList, SUBJECT_PROGRESS_TAB } from "../../hooks/useSubjectProgressList";
import { SubjectProgressBanner } from "./components/SubjectProgressBanner";
import { SubjectProgressRow } from "./components/SubjectProgressRow";
import { SubjectProgressLockCard } from "./components/SubjectProgressLockCard";
import { PREMIUM_ENABLED } from "../../constants/premium";

const TABS = [
  { key: SUBJECT_PROGRESS_TAB.PRIORITY, label: "Öncelikli", section: "ROTA ÖNCELİĞİ", empty: "Öncelik verecek bir konu yok." },
  { key: SUBJECT_PROGRESS_TAB.PROGRESS, label: "Sürüyor", section: "BU HAFTA VE SONRAKİ", empty: "Şu an sürmekte olan durak yok." },
  { key: SUBJECT_PROGRESS_TAB.CLOSED, label: "Kapandı", section: "KAPANAN KONULAR", empty: "Henüz kapanan konu yok." },
];

export default function SubjectListScreen() {
  const C = useC();
  const navigation = useNavigation();
  const [tab, setTab] = useState(SUBJECT_PROGRESS_TAB.PRIORITY);
  const { items, loading, isEmpty } = useSubjectProgressList(tab);
  const active = TABS.find((t) => t.key === tab) || TABS[0];
  const solved = items.reduce((sum, item) => sum + item.totalQuestions, 0);

  return (
    <SafeAreaView edges={["top"]} style={[s.safe, { backgroundColor: C.bg }]}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>Konu ilerlemesi</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.tabsWrap}>
          <View style={[s.tabsContainer, { backgroundColor: C.surface, borderColor: C.elev }]}>
            {TABS.map((t) => {
              const on = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  style={[s.tabItem, on && { backgroundColor: C.elev }]}
                >
                  <Text style={[s.tabText, { color: on ? C.text : C.text3 }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {!loading && items.length > 0 && tab === SUBJECT_PROGRESS_TAB.PRIORITY ? (
          <SubjectProgressBanner
            C={C}
            topicCount={items.length}
            solvedCount={solved}
            onAddToRoute={() => navigation.navigate(SCREENS.ADD_TASK)}
          />
        ) : null}

        <View style={s.listWrap}>
          <Text style={[s.sectionLabel, { color: C.text2 }]}>{active.section}</Text>

          {loading ? (
            <View style={s.skeletons}>
              <SkeletonCard height={52} />
              <SkeletonCard height={52} />
              <SkeletonCard height={52} />
            </View>
          ) : isEmpty ? (
            <EmptyState icon="target" title={active.empty} message="Çalıştıkça ve rotan ilerledikçe konular burada toplanır." />
          ) : (
            <View style={s.list}>
              {items.map((item) => (
                <SubjectProgressRow
                  key={item.key}
                  C={C}
                  item={item}
                  onPress={() => navigation.navigate(SCREENS.TOPIC_STUDY, { topic: { name: item.name } })}
                />
              ))}
            </View>
          )}

          {PREMIUM_ENABLED && !loading && !isEmpty ? (
            <SubjectProgressLockCard
              C={C}
              onPress={() => navigation.navigate(SCREENS.PRO_PREVIEW)}
            />
          ) : null}
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
  skeletons: { marginTop: STEP.s2, gap: STEP.s1 },
});
