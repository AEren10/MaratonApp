import { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, IconBox, GlassCard, AnimatedPressable } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAppDispatch } from "../../store/hooks";
import { selectGoals, setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { updateProfile } from "../../supabase/profiles";
import { useAlert } from "../../contexts/AlertContext";
import { captureError } from "../../lib/errorReporting";
import * as H from "../../lib/haptics";
import { GoalHeroCard } from "./components/GoalHeroCard";

const RANKINGS = [
  { id: "1k", label: "İlk 1.000", icon: "flame", color: "#E8841A" },
  { id: "5k", label: "İlk 5.000", icon: "target", color: "#15A86A" },
  { id: "10k", label: "İlk 10.000", icon: "chart", color: "#15A86A" },
  { id: "25k", label: "İlk 25.000", icon: "hash", color: "#2E7DEB" },
  { id: "50k", label: "İlk 50.000", icon: "layers", color: "#2E7DEB" },
  { id: "100k", label: "İlk 100.000", icon: "bookOpen", color: "#6B4FE0" },
  { id: "100k+", label: "100.000+", icon: "shield", color: "#6B4FE0" },
];

function GoalRow({ icon, color, label, value, onChange, suffix, C }) {
  return (
    <GlassCard radius={RADIUS.xl} style={{ padding: SPACING.md, marginBottom: SPACING.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md }}>
        <IconBox icon={icon} color={color} size={36} rounded={10} />
        <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, flex: 1 }}>{label}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.surface2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs }}>
          <TextInput
            value={String(value)}
            onChangeText={(t) => onChange(parseInt(t.replace(/[^0-9]/g, ""), 10) || 0)}
            keyboardType="number-pad"
            style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text, minWidth: 40, textAlign: "right" }}
            maxLength={5}
          />
          <Text style={{ ...TYPOGRAPHY.caption, color: C.muted }}>{suffix}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export default function GoalsScreen() {
  const C = useC();
  const nav = useNavigation();
  const dispatch = useAppDispatch();
  const goals = useSelector(selectGoals);
  const { user } = useAuth();
  const { targetRanking, targetDepartment, daysUntilExam, updateGoal } = useExam();
  const showAlert = useAlert();
  const [showPicker, setShowPicker] = useState(false);
  const [draft, setDraft] = useState({ dailyQuestions: goals.dailyQuestions, weeklyTrials: goals.weeklyTrials, weeklyMinutes: goals.weeklyMinutes });

  useEffect(() => {
    setDraft({ dailyQuestions: goals.dailyQuestions, weeklyTrials: goals.weeklyTrials, weeklyMinutes: goals.weeklyMinutes });
  }, [goals.dailyQuestions, goals.weeklyTrials, goals.weeklyMinutes]);

  const pickRanking = useCallback((id) => {
    updateGoal(id, targetDepartment);
    H.success();
    setShowPicker(false);
  }, [updateGoal, targetDepartment]);

  const save = useCallback(async () => {
    dispatch(setGoals(draft));
    saveGoalsToStorage(draft);
    if (user?.id && user.id !== "dev") {
      try { await updateProfile(user.id, {
        daily_question_goal: draft.dailyQuestions,
        weekly_trials_goal: draft.weeklyTrials,
        weekly_minutes_goal: draft.weeklyMinutes,
      }); } catch (e) { captureError(e, { context: "goals_sync" }); }
    }
    H.success();
    showAlert("Kaydedildi", "Hedeflerin güncellendi.");
    nav.goBack();
  }, [draft, dispatch, nav, user?.id, showAlert]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md }}>
        <Pressable onPress={() => nav.goBack()} hitSlop={12}><Icon name="arrowL" size={22} color={C.text} /></Pressable>
        <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Hedeflerim</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 60 }}>
        <GoalHeroCard targetRanking={targetRanking} targetDepartment={targetDepartment} daysUntilExam={daysUntilExam} onEdit={() => setShowPicker((p) => !p)} />

        {showPicker && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.label, color: C.muted, marginBottom: SPACING.sm }}>HEDEF SIRALAMA SEÇ</Text>
            {RANKINGS.map((r) => {
              const active = targetRanking === r.id;
              return (
                <Pressable key={r.id} onPress={() => pickRanking(r.id)} style={{ flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, backgroundColor: C.surface, borderColor: active ? r.color : C.border }}>
                  <IconBox icon={r.icon} color={r.color} size={36} rounded={10} />
                  <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: active ? C.text : C.sec, flex: 1 }}>{r.label}</Text>
                  {active && <Icon name="check" size={18} color={r.color} />}
                </Pressable>
              );
            })}
          </Animated.View>
        )}

        <Text style={{ ...TYPOGRAPHY.label, color: C.muted, marginTop: SPACING.xxl, marginBottom: SPACING.md }}>GÜNLÜK & HAFTALIK</Text>

        <GoalRow icon="target" color={C.accent} label="Günlük Soru" value={draft.dailyQuestions} onChange={(v) => setDraft((d) => ({ ...d, dailyQuestions: v }))} suffix="soru" C={C} />
        <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: -SPACING.xs, marginBottom: SPACING.md }}>
          {[50, 100, 150, 200].map((n) => {
            const on = draft.dailyQuestions === n;
            return (
              <Pressable key={n} onPress={() => setDraft((d) => ({ ...d, dailyQuestions: n }))} style={{ flex: 1, alignItems: "center", paddingVertical: SPACING.sm, backgroundColor: on ? C.accent + "20" : C.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: on ? C.accent : C.border }}>
                <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: on ? C.accent : C.sec }}>{n}</Text>
              </Pressable>
            );
          })}
        </View>

        <GoalRow icon="chart" color={C.teal} label="Haftalık Deneme" value={draft.weeklyTrials} onChange={(v) => setDraft((d) => ({ ...d, weeklyTrials: v }))} suffix="adet" C={C} />
        <GoalRow icon="clock" color={C.blue} label="Haftalık Süre" value={draft.weeklyMinutes} onChange={(v) => setDraft((d) => ({ ...d, weeklyMinutes: v }))} suffix="dk" C={C} />

        <AnimatedPressable onPress={save} haptic="medium" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, backgroundColor: C.accent, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.lg, ...SHADOWS.accent }}>
          <Icon name="check" size={20} color={C.bg} />
          <Text style={{ ...TYPOGRAPHY.button, color: C.bg }}>Kaydet</Text>
        </AnimatedPressable>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
