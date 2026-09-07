import { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getProfile } from "../supabase/profiles";
import { updateExamConfig as syncExamConfig } from "../supabase/profiles";
import { clearRouteWeeks } from "../supabase/routePlan";
import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

const ExamContext = createContext(null);

const STORAGE_KEY = STORAGE_KEYS.EXAM_CONFIG;
const SLIDES_KEY = STORAGE_KEYS.HAS_SEEN_ONBOARDING;

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
      appStorage.getJson(STORAGE_KEY, null),
      appStorage.getString(SLIDES_KEY),
    ]).then(([d, seenRaw]) => {
      if (d) {
        setExamType(d.examType);
        setField(d.field || null);
        setExamDate(d.examDate ? new Date(d.examDate) : null);
        setTargetRanking(d.targetRanking || null);
        setTargetDepartment(d.targetDepartment || null);
        if (d.dailyGoalSet || d.targetRanking) setDailyGoalSet(true);
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

    // Çıkış→giriş yarışı: A'nın profili logout'tan sonra resolve olursa
    // B'nin sınav tipi/hedef sıralaması A'nınkiyle eziliyor ve diske yazılıyor.
    // Effect session değişince yeniden çalıştığı için cleanup bunu keser.
    let cancelled = false;

    getProfile(session.user.id).then((p) => {
      if (cancelled) return;
      if (!p?.exam_type) {
        appStorage.getJson(STORAGE_KEY, null).then((d) => {
          if (cancelled || !d) return;
          setExamType(d.examType);
          setField(d.field || null);
          setExamDate(d.examDate ? new Date(d.examDate) : null);
          setTargetRanking(d.targetRanking || null);
          setTargetDepartment(d.targetDepartment || null);
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
      appStorage.setJson(STORAGE_KEY, {
        examType: config.examType,
        field: config.field,
        examDate: config.examDate?.toISOString() || null,
        targetRanking: config.targetRanking,
        targetDepartment: config.targetDepartment,
        dailyGoalSet: config.dailyGoalSet,
      }).catch(() => {});
    }).catch(() => {}).finally(() => { if (!cancelled) setDbLoading(false); });

    return () => { cancelled = true; };
  }, [session]);

  const markSlidesAsSeen = useCallback(() => {
    setHasSeenSlides(true);
    appStorage.setString(SLIDES_KEY, "true").catch(() => {});
  }, []);

  const updateExamConfig = useCallback(async (type, selectedField, date) => {
    const changedExam = !!examType && !!type && examType !== type;
    setExamType(type);
    setField(selectedField || null);
    setExamDate(date);

    // Sınav tipi DEĞİŞTİYSE eski rotayı temizle. YKS'den LGS'ye geçen bir
    // kullanıcının rota haftaları başka bir müfredata ait; borç hesabı ve
    // "Plan vs Gerçek" yanlış konularla dolar. Sessizce durmasındansa silinsin.
    if (changedExam && session?.user?.id) {
      clearRouteWeeks(session.user.id, { exceptExamType: type }).catch(() => {});
    }
    try {
      const existing = await appStorage.getJson(STORAGE_KEY, {});
      await appStorage.setJson(
        STORAGE_KEY,
        { ...existing, examType: type, field: selectedField || null, examDate: date?.toISOString() },
      );
    } catch {}
    if (session?.user?.id && session.user.id) {
      syncExamConfig(session.user.id, {
        examType: type, field: selectedField || null, examDate: date,
        targetRanking, targetDepartment,
      }).catch(() => {});
    }
  }, [session, targetRanking, targetDepartment, examType]);

  const updateGoal = useCallback(async (dailyQuestions) => {
    setDailyGoalSet(true);
    try {
      const existing = await appStorage.getJson(STORAGE_KEY, {});
      await appStorage.setJson(
        STORAGE_KEY,
        { ...existing, dailyGoalSet: true },
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
      const existing = await appStorage.getJson(STORAGE_KEY, {});
      await appStorage.setJson(
        STORAGE_KEY,
        { ...existing, targetRanking: ranking, targetDepartment: department || null },
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
