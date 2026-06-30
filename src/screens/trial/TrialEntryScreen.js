import { useState, useMemo, useCallback } from "react";
import {
  ScrollView, View, Text, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, IconBox, AnimatedPressable, Button } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useExam } from "../../contexts/ExamContext";
import { getTrialTypes, getSubjectsForType, getFieldFromType } from "./trialTypes";
import { SubjectInput } from "./components/SubjectInput";
import { useAlert } from "../../contexts/AlertContext";
import { usePremium } from "../../contexts/PremiumContext";
import { TotalCard } from "./components/TotalCard";
import { TrialTypeSelector } from "./components/TrialTypeSelector";
import { BranchSubjectPicker } from "./components/BranchSubjectPicker";
import { useAppDispatch } from "../../store/hooks";
import { addTrial } from "../../store/slices/trialSlice";
import { useGamification } from "../../hooks/useGamification";
import { XPBoostToast } from "../../components/common/XPBoostToast";
import { useAuth } from "../../contexts/AuthContext";
import { saveTrialOffline } from "../../lib/offlineQueue";
import { trialEntrySchema } from "../../validations/auth";
import { SCREENS } from "../../constants/screens";
import * as H from "../../lib/haptics";

const EMPTY = { correct: "", wrong: "" };

const MOODS = [
  { key: "good", emoji: "😄", label: "İyi" },
  { key: "okay", emoji: "😐", label: "Orta" },
  { key: "bad", emoji: "😞", label: "Kötü" },
];

function MoodSelector({ value, onChange, C, styles }) {
  return (
    <View style={styles.moodWrap}>
      <Text style={styles.moodTitle}>Nasıl hissettin? (opsiyonel)</Text>
      <View style={styles.moodRow}>
        {MOODS.map((m) => {
          const active = value === m.key;
          return (
            <Pressable
              key={m.key}
              accessibilityRole="radio"
              accessibilityLabel={`Ruh hali: ${m.label}`}
              accessibilityState={{ selected: active }}
              onPress={() => { H.select(); onChange(active ? null : m.key); }}
              style={[styles.moodBtn, active && styles.moodBtnActive]}
            >
              <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
              <Text style={[styles.moodLabel, active && { color: C.accent }]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function formatDateLong(d) {
  return d.toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateISO(d) {
  return d.toISOString().split("T")[0];
}

function getRecentDays(count = 7) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(12, 0, 0, 0);
    const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
    days.push({
      date: d,
      iso: formatDateISO(d),
      day: d.getDate(),
      dayName: i === 0 ? "Bugün" : i === 1 ? "Dün" : dayNames[d.getDay()],
    });
  }
  return days;
}

export default function TrialEntryScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { user } = useAuth();
  const { reward, xpToast, dismissXP } = useGamification();
  const { examType: userExamType } = useExam();
  const showAlert = useAlert();
  const { checkFeature, showPaywall, refreshUsage } = usePremium();

  const [trialType, setTrialType] = useState(userExamType === "lgs" ? "LGS" : "TYT");
  const [branchSubject, setBranchSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [mood, setMood] = useState(null);
  const [title, setTitle] = useState("");
  const [trialDate, setTrialDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const recentDays = useMemo(() => getRecentDays(14), []);

  const subjects = useMemo(
    () => getSubjectsForType(C, trialType, branchSubject),
    [C, trialType, branchSubject]
  );

  const handleTypeChange = useCallback((newType) => {
    H.select();
    setTrialType(newType);
    setValues({});
    if (newType !== "BRANCH") setBranchSubject(null);
  }, []);

  const handleBranchChange = useCallback((key) => {
    H.select();
    setBranchSubject(key);
    setValues({});
  }, []);

  const handleChange = useCallback((key) => (v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  }, []);

  const wrongPenalty = trialType === "LGS" ? 1 / 3 : 0.25;

  const totalNet = useMemo(() => {
    return subjects.reduce((sum, s) => {
      const val = values[s.key] || EMPTY;
      const d = parseInt(val.correct, 10) || 0;
      const y = parseInt(val.wrong, 10) || 0;
      return sum + d - y * wrongPenalty;
    }, 0).toFixed(2);
  }, [values, subjects, wrongPenalty]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    if (!checkFeature("unlimited_trials")) {
      H.warn();
      showPaywall();
      return;
    }
    if (trialType === "BRANCH" && !branchSubject) {
      H.warn();
      showAlert("Ders seç", "Branş denemesi için bir ders seçmelisin.");
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
      subjectsMap[s.key] = { correct: c, wrong: w, net: c - w * wrongPenalty };
      subjectsArr.push({ subject: s.key, correct_count: c, wrong_count: w, empty_count: Math.max(0, s.max - c - w) });
    });
    if (!hasAny) {
      H.warn();
      showAlert("Boş deneme", "En az bir ders için değer gir.");
      return;
    }

    const netVal = parseFloat(totalNet);
    const typeMeta = getTrialTypes(C)[trialType];
    const autoName = trialType === "BRANCH"
      ? `${subjects[0]?.name || "Branş"} Branş`
      : typeMeta.label;
    const trialName = title.trim() || autoName;

    const parsed = trialEntrySchema.safeParse({
      name: trialName,
      trial_date: formatDateISO(trialDate),
      exam_type: trialType.toLowerCase(),
      total_net: netVal,
      subjects: subjectsArr,
    });
    if (!parsed.success) {
      H.warn();
      showAlert("Geçersiz veri", parsed.error.issues[0]?.message || "Lütfen verileri kontrol edin.");
      return;
    }

    const localTrial = {
      id: Date.now().toString(),
      date: formatDateISO(trialDate),
      name: trialName,
      totalNet: netVal,
      subjects: subjectsMap,
      trialType,
      field: getFieldFromType(trialType),
      branchSubject,
      mood,
    };
    dispatch(addTrial(localTrial));

    setSaving(true);
    const result = await saveTrialOffline(
      {
        user_id: user.id,
        name: trialName,
        trial_date: formatDateISO(trialDate),
        exam_type: trialType,
        field: getFieldFromType(trialType),
        branch_subject: branchSubject,
        total_net: netVal,
        mood,
      },
      subjectsArr
    );
    setSaving(false);

    if (result.queued) {
      showAlert("Çevrimdışı", "Deneme sonucu bağlantı geldiğinde gönderilecek.");
    }

    reward("trial_entry", {
      statUpdates: [
        { type: "increment", key: "totalTrials" },
        { type: "max", key: "maxNet", value: netVal },
      ],
    });
    H.success();
    if (localTrial) navigation.replace(SCREENS.TRIAL_SUMMARY, { trial: localTrial });
  }, [saving, trialType, branchSubject, subjects, values, totalNet, mood, title, trialDate, user, dispatch, reward, navigation, C, showAlert]);

  const showSubjectInputs = trialType !== "BRANCH" || branchSubject;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button">
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Deneme Gir</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Tarih: ${formatDateLong(trialDate)}`}
            accessibilityHint="Tarih seçiciyi açar veya kapatır"
            onPress={() => setShowDatePicker((p) => !p)}
            style={styles.dateRow}
          >
            <IconBox icon="calendar" color={C.accent} size={34} rounded={10} />
            <Text style={styles.dateText}>{formatDateLong(trialDate)}</Text>
            <Icon name={showDatePicker ? "chevUp" : "chevDown"} size={16} color={C.muted} />
          </Pressable>

          {showDatePicker && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.datePicker}>
              {recentDays.map((d) => {
                const active = formatDateISO(trialDate) === d.iso;
                return (
                  <Pressable
                    key={d.iso}
                    accessibilityRole="radio"
                    accessibilityLabel={`${d.dayName} ${d.day}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => { H.tap(); setTrialDate(d.date); setShowDatePicker(false); }}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: active ? C.accent + "1A" : C.surface,
                        borderColor: active ? C.accent : C.border,
                      },
                    ]}
                  >
                    <Text style={{
                      fontFamily: "Inter_500Medium", fontSize: 11,
                      color: active ? C.accent : C.muted,
                    }}>{d.dayName}</Text>
                    <Text style={{
                      fontFamily: "SpaceGrotesk_700Bold", fontSize: 18,
                      color: active ? C.accent : C.text,
                    }}>{d.day}</Text>
                  </Pressable>
                );
              })}
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(100).duration(420).springify()} style={styles.titleRow}>
            <Icon name="edit" size={16} color={C.muted} />
            <TextInput
              accessibilityLabel="Deneme adı"
              value={title}
              onChangeText={setTitle}
              placeholder="Deneme adı (Özdebir, 3D, Limit...)"
              placeholderTextColor={C.muted}
              style={styles.titleInput}
              maxLength={40}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).duration(420).springify()}>
            <TrialTypeSelector value={trialType} onChange={handleTypeChange} />
          </Animated.View>

          {trialType === "BRANCH" && (
            <BranchSubjectPicker value={branchSubject} onChange={handleBranchChange} />
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(240).duration(420).springify()}>
              {subjects.map((s) => (
                <SubjectInput
                  key={s.key}
                  subject={s}
                  values={values[s.key] || EMPTY}
                  onChange={handleChange(s.key)}
                  wrongPenalty={wrongPenalty}
                />
              ))}
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(310).duration(420).springify()}>
              <TotalCard totalNet={totalNet} />
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(380).duration(420).springify()}>
              <MoodSelector value={mood} onChange={setMood} C={C} styles={styles} />
            </Animated.View>
          )}

          {showSubjectInputs && (
            <Animated.View entering={FadeInDown.delay(450).duration(420).springify()}>
              <Button onPress={handleSave} loading={saving} icon="check" fullWidth>
                {saving ? "Kaydediliyor..." : "Denemeyi Kaydet"}
              </Button>
            </Animated.View>
          )}
        </ScrollView>
        <XPBoostToast amount={xpToast.amount} visible={xpToast.visible} multiplier={xpToast.multiplier} onDismiss={dismissXP} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (C) => ({
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
    flex: 1,
  },
  datePicker: {
    flexDirection: "row",
    gap: 8,
    marginBottom: SPACING.lg,
    flexWrap: "wrap",
  },
  dateChip: {
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 52,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    marginBottom: SPACING.lg,
  },
  titleInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.text,
    paddingVertical: 12,
  },
  moodWrap: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  moodTitle: {
    ...TYPOGRAPHY.captionMedium,
    color: C.sec,
    marginBottom: SPACING.sm,
  },
  moodRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  moodBtn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: SPACING.md,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: C.border,
  },
  moodBtnActive: {
    borderColor: C.accent,
    backgroundColor: C.accent + "18",
  },
  moodLabel: {
    ...TYPOGRAPHY.micro,
    color: C.muted,
  },
});
