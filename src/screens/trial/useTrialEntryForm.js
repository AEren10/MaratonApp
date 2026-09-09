import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import { useFormLifecycleAnalytics } from "../../hooks/useFormLifecycleAnalytics";
import { useGamification } from "../../hooks/useGamification";
import { buildTrialSubjectScores } from "../../domain/trial/trialEntryModel";
import { getSubjectsForType } from "../../domain/trial/trialTypes";
import { wrongPenaltyForTrialType } from "../../domain/trial/trialModel";
import { useAppDispatch } from "../../store/hooks";
import { getRecentDays } from "./trialEntryDates";
import { submitTrialEntry } from "./trialEntrySubmit";
import * as H from "../../lib/haptics";
import { getTrialPublishers } from "../../supabase/productAccess";

export function useTrialEntryForm({ C, navigation }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP } = useGamification();
  const { examType: userExamType } = useExam();
  const showAlert = useAlert();
  const { checkFeature, showPaywall, bumpUsage } = usePremium();
  const [trialType, setTrialType] = useState(userExamType === "lgs" ? "LGS" : "TYT");
  const [branchSubject, setBranchSubject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [mood, setMood] = useState(null);
  const [title, setTitle] = useState("");
  const [publishers, setPublishers] = useState([]);
  const [publisherId, setPublisherId] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState("standard");
  const [trialDate, setTrialDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const recentDays = useMemo(() => getRecentDays(14), []);
  const { completeForm, markFormDirty } = useFormLifecycleAnalytics("trial_entry", {
    trialType,
    branchSubject,
  });

  const subjects = useMemo(
    () => getSubjectsForType(C, trialType, branchSubject),
    [C, branchSubject, trialType],
  );
  const wrongPenalty = useMemo(() => wrongPenaltyForTrialType(trialType), [trialType]);
  const showSubjectInputs = trialType !== "BRANCH" || branchSubject;

  useEffect(() => {
    let cancelled = false;
    getTrialPublishers()
      .then((rows) => { if (!cancelled) setPublishers(rows); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const totalNet = useMemo(() => {
    const { subjectsArr } = buildTrialSubjectScores(subjects, values, wrongPenalty);
    return subjectsArr
      .reduce((sum, subject) => sum + subject.correct_count - subject.wrong_count * wrongPenalty, 0)
      .toFixed(2);
  }, [subjects, values, wrongPenalty]);

  const handleTypeChange = useCallback((newType) => {
    H.select();
    markFormDirty({ field: "trial_type", trialType: newType });
    setTrialType(newType);
    setValues({});
    if (newType !== "BRANCH") setBranchSubject(null);
  }, [markFormDirty]);

  const handleBranchChange = useCallback((key) => {
    H.select();
    markFormDirty({ branchSubject: key, field: "branch_subject" });
    setBranchSubject(key);
    setValues({});
  }, [markFormDirty]);

  const handleScoreChange = useCallback((key) => (value) => {
    markFormDirty({ field: "subject_score", subject: key });
    setValues((prev) => ({ ...prev, [key]: value }));
  }, [markFormDirty]);

  const handleDateChange = useCallback((date) => {
    H.tap();
    markFormDirty({ field: "trial_date" });
    setTrialDate(date);
    setShowDatePicker(false);
  }, [markFormDirty]);

  const handleTitleChange = useCallback((value) => {
    markFormDirty({ field: "title" });
    setTitle(value);
  }, [markFormDirty]);

  const handleMoodChange = useCallback((value) => {
    markFormDirty({ field: "mood" });
    setMood(value);
  }, [markFormDirty]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    await submitTrialEntry({
      C,
      branchSubject,
      checkFeature,
      bumpUsage,
      completeForm,
      dispatch,
      difficultyLevel,
      mood,
      navigation,
      reward,
      publisherId,
      setSaving,
      showAlert,
      showPaywall,
      subjects,
      title,
      totalNet,
      trialDate,
      trialType,
      user,
      values,
      wrongPenalty,
    });
  }, [
    C,
    branchSubject,
    checkFeature,
    bumpUsage,
    completeForm,
    dispatch,
    difficultyLevel,
    mood,
    navigation,
    publisherId,
    reward,
    saving,
    showAlert,
    showPaywall,
    subjects,
    title,
    totalNet,
    trialDate,
    trialType,
    user,
    values,
    wrongPenalty,
  ]);

  return {
    branchSubject,
    dismissXP,
    handleBranchChange,
    handleDateChange,
    handleMoodChange,
    handleSave,
    handleScoreChange,
    handleTitleChange,
    handleTypeChange,
    mood,
    difficultyLevel,
    handleDifficultyChange: setDifficultyLevel,
    handlePublisherChange: setPublisherId,
    publisherId,
    publishers,
    recentDays,
    saving,
    setShowDatePicker,
    showDatePicker,
    showSubjectInputs,
    subjects,
    title,
    totalNet,
    trialDate,
    trialType,
    values,
    wrongPenalty,
    xpToast,
  };
}
