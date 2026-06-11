import { useState, useMemo, useCallback } from "react";
import {
  ScrollView, View, Text, Pressable,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { SUBJECTS } from "./trialSubjects";
import { SubjectInput } from "./components/SubjectInput";
import { TotalCard } from "./components/TotalCard";
import { useAppDispatch } from "../../store/hooks";
import { addTrial } from "../../store/slices/trialSlice";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { addTrial as supabaseAddTrial } from "../../supabase/trials";

const EMPTY = { correct: "", wrong: "" };

const today = () => {
  const d = new Date();
  return d.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
};

export default function TrialEntryScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { examType } = useExam();
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(
    Object.fromEntries(SUBJECTS.map((s) => [s.key, { ...EMPTY }]))
  );

  const handleChange = useCallback((key) => (v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const totalNet = useMemo(() => {
    return SUBJECTS.reduce((sum, s) => {
      const d = parseInt(values[s.key].correct, 10) || 0;
      const y = parseInt(values[s.key].wrong, 10) || 0;
      return sum + d - y * 0.25;
    }, 0).toFixed(2);
  }, [values]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12}>
            <Icon name="x" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Deneme Gir</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dateRow}>
            <IconBox icon="calendar" color={C.amber} size={34} rounded={10} />
            <Text style={styles.dateText}>{today()}</Text>
          </View>

          {SUBJECTS.map((s) => (
            <SubjectInput
              key={s.key}
              subject={s}
              values={values[s.key]}
              onChange={handleChange(s.key)}
            />
          ))}

          <TotalCard totalNet={totalNet} />

          <Pressable onPress={async () => {
            if (saving) return;
            const subjects = {};
            const subjectsArr = [];
            let hasAny = false;
            SUBJECTS.forEach((s) => {
              const c = parseInt(values[s.key].correct, 10) || 0;
              const w = parseInt(values[s.key].wrong, 10) || 0;
              if (c || w) hasAny = true;
              subjects[s.key] = { correct: c, wrong: w, net: c - w * 0.25 };
              subjectsArr.push({ subject: s.key, correct_count: c, wrong_count: w, empty_count: 0 });
            });
            if (!hasAny) { Alert.alert("Bos deneme", "En az bir ders icin deger gir."); return; }

            const netVal = parseFloat(totalNet);
            const localTrial = { id: Date.now().toString(), date: today(), totalNet: netVal, subjects };
            dispatch(addTrial(localTrial));

            try {
              setSaving(true);
              await supabaseAddTrial(
                { user_id: user.id, name: `Deneme ${today()}`, trial_date: new Date().toISOString().split("T")[0], exam_type: (examType || "TYT").toUpperCase(), total_net: netVal },
                subjectsArr
              );
            } catch (e) {
              console.warn("Supabase trial save failed:", e.message);
            } finally {
              setSaving(false);
            }

            reward("trial_entry", {
              statUpdates: [
                { type: "increment", key: "totalTrials" },
                { type: "max", key: "maxNet", value: netVal },
              ],
            });
            Alert.alert("Kaydedildi", "Deneme sonucun basariyla kaydedildi.");
            navigation.goBack();
          }} style={[styles.submitBtn, saving && { opacity: 0.6 }]} disabled={saving}>
            <Icon name="check" size={20} color={C.bg} />
            <Text style={styles.submitText}>Kaydet</Text>
          </Pressable>
        </ScrollView>
        <XPToast amount={xpToast.amount} visible={xpToast.visible} onDone={dismissXP} />
        <BadgeUnlockModal badge={badgeModal.badge} visible={badgeModal.visible} onClose={dismissBadge} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 60,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dateText: {
    ...TYPOGRAPHY.bodyMedium,
    color: C.sec,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: C.amber,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    ...SHADOWS.amber,
  },
  submitText: {
    ...TYPOGRAPHY.button,
    color: C.bg,
  },
};
