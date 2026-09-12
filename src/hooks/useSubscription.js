import { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { usePremium } from "../contexts/PremiumContext";
import { getCustomerInfo, getPurchasesStatus } from "../lib/purchases";
import { getProfile } from "../supabase/profiles";
import { fullDateLocative } from "../lib/trSuffix";
import * as H from "../lib/haptics";

// ABONELIK BILGISI
//
// Iki kaynak var, ikisi de eksik olabilir:
//  1. RevenueCat customerInfo -- magaza, urun, bitis tarihi, yonetim URL'i.
//     API anahtarlari HENUZ BOS, o yuzden initialized false olabiliyor.
//  2. profiles.premium_until (SUNUCU otoritesi) -- magaza bilgisi yok ama
//     erisimin ne zaman bitecegini biliyor.
// Hicbiri tarih vermiyorsa tarih UYDURULMUYOR: ekran satiri hic gostermiyor.
// Fiyat/fatura gecmisi ise hicbir kaynakta yok (customerInfo tutar tasimaz,
// veritabaninda fatura tablosu yok) -- o bolum bilerek cizilmiyor.

const STORE_URL = {
  ios: "https://apps.apple.com/account/subscriptions",
  android: "https://play.google.com/store/account/subscriptions",
};

const STORE_LABEL = {
  APP_STORE: "App Store",
  MAC_APP_STORE: "App Store",
  PLAY_STORE: "Google Play",
};

const PLATFORM_STORE_LABEL = Platform.OS === "ios" ? "App Store" : "Google Play";

function periodOf(productIdentifier) {
  if (!productIdentifier) return null;
  const id = String(productIdentifier).toLowerCase();
  if (/year|annual|yil/.test(id)) return "yıllık";
  if (/month|aylik/.test(id)) return "aylık";
  return null;
}

function futureDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime() > Date.now() ? d : null;
}

export function useSubscription() {
  const { user } = useAuth();
  const { isPremium, isInGrace } = usePremium();
  const [state, setState] = useState("loading");
  const [info, setInfo] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    const purchases = getPurchasesStatus();
    const [profileRes, customerRes] = await Promise.allSettled([
      user?.id && user.id !== "dev" ? getProfile(user.id) : Promise.resolve(null),
      purchases.initialized ? getCustomerInfo() : Promise.resolve(null),
    ]);

    const profile = profileRes.status === "fulfilled" ? profileRes.value : null;
    const customer = customerRes.status === "fulfilled" ? customerRes.value : null;

    if (profileRes.status === "rejected" && !customer) {
      setInfo(null);
      setState("error");
      return;
    }

    const active = customer?.entitlements?.active || null;
    const ent = active?.pro || active?.premium || null;
    const willRenew = ent ? ent.willRenew !== false : true;
    const endsAt = futureDate(ent?.expirationDate) || futureDate(profile?.premium_until);
    const storeLabel = STORE_LABEL[ent?.store] || null;

    setInfo({
      endsAt,
      willRenew,
      periodLabel: periodOf(ent?.productIdentifier),
      storeLabel,
      // Magaza adi bilinmiyorsa cihazin magazasi yaziliyor: iptal her
      // durumda o magazadan yapiliyor, cumle yanlis olmuyor.
      storeName: storeLabel || PLATFORM_STORE_LABEL,
      renewsLine: endsAt && willRenew
        ? [`${fullDateLocative(endsAt)} yenilenir`, storeLabel && `${storeLabel} üzerinden`]
          .filter(Boolean).join(" · ")
        : null,
      manageUrl: customer?.managementURL || STORE_URL[Platform.OS] || null,
    });
    setState("ready");
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const openStore = useCallback(async () => {
    const url = info?.manageUrl;
    if (!url) return;
    H.tap();
    try {
      await Linking.openURL(url);
    } catch {
      /* magaza acilamadiysa kullanici zaten magazadan girebilir */
    }
  }, [info?.manageUrl]);

  return {
    state,
    info,
    isPremium: isPremium || isInGrace,
    reload: load,
    openStore,
  };
}
