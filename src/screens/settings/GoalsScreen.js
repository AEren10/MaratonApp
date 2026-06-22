import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { Icon, IconBox, GlassCard } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { selectGoals, setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "../../supabase/profiles";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

function GoalInput({ icon, color, label, hint, value, onChange, suffix, styles }) {
  return (
    <GlassCard radius={RADIUS.xl} style={styles.card}>
      <View style={styles.row}>
        <IconBox icon={icon} color={color} size={36} rounded={10} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            value={String(value)}
            onChangeText={(t) => onChange(parseInt(t.replace(/[^0-9]/g, ""), 10) || 0)}
            keyboardType="number-pad"
            style={styles.input}
            maxLength={5}
          />
          <Text style={styles.suffix}>{suffix}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default function GoalsScreen() {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const goals = useSelector(selectGoals);
  const { user } = useAuth();
  const showAlert = useAlert();

  const [draft, setDraft] = useState({
    dailyQuestions: goals.dailyQuestions,
    weeklyTrials: goals.weeklyTrials,
    weeklyMinutes: goals.weeklyMinutes,
  });

  useEffect(() => {
    setDraft({
      dailyQuestions: goals.dailyQuestions,
      weeklyTrials: goals.weeklyTrials,
      weeklyMinutes: goals.weeklyMinutes,
    });
  }, [goals.dailyQuestions, goals.weeklyTrials, goals.weeklyMinutes]);

  const save = useCallback(async () => {
    dispatch(setGoals(draft));
    saveGoalsToStorage(draft);
    // Cihazlar arası senkron: profili güncelle (migration 008 sütunu).
    if (user?.id && user.id !== "dev") {
      try {
        await updateProfile(user.id, { daily_question_goal: draft.dailyQuestions });
      } catch (_) {}
    }
    H.success();
    showAlert("Kaydedildi", "Hedeflerin güncellendi.");
    navigation.goBack();
  }, [draft, dispatch, navigation, user?.id]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={styles.title}>Hedeflerim</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          Hedef belirlemek odaklanmanı artırır. İstediğin zaman değiştirebilirsin.
        </Text>

        <GoalInput
          icon="target"
          color={C.accent}
          label="Günlük Soru Hedefi"
          hint="Her gün çözmen gereken soru sayısı"
          value={draft.dailyQuestions}
          onChange={(v) => setDraft((d) => ({ ...d, dailyQuestions: v }))}
          suffix="soru"
          styles={styles}
        />

        <View style={styles.chipRow}>
          {[50, 100, 150, 200].map((n) => {
            const active = draft.dailyQuestions === n;
            return (
              <Pressable
                key={n}
                onPress={() => setDraft((d) => ({ ...d, dailyQuestions: n }))}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{n}</Text>
              </Pressable>
            );
          })}
        </View>

        <GoalInput
          icon="chart"
          color={C.teal}
          label="Haftalık Deneme Hedefi"
          hint="Her hafta girmen gereken deneme sayısı"
          value={draft.weeklyTrials}
          onChange={(v) => setDraft((d) => ({ ...d, weeklyTrials: v }))}
          suffix="adet"
          styles={styles}
        />

        <GoalInput
          icon="clock"
          color={C.blue}
          label="Haftalık Çalışma Süresi"
          hint="Toplam çalışma süresi (dakika)"
          value={draft.weeklyMinutes}
          onChange={(v) => setDraft((d) => ({ ...d, weeklyMinutes: v }))}
          suffix="dk"
          styles={styles}
        />

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
        >
          <Icon name="check" size={20} color={C.bg} />
          <Text style={styles.saveText}>Kaydet</Text>
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    title: { ...TYPOGRAPHY.subheading, color: C.text },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
    subtitle: {
      ...TYPOGRAPHY.caption,
      color: C.muted,
      marginBottom: SPACING.lg,
    },
    card: {
      padding: SPACING.md,
      marginBottom: SPACING.md,
    },
    row: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
    label: { ...TYPOGRAPHY.bodySemiBold, color: C.text },
    hint: { ...TYPOGRAPHY.caption, color: C.muted, marginTop: 2 },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: C.surface2,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: C.border,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    input: {
      ...TYPOGRAPHY.bodySemiBold,
      color: C.text,
      minWidth: 40,
      textAlign: "right",
    },
    suffix: { ...TYPOGRAPHY.caption, color: C.muted },
    chipRow: {
      flexDirection: "row",
      gap: SPACING.sm,
      marginTop: -SPACING.xs,
      marginBottom: SPACING.md,
    },
    chip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: SPACING.sm,
      backgroundColor: C.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: C.border,
    },
    chipActive: {
      backgroundColor: C.accent + "20",
      borderColor: C.accent,
    },
    chipText: { ...TYPOGRAPHY.bodySemiBold, color: C.sec },
    chipTextActive: { color: C.accent },
    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      backgroundColor: C.accent,
      borderRadius: RADIUS.xl,
      paddingVertical: SPACING.lg,
      marginTop: SPACING.lg,
      ...SHADOWS.accent,
    },
    saveText: { ...TYPOGRAPHY.button, color: C.bg },
  });
}
