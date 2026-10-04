import { useState, useCallback, useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Icon, Button, Press } from "../../components/design";
import { ExamOption } from "./components/ExamOption";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, NAV_ICON, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { useExamSetupPrefill } from "../../hooks/useExamSetupPrefill";
import { SCREENS } from "../../constants/screens";
import { SetupRouteSteps } from "../../components/route/SetupRouteSteps";
import * as H from "../../lib/haptics";
import { buildCategoryOptions, buildYKSOptions, MONTHS } from "./constants/examSetupOptions";

export default function ExamSetupScreen() {
  const C = useC();
  const navigation = useNavigation();
  // Ayarlar > Sinav turu: duzenleme modu (kurulum cizgisi yok, kaydedince geri doner).
  const editing = Boolean(useRoute().params?.edit);
  const CATEGORIES = useMemo(() => buildCategoryOptions(), []);
  const YKS_OPTIONS = useMemo(() => buildYKSOptions(), []);
  const { updateExamConfig } = useExam();

  const [category, setCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [examDate, setExamDate] = useState(MONTHS[0]);

  useExamSetupPrefill({
    options: YKS_OPTIONS,
    months: MONTHS,
    setCategory,
    setSelectedId,
    setExamDate,
  });

  const isLGS = category === "lgs";
  const canContinue = isLGS ? category !== null : selectedId !== null;

  const finish = useCallback(() => {
    const match = examDate.match(/(\d{4})/);
    const year = match ? parseInt(match[1], 10) : new Date().getFullYear() + 1;
    const date = new Date(year, 5, 15);
    if (isLGS) {
      updateExamConfig("lgs", null, date).catch(() => {});
    } else {
      const opt = YKS_OPTIONS.find((o) => o.id === selectedId);
      if (!opt) return;
      updateExamConfig(opt.examType, opt.field, date).catch(() => {});
    }
    H.success();
    if (editing) navigation.goBack();
    else navigation.navigate(SCREENS.GOAL_SETUP);
  }, [category, selectedId, examDate, isLGS, updateExamConfig, YKS_OPTIONS, navigation, editing]);

  const handleCategorySelect = useCallback((id) => {
    H.select();
    setCategory(id);
    setSelectedId(null);
  }, []);

  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        {canGoBack ? (
          <Press haptic="none" onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" style={styles.backBtn}>
            <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
          </Press>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>Sınav Seçimi</Text>
        <View style={styles.backBtn} />
      </View>

      {editing ? null : <SetupRouteSteps current={1} />}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[TYPOGRAPHY.heading, styles.title, { color: C.text }]}>Hangi sınava hazırlanıyorsun?</Text>

        <View style={styles.optionsCol}>
          {CATEGORIES.map((opt) => (
            <ExamOption key={opt.id} item={opt} selected={category} onPress={handleCategorySelect} C={C} />
          ))}
        </View>

        {category === "yks" && (
          <View style={styles.yksCol}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ALAN SEÇİMİ</Text>
            {YKS_OPTIONS.map((opt) => (
              <ExamOption key={opt.id} item={opt} selected={selectedId} onPress={(id) => { H.select(); setSelectedId(id); }} C={C} />
            ))}
          </View>
        )}

        {category && (
          <View style={styles.dateCol}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SINAV TARİHİ</Text>
            <View style={styles.dateRow}>
              {MONTHS.map((m) => (
                <Press
                  haptic="none"
                  key={m}
                  onPress={() => setExamDate(m)}
                  style={[styles.dateChip, { backgroundColor: C.surface, borderColor: examDate === m ? C.accent : C.border }]}
                >
                  <Icon name="calendar" size={14} color={examDate === m ? C.accent : C.text3} />
                  <Text style={[TYPOGRAPHY.captionMedium, { color: examDate === m ? C.text : C.text2 }]}>{m}</Text>
                </Press>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.cta}>
        <Button onPress={finish} iconRight="arrowR" size="lg" fullWidth disabled={!canContinue}>
          Devam
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: GUTTER, paddingVertical: STEP.s1, minHeight: CONTROL.tapMin },
  backBtn: { width: CONTROL.tapMin, minHeight: CONTROL.tapMin, justifyContent: "center" },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s2, paddingBottom: 30 },
  title: { fontSize: 24, maxWidth: 300, marginTop: STEP.s2 },
  optionsCol: { gap: STEP.s1, marginTop: STEP.s3 },
  yksCol: { gap: STEP.s1, marginTop: STEP.s3 },
  dateCol: { marginTop: STEP.s4 },
  dateRow: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s2 },
  dateChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: SHAPE.card, paddingVertical: STEP.s2, borderWidth: 1, minHeight: CONTROL.tapMin,
  },
  cta: { paddingHorizontal: GUTTER, paddingBottom: STEP.s3, paddingTop: STEP.s1 },
});
