import { createContext, useContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

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
    if (!session) {
      setExamType(null);
      setField(null);
      setExamDate(null);
      setTargetRanking(null);
      setTargetDepartment(null);
    }
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
  }, []);

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
  }, []);

  const onboardingDone = !!examType && !!targetRanking;

  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24)))
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
