import { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, IconBox } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";

const RANKINGS = [
  { id: "1k", label: "İlk 1.000", desc: "Tıp, en üst mühendislik", icon: "flame", tier: "elite" },
  { id: "5k", label: "İlk 5.000", desc: "Popüler mühendislik, hukuk", icon: "target", tier: "high" },
  { id: "10k", label: "İlk 10.000", desc: "Güçlü bölümler", icon: "chart", tier: "high" },
  { id: "25k", label: "İlk 25.000", desc: "Rekabetçi bölümler", icon: "hash", tier: "mid" },
  { id: "50k", label: "İlk 50.000", desc: "Orta-üst bölümler", icon: "layers", tier: "mid" },
  { id: "100k", label: "İlk 100.000", desc: "Geniş seçenek aralığı", icon: "bookOpen", tier: "base" },
  { id: "100k+", label: "100.000+", desc: "Yerleşmek istiyorum", icon: "shield", tier: "base" },
];

function tierColor(tier, C) {
  if (tier === "elite") return C.amber;
  if (tier === "high") return C.green;
  if (tier === "mid") return C.blue;
  return C.purple;
}

function RankOption({ item, selected, onPress, C }) {
  const active = selected === item.id;
  const color = tierColor(item.tier, C);
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      style={[styles.optionCard, { backgroundColor: C.surface, borderColor: active ? color : C.border }]}
    >
      <IconBox icon={item.icon} color={color} size={40} rounded={12} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: active ? C.text : C.sec }]}>{item.label}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginTop: 1 }]}>{item.desc}</Text>
      </View>
      <View style={[styles.radio, { borderColor: active ? color : C.border }]}>
        {active && <View style={[styles.radioInner, { backgroundColor: color }]} />}
      </View>
    </Pressable>
  );
}

export default function GoalSetupScreen() {
  const C = useC();
  const navigation = useNavigation();
  const { updateGoal } = useExam();
  const [selectedRanking, setSelectedRanking] = useState(null);
  const [department, setDepartment] = useState("");

  const canContinue = selectedRanking !== null;

  const finish = useCallback(() => {
    if (!selectedRanking) return;
    updateGoal(selectedRanking, department.trim() || null).catch(() => {});
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
  }, [selectedRanking, department, updateGoal, navigation]);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: C.border }]} />
          <View style={[styles.stepDot, { backgroundColor: C.amber }]} />
        </View>

        <View style={styles.hero}>
          <IconBox icon="target" color={C.green} size={56} rounded={18} />
          <Text style={[styles.heroTitle, { color: C.text }]}>Hedefini Belirle</Text>
          <Text style={[styles.heroDesc, { color: C.sec }]}>
            Sana özel çalışma planı ve günlük hedefler için sıralama hedefini seç.
          </Text>
        </View>

        <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.md }]}>
          HEDEF SIRALAMA
        </Text>

        {RANKINGS.map((r) => (
          <RankOption key={r.id} item={r} selected={selectedRanking} onPress={setSelectedRanking} C={C} />
        ))}

        <Text style={[TYPOGRAPHY.label, { color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md }]}>
          HEDEF BÖLÜM (İSTEĞE BAĞLI)
        </Text>

        <TextInput
          value={department}
          onChangeText={setDepartment}
          placeholder="Örn: Bilgisayar Mühendisliği"
          placeholderTextColor={C.muted}
          style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
        />
      </ScrollView>

      <Pressable
        onPress={finish}
        style={[styles.continueBtn, { backgroundColor: C.amber, ...SHADOWS.amber }, !canContinue && { opacity: 0.4 }]}
        disabled={!canContinue}
      >
        <Text style={[TYPOGRAPHY.button, { color: C.bg }]}>Başlayalım</Text>
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
    borderRadius: RADIUS.xl, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1.5,
  },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },
  input: {
    borderWidth: 1.5, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    ...TYPOGRAPHY.body, fontSize: 15,
  },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm,
    borderRadius: RADIUS.xl,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, paddingVertical: SPACING.lg,
  },
});
