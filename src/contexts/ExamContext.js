import { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { getProfile } from "../supabase/profiles";
import { updateExamConfig as syncExamConfig } from "../supabase/profiles";

const ExamContext = createContext(null);

const STORAGE_KEY = "@exam_config";
const SLIDES_KEY = "@has_seen_onboarding";

export function ExamProvider({ children }) {
  const { session } = useAuth();
  const [examType, setExamType] = useState(null);
  const [field, setField] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [targetRanking, setTargetRanking] = useState(null);
  const [targetDepartment, setTargetDepartment] = useState(null);
  const [dailyGoalSet, setDailyGoalSet] = useState(false);
  const [hasSeenSlides, setHasSeenSlides] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const dbLoaded = useRef(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(SLIDES_KEY),
    ]).then(([raw, seenRaw]) => {
      if (raw) {
        try {
          const d = JSON.parse(raw);
          setExamType(d.examType);
          setField(d.field || null);
          setExamDate(d.examDate ? new Date(d.examDate) : null);
          setTargetRanking(d.targetRanking || null);
          setTargetDepartment(d.targetDepartment || null);
          if (d.dailyGoalSet || d.targetRanking) setDailyGoalSet(true);
        } catch {}
      }
      setHasSeenSlides(seenRaw === "true");
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      if (!session && !loading) {
        dbLoaded.current = false;
        setExamType(null);
        setField(null);
        setExamDate(null);
        setTargetRanking(null);
        setTargetDepartment(null);
        setDailyGoalSet(false);
      }
      return;
    }
    if (dbLoaded.current) return;
    dbLoaded.current = true;
    setDbLoading(true);

    getProfile(session.user.id).then((p) => {
      if (!p?.exam_type) {
        AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
          if (!raw) return;
          try {
            const d = JSON.parse(raw);
            setExamType(d.examType);
            setField(d.field || null);
            setExamDate(d.examDate ? new Date(d.examDate) : null);
            setTargetRanking(d.targetRanking || null);
            setTargetDepartment(d.targetDepartment || null);
          } catch {}
        }).catch(() => {});
        return;
      }
      const config = {
        examType: p.exam_type,
        field: p.field || null,
        examDate: p.exam_date ? new Date(p.exam_date) : null,
        targetRanking: p.target_ranking || null,
        targetDepartment: p.target_department || null,
        dailyGoalSet: !!p.daily_question_goal || !!p.target_ranking,
      };
      setExamType(config.examType);
      setField(config.field);
      setExamDate(config.examDate);
      setTargetRanking(config.targetRanking);
      setTargetDepartment(config.targetDepartment);
      if (config.dailyGoalSet) setDailyGoalSet(true);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        examType: config.examType,
        field: config.field,
        examDate: config.examDate?.toISOString() || null,
        targetRanking: config.targetRanking,
        targetDepartment: config.targetDepartment,
        dailyGoalSet: config.dailyGoalSet,
      })).catch(() => {});
    }).catch(() => {}).finally(() => setDbLoading(false));
  }, [session]);

  const markSlidesAsSeen = useCallback(() => {
    setHasSeenSlides(true);
    AsyncStorage.setItem(SLIDES_KEY, "true").catch(() => {});
  }, []);

  const updateExamConfig = useCallback(async (type, selectedField, date) => {
    setExamType(type);
    setField(selectedField || null);
    setExamDate(date);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, examType: type, field: selectedField || null, examDate: date?.toISOString() }),
      );
    } catch {}
    if (session?.user?.id && session.user.id) {
      syncExamConfig(session.user.id, {
        examType: type, field: selectedField || null, examDate: date,
        targetRanking, targetDepartment,
      }).catch(() => {});
    }
  }, [session, targetRanking, targetDepartment]);

  const updateGoal = useCallback(async (dailyQuestions) => {
    setDailyGoalSet(true);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, dailyGoalSet: true }),
      );
    } catch {}
    if (session?.user?.id) {
      const { updateProfile: updateProf } = require("../supabase/profiles");
      updateProf(session.user.id, { daily_question_goal: dailyQuestions }).catch(() => {});
    }
  }, [session]);

  const updateRanking = useCallback(async (ranking, department) => {
    setTargetRanking(ranking);
    setTargetDepartment(department || null);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...existing, targetRanking: ranking, targetDepartment: department || null }),
      );
    } catch {}
    if (session?.user?.id) {
      syncExamConfig(session.user.id, {
        examType, field, examDate,
        targetRanking: ranking, targetDepartment: department || null,
      }).catch(() => {});
    }
  }, [session, examType, field, examDate]);

  const onboardingDone = !!examType && dailyGoalSet;

  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const examUTC = Date.UTC(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    return Math.max(0, Math.round((examUTC - todayUTC) / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  const combinedLoading = loading || dbLoading;

  const value = useMemo(() => ({
    examType, field, examDate, targetRanking, targetDepartment,
    daysUntilExam, loading: combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, updateExamConfig, updateGoal, updateRanking, markSlidesAsSeen,
  }), [examType, field, examDate, targetRanking, targetDepartment,
    daysUntilExam, combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, updateExamConfig, updateGoal, updateRanking, markSlidesAsSeen]);

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
