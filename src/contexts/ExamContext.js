import { createContext, useContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExamContext = createContext(null);

const STORAGE_KEY = "@exam_config";

export function ExamProvider({ children }) {
  const [examType, setExamType] = useState(null);
  const [field, setField] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        const data = JSON.parse(raw);
        setExamType(data.examType);
        setField(data.field || null);
        setExamDate(data.examDate ? new Date(data.examDate) : null);
      }
      setLoading(false);
    });
  }, []);

  const updateExamConfig = useCallback(async (type, selectedField, date) => {
    setExamType(type);
    setField(selectedField || null);
    setExamDate(date);
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ examType: type, field: selectedField || null, examDate: date?.toISOString() })
    );
  }, []);

  const onboardingDone = !!examType;

  const daysUntilExam = examDate
    ? Math.max(0, Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const value = {
    examType,
    field,
    examDate,
    daysUntilExam,
    loading,
    onboardingDone,
    updateExamConfig,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
