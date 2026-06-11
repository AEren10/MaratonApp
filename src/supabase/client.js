import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";

let storageAdapter;

if (Platform.OS === "web") {
  storageAdapter = {
    getItem: (key) => Promise.resolve(localStorage.getItem(key)),
    setItem: (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
    removeItem: (key) => { localStorage.removeItem(key); return Promise.resolve(); },
  };
} else {
  const SecureStore = require("expo-secure-store");
  storageAdapter = {
    getItem: (key) => SecureStore.getItemAsync(key),
    setItem: (key, value) => SecureStore.setItemAsync(key, value),
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

let _client = null;

export const supabase = (() => {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
})();
