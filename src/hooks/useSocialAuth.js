import { useState, useCallback } from "react";
import { Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { signInWithAppleToken, signInWithGoogleToken } from "../supabase/auth";

GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function useSocialAuth() {
  const [busy, setBusy] = useState(false);

  const signInWithApple = useCallback(async () => {
    setBusy(true);
    try {
      const rawNonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      if (!credential.identityToken) throw new Error("Apple identity token missing");
      return await signInWithAppleToken({ idToken: credential.identityToken, nonce: rawNonce });
    } finally {
      setBusy(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setBusy(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error("Google ID token missing");
      return await signInWithGoogleToken({ idToken });
    } finally {
      setBusy(false);
    }
  }, []);

  return { signInWithApple, signInWithGoogle, busy };
}
