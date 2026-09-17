import { useCallback, useEffect, useState } from "react";
import { Share } from "react-native";
import * as Clipboard from "expo-clipboard";

import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";
import {
  getOrCreateReferralCode,
  applyReferralCode,
  getReferralStats,
} from "../supabase/referrals";
import { track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { captureError } from "../lib/errorReporting";
import * as H from "../lib/haptics";

const REWARD_DAYS = 7;

export function useReferrals({ routeCode, examType, showAlert } = {}) {
  const { user } = useAuth();
  const { refreshPremium } = usePremium();
  const [code, setCode] = useState(null);
  const [stats, setStats] = useState({ referralCount: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [friendCode, setFriendCode] = useState("");
  const [applying, setApplying] = useState(false);
  const userId = user?.id;
  const examName = examType === "lgs" ? "LGS" : "YKS";

  useEffect(() => {
    if (routeCode) {
      setFriendCode(routeCode.toUpperCase());
      return;
    }
    appStorage.getString(STORAGE_KEYS.PENDING_REFERRAL)
      .then((pending) => { if (pending) setFriendCode(pending); })
      .catch(() => {});
  }, [routeCode]);

  useEffect(() => {
    if (!userId || userId === "dev") {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getOrCreateReferralCode(userId),
      getReferralStats(userId),
    ]).then(([c, st]) => {
      if (!cancelled) {
        setCode(c);
        setStats(st);
      }
    }).catch((e) => {
      if (!cancelled) {
        captureError(e, { context: "referral_load" });
        showAlert?.("Hata", "Referral kodu alınamadı.");
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [showAlert, userId]);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    H.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleShare = useCallback(async () => {
    if (!code) return;
    H.medium();
    try {
      const link = `https://maraton.app/referral/${code}`;
      await Share.share({
        message: `Maraton ile birlikte ${examName}'ye hazırlanmak ister misin? ${link}\nDavet kodum: ${code}`,
        url: link,
      });
      track(EVENTS.REFERRAL_LINK_SHARED, { source: "referral_screen", examType });
    } catch {
      handleCopy();
    }
  }, [code, examName, examType, handleCopy]);

  const handleApply = useCallback(async () => {
    if (!friendCode.trim() || !userId) return;
    setApplying(true);
    try {
      const result = await applyReferralCode(userId, friendCode);
      if (result.ok) {
        H.success();
        track(EVENTS.REFERRAL_LINK_APPLIED, {
          source: "referral_screen",
          entry: routeCode ? "deep_link" : "manual_entry",
        });
        appStorage.remove(STORAGE_KEYS.PENDING_REFERRAL).catch(() => {});
        await refreshPremium();
        showAlert?.("Başarılı!", `Davet kodu uygulandı. ${REWARD_DAYS} gün Premium kazandın!`);
        setFriendCode("");
      } else if (result.reason === "invalid") {
        showAlert?.("Geçersiz Kod", "Bu davet kodu bulunamadı.");
      } else if (result.reason === "self") {
        showAlert?.("Hata", "Kendi davet kodunu kullanamazsın.");
      } else if (result.reason === "already_used") {
        showAlert?.("Zaten Kullanıldı", "Daha önce bir davet kodu kullandın.");
      } else {
        showAlert?.("Hata", "Davet kodu uygulanamadı, tekrar dene.");
      }
    } catch (e) {
      captureError(e, { context: "referral_apply" });
      showAlert?.("Hata", "Bir sorun oluştu, tekrar dene.");
    } finally {
      setApplying(false);
    }
  }, [friendCode, refreshPremium, routeCode, showAlert, userId]);

  return {
    code,
    stats,
    loading,
    copied,
    friendCode,
    setFriendCode,
    applying,
    rewardDays: REWARD_DAYS,
    handleCopy,
    handleShare,
    handleApply,
  };
}
