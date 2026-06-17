import { createContext, useContext, useCallback, useEffect, useState, useRef } from "react";
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
  const [hasSeenSlides, setHasSeenSlides] = useState(false);
  const [loading, setLoading] = useState(true);
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
        } catch {}
      }
      setHasSeenSlides(seenRaw === "true");
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!session?.user?.id || session.user.id === "dev") {
      if (!session) {
        setExamType(null);
        setField(null);
        setExamDate(null);
        setTargetRanking(null);
        setTargetDepartment(null);
      }
      return;
    }
    if (dbLoaded.current) return;
    dbLoaded.current = true;

    getProfile(session.user.id).then((p) => {
      if (!p?.exam_type) return;
      const config = {
        examType: p.exam_type,
        field: p.field || null,
        examDate: p.exam_date ? new Date(p.exam_date) : null,
        targetRanking: p.target_ranking || null,
        targetDepartment: p.target_department || null,
      };
      setExamType(config.examType);
      setField(config.field);
      setExamDate(config.examDate);
      setTargetRanking(config.targetRanking);
      setTargetDepartment(config.targetDepartment);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        examType: config.examType,
        field: config.field,
        examDate: config.examDate?.toISOString() || null,
        targetRanking: config.targetRanking,
        targetDepartment: config.targetDepartment,
      })).catch(() => {});
    }).catch(() => {});
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
    if (session?.user?.id && session.user.id !== "dev") {
      syncExamConfig(session.user.id, {
        examType: type, field: selectedField || null, examDate: date,
        targetRanking, targetDepartment,
      }).catch(() => {});
    }
  }, [session, targetRanking, targetDepartment]);

  const updateGoal = useCallback(async (ranking, department) => {
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
    if (session?.user?.id && session.user.id !== "dev") {
      syncExamConfig(session.user.id, {
        examType, field, examDate,
        targetRanking: ranking, targetDepartment: department || null,
      }).catch(() => {});
    }
  }, [session, examType, field, examDate]);

  const onboardingDone = !!examType && !!targetRanking;

  const daysUntilExam = examDate
    ? (() => {
        const now = new Date();
        const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
        const examUTC = Date.UTC(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
        return Math.max(0, Math.round((examUTC - todayUTC) / (1000 * 60 * 60 * 24)));
      })()
    : null;

  const value = {
    examType, field, examDate, targetRanking, targetDepartment,
    daysUntilExam, loading, onboardingDone, hasSeenSlides,
    updateExamConfig, updateGoal, markSlidesAsSeen,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
