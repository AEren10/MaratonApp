import { useState, useMemo, useCallback } from "react";
import {
  ScrollView, View, Text, Pressable,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, IconBox } from "../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { TRIAL_TYPES, getSubjectsForType, getFieldFromType } from "./trialTypes";
import { SubjectInput } from "./components/SubjectInput";
import { TotalCard } from "./components/TotalCard";
import { TrialTypeSelector } from "./components/TrialTypeSelector";
import { BranchSubjectPicker } from "./components/BranchSubjectPicker";
import { useAppDispatch } from "../../store/hooks";
import { addTrial } from "../../store/slices/trialSlice";
import { useGamification } from "../../hooks/useGamification";
import { XPToast } from "../../components/common/XPToast";
import { BadgeUnlockModal } from "../../components/common/BadgeUnlockModal";
import { useAuth } from "../../contexts/AuthContext";
import { saveTrialOffline } from "../../lib/offlineQueue";

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
  const { reward, xpToast, dismissXP, badgeModal, dismissBadge } = useGamification();

  const [trialType, setTrialType] = useState("TYT");
  const [branchSubject, setBranchSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});

  const subjects = useMemo(
    () => getSubjectsForType(trialType, branchSubject),
    [trialType, branchSubject]
  );

  const handleTypeChange = useCallback((newType) => {
    setTrialType(newType);
    setValues({});
    if (newType !== "BRANCH") setBranchSubject(null);
  }, []);

  const handleBranchChange = useCallback((key) => {
    setBranchSubject(key);
    setValues({});
  }, []);

  const handleChange = useCallback((key) => (v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const totalNet = useMemo(() => {
    return subjects.reduce((sum, s) => {
      const val = values[s.key] || EMPTY;
      const d = parseInt(val.correct, 10) || 0;
      const y = parseInt(val.wrong, 10) || 0;
      return sum + d - y * 0.25;
    }, 0).toFixed(2);
  }, [values, subjects]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    if (trialType === "BRANCH" && !branchSubject) {
      Alert.alert("Ders sec", "Branş denemesi için bir ders seçmelisin.");
      return;
    }

    const subjectsMap = {};
    const subjectsArr = [];
    let hasAny = false;
    subjects.forEach((s) => {
      const val = values[s.key] || EMPTY;
      const c = parseInt(val.correct, 10) || 0;
      const w = parseInt(val.wrong, 10) || 0;
      if (c || w) hasAny = true;
      subjectsMap[s.key] = { correct: c, wrong: w, net: c - w * 0.25 };
      subjectsArr.push({ subject: s.key, correct_count: c, wrong_count: w, empty_count: 0 });
    });
    if (!hasAny) {
      Alert.alert("Bos deneme", "En az bir ders icin deger gir.");
      return;
    }

    const netVal = parseFloat(totalNet);
    const typeMeta = TRIAL_TYPES[trialType];
    const trialName = trialType === "BRANCH"
      ? `${subjects[0]?.name || "Branş"} Branş`
      : typeMeta.label;

    const localTrial = {
      id: Date.now().toString(),
      date: today(),
      totalNet: netVal,
      subjects: subjectsMap,
      trialType,
      field: getFieldFromType(trialType),
      branchSubject,
    };
    dispatch(addTrial(localTrial));

    setSaving(true);
    const result = await saveTrialOffline(
      {
        user_id: user.id,
        name: trialName,
        trial_date: new Date().toISOString().split("T")[0],
        exam_type: trialType,
        field: getFieldFromType(trialType),
        branch_subject: branchSubject,
        total_net: netVal,
      },
      subjectsArr
    );
    setSaving(false);

    reward("trial_entry", {
      statUpdates: [
        { type: "increment", key: "totalTrials" },
        { type: "max", key: "maxNet", value: netVal },
      ],
    });
    Alert.alert(
      result.queued ? "Çevrimdışı kaydedildi" : "Kaydedildi",
      result.queued
        ? "Deneme sonucun internet geldiğinde sunucuya gönderilecek."
        : "Deneme sonucun basariyla kaydedildi."
    );
    navigation.goBack();
  }, [saving, trialType, branchSubject, subjects, values, totalNet, user, dispatch, reward, navigation]);

  const showSubjectInputs = trialType !== "BRANCH" || branchSubject;

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

          <TrialTypeSelector value={trialType} onChange={handleTypeChange} />

          {trialType === "BRANCH" && (
            <BranchSubjectPicker value={branchSubject} onChange={handleBranchChange} />
          )}

          {showSubjectInputs && subjects.map((s) => (
            <SubjectInput
              key={s.key}
              subject={s}
              values={values[s.key] || EMPTY}
              onChange={handleChange(s.key)}
            />
          ))}

          {showSubjectInputs && <TotalCard totalNet={totalNet} />}

          {showSubjectInputs && (
            <Pressable
              onPress={handleSave}
              style={[styles.submitBtn, saving && { opacity: 0.6 }]}
              disabled={saving}
            >
              <Icon name="check" size={20} color={C.bg} />
              <Text style={styles.submitText}>{saving ? "Kaydediliyor..." : "Kaydet"}</Text>
            </Pressable>
          )}
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
