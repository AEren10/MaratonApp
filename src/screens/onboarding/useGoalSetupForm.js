import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";

import { useExam } from "../../contexts/ExamContext";
import { useAuth } from "../../contexts/AuthContext";
import { setGoals, saveGoalsToStorage } from "../../store/slices/goalsSlice";
import {
  requestNotificationPermissions,
  applyNotifPrefs,
  getNotifPrefs,
  ensurePushTokenRegistered,
} from "../../lib/notifications";
import * as H from "../../lib/haptics";
import { SCREENS } from "../../constants/screens";
import { SYNC_PENDING_COPY } from "../../constants/stateCopy";

export const TARGET_NET_MIN = 40;
export const TARGET_NET_MAX = 120;
export const TARGET_NET_DEFAULT = 72;

export const DAILY_Q_MIN = 20;
export const DAILY_Q_MAX = 200;
export const DAILY_Q_STEP = 5;

// Tasarim "net · TYT" ornegini gosteriyor; TYT herkesin ortak sinavi oldugu
// icin dil ve tyt_ayt kullanicilarinda da hedef net TYT uzerinden olculuyor.
export function examNetLabel(examType) {
  if (examType === "lgs") return "LGS";
  if (examType === "tyt_ayt") return "TYT-AYT";
  return "TYT";
}

function estimateHours(q) {
  const h = q / 50;
  return h % 1 === 0 ? `${h}` : h.toFixed(1);
}

// GoalSetupScreen'in is mantigi: hedef net (ana soru) + gunluk soru
// hedefi (ikincil), kayitli degerlerin geri doldurulmasi ve kurulumun
// bitirilmesi.
export function useGoalSetupForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { updateGoal, updateTargetNet, examType, targetNet } = useExam();

  const [targetNetValue, setTargetNetValue] = useState(TARGET_NET_DEFAULT);
  const [dailyQuestions, setDailyQuestions] = useState(80);
  const seeded = useRef(false);
  const [targetNetPending, setTargetNetPending] = useState(false);

  useEffect(() => {
    if (seeded.current) return;
    if (targetNet == null) return;
    seeded.current = true;
    setTargetNetValue(targetNet);
  }, [targetNet]);

  const hours = estimateHours(dailyQuestions);
  const netLabel = examNetLabel(examType);

  const finish = useCallback(async () => {
    H.success();
    const goals = { dailyQuestions, weeklyTrials: 2, weeklyMinutes: 1200 };
    dispatch(setGoals(goals));
    saveGoalsToStorage(goals).catch(() => {});
    updateGoal(dailyQuestions).catch(() => {});

    // updateTargetNet HIC reject etmiyor: hatayi kendi icinde yakalayip
    // { synced, error } donduruyor. Eski hali `.catch(() => {})` ile bu
    // sonucu tamamen atiyordu, yani sunucu yazimi basarisiz olsa bile akis
    // "kaydedildi" gibi devam ediyordu. Sonuc artik okunuyor; deger yerelde
    // ve bekleyen bayrakla duruyor, ExamContext sonraki acilista yeniden
    // deniyor. Kurulum akisi bu yuzden BLOKLANMIYOR, sadece dogru soyluyor.
    updateTargetNet(targetNetValue).then((res) => {
      if (res && res.synced === false) setTargetNetPending(true);
    });

    requestNotificationPermissions().then(async (granted) => {
      if (granted) {
        const prefs = await getNotifPrefs();
        await applyNotifPrefs(prefs);
        // İzin verildiği AN token'ı kaydet. Aksi halde sunucu tarafındaki
        // re-engagement push'u yeni kullanıcıya hiç ulaşmıyor: loadAll bu
        // noktadan önce çalışmış ve izin yokken token null dönmüş oluyor.
        await ensurePushTokenRegistered(user?.id);
      }
    }).catch(() => {});

    // Kurulum BURADA BITMIYOR. Tasarim AKIS 12 dort adim:
    // Karsilama -> Hedef Sec -> Seviye Testi -> Rota Hazir.
    navigation.navigate(SCREENS.LEVEL_TEST);
  }, [dailyQuestions, targetNetValue, dispatch, updateGoal, updateTargetNet, navigation, user?.id]);

  return {
    targetNetPending,
    targetNetPendingNote: targetNetPending ? SYNC_PENDING_COPY.targetNet : null,
    targetNetValue,
    setTargetNetValue,
    dailyQuestions,
    setDailyQuestions,
    hours,
    netLabel,
    finish,
  };
}
