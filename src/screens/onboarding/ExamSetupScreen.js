import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, IconBox } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

function buildCategoryOptions(C) {
  return [
    { id: "lgs", label: "LGS", desc: "Liselere Geçiş Sınavı (8. Sınıf)", icon: "shield", color: C.green },
    { id: "yks", label: "YKS", desc: "Yükseköğretim Kurumları Sınavı", icon: "target", color: C.amber },
  ];
}

function buildYKSOptions(C) {
  return [
    { id: "tyt", examType: "tyt", field: null, label: "Sadece TYT", desc: "Temel Yeterlilik Testi", icon: "target", color: C.amber },
    { id: "ayt_say", examType: "tyt_ayt", field: "sayisal", label: "TYT + AYT Sayısal", desc: "Mühendislik, Tıp, Fen", icon: "hash", color: C.green },
    { id: "ayt_ea", examType: "tyt_ayt", field: "ea", label: "TYT + AYT Eşit Ağırlık", desc: "Hukuk, İşletme, Psikoloji", icon: "layers", color: C.blue },
    { id: "ayt_soz", examType: "tyt_ayt", field: "sozel", label: "TYT + AYT Sözel", desc: "Edebiyat, Tarih, İlahiyat", icon: "bookOpen", color: C.purple },
    { id: "dil", examType: "dil", field: "dil", label: "YKS Dil", desc: "Yabancı Dil Testi", icon: "globe", color: "#46C7B0" },
  ];
}

function buildExamMonthOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const beforeExamThisYear = now.getMonth() < 5 || (now.getMonth() === 5 && now.getDate() < 20);
  const startYear = beforeExamThisYear ? currentYear : currentYear + 1;
  return [
    `Haziran ${startYear}`,
    `Haziran ${startYear + 1}`,
    `Haziran ${startYear + 2}`,
  ];
}

const MONTHS = buildExamMonthOptions();

function ExamOption({ item, selected, onPress, C }) {
  const active = selected === item.id;
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[styles.optionCard, { backgroundColor: C.surface, borderColor: active ? item.color : C.border }]}
    >
      <IconBox icon={item.icon} color={item.color} size={44} rounded={14} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: active ? C.text : C.sec }]}>{item.label}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>{item.desc}</Text>
      </View>
      <View style={[styles.radio, { borderColor: active ? item.color : C.border }]}>
        {active && <View style={[styles.radioInner, { backgroundColor: item.color }]} />}
      </View>
    </Pressable>
  );
}

export default function ExamSetupScreen() {
  const C = useC();
  const navigation = useNavigation();
  const CATEGORIES = useMemo(() => buildCategoryOptions(C), [C]);
  const YKS_OPTIONS = useMemo(() => buildYKSOptions(C), [C]);
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: C.amber }]} />
          <View style={[styles.stepDot, { backgroundColor: C.border }]} />
        </View>

        <View style={styles.hero}>
          <IconBox icon="shield" color={C.amber} size={56} rounded={18} />
          <Text style={[styles.heroTitle, { color: C.text }]}>Sınav Bilgilerin</Text>
          <Text style={[styles.heroDesc, { color: C.sec }]}>
            Sana özel çalışma planı oluşturabilmemiz için sınav türünü ve tarihini seç.
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
          SINAV KATEGORİSİ
        </Text>

        {CATEGORIES.map((opt) => (
          <ExamOption key={opt.id} item={opt} selected={category} onPress={handleCategorySelect} C={C} />
        ))}

        {category === "yks" && (
          <>
            <Text style={[TYPOGRAPHY.label, { color: C.muted, marginTop: SPACING.xl, marginBottom: SPACING.md }]}>
              ALAN SEÇİMİ
            </Text>
            {YKS_OPTIONS.map((opt) => (
              <ExamOption key={opt.id} item={opt} selected={selectedId} onPress={(id) => { H.select(); setSelectedId(id); }} C={C} />
            ))}
          </>
        )}

        {category && (
          <>
            <Text style={[TYPOGRAPHY.label, { color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md }]}>
              SINAV TARİHİ
            </Text>
            <View style={styles.dateRow}>
              {MONTHS.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setExamDate(m)}
                  style={[styles.dateChip, { backgroundColor: C.surface, borderColor: examDate === m ? C.amber : C.border },
                    examDate === m && { backgroundColor: C.amber + "10" }]}
                >
                  <Icon name="calendar" size={14} color={examDate === m ? C.amber : C.muted} />
                  <Text style={[TYPOGRAPHY.captionMedium, { color: examDate === m ? C.text : C.sec }]}>
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        onPress={finish}
        style={[styles.continueBtn, { backgroundColor: C.amber, ...SHADOWS.amber }, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
      >
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>Devam Et</Text>
        <Icon name="arrowR" size={18} color={C.bg} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 30 },
  stepRow: {
    flexDirection: "row", justifyContent: "center", gap: 8,
    paddingVertical: SPACING.lg,
  },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  hero: { alignItems: "center", paddingVertical: SPACING.xl },
  heroTitle: {
    fontFamily: "SpaceGrotesk_700Bold", fontSize: 24,
    letterSpacing: -0.5, marginTop: SPACING.lg,
  },
  heroDesc: {
    ...TYPOGRAPHY.body, textAlign: "center",
    marginTop: SPACING.sm, maxWidth: 300, lineHeight: 22,
  },
  optionCard: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1.5,
  },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  dateRow: { flexDirection: "row", gap: SPACING.md },
  dateChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: RADIUS.xl, paddingVertical: SPACING.lg,
    borderWidth: 1.5,
  },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, paddingVertical: SPACING.lg,
  },
});
