import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Button } from "../../components/design";
import { ExamOption } from "./components/ExamOption";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

function buildCategoryOptions() {
  return [
    { id: "lgs", label: "LGS", desc: "Liselere Geçiş Sınavı (8. Sınıf)" },
    { id: "yks", label: "YKS", desc: "Yükseköğretim Kurumları Sınavı" },
  ];
}

function buildYKSOptions() {
  return [
    { id: "tyt", examType: "tyt", field: null, label: "Sadece TYT", desc: "Temel Yeterlilik Testi" },
    { id: "ayt_say", examType: "tyt_ayt", field: "sayisal", label: "TYT + AYT Sayısal", desc: "Mühendislik, Tıp, Fen" },
    { id: "ayt_ea", examType: "tyt_ayt", field: "ea", label: "TYT + AYT Eşit Ağırlık", desc: "Hukuk, İşletme, Psikoloji" },
    { id: "ayt_soz", examType: "tyt_ayt", field: "sozel", label: "TYT + AYT Sözel", desc: "Edebiyat, Tarih, İlahiyat" },
    { id: "dil", examType: "dil", field: "dil", label: "YKS Dil", desc: "Yabancı Dil Testi" },
  ];
}

function buildExamMonthOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const beforeExamThisYear = now.getMonth() < 5 || (now.getMonth() === 5 && now.getDate() < 20);
  const startYear = beforeExamThisYear ? currentYear : currentYear + 1;
  return [`Haziran ${startYear}`, `Haziran ${startYear + 1}`, `Haziran ${startYear + 2}`];
}

const MONTHS = buildExamMonthOptions();

export default function ExamSetupScreen() {
  const C = useC();
  const navigation = useNavigation();
  const CATEGORIES = useMemo(() => buildCategoryOptions(), []);
  const YKS_OPTIONS = useMemo(() => buildYKSOptions(), []);
  const { updateExamConfig } = useExam();

  const [category, setCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [examDate, setExamDate] = useState(MONTHS[0]);

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
    navigation.navigate(SCREENS.GOAL_SETUP);
  }, [category, selectedId, examDate, isLGS, updateExamConfig, YKS_OPTIONS, navigation]);

  const handleCategorySelect = useCallback((id) => {
    H.select();
    setCategory(id);
    setSelectedId(null);
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.progressRow}>
        <View style={[styles.segment, { backgroundColor: C.accent }]} />
        <View style={[styles.segment, { backgroundColor: C.track }]} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: C.text }]}>Hangi sınava hazırlanıyorsun?</Text>

        <View style={{ gap: STEP.s1, marginTop: STEP.s3 }}>
          {CATEGORIES.map((opt) => (
            <ExamOption key={opt.id} item={opt} selected={category} onPress={handleCategorySelect} C={C} />
          ))}
        </View>

        {category === "yks" && (
          <View style={{ gap: STEP.s1, marginTop: STEP.s3 }}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ALAN SEÇİMİ</Text>
            {YKS_OPTIONS.map((opt) => (
              <ExamOption key={opt.id} item={opt} selected={selectedId} onPress={(id) => { H.select(); setSelectedId(id); }} C={C} />
            ))}
          </View>
        )}

        {category && (
          <View style={{ marginTop: STEP.s4 }}>
            <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SINAV TARİHİ</Text>
            <View style={styles.dateRow}>
              {MONTHS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setExamDate(m)}
                  style={[styles.dateChip, { backgroundColor: C.surface, borderColor: examDate === m ? C.accent : C.elev }]}
                >
                  <Icon name="calendar" size={14} color={examDate === m ? C.accent : C.text3} />
                  <Text style={[TYPOGRAPHY.captionMedium, { color: examDate === m ? C.text : C.text2 }]}>{m}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: GUTTER, paddingBottom: STEP.s3 }}>
        <Button onPress={finish} iconRight="arrowR" size="lg" fullWidth disabled={!canContinue}>
          Devam
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: 30 },
  progressRow: { flexDirection: "row", gap: STEP.s1, paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  segment: { flex: 1, height: 3, borderRadius: 1.5 },
  title: { ...TYPOGRAPHY.heading, fontSize: 28, maxWidth: 280 },
  dateRow: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s2 },
  dateChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: SHAPE.card, paddingVertical: STEP.s2, borderWidth: 1, minHeight: 44,
  },
});
