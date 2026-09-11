import { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getProfile, updateProfile as updateProf } from "../supabase/profiles";
import { updateExamConfig as syncExamConfig } from "../supabase/profiles";
import { clearRouteWeeks } from "../supabase/routePlan";
import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

const ExamContext = createContext(null);

const STORAGE_KEY = STORAGE_KEYS.EXAM_CONFIG;
const SLIDES_KEY = STORAGE_KEYS.HAS_SEEN_ONBOARDING;

function coerceNet(value) {
  return value == null ? null : Number(value);
}

/**
 * Bekleyen hedef/baslangic net yazimini sunucuya yeniden dener.
 *
 * updateTargetNet/updateBaselineNet sunucu yazimi basarisiz olunca degeri
 * yerelde tutup `*SyncPending` bayragini kaldiriyordu, ama bu bayragi HICBIR
 * YER OKUMUYORDU: deger cihazda kaliyor, sunucuya hicbir zaman gitmiyordu.
 * Kullanici hedefini kaydettigini saniyor, baska cihazda yok.
 *
 * Yerelde bekleyen deger sunucudakinden YENIdir (kullanici az once girdi),
 * bu yuzden catisma halinde yerel kazanir.
 */
async function retryPendingNetSync(userId, local, isCancelled) {
  const jobs = [
    { flag: "targetNetSyncPending", value: local?.targetNet, column: "target_net", patchKey: "targetNet" },
    { flag: "baselineNetSyncPending", value: local?.baselineNet, column: "baseline_net", patchKey: "baselineNet" },
  ];
  for (const job of jobs) {
    if (!local?.[job.flag] || job.value == null) continue;
    try {
      await updateProf(userId, { [job.column]: job.value });
      if (isCancelled()) return;
      await persistExamConfigPatch({ [job.patchKey]: job.value, [job.flag]: false });
    } catch {
      // Hala basarisiz: bayrak duruyor, sonraki acilista yine denenir.
    }
  }
}

async function persistExamConfigPatch(patch) {
  const existing = await appStorage.getJson(STORAGE_KEY, {});
  await appStorage.setJson(STORAGE_KEY, { ...existing, ...patch });
}

export function ExamProvider({ children }) {
  const { session } = useAuth();
  const [examType, setExamType] = useState(null);
  const [field, setField] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [targetRanking, setTargetRanking] = useState(null);
  const [targetDepartment, setTargetDepartment] = useState(null);
  // Tasarimin onboarding 1. adimi: HEDEF NET (slider 40-120). profiles.target_net.
  const [targetNet, setTargetNet] = useState(null);
  // Rotanin baslangic noktasi (Seviye Testi 3/4). profiles.baseline_net.
  const [baselineNet, setBaselineNet] = useState(null);
  const [dailyGoalSet, setDailyGoalSet] = useState(false);
  const [levelTestDone, setLevelTestDone] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
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
        setTargetNet(d.targetNet ?? null);
        setBaselineNet(d.baselineNet ?? null);
        if (d.dailyGoalSet || d.targetRanking) setDailyGoalSet(true);
        setLevelTestDone(!!d.levelTestDone || d.baselineNet != null);
        setSetupCompleted(!!d.setupCompleted);
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
        setTargetNet(null);
        setBaselineNet(null);
        setDailyGoalSet(false);
        setLevelTestDone(false);
        setSetupCompleted(false);
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

    getProfile(session.user.id).then(async (p) => {
      if (cancelled) return;
      const local = await appStorage.getJson(STORAGE_KEY, {});
      if (!p?.exam_type) {
        if (local && !cancelled) {
          setExamType(local.examType);
          setField(local.field || null);
          setExamDate(local.examDate ? new Date(local.examDate) : null);
          setTargetRanking(local.targetRanking || null);
          setTargetDepartment(local.targetDepartment || null);
          setTargetNet(local.targetNet ?? null);
          setBaselineNet(local.baselineNet ?? null);
          setLevelTestDone(!!local.levelTestDone || local.baselineNet != null);
          setSetupCompleted(!!local.setupCompleted);
        }
        await retryPendingNetSync(session.user.id, local, () => cancelled);
        return;
      }
      // Cozum sirasi: BEKLEYEN yerel yazim > sunucu > yerel yedek.
      //
      // Bekleyen bayragi yoksa sunucu kazanir (baska cihazdaki degisiklik
      // gecerlidir). Bayrak varsa YEREL kazanir: kullanici az once degistirdi,
      // sunucu yazimi basarisiz oldu ve sunucudaki deger eskidir. Onceki hal
      // bayragi hic sormuyordu, bu yuzden sunucu null OLMADIGINDA -- ornegin
      // hedef 60'tan 75'e cekilip yazim basarisiz olduysa -- 75 sessizce
      // 60'a geri doner ve backfill de devreye girmezdi.
      const targetNetValue = local.targetNetSyncPending && local.targetNet != null
        ? Number(local.targetNet)
        : (p.target_net == null ? local.targetNet ?? null : Number(p.target_net));
      const baselineNetValue = local.baselineNetSyncPending && local.baselineNet != null
        ? Number(local.baselineNet)
        : (p.baseline_net == null ? local.baselineNet ?? null : Number(p.baseline_net));
      const config = {
        examType: p.exam_type,
        field: p.field || null,
        examDate: p.exam_date ? new Date(p.exam_date) : null,
        targetRanking: p.target_ranking || null,
        targetDepartment: p.target_department || null,
        targetNet: targetNetValue,
        baselineNet: baselineNetValue,
        dailyGoalSet: !!p.daily_question_goal || !!p.target_ranking,
        levelTestDone: !!local.levelTestDone || baselineNetValue != null,
        setupCompleted: !!local.setupCompleted,
      };
      setExamType(config.examType);
      setField(config.field);
      setExamDate(config.examDate);
      setTargetRanking(config.targetRanking);
      setTargetDepartment(config.targetDepartment);
      setTargetNet(config.targetNet);
      setBaselineNet(config.baselineNet);
      if (config.dailyGoalSet) setDailyGoalSet(true);
      setLevelTestDone(config.levelTestDone);
      setSetupCompleted(config.setupCompleted);
      appStorage.setJson(STORAGE_KEY, {
        ...local,
        examType: config.examType,
        field: config.field,
        examDate: config.examDate?.toISOString() || null,
        targetRanking: config.targetRanking,
        targetDepartment: config.targetDepartment,
        targetNet: config.targetNet,
        baselineNet: config.baselineNet,
        dailyGoalSet: config.dailyGoalSet,
        levelTestDone: config.levelTestDone,
        setupCompleted: config.setupCompleted,
      }).catch(() => {});
      // Sunucuda hic deger yoksa yerelden doldur (ilk kurulum / eski surum).
      const pending = {};
      if (p.target_net == null && local.targetNet != null) pending.target_net = Number(local.targetNet);
      if (p.baseline_net == null && local.baselineNet != null) pending.baseline_net = Number(local.baselineNet);
      if (Object.keys(pending).length) {
        updateProf(session.user.id, pending).catch(() => {});
      }
      // Bekleyen yazimlari yeniden dene. Basarili olursa bayrak dusuyor.
      await retryPendingNetSync(session.user.id, local, () => cancelled);
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
      updateProf(session.user.id, { daily_question_goal: dailyQuestions }).catch(() => {});
    }
  }, [session]);

  // Hedef net. Sunucu yazimi sessizce yutulMUYOR: basarisizsa yerelde kaliyor
  // ve bir sonraki profil okumasinda geri dolduruluyor (getProfile dalindaki
  // "profil yoksa yerelden oku" yolu). Cevrimdisi girilen hedef kaybolmasin.
  const updateTargetNet = useCallback(async (net) => {
    const value = coerceNet(net);
    setTargetNet(value);
    try {
      await persistExamConfigPatch({ targetNet: value, targetNetSyncPending: false });
    } catch {}
    if (session?.user?.id) {
      try {
        await updateProf(session.user.id, { target_net: value });
        await persistExamConfigPatch({ targetNet: value, targetNetSyncPending: false });
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({ targetNet: value, targetNetSyncPending: true }).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session]);

  // Rotanin baslangic neti. targetNet ile ayni deseni izliyor.
  // profiles.baseline_net kolonu uygulandi (2026-09-10), sunucu senkronu acik.
  // Sunucu yazimi basarisiz olursa deger yerelde kaliyor ve profil
  // okunamadiginda yerelden geri dolduruluyor — sessizce kaybolmuyor.
  const updateBaselineNet = useCallback(async (net) => {
    const value = coerceNet(net);
    setBaselineNet(value);
    setLevelTestDone(true);
    try {
      await persistExamConfigPatch({
        baselineNet: value,
        levelTestDone: true,
        levelTestSkipped: false,
        baselineNetSyncPending: false,
      });
    } catch {}
    if (session?.user?.id) {
      try {
        await updateProf(session.user.id, { baseline_net: value });
        await persistExamConfigPatch({ baselineNet: value, baselineNetSyncPending: false });
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({ baselineNet: value, baselineNetSyncPending: true }).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session]);

  const markLevelTestDone = useCallback(async ({ skipped = false } = {}) => {
    setLevelTestDone(true);
    try {
      const existing = await appStorage.getJson(STORAGE_KEY, {});
      await appStorage.setJson(
        STORAGE_KEY,
        { ...existing, levelTestDone: true, levelTestSkipped: !!skipped },
      );
    } catch {}
  }, []);

  const completeOnboarding = useCallback(async () => {
    setSetupCompleted(true);
    try {
      const existing = await appStorage.getJson(STORAGE_KEY, {});
      await appStorage.setJson(STORAGE_KEY, { ...existing, setupCompleted: true });
    } catch {}
  }, []);

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

  const onboardingDone = !!examType && dailyGoalSet && setupCompleted;

  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const examUTC = Date.UTC(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    return Math.max(0, Math.round((examUTC - todayUTC) / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  const combinedLoading = loading || dbLoading;

  const value = useMemo(() => ({
    examType, field, examDate, targetRanking, targetDepartment, targetNet, baselineNet,
    daysUntilExam, loading: combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, levelTestDone, setupCompleted,
    updateExamConfig, updateGoal, updateRanking, updateTargetNet, updateBaselineNet,
    markLevelTestDone, completeOnboarding,
    markSlidesAsSeen,
  }), [examType, field, examDate, targetRanking, targetDepartment, targetNet, baselineNet,
    daysUntilExam, combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, levelTestDone, setupCompleted,
    updateExamConfig, updateGoal, updateRanking, updateTargetNet, updateBaselineNet,
    markLevelTestDone, completeOnboarding,
    markSlidesAsSeen]);

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
