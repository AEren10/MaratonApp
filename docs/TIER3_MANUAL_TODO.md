# Tier 3 — Manuel Yapılacaklar

Kod değişiklikleri tamamlandı. Aşağıdaki adımlar senin tarafından yapılmalı.

---

## 1. Google Cloud Console — OAuth Credentials

Google Sign-In çalışması için OAuth 2.0 istemci kimliği oluşturulmalı.

1. https://console.cloud.google.com adresine git
2. Yeni proje oluştur veya mevcut projeyi seç
3. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. **iOS** tipi seç:
   - Bundle ID: `com.maraton.app`
   - Oluşturulan iOS Client ID'yi kopyala
5. **Web** tipi seç (Supabase için gerekli):
   - Authorized redirect URI: `https://zrycqfehhyjrsujmajpf.supabase.co/auth/v1/callback`
   - Oluşturulan Web Client ID'yi kopyala
6. **Android** tipi seç:
   - Package name: `com.maraton.app`
   - SHA-1: `keytool -keystore android/app/debug.keystore -list -v` ile al (debug keystore şifresi: `android`)

### Sonra yapılacaklar:
- `.env` dosyasına ekle:
  ```
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
  ```
- `app.json` → plugins → `@react-native-google-signin/google-signin` → `iosUrlScheme` değerini gerçek iOS Client ID ile güncelle (ters çevrilmiş format: `com.googleusercontent.apps.XXXX`)
- Supabase Dashboard → Authentication → Providers → Google → Client ID (Web) ve Client Secret ekle

---

## 2. Apple Sign-In — App Store Connect

Kod hazır, Supabase Apple provider aktif (Client ID: `com.maraton.app`). Ek yapılacak:

1. **Apple Developer → Certificates, Identifiers & Profiles**
   - App ID'de "Sign in with Apple" capability aktif olmalı
2. **Services ID** oluştur (web login için, Supabase redirect):
   - Identifier: `com.maraton.app.web`
   - Return URL: `https://zrycqfehhyjrsujmajpf.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Apple provider → Secret Key (p8 dosyası) yükle

> Not: Native iOS Sign in with Apple için Services ID zorunlu değil, ama Supabase admin panel için gerekebilir.

---

## 3. Supabase Edge Function Deploy

Push notification Edge Function yazıldı ama deploy edilmedi.

```bash
supabase functions deploy send-push --project-ref zrycqfehhyjrsujmajpf
```

Gerekli environment variable:
```bash
supabase secrets set EXPO_ACCESS_TOKEN=xxx --project-ref zrycqfehhyjrsujmajpf
```

Expo access token: https://expo.dev/accounts/ahmeterenn/settings/access-tokens adresinden oluştur.

---

## 4. pg_cron — Push Scheduling (Pro Plan Gerekli)

`supabase/migrations/20260624_push_reengagement_cron.sql` dosyasında pg_cron job'ları var ama **Supabase Free plan'da pg_cron yok**. Pro plan'a geçince:

1. Dashboard → Database → Extensions → `pg_cron` aktif et
2. Migration SQL'deki yorum satırlarını kaldırıp çalıştır:
   - `inactive_3d_push`: 3 gün inaktif kullanıcılara push
   - `streak_risk_push`: Streak kaybetme riski olanlara push
   - `weekly_summary_push`: Haftalık özet push (Pazar 10:00)

---

## 5. Deep Link Domain Doğrulama

`expo-linking` ve React Navigation linking config hazır. Production'da çalışması için:

### iOS — Universal Links:
- `maraton.app/.well-known/apple-app-site-association` dosyası sunucuya koyulmalı:
```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAM_ID.com.maraton.app",
      "paths": ["/referral/*", "/share/*"]
    }]
  }
}
```

### Android — App Links:
- `maraton.app/.well-known/assetlinks.json` dosyası sunucuya koyulmalı:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.maraton.app",
    "sha256_cert_fingerprints": ["SHA256_HASH"]
  }
}]
```

---

## 6. RevenueCat API Keys

Premium/paywall sistemi RevenueCat entegrasyonu hazır, sadece API key'ler placeholder.

1. https://app.revenuecat.com → yeni proje oluştur
2. iOS ve Android app ekle (bundle: `com.maraton.app`)
3. API key'leri `.env` dosyasına ekle:
   ```
   EXPO_PUBLIC_RC_IOS_KEY=appl_xxx
   EXPO_PUBLIC_RC_ANDROID_KEY=goog_xxx
   ```
4. App Store Connect ve Google Play Console'da in-app purchase ürünleri oluştur
5. RevenueCat'e entitlement ve offering tanımla

---

## 7. EAS Build Sonrası Native Rebuild

Google Sign-In ve Apple Auth native modül eklendi. Bir sonraki build'de:

```bash
npx expo prebuild --clean
eas build --platform all --profile development
```

---

## Özet Checklist

| # | Görev | Zorunluluk | Durum |
|---|-------|-----------|-------|
| 1 | Google OAuth credentials | Yüksek | ⬜ |
| 2 | Apple Developer Sign-In config | Yüksek | ⬜ |
| 3 | Edge Function deploy | Orta | ⬜ |
| 4 | pg_cron (Pro plan) | Düşük | ⬜ |
| 5 | Deep link domain verification | Orta | ⬜ |
| 6 | RevenueCat API keys | Yüksek | ⬜ |
| 7 | Native rebuild (EAS) | Yüksek | ⬜ |
