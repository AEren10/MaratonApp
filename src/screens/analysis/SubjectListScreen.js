import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTrials } from "../../store/slices/trialSlice";
import { getAllSubjects } from "../../domain/trial/trialTypes";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { SCREENS } from "../../constants/screens";
import { Icon, EmptyState } from "../../components/design";
import { SubjectListCard } from "./components/SubjectListCard";

function filterTrials(trials, filter) {
  if (!filter || filter === "ALL") return trials.filter((t) => t.trialType !== "BRANCH");
  if (filter === "AYT") return trials.filter((t) => t.trialType?.startsWith("AYT"));
  return trials.filter((t) => t.trialType === filter);
}

function buildItems(allSubjects, trials, filter, accent) {
  const filtered = filterTrials(trials, filter);
  return allSubjects
    .map((sub) => {
      const trialsWithSub = filtered.filter((t) => t.subjects?.[sub.key]);
      if (!trialsWithSub.length) return null;
      const sorted = [...trialsWithSub].sort((a, b) => new Date(b.date) - new Date(a.date));
      const history = trialsWithSub.map((t) => t.subjects[sub.key]);
      const net = sorted[0].subjects[sub.key]?.net ?? 0;
      const totalC = history.reduce((s, h) => s + (h.correct || 0), 0);
      const totalW = history.reduce((s, h) => s + (h.wrong || 0), 0);
      const avgNet = history.reduce((s, h) => s + (h.net || 0), 0) / history.length;
      const accuracy = totalC + totalW > 0 ? Math.round((totalC / (totalC + totalW)) * 100) : 0;
      const trend = sorted.slice(0, 5).reverse().map((t) => t.subjects[sub.key]?.net ?? 0);
      const prevNet = sorted[1]?.subjects[sub.key]?.net;
      // Onceki kayit yoksa delta 0 DEGIL null: "0,0" degisim olmadigini
      // soyler, oysa karsilastirilacak bir onceki deneme hic yok.
      const delta = prevNet == null ? null : net - prevNet;
      const lo = Math.min(...trend);
      const hi = Math.max(...trend);
      return {
        key: sub.key,
        name: sub.name,
        color: sub.color || accent,
        net,
        max: sub.max || 40,
        avgNet,
        accuracy,
        trialCount: history.length,
        trend,
        delta,
        lo,
        hi,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.net - a.net);
}

export default function SubjectListScreen() {
  const C = useC();
  const navigation = useNavigation();
  const route = useRoute();
  const filter = route.params?.filter || "ALL";
  const trials = useSelector(selectTrials);
  const allSubjects = useMemo(() => getAllSubjects(C), [C]);

  const items = useMemo(
    () => buildItems(allSubjects, trials, filter, C.accent),
    [allSubjects, trials, filter, C.accent]
  );

  const renderItem = useCallback(
    ({ item, index }) => (
      <SubjectListCard
        item={item}
        index={index}
        C={C}
        onPress={() =>
          navigation.navigate(SCREENS.SUBJECT_DETAIL, {
            subjectKey: item.key,
            subjectName: item.name,
          })
        }
      />
    ),
    [C, navigation]
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.header, { borderBottomColor: C.border }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, marginLeft: STEP.s2 }]}>
          Ders Analizi
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState title="Bu filtre için deneme verisi yok." />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: STEP.s5 * 2 },
});
