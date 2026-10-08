import { useCallback, useEffect, useMemo, useState } from "react";
import { useRoute } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { usePremium } from "../../contexts/PremiumContext";
import { useAlert } from "../../contexts/AlertContext";
import { useFormLifecycleAnalytics } from "../../hooks/useFormLifecycleAnalytics";
import { useGamification } from "../../hooks/useGamification";
import { buildTrialSubjectScores } from "../../domain/trial/trialEntryModel";
import { getSubjectsForType, officialDurationForTrialType } from "../../domain/trial/trialTypes";
import { wrongPenaltyForTrialType } from "../../domain/trial/trialModel";
import {
  MAX_PUBLISHER_NAME_LENGTH,
  normalizePublisherSelection,
  publisherLabel as resolvePublisherLabel,
} from "../../domain/trial/publisherSelection";
import { useAppDispatch } from "../../store/hooks";
import { getRecentDays } from "./trialEntryDates";
import { submitTrialEntry } from "./trialEntrySubmit";
import * as H from "../../lib/haptics";
import { getTrialPublishers } from "../../supabase/productAccess";
import {
  loadTrialEntryDraft,
  saveTrialEntryDraft,
  clearTrialEntryDraft,
} from "../../lib/trialEntryDraft";

export function useTrialEntryForm({ C, navigation }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { reward, xpToast, dismissXP } = useGamification();
  const { examType: userExamType } = useExam();
  const showAlert = useAlert();
  const { checkFeature, showPaywall, bumpUsage, accessLoading, accessError } = usePremium();
  const accessReady = !accessLoading && !accessError;
  // Rotanin deneme onerisinden gelindiyse tur ve brans hazir gelir.
  const params = useRoute().params || {};
  const [trialType, setTrialType] = useState(
    params.trialType || (userExamType === "lgs" ? "LGS" : "TYT"),
  );
  const [branchSubject, setBranchSubject] = useState(params.branchSubject || null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({});
  const [mood, setMood] = useState(null);
  const [title, setTitle] = useState("");
  const [publishers, setPublishers] = useState([]);
  const [publisherId, setPublisherId] = useState(null);
  const [publisherName, setPublisherName] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("standard");
  const [durationMinutes, setDurationMinutes] = useState(() =>
    String(officialDurationForTrialType(trialType) || ""),
  );
  const [trialDate, setTrialDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const recentDays = useMemo(() => getRecentDays(14), []);
  const [draftReady, setDraftReady] = useState(false);
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
      .then((rows) => {
        if (!cancelled) setPublishers(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadTrialEntryDraft(user?.id)
      .then((draft) => {
        if (cancelled || !draft) {
          setDraftReady(true);
          return;
        }
        if (draft.trialType) setTrialType(draft.trialType);
        if (draft.branchSubject !== undefined) setBranchSubject(draft.branchSubject);
        if (draft.values) setValues(draft.values);
        if (draft.mood !== undefined) setMood(draft.mood);
        if (draft.title) setTitle(draft.title);
        if (draft.publisherId !== undefined || draft.publisherName !== undefined) {
          const restoredPublisher = normalizePublisherSelection(draft);
          setPublisherId(restoredPublisher.publisherId);
          setPublisherName(restoredPublisher.publisherName);
        }
        if (draft.difficultyLevel) setDifficultyLevel(draft.difficultyLevel);
        if (draft.durationMinutes !== undefined)
          setDurationMinutes(String(draft.durationMinutes || ""));
        if (draft.trialDate) setTrialDate(new Date(draft.trialDate));
        setDraftReady(true);
      })
      .catch(() => setDraftReady(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => {
    const { hasAny } = buildTrialSubjectScores(subjects, values, wrongPenalty);
    return hasAny || !!title.trim() || !!mood || !!publisherId || !!publisherName.trim();
  }, [subjects, values, wrongPenalty, title, mood, publisherId, publisherName]);

  useEffect(() => {
    if (!draftReady) return;
    if (!isDirty) return;
    const timeout = setTimeout(() => {
      saveTrialEntryDraft(user?.id, {
        trialType,
        branchSubject,
        values,
        mood,
        title,
        publisherId,
        publisherName,
        difficultyLevel,
        durationMinutes,
        trialDate: trialDate.toISOString(),
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [
    draftReady,
    isDirty,
    user?.id,
    trialType,
    branchSubject,
    values,
    mood,
    title,
    publisherId,
    publisherName,
    difficultyLevel,
    durationMinutes,
    trialDate,
  ]);

  const clearDraft = useCallback(() => clearTrialEntryDraft(user?.id), [user?.id]);

  const totalNet = useMemo(() => {
    const { subjectsArr } = buildTrialSubjectScores(subjects, values, wrongPenalty);
    return subjectsArr
      .reduce((sum, subject) => sum + subject.correct_count - subject.wrong_count * wrongPenalty, 0)
      .toFixed(2);
  }, [subjects, values, wrongPenalty]);

  const handleTypeChange = useCallback(
    (newType) => {
      H.select();
      markFormDirty({ field: "trial_type", trialType: newType });
      setTrialType(newType);
      setValues({});
      setDurationMinutes(String(officialDurationForTrialType(newType) || ""));
      if (newType !== "BRANCH") setBranchSubject(null);
    },
    [markFormDirty],
  );

  const handleBranchChange = useCallback(
    (key) => {
      H.select();
      markFormDirty({ branchSubject: key, field: "branch_subject" });
      setBranchSubject(key);
      setValues({});
    },
    [markFormDirty],
  );

  const handleScoreChange = useCallback(
    (key) => (value) => {
      markFormDirty({ field: "subject_score", subject: key });
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [markFormDirty],
  );

  const handleDateChange = useCallback(
    (date) => {
      H.tap();
      markFormDirty({ field: "trial_date" });
      setTrialDate(date);
      setShowDatePicker(false);
    },
    [markFormDirty],
  );

  const handleTitleChange = useCallback(
    (value) => {
      markFormDirty({ field: "title" });
      setTitle(value);
    },
    [markFormDirty],
  );

  const handleDurationChange = useCallback(
    (value) => {
      markFormDirty({ field: "duration_minutes" });
      setDurationMinutes(value.replace(/\D/g, "").slice(0, 3));
    },
    [markFormDirty],
  );

  const handleMoodChange = useCallback(
    (value) => {
      markFormDirty({ field: "mood" });
      setMood(value);
    },
    [markFormDirty],
  );

  const handlePublisherChange = useCallback(
    (value) => {
      markFormDirty({ field: "publisher" });
      setPublisherId(value);
      setPublisherName("");
    },
    [markFormDirty],
  );

  const handlePublisherNameChange = useCallback(
    (value) => {
      markFormDirty({ field: "publisher_name" });
      const next = value.slice(0, MAX_PUBLISHER_NAME_LENGTH);
      setPublisherName(next);
      if (next.trim()) setPublisherId(null);
    },
    [markFormDirty],
  );

  const publisherLabel = useMemo(
    () =>
      resolvePublisherLabel({
        publisherId,
        publisherName,
        publishers,
      }),
    [publisherId, publisherName, publishers],
  );

  const handleSave = useCallback(async () => {
    if (saving) return;
    await submitTrialEntry({
      C,
      branchSubject,
      checkFeature,
      accessReady,
      bumpUsage,
      completeForm,
      dispatch,
      difficultyLevel,
      durationMinutes,
      mood,
      navigation,
      onSaved: clearDraft,
      reward,
      publisherId,
      publisherName,
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
    accessReady,
    bumpUsage,
    completeForm,
    dispatch,
    difficultyLevel,
    durationMinutes,
    mood,
    navigation,
    publisherId,
    publisherName,
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
    clearDraft,
  ]);

  return {
    branchSubject,
    clearDraft,
    dismissXP,
    isDirty,
    handleBranchChange,
    handleDateChange,
    handleMoodChange,
    handleSave,
    handleScoreChange,
    handleTitleChange,
    handleTypeChange,
    mood,
    durationMinutes,
    difficultyLevel,
    handleDifficultyChange: setDifficultyLevel,
    handleDurationChange,
    handlePublisherChange,
    handlePublisherNameChange,
    publisherId,
    publisherLabel,
    publisherName,
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
