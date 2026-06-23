import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const API_KEYS = {
  ios: "YOUR_REVENUECAT_IOS_API_KEY",
  android: "YOUR_REVENUECAT_ANDROID_API_KEY",
};

let initialized = false;

export async function initPurchases(userId) {
  if (initialized) return;
  const key = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
  if (key.startsWith("YOUR_")) return;

  try {
    Purchases.configure({ apiKey: key, appUserID: userId || undefined });
    initialized = true;
  } catch (e) {
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
