import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon, IconBox } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";

function buildExamOptions(C) {
  return [
    { id: "lgs", examType: "lgs", field: null, label: "LGS", desc: "Liselere Geçiş Sınavı (8. Sınıf)", icon: "shield", color: C.green },
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
  const beforeExamThisYear = now.getMonth() < 5; // before June
  const startYear = beforeExamThisYear ? currentYear : currentYear + 1;
  return [
    `Haziran ${startYear}`,
    `Haziran ${startYear + 1}`,
    `Haziran ${startYear + 2}`,
  ];
}

const MONTHS = buildExamMonthOptions();

function ExamOption({ item, selected, onPress, styles, C }) {
  const active = selected === item.id;
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[styles.optionCard, active && { borderColor: item.color }]}
    >
      <IconBox icon={item.icon} color={item.color} size={44} rounded={14} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: active ? C.text : C.sec }]}>{item.label}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 2 }]}>{item.desc}</Text>
      </View>
      <View style={[styles.radio, active && { borderColor: item.color }]}>
        {active && <View style={[styles.radioInner, { backgroundColor: item.color }]} />}
      </View>
    </Pressable>
  );
}

export default function ExamSetupScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const EXAM_OPTIONS = useMemo(() => buildExamOptions(C), [C]);
  const { updateExamConfig } = useExam();
  const [selectedId, setSelectedId] = useState(null);
  const [examDate, setExamDate] = useState(MONTHS[0]);

  const canContinue = selectedId !== null;

  const finish = useCallback(() => {
    const opt = EXAM_OPTIONS.find((o) => o.id === selectedId);
    if (!opt) {
      Alert.alert("Hata", "Lütfen sınav türünü seç");
      return;
    }
    const match = examDate.match(/(\d{4})/);
    const year = match ? parseInt(match[1], 10) : new Date().getFullYear() + 1;
    const date = new Date(year, 5, 15);
    try {
      updateExamConfig(opt.examType, opt.field, date).catch(() => {});
    } catch (e) {
      Alert.alert("Hata", e.message);
    }
  }, [selectedId, examDate, updateExamConfig, EXAM_OPTIONS]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <IconBox icon="shield" color={C.amber} size={56} rounded={18} />
          <Text style={styles.heroTitle}>Sinav Bilgilerin</Text>
          <Text style={styles.heroDesc}>
            Sana ozel calisma plani olusturabilmemiz icin sinav turunu ve tarihini sec.
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
          SINAV TURU
        </Text>

        {EXAM_OPTIONS.map((opt) => (
          <ExamOption key={opt.id} item={opt} selected={selectedId} onPress={setSelectedId} styles={styles} C={C} />
        ))}

        <Text style={[TYPOGRAPHY.label, { color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md }]}>
          SINAV TARIHI
        </Text>

        <View style={styles.dateRow}>
          {MONTHS.map((m) => (
            <Pressable
              key={m}
              onPress={() => setExamDate(m)}
              style={[styles.dateChip, examDate === m && styles.dateActive]}
            >
              <Icon name="calendar" size={14} color={examDate === m ? C.amber : C.muted} />
              <Text style={[
                TYPOGRAPHY.captionMedium,
                { color: examDate === m ? C.text : C.sec },
              ]}>
                {m}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Pressable
        onPress={finish}
        style={[styles.continueBtn, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
      >
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>Devam Et</Text>
        <Icon name="arrowR" size={18} color={C.bg} />
      </Pressable>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 30 },
    hero: {
      alignItems: "center", paddingVertical: SPACING.xxxl,
    },
    heroTitle: {
      ...TYPOGRAPHY.heading, color: C.text, marginTop: SPACING.lg,
    },
    heroDesc: {
      ...TYPOGRAPHY.body, color: C.sec, textAlign: "center",
      marginTop: SPACING.sm, maxWidth: 300, lineHeight: 22,
    },
    optionCard: {
      flexDirection: "row", alignItems: "center", gap: SPACING.md,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, marginBottom: SPACING.md,
      borderWidth: 1.5, borderColor: C.border,
    },
    radio: {
      width: 22, height: 22, borderRadius: 11,
      borderWidth: 2, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    dateRow: { flexDirection: "row", gap: SPACING.md },
    dateChip: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      paddingVertical: SPACING.lg, borderWidth: 1.5, borderColor: C.border,
    },
    dateActive: { borderColor: C.amber, backgroundColor: C.amber + "10" },
    continueBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
      backgroundColor: C.amber, borderRadius: RADIUS.xl,
      marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, paddingVertical: SPACING.lg,
      ...SHADOWS.amber,
    },
  });
}
