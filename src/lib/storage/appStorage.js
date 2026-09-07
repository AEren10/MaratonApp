import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getString(key, fallback = null) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setString(key, value) {
  try {
    await AsyncStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export async function getJson(key, fallback = null) {
  const raw = await getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function setJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function remove(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export async function takeString(key, fallback = null) {
  const value = await getString(key, fallback);
  if (value !== fallback) await remove(key);
  return value;
}
