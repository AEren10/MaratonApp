import { createContext, useContext, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { getProfile, updateProfile as updateProf } from "../supabase/profiles";
import { updateExamConfig as syncExamConfig } from "../supabase/profiles";
import { clearRouteWeeks } from "../supabase/routePlan";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";
import { rescheduleExamEveReminder } from "../lib/examDayPlanStore";

const ExamContext = createContext(null);

const STORAGE_KEY = STORAGE_KEYS.EXAM_CONFIG;
const SLIDES_KEY = STORAGE_KEYS.HAS_SEEN_ONBOARDING;

function examConfigKey(userId) {
  return userScopedKey(STORAGE_KEY, userId);
}

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
      await persistExamConfigPatch({ [job.patchKey]: job.value, [job.flag]: false }, userId);
    } catch {
      // Hala basarisiz: bayrak duruyor, sonraki acilista yine denenir.
    }
  }
}

async function retryPendingProfileSettingsSync(userId, local, isCancelled) {
  if (!userId || !local) return;
  try {
    if (local.examConfigSyncPending && local.examType) {
      await syncExamConfig(userId, {
        examType: local.examType,
        field: local.field || null,
        examDate: local.examDate || null,
        targetRanking: local.targetRanking || null,
        targetDepartment: local.targetDepartment || null,
      });
      if (isCancelled()) return;
      await persistExamConfigPatch({ examConfigSyncPending: false }, userId);
    }
    if (local.rankingSyncPending) {
      await syncExamConfig(userId, {
        examType: local.examType || null,
        field: local.field || null,
        examDate: local.examDate || null,
        targetRanking: local.targetRanking || null,
        targetDepartment: local.targetDepartment || null,
      });
      if (isCancelled()) return;
      await persistExamConfigPatch({ rankingSyncPending: false }, userId);
    }
    if (local.dailyGoalSyncPending && local.dailyQuestionGoal != null) {
      await updateProf(userId, { daily_question_goal: Number(local.dailyQuestionGoal) });
      if (isCancelled()) return;
      await persistExamConfigPatch({ dailyGoalSyncPending: false }, userId);
    }
  } catch {
    // Hala başarısız: pending bayrakları yerelde kalır, sonraki açılışta yeniden denenir.
  }
}

async function persistExamConfigPatch(patch, userId = null) {
  const key = examConfigKey(userId);
  const existing = await appStorage.getJson(key, {});
  await appStorage.setJson(key, { ...existing, ...patch });
}

export function ExamProvider({ children }) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const storageKey = useMemo(() => examConfigKey(userId), [userId]);
  const [examType, setExamType] = useState(null);
  const [field, setField] = useState(null);
  const [examDate, setExamDate] = useState(null);
  const [targetRanking, setTargetRanking] = useState(null);
  const [targetDepartment, setTargetDepartment] = useState(null);
  // Tasarimin onboarding 1. adimi: HEDEF NET (slider 40-120). profiles.target_net.
  const [targetNet, setTargetNet] = useState(null);
  const [targetNetTYT, setTargetNetTYT] = useState(null);
  const [targetNetAYT, setTargetNetAYT] = useState(null);
  // Rotanin baslangic noktasi (Seviye Testi 3/4). profiles.baseline_net.
  const [baselineNet, setBaselineNet] = useState(null);
  const [dailyGoalSet, setDailyGoalSet] = useState(false);
  const [levelTestDone, setLevelTestDone] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  // Kullanici kurulumu bilerek yarim biraktiysa bunu HATIRLARIZ. Yoksa her
  // acilista ayni ekrana dusuyordu: girmesine izin verip yine sormak.
  const [setupSkipped, setSetupSkipped] = useState(false);
  const [hasSeenSlides, setHasSeenSlides] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const dbLoadedFor = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const safety = setTimeout(() => { if (!cancelled) setLoading(false); }, 2000);
    Promise.all([
      userId ? appStorage.getJson(storageKey, null) : Promise.resolve(null),
      appStorage.getString(SLIDES_KEY),
    ]).then(([d, seenRaw]) => {
      if (cancelled) return;
      if (d) {
        setExamType(d.examType);
        setField(d.field || null);
        setExamDate(d.examDate ? new Date(d.examDate) : null);
        setTargetRanking(d.targetRanking || null);
        setTargetDepartment(d.targetDepartment || null);
        setTargetNet(d.targetNet ?? null);
        setTargetNetTYT(d.targetNetTYT ?? null);
        setTargetNetAYT(d.targetNetAYT ?? null);
        setBaselineNet(d.baselineNet ?? null);
        if (d.dailyGoalSet || d.targetRanking) setDailyGoalSet(true);
        setLevelTestDone(!!d.levelTestDone || d.baselineNet != null);
        setSetupCompleted(!!d.setupCompleted);
        setSetupSkipped(!!d.setupSkipped);
      }
      setHasSeenSlides(seenRaw === "true");
    })
    .catch(() => {})
    .finally(() => { clearTimeout(safety); if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [storageKey, userId]);

  useEffect(() => {
    if (!userId) {
      if (!session && !loading) {
        dbLoadedFor.current = null;
        setExamType(null);
        setField(null);
        setExamDate(null);
        setTargetRanking(null);
        setTargetDepartment(null);
        setTargetNet(null);
        setTargetNetTYT(null);
        setTargetNetAYT(null);
        setBaselineNet(null);
        setDailyGoalSet(false);
        setLevelTestDone(false);
        setSetupCompleted(false);
      }
      return;
    }
    if (dbLoadedFor.current === userId) return;
    dbLoadedFor.current = userId;
    setDbLoading(true);

    // Çıkış→giriş yarışı: A'nın profili logout'tan sonra resolve olursa
    // B'nin sınav tipi/hedef sıralaması A'nınkiyle eziliyor ve diske yazılıyor.
    // Effect session değişince yeniden çalıştığı için cleanup bunu keser.
    let cancelled = false;

    getProfile(userId).then(async (p) => {
      if (cancelled) return;
      const local = await appStorage.getJson(storageKey, {});
      if (!p?.exam_type) {
        if (local && !cancelled) {
          setExamType(local.examType);
          setField(local.field || null);
          setExamDate(local.examDate ? new Date(local.examDate) : null);
          setTargetRanking(local.targetRanking || null);
          setTargetDepartment(local.targetDepartment || null);
          setTargetNet(local.targetNet ?? null);
          setTargetNetTYT(local.targetNetTYT ?? null);
          setTargetNetAYT(local.targetNetAYT ?? null);
          setBaselineNet(local.baselineNet ?? null);
          setLevelTestDone(!!local.levelTestDone || local.baselineNet != null);
          setSetupCompleted(!!local.setupCompleted);
          setSetupSkipped(!!local.setupSkipped);
        }
        await retryPendingNetSync(userId, local, () => cancelled);
        await retryPendingProfileSettingsSync(userId, local, () => cancelled);
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
      const examConfigPending = !!local.examConfigSyncPending && !!local.examType;
      const rankingPending = !!local.rankingSyncPending;
      const dailyGoalPending = !!local.dailyGoalSyncPending;
      const config = {
        examType: examConfigPending ? local.examType : p.exam_type,
        field: examConfigPending ? (local.field || null) : (p.field || null),
        examDate: examConfigPending
          ? (local.examDate ? new Date(local.examDate) : null)
          : (p.exam_date ? new Date(p.exam_date) : null),
        targetRanking: rankingPending ? (local.targetRanking || null) : (p.target_ranking || null),
        targetDepartment: rankingPending ? (local.targetDepartment || null) : (p.target_department || null),
        targetNet: targetNetValue,
        targetNetTYT: local.targetNetTYT ?? null,
        targetNetAYT: local.targetNetAYT ?? null,
        baselineNet: baselineNetValue,
        dailyGoalSet: dailyGoalPending || !!p.daily_question_goal || !!p.target_ranking,
        levelTestDone: !!local.levelTestDone || baselineNetValue != null,
        setupCompleted: !!local.setupCompleted || (!!p.exam_type && (p.target_net != null || p.baseline_net != null || !!p.daily_question_goal || !!p.target_ranking)),
      };
      setExamType(config.examType);
      setField(config.field);
      setExamDate(config.examDate);
      setTargetRanking(config.targetRanking);
      setTargetDepartment(config.targetDepartment);
      setTargetNet(config.targetNet);
      setTargetNetTYT(config.targetNetTYT);
      setTargetNetAYT(config.targetNetAYT);
      setBaselineNet(config.baselineNet);
      if (config.dailyGoalSet) setDailyGoalSet(true);
      setLevelTestDone(config.levelTestDone);
      setSetupCompleted(config.setupCompleted);
      setSetupSkipped(!!local.setupSkipped);
      appStorage.setJson(storageKey, {
        ...local,
        examType: config.examType,
        field: config.field,
        examDate: config.examDate?.toISOString() || null,
        targetRanking: config.targetRanking,
        targetDepartment: config.targetDepartment,
        targetNet: config.targetNet,
        targetNetTYT: config.targetNetTYT,
        targetNetAYT: config.targetNetAYT,
        dailyGoalSet: config.dailyGoalSet,
        levelTestDone: config.levelTestDone,
        setupCompleted: config.setupCompleted,
      }).catch(() => {});
      // Sunucuda hic deger yoksa yerelden doldur (ilk kurulum / eski surum).
      const pending = {};
      if (p.target_net == null && local.targetNet != null) pending.target_net = Number(local.targetNet);
      if (p.baseline_net == null && local.baselineNet != null) pending.baseline_net = Number(local.baselineNet);
      if (Object.keys(pending).length) {
        updateProf(userId, pending).catch(() => {});
      }
      // Bekleyen yazimlari yeniden dene. Basarili olursa bayrak dusuyor.
      await retryPendingNetSync(userId, local, () => cancelled);
      await retryPendingProfileSettingsSync(userId, local, () => cancelled);
    }).catch(() => {}).finally(() => { if (!cancelled) setDbLoading(false); });

    return () => { cancelled = true; };
  }, [loading, session, storageKey, userId]);

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
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(
        storageKey,
        {
          ...existing,
          examType: type,
          field: selectedField || null,
          examDate: date?.toISOString(),
          examConfigSyncPending: false,
        },
      );
    } catch {}
    // Sinav gunu plani kayitliysa arife hatirlatmasi yeni tarihe tasinir.
    rescheduleExamEveReminder(session?.user?.id, date);
    if (session?.user?.id && session.user.id) {
      try {
        await syncExamConfig(session.user.id, {
          examType: type, field: selectedField || null, examDate: date,
          targetRanking, targetDepartment,
        });
        await persistExamConfigPatch({ examConfigSyncPending: false }, session.user.id);
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({
          examType: type,
          field: selectedField || null,
          examDate: date?.toISOString(),
          targetRanking,
          targetDepartment,
          examConfigSyncPending: true,
        }, session.user.id).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session, storageKey, targetRanking, targetDepartment, examType]);

  const updateGoal = useCallback(async (dailyQuestions) => {
    setDailyGoalSet(true);
    try {
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(
        storageKey,
        { ...existing, dailyGoalSet: true, dailyQuestionGoal: dailyQuestions, dailyGoalSyncPending: false },
      );
    } catch {}
    if (session?.user?.id) {
      try {
        await updateProf(session.user.id, { daily_question_goal: dailyQuestions });
        await persistExamConfigPatch({ dailyQuestionGoal: dailyQuestions, dailyGoalSyncPending: false }, session.user.id);
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({
          dailyQuestionGoal: dailyQuestions,
          dailyGoalSyncPending: true,
        }, session.user.id).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session, storageKey]);

  // Hedef net. Sunucu yazimi sessizce yutulMUYOR: basarisizsa yerelde kaliyor
  // ve bir sonraki profil okumasinda geri dolduruluyor (getProfile dalindaki
  // "profil yoksa yerelden oku" yolu). Cevrimdisi girilen hedef kaybolmasin.
  const updateTargetNet = useCallback(async (net, extra = {}) => {
    let total = net;
    let tyt = extra?.tyt ?? null;
    let ayt = extra?.ayt ?? null;
    if (typeof net === "object" && net !== null) {
      tyt = net.tyt ?? null;
      ayt = net.ayt ?? null;
      total = (tyt || 0) + (ayt || 0);
    }
    const value = coerceNet(total);
    setTargetNet(value);
    if (tyt != null) setTargetNetTYT(Number(tyt));
    if (ayt != null) setTargetNetAYT(Number(ayt));
    try {
      await persistExamConfigPatch({
        targetNet: value,
        targetNetTYT: tyt != null ? Number(tyt) : undefined,
        targetNetAYT: ayt != null ? Number(ayt) : undefined,
        targetNetSyncPending: false,
      }, userId);
    } catch {}
    if (session?.user?.id) {
      try {
        await updateProf(session.user.id, { target_net: value });
        await persistExamConfigPatch({ targetNet: value, targetNetSyncPending: false }, userId);
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({ targetNet: value, targetNetSyncPending: true }, userId).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session, userId]);

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
      }, userId);
    } catch {}
    if (session?.user?.id) {
      try {
        await updateProf(session.user.id, { baseline_net: value });
        await persistExamConfigPatch({ baselineNet: value, baselineNetSyncPending: false }, userId);
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({ baselineNet: value, baselineNetSyncPending: true }, userId).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session, userId]);

  const markLevelTestDone = useCallback(async ({ skipped = false } = {}) => {
    setLevelTestDone(true);
    try {
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(
        storageKey,
        { ...existing, levelTestDone: true, levelTestSkipped: !!skipped },
      );
    } catch {}
  }, [storageKey]);

  const completeOnboarding = useCallback(async () => {
    setSetupCompleted(true);
    try {
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(storageKey, { ...existing, setupCompleted: true });
    } catch {}
  }, [storageKey]);

  const skipSetup = useCallback(async () => {
    setSetupSkipped(true);
    try {
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(storageKey, { ...existing, setupSkipped: true });
    } catch {}
  }, [storageKey]);

  const updateRanking = useCallback(async (ranking, department) => {
    setTargetRanking(ranking);
    setTargetDepartment(department || null);
    try {
      const existing = await appStorage.getJson(storageKey, {});
      await appStorage.setJson(
        storageKey,
        {
          ...existing,
          targetRanking: ranking,
          targetDepartment: department || null,
          rankingSyncPending: false,
        },
      );
    } catch {}
    if (session?.user?.id) {
      try {
        await syncExamConfig(session.user.id, {
          examType, field, examDate,
          targetRanking: ranking, targetDepartment: department || null,
        });
        await persistExamConfigPatch({ rankingSyncPending: false }, session.user.id);
        return { synced: true };
      } catch (e) {
        await persistExamConfigPatch({
          examType,
          field,
          examDate: examDate?.toISOString?.() || examDate || null,
          targetRanking: ranking,
          targetDepartment: department || null,
          rankingSyncPending: true,
        }, session.user.id).catch(() => {});
        return { synced: false, error: e };
      }
    }
    return { synced: false, offline: true };
  }, [session, storageKey, examType, field, examDate]);

  // Kurulumu ACIKCA bitirmis olmak baglayicidir.
  // setupCompleted tek basina yeterlidir; dailyGoalSet hedef ekraninda
  // true oldugu icin burada kullanilirsa kullaniciyi henuz seviye testi
  // ve rota hazir ekranlarini gormeden prematur olarak MainTabs'e atiyordu.
  const onboardingDone = !!examType && (setupCompleted || setupSkipped);

  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;
    const now = new Date();
    const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const examUTC = Date.UTC(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
    return Math.max(0, Math.round((examUTC - todayUTC) / (1000 * 60 * 60 * 24)));
  }, [examDate]);

  const combinedLoading = loading;

  const value = useMemo(() => ({
    examType, field, examDate, targetRanking, targetDepartment, targetNet,
    targetNetTYT, targetNetAYT, baselineNet,
    daysUntilExam, loading: combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, levelTestDone, setupCompleted, setupSkipped,
    updateExamConfig, updateGoal, updateRanking, updateTargetNet, updateBaselineNet,
    markLevelTestDone, completeOnboarding, skipSetup,
    markSlidesAsSeen,
  }), [examType, field, examDate, targetRanking, targetDepartment, targetNet,
    targetNetTYT, targetNetAYT, baselineNet,
    daysUntilExam, combinedLoading, onboardingDone, hasSeenSlides,
    dailyGoalSet, levelTestDone, setupCompleted, setupSkipped,
    updateExamConfig, updateGoal, updateRanking, updateTargetNet, updateBaselineNet,
    markLevelTestDone, completeOnboarding, skipSetup,
    markSlidesAsSeen]);

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export const useExam = () => {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
};
