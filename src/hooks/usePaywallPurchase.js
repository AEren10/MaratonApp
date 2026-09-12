import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { track, trackPaywallViewed } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { PLANS } from "../constants/premium";
import { usePremium } from "../contexts/PremiumContext";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  getPurchasesStatus,
  isInitialized,
} from "../lib/purchases";
import { startTrial } from "../supabase/productAccess";
import * as H from "../lib/haptics";

// Paywall satin alma mantigi. Ekran dosyasinda is mantigi durmaz
// (AGENTS.md); goruntuleme/donusum olcumu de burada.
//
// URETIMDE ucretsiz denemeye DUSMEZ: paket bulunamazsa "Satin alma hazir
// degil" der ve durur. Deneme yoluna yalniz __DEV__ ve RevenueCat
// yapilandirilmamisken giriliyor.
export function usePaywallPurchase() {
  const navigation = useNavigation();
  const route = useRoute();
  const { refreshPremium } = usePremium();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [selectedPlan, setSelectedPlan] = useState("yearly");
  const [packages, setPackages] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  // Dönüşümün paydası. PREMIUM_DISMISSED tanımlıydı ama hiç gönderilmiyordu:
  // görüntüleme sayılıyor, kapatma sayılmıyordu — yani paywall dönüşüm oranı
  // hesaplanamıyordu. beforeRemove kullanılıyor ki kapatma butonu, donanım
  // geri tuşu ve kaydırmayla çıkış hepsi yakalansın.
  const convertedRef = useRef(false);

  useEffect(() => {
    track(EVENTS.PREMIUM_VIEWED, { source: route.params?.source || "unknown" });
    trackPaywallViewed(route.params?.source || "unknown");
  }, [route.params?.source]);

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      if (convertedRef.current) return;
      track(EVENTS.PREMIUM_DISMISSED, {
        source: route.params?.source || "unknown",
        selectedPlan,
      });
    });
    return unsub;
  }, [navigation, route.params?.source, selectedPlan]);

  useEffect(() => {
    if (!isInitialized()) return;
    getOfferings().then((offering) => {
      if (offering?.availablePackages) setPackages(offering.availablePackages);
    });
  }, []);

  // Fiyatı her zaman mağazadan gelen gerçek fiyattan göster. Sabit fiyat
  // yalnızca RevenueCat bağlı değilken (dev/preview) fallback olarak kalır.
  const displayPlans = useMemo(() => {
    if (!packages) return PLANS;
    return PLANS.map((plan) => {
      const identifier = plan.id === "yearly" ? "$rc_annual" : "$rc_monthly";
      const pkg = packages.find((p) => p.identifier === identifier);
      const priceString = pkg?.product?.priceString;
      return priceString ? { ...plan, price: priceString } : plan;
    });
  }, [packages]);

  const getSelectedPackage = useCallback(() => {
    if (!packages) return null;
    const identifier = selectedPlan === "yearly" ? "$rc_annual" : "$rc_monthly";
    return packages.find((p) => p.identifier === identifier) || packages[0];
  }, [packages, selectedPlan]);

  const handlePurchase = useCallback(async () => {
    H.medium();
    setPurchasing(true);
    try {
      const pkg = getSelectedPackage();
      if (!pkg) {
        const purchasesStatus = getPurchasesStatus();
        if (__DEV__ && user?.id && !purchasesStatus.configured) {
          const started = await startTrial(user.id);
          if (started) {
            convertedRef.current = true;
            track(EVENTS.TRIAL_STARTED, { source: route.params?.source || "paywall" });
            H.success();
            await refreshPremium();
            showAlert("Deneme Başladı", "7 günlük ücretsiz denemen başladı!");
            navigation.goBack();
            return;
          }
          showAlert("Deneme Kullanıldı", "Ücretsiz deneme hakkını zaten kullandın.");
          return;
        }
        showAlert(
          "Satın alma hazır değil",
          "Mağaza paketleri yüklenemedi. Biraz sonra tekrar dene.",
        );
        return;
      }
      const isPro = await purchasePackage(pkg);
      if (isPro) {
        convertedRef.current = true;
        track(EVENTS.PREMIUM_PURCHASED, { plan: selectedPlan });
        H.success();
        await refreshPremium();
        navigation.goBack();
      }
    } catch (e) {
      if (e.userCancelled) return;
      showAlert("Hata", "Satın alma işlemi başarısız oldu. Lütfen tekrar dene.");
    } finally {
      setPurchasing(false);
    }
  }, [getSelectedPackage, selectedPlan, user?.id, refreshPremium, navigation, showAlert]);

  const handleRestore = useCallback(async () => {
    setPurchasing(true);
    try {
      const isPro = await restorePurchases();
      if (isPro) {
        H.success();
        await refreshPremium();
        showAlert("Başarılı", "Premium üyeliğin geri yüklendi!");
        navigation.goBack();
      } else {
        showAlert("Bulunamadı", "Aktif bir abonelik bulunamadı.");
      }
    } catch {
      showAlert("Hata", "Geri yükleme başarısız oldu.");
    } finally {
      setPurchasing(false);
    }
  }, [user?.id, refreshPremium, navigation, showAlert]);

  return {
    selectedPlan,
    setSelectedPlan,
    purchasing,
    displayPlans,
    handlePurchase,
    handleRestore,
    source: route.params?.source,
  };
}
