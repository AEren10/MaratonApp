import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "",
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "",
};

let initialized = false;
let unavailableReason = null;

function isConfiguredKey(key) {
  return !!key && !key.startsWith("YOUR_");
}

export async function initPurchases(userId) {
  if (initialized) return;
  const key = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
  if (!isConfiguredKey(key)) {
    unavailableReason = "missing_revenuecat_key";
    return;
  }

  try {
    Purchases.configure({ apiKey: key, appUserID: userId || undefined });
    initialized = true;
    unavailableReason = null;
  } catch (e) {
    unavailableReason = "configure_failed";
    if (__DEV__) console.warn("[Purchases] init failed", e);
  }
}

export async function getOfferings() {
  if (!initialized) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    if (__DEV__) console.warn("[Purchases] getOfferings", e);
    return null;
  }
}

export async function purchasePackage(pkg) {
  if (!initialized) throw new Error("Purchases not initialized");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return isPremiumFromInfo(customerInfo);
}

export async function restorePurchases() {
  if (!initialized) throw new Error("Purchases not initialized");
  const customerInfo = await Purchases.restorePurchases();
  return isPremiumFromInfo(customerInfo);
}

export async function getCustomerInfo() {
  if (!initialized) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return info;
  } catch {
    return null;
  }
}

export function isPremiumFromInfo(info) {
  if (!info) return false;
  const entitlements = info.entitlements?.active;
  return !!entitlements?.pro || !!entitlements?.premium;
}

export function isInitialized() {
  return initialized;
}

export function getPurchasesStatus() {
  return {
    initialized,
    configured: isConfiguredKey(Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android),
    unavailableReason,
  };
}
