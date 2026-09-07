import { supabase } from "./client";
import { isRecoveryUrl } from "../lib/recoveryLink";

export { isRecoveryUrl };

export const signUp = async ({ email, password, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email) => {
  // redirectTo ZORUNLU. Yoksa Supabase e-postadaki linki proje ayarındaki
  // site_url'e yollar — telefonda açılmayan bir adres — ve kullanıcı
  // şifresini ASLA değiştiremez, hesabına kalıcı olarak kilitlenir.
  // Bu şemanın Supabase Auth > URL Configuration > Redirect URLs listesinde
  // de bulunması gerekir (canlıda `maraton://*` olarak eklendi).
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "maraton://sifre-belirle",
  });
  if (error) throw error;
};


export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
};

export const onAuthStateChange = (callback) =>
  supabase.auth.onAuthStateChange(callback);

export const updateEmail = async (email) => {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
};

/**
 * Şifre sıfırlama linkindeki token'dan oturum kurar.
 *
 * client.js'te `detectSessionInUrl: false` — React Native'de doğru ayar,
 * ama Supabase linkteki token'ı kendisi tüketmiyor demek. Bu fonksiyon
 * olmadan `updateUser({ password })` "Auth session missing" veriyor ve
 * kullanıcı şifresini değiştiremiyor.
 *
 * İki akış da destekleniyor:
 *   PKCE      -> ?code=...
 *   implicit  -> #access_token=...&refresh_token=...
 *   OTP       -> ?token_hash=...&type=recovery
 *
 * @returns true ise oturum hazır
 */
export const establishRecoverySession = async (url) => {
  // ÖNEMLİ: "zaten oturum var" DİYE ERKEN DÖNMÜYORUZ.
  //
  // Eskiden herhangi bir oturum varsa link hiç doğrulanmadan true dönüyordu.
  // Yani süresi dolmuş ya da başka hesaba ait bir link, o an giriş yapmış
  // kullanıcının şifresini değiştirebilecek bir form açıyordu. Link her
  // zaman kendi başına doğrulanmalı.
  if (!url) {
    // Link yok: yalnızca uygulama içinden (girişliyken) gelinmişse anlamlı.
    try {
      const { data } = await supabase.auth.getSession();
      return !!data?.session;
    } catch (_) {
      return false;
    }
  }

  try {
    const qIndex = url.indexOf("?");
    const hIndex = url.indexOf("#");
    const query = qIndex >= 0 ? new URLSearchParams(url.slice(qIndex + 1).split("#")[0]) : null;
    const hash = hIndex >= 0 ? new URLSearchParams(url.slice(hIndex + 1)) : null;

    const code = query?.get("code");
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return !error;
    }

    const tokenHash = query?.get("token_hash") || hash?.get("token_hash");
    if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
      return !error;
    }

    const accessToken = hash?.get("access_token") || query?.get("access_token");
    const refreshToken = hash?.get("refresh_token") || query?.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      return !error;
    }
  } catch (_) {}

  return false;
};

export const updatePassword = async (password) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const signInWithAppleToken = async ({ idToken, nonce }) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
    nonce,
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogleToken = async ({ idToken }) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  return data;
};

export const deleteAccount = async () => {
  // Depolama temizliği önce ve istemciden — SQL tarafından storage.objects
  // silinemiyor (Supabase engelliyor), fonksiyon o yüzden patlıyordu.
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (userId) {
    const { deleteUserStorage } = require("./storage");
    await deleteUserStorage(userId);
  }

  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;
};
