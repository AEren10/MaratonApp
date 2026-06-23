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
  const CHUNK_SIZE = 2048;

  storageAdapter = {
    async getItem(key) {
      try {
        const raw = await SecureStore.getItemAsync(key);
        if (raw !== null) return raw;
        const count = await SecureStore.getItemAsync(`${key}__c`);
        if (!count) return null;
        const n = parseInt(count, 10);
        const parts = await Promise.all(
          Array.from({ length: n }, (_, i) => SecureStore.getItemAsync(`${key}__${i}`)),
        );
        return parts.join("");
      } catch (e) {
        console.error("[SecureStore:getItem]", e.message || e);
        return null;
      }
    },
    async setItem(key, value) {
      try {
        if (!value || typeof value !== "string") return;
        if (value.length <= CHUNK_SIZE) {
          await SecureStore.setItemAsync(key, value);
          const old = await SecureStore.getItemAsync(`${key}__c`);
          if (old) {
            const n = parseInt(old, 10);
            await Promise.all(Array.from({ length: n }, (_, i) => SecureStore.deleteItemAsync(`${key}__${i}`)));
            await SecureStore.deleteItemAsync(`${key}__c`);
          }
          return;
        }
        const chunks = [];
        for (let i = 0; i < value.length; i += CHUNK_SIZE) chunks.push(value.slice(i, i + CHUNK_SIZE));
        await SecureStore.setItemAsync(`${key}__c`, String(chunks.length));
        await Promise.all(chunks.map((ch, i) => SecureStore.setItemAsync(`${key}__${i}`, ch)));
        try { await SecureStore.deleteItemAsync(key); } catch {}
      } catch (e) {
        console.error("[SecureStore:setItem]", e.message || e);
      }
    },
    async removeItem(key) {
      try {
        await SecureStore.deleteItemAsync(key);
        const count = await SecureStore.getItemAsync(`${key}__c`);
        if (count) {
          const n = parseInt(count, 10);
          await Promise.all(Array.from({ length: n }, (_, i) => SecureStore.deleteItemAsync(`${key}__${i}`)));
          await SecureStore.deleteItemAsync(`${key}__c`);
        }
      } catch (e) {
        console.error("[SecureStore:removeItem]", e.message || e);
      }
    },
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
