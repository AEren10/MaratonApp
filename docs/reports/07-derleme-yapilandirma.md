# 07 · Derleme ve yapılandırma denetimi (yayın hazırlığı)

Tarih: 4 Ekim 2026 · Kapsam: `app.json`, `eas.json`, `package.json`, `patches/`, `assets/`, `web/` · Kaynak koda dokunulmadı.

## 0. Nasıl doğrulandı

| Yöntem | Sonuç |
|---|---|
| `npx expo config --type introspect` (eklentiler uygulandıktan sonraki **nihai** yapılandırma) | Çalıştı. Nihai Android izinleri ve iOS Info.plist aşağıdaki bulguların kaynağı. |
| `npx expo export --platform android` (sahte Supabase değişkenleriyle) | **Başarılı**: 3154 modül, 9.6 MB Hermes bytecode. JS paketi derleniyor. |
| `npx expo install --check` | Ağ engelli (proxy 403). Bunun yerine `node_modules/expo/bundledNativeModules.json` ile karşılaştırıldı: **36 paketin hepsi SDK 57 beklentisine uyuyor.** Tek `react` (19.2.3) ve tek `react-native` (0.86.3) kopyası var. |
| Görseller (Pillow) | Ölçüm sonuçları §3'te. |
| `patch -p1 --dry-run patches/expo+57.0.26.patch` | Temiz uygulanıyor. |
| docs.expo.dev, maratonapp.com | Bu ortamdan erişilemedi (proxy reddi). Expo davranışı `node_modules` içindeki v57 eklenti kaynağından okundu. |

Önem: **P0** = mağaza reddi ya da açılışta çökme · **P1** = yayından önce düzeltilmeli (işlev kaybı, gözlemlenebilirlik, politika riski) · **P2** = iyileştirme.

---

## 1. P0: göndermeden önce

### P0-1 · Supabase ortam değişkenleri EAS'ta yoksa uygulama açılışta çöker (DOĞRULA)

- `src/supabase/client.js:73-80`: `createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, …)` modül yüklenirken çağrılıyor. Değer `undefined` ise supabase-js `supabaseUrl is required` fırlatır, uygulama ilk ekranı göremeden düşer.
- Repoda `.env` yok (yalnız `.env.example`). `eas.json` profillerinde bu değişkenler yok. Yani değerler **yalnız EAS ortam değişkenlerinden** gelebilir; bu ortamdan EAS hesabına erişilemediği için doğrulanamadı.
- **Yapılacak:**
  ```bash
  eas env:list --environment production
  # eksikse:
  eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://<ref>.supabase.co --visibility plaintext
  eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_KEY --value <publishable/anon> --visibility plaintext
  eas env:create --environment production --name EXPO_PUBLIC_SENTRY_DSN   --value <dsn> --visibility plaintext
  ```
  Aynısını `preview` ortamı için de yap. Profili ortama açıkça bağla (`eas.json:33`):
  ```json
  "production": { "environment": "production", "autoIncrement": true, "channel": "production", … }
  "preview":    { "environment": "preview", … }
  ```

### P0-2 · Google Play: `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` → "Photo and Video Permissions" reddi

- Nihai manifestte (introspect) şunlar var: `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`, `READ_MEDIA_VISUAL_USER_SELECTED`. Kaynak: `expo-media-library` eklentisi, `granularPermissions` verilmediğinde üçünü de ekliyor (`node_modules/expo-media-library/plugin/build/withMediaLibrary.js:11,39`).
- Uygulama galeriyi **yalnız yazmak** için kullanıyor: `src/lib/storyShare.js:141` `requestPermissionsAsync(true)` (writeOnly) + `saveToLibraryAsync`. Seçim tarafı `expo-image-picker` (sistem foto seçicisi, izin gerekmez). Play, sık okuma gerektirmeyen uygulamalarda bu izinleri reddediyor.
- Kütüphane kodu kontrol edildi: Android 13+ üzerinde `writeOnly` hiçbir izin istemiyor ve `saveToLibraryAsync` izin kontrolünden geçiyor (`MediaLibraryModule.kt:315-321, 395-397`). İzinleri kaldırmak kaydetmeyi bozmaz.
- **Yapılacak** (`app.json:94-100` ve `app.json:62-67`):
  ```json
  [
    "expo-media-library",
    {
      "savePhotosPermission": "Paylaşım kartını galerine kaydetmek için izin gerekli.",
      "isAccessMediaLocationEnabled": false,
      "granularPermissions": []
    }
  ]
  ```
  ```json
  "android": {
    …
    "permissions": [
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE"
    ],
    "blockedPermissions": [
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.READ_MEDIA_VISUAL_USER_SELECTED"
    ]
  }
  ```
  Kanıt: final `.aab` üzerinde `bundletool dump manifest --bundle app.aab | grep uses-permission`.

### P0-3 · App Store: Support URL sayfası yok

- `web/` içinde `privacy.html`, `terms.html`, `delete-account.html` var; **`support.html` yok.** App Store Connect "Support URL" alanı zorunlu ve iletişim bilgisi içeren gerçek bir sayfa olmalı (Guideline 1.5).
- **Yapılacak:** `web/support.html` (destek e-postası `destek@maratonapp.com`, SSS, hesap silme bağlantısı, yanıt süresi) ekle ve `https://maratonapp.com/support` olarak yayınla. Diğer sayfaların da canlı olduğunu tarayıcıdan doğrula (bu ortamdan erişilemedi).

---

## 2. P1: yayından önce düzelt

### P1-1 · Mikrofon: iOS'ta İngilizce varsayılan izin metni, Android'de `RECORD_AUDIO`

- Nihai Info.plist: `NSMicrophoneUsageDescription = "Allow $(PRODUCT_NAME) to access your microphone"`; nihai Android izinleri: `RECORD_AUDIO`. Kaynak: `expo-image-picker` eklentisi `microphonePermission` verilmediğinde ikisini de ekliyor (`withImagePicker.js:56-61`).
- Uygulama yalnız `mediaTypes: ["images"]` kullanıyor (`src/hooks/useAvatarUpload.js:67,80`, `src/hooks/useAddWrong.js:18`, `src/lib/storyPhoto.js:14`). iOS kaynağında mikrofon API'si yok; yalnız video kaydında `NSMicrophoneUsageDescription` var mı diye bakılıyor (`ImagePickerModule.swift:145`). Kaldırmak güvenli.
- **Yapılacak** (`app.json:87-93`):
  ```json
  [
    "expo-image-picker",
    {
      "photosPermission": "Profil fotoğrafı, yanlış soru fotoğrafı ve story arka planı seçmek için galerine erişmemiz gerekiyor.",
      "cameraPermission": "Profil fotoğrafı ve yanlış soru fotoğrafı çekmek için kameraya erişmemiz gerekiyor.",
      "microphonePermission": false
    }
  ]
  ```
  `false`, iOS anahtarını siler ve Android'de `RECORD_AUDIO`'yu engeller. Metinler kameranın gerçek üç kullanımını da (avatar, yanlış soru, story) anlatacak biçimde genişletildi (5.1.1). Aynı metinler `app.json:21-22` `infoPlist` içinde de var; eklenti metni onları ezer, ikisini aynı tut ya da `infoPlist`tekileri sil.

### P1-2 · Universal Links / App Links doğrulama dosyaları yok

- `app.json:17-19` `applinks:maratonapp.com`, `app.json:31-56` `autoVerify: true` (`/referral`, `/friend`, `/group`). Uygulama bu bağlantıları üretiyor (`src/hooks/useReferrals.js:77`).
- `web/.well-known/` **yok**: ne `apple-app-site-association` ne `assetlinks.json`. Bunlar olmadan iOS bağlantıyı Safari'de açar; Android 12+ doğrulama başarısız olur ve bağlantı tarayıcıda açılır. Davet akışı bozulur.
- **Yapılacak:** `web/.well-known/apple-app-site-association` (uzantısız, `Content-Type: application/json`, yönlendirmesiz HTTPS):
  ```json
  {
    "applinks": {
      "details": [{
        "appIDs": ["<TEAM_ID>.com.ahmeterensiranli.maraton"],
        "components": [{ "/": "/referral/*" }, { "/": "/friend/*" }, { "/": "/group/*" }]
      }]
    }
  }
  ```
  `web/.well-known/assetlinks.json`:
  ```json
  [{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.ahmeterensiranli.maraton",
      "sha256_cert_fingerprints": ["<Play App Signing SHA-256>", "<EAS upload key SHA-256>"]
    }
  }]
  ```
  SHA-256 değerleri: Play Console → Kurulum → Uygulama bütünlüğü → Uygulama imzalama, ve `eas credentials -p android`. Web sunucusunda `/referral/*` gibi yollar için yedek bir sayfa da olmalı (uygulaması olmayan kullanıcı 404 görmesin).

### P1-3 · Android push bildirimleri sessizce çalışmayacak: `google-services.json` yok

- `src/lib/notifications.js:413` `getExpoPushTokenAsync` çağırıyor. Android'de bu FCM ister; `app.json` içinde `android.googleServicesFile` yok. Hata `catch` ile yutuluyor (`:419`), yani Android kullanıcılarına hiç uzak bildirim gitmez ve kimse fark etmez. Yerel bildirimler etkilenmez.
- **Yapılacak:** Firebase projesi → Android uygulaması `com.ahmeterensiranli.maraton` → `google-services.json`. Dosyayı repoya koymadan EAS dosya değişkeni olarak ver:
  ```bash
  eas env:create --environment production --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json --visibility secret
  ```
  `app.json`'ı `app.config.js`'e çevirip `android.googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json"` ver. FCM v1 hizmet hesabı anahtarını `eas credentials -p android` → "Push Notifications (FCM V1)" ile yükle. Play Data Safety'de "Device or other IDs" zaten işaretli; Firebase eklenince değişmez.

### P1-4 · Sentry: üretimde kaynak haritası ve dSYM yüklenmiyor; DSN EAS'ta mı belli değil

- `eas.json:36-38` üretimde `SENTRY_DISABLE_AUTO_UPLOAD=true`. Derleme bu yüzden **kırılmaz** (eklenti org/project eksikliğinde yalnız uyarı veriyor; `export` sırasında da görüldü), ama üretim çökmeleri sembolsüz ve okunmaz gelir.
- `metro.config.js` `.git/info/exclude` içinde (dosyanın ilk satırı "GECICI: yalnız web önizleme"). EAS bu dosyayı yüklemez; yani Sentry'nin `getSentryExpoConfig` debug-id serileştiricisi de yok.
- **Yapılacak:**
  1. `app.json:77`:
     ```json
     ["@sentry/react-native/expo", { "organization": "<org-slug>", "project": "<project-slug>", "url": "https://sentry.io/" }]
     ```
  2. `eas env:create --environment production --name SENTRY_AUTH_TOKEN --value <token> --visibility secret`
  3. `eas.json` production `env`'den `SENTRY_DISABLE_AUTO_UPLOAD` satırını kaldır (development/preview'da kalabilir).
  4. Önizleme mock'larını koruyarak repoya girecek bir `metro.config.js`: `const { getSentryExpoConfig } = require("@sentry/react-native/metro"); const config = getSentryExpoConfig(__dirname);` + mevcut `PREVIEW` koşullu çözücü.
  5. OTA güncellemelerinden sonra: `npx sentry-expo-upload-sourcemaps dist`.
  6. `EXPO_PUBLIC_SENTRY_DSN` P0-1 listesinde; yoksa Sentry tamamen kapalı (`src/lib/errorReporting.js:7-13`).

### P1-5 · Gizlilik bildirimi (privacy manifest) açıkça tanımlı değil; widget eklentisi kapsam dışı

- `app.json` içinde `ios.privacyManifests` yok. Expo şablonu ve pod'ların kendi bildirimleri birleştiriliyor (`react-native`, `async-storage`, `expo-constants`, `expo-file-system`, `expo-notifications`, `expo-media-library`, `react-native-view-shot` kendi `PrivacyInfo.xcprivacy`'sini getiriyor), ama `expo-widgets`, `expo-updates`, `expo-sharing`, `expo-eas-client` `UserDefaults` kullandığı halde bildirim getirmiyor. `expo-widgets` `UserDefaults(suiteName: appGroup)` kullanıyor (`WidgetsStorage.swift:3`): bunun gerekçesi `1C8F.1`, şablonda yok.
- **Yapılacak** (`app.json` → `ios`):
  ```json
  "privacyManifests": {
    "NSPrivacyTracking": false,
    "NSPrivacyTrackingDomains": [],
    "NSPrivacyAccessedAPITypes": [
      { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults", "NSPrivacyAccessedAPITypeReasons": ["CA92.1", "1C8F.1"] },
      { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp", "NSPrivacyAccessedAPITypeReasons": ["C617.1", "0A2A.1", "3B52.1"] },
      { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime", "NSPrivacyAccessedAPITypeReasons": ["35F9.1"] },
      { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryDiskSpace", "NSPrivacyAccessedAPITypeReasons": ["E174.1", "85F4.1"] }
    ],
    "NSPrivacyCollectedDataTypes": [
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailAddress", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeName", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeUserID", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePhotosorVideos", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeOtherUserContent", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeProductInteraction", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAnalytics"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeCrashData", "NSPrivacyCollectedDataTypeLinked": false, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypePerformanceData", "NSPrivacyCollectedDataTypeLinked": false, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] },
      { "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeDeviceID", "NSPrivacyCollectedDataTypeLinked": true, "NSPrivacyCollectedDataTypeTracking": false, "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"] }
    ]
  }
  ```
  Bu liste App Store Connect "App Privacy" etiketiyle (`store/privacy-labels.md`) birebir aynı olmalı.
- Widget eklentisi (`ExpoWidgetsTarget`) ayrı bir ikili; `expo-widgets` ona bildirim eklemiyor. İlk TestFlight yüklemesinden sonra Apple'dan **ITMS-91053** e-postası gelirse eklenti hedefine `UserDefaults: 1C8F.1` içeren bir `PrivacyInfo.xcprivacy` ekleyen küçük bir config plugin gerekir.

### P1-6 · `userInterfaceStyle: "dark"` "Sistem" tema seçeneğini bozuyor

- `app.json:9` `"dark"` → nihai Info.plist `UIUserInterfaceStyle = Dark`. iOS ve Android'de `useColorScheme()` her zaman `"dark"` döner. Ayarlar → Görünüm → "Sistem" (`src/screens/settings/AppearanceScreen.js:17`) açık temalı cihazda da koyu kalır (`src/contexts/ThemeContext.js:49`). Sistem diyalogları, klavye ve seçiciler de hep koyu.
- **Yapılacak:** `"userInterfaceStyle": "automatic"`. Varsayılan tercih zaten `"dark"` (`ThemeContext.js:29`), yani kullanıcı seçmedikçe görünüm değişmez. Splash için koyu/açık ayrımı P2-4'te.

### P1-7 · `pc-api-key.json` `.gitignore` içinde değil

- `eas.json:47` `serviceAccountKeyPath: "./pc-api-key.json"`. Dosya şu an yok, ama kök dizine konduğu anda `git add .` ile Play hizmet hesabı özel anahtarı repoya girer.
- **Yapılacak:** `.gitignore`'a `pc-api-key.json`, `google-services.json`, `GoogleService-Info.plist` ekle. Daha iyisi: anahtarı EAS'a yükle (`eas credentials -p android` → Google Service Account) ve `serviceAccountKeyPath` satırını sil.

### P1-8 · Google Play: ilk sürüm elle yüklenmeli; kapalı test şartı

- `eas.json:46-49` `track: "internal"` doğru başlangıç. Ama Google Play API yeni bir uygulamanın **ilk** paketini kabul etmez: ilk `.aab` Play Console'dan elle yüklenmeli, sonra `eas submit` çalışır.
- Kişisel geliştirici hesabıysa üretime çıkmadan önce 12 test kullanıcısıyla 14 günlük kapalı test zorunlu (`03-magaza-hazirligi.md` §4.4/5 ile aynı).

---

## 3. Kontrol edilen ve uygun bulunanlar

| Madde | Değer / kanıt | Durum |
|---|---|---|
| `name` / `slug` / `version` | `Maraton` / `maraton` / `1.0.0` (`app.json:3-5`) | Uygun |
| `ios.bundleIdentifier` / `android.package` | `com.ahmeterensiranli.maraton` | Uygun |
| `scheme` | `maraton` | Uygun |
| `extra.eas.projectId` + `updates.url` | İkisi aynı UUID `b7c40c1c-…` (`app.json:218-226`); `owner: ahmeterenn` | Uygun |
| `runtimeVersion` | `{ "policy": "appVersion" }` | Uygun (P2-1'e bak) |
| Kanal | `preview` → `preview`, `production` → `production` (`eas.json:31,35`) | Uygun |
| Android derleme türü | `production` profilinde `buildType` yok → varsayılan **app-bundle** | Uygun |
| `autoIncrement` + `appVersionSource: remote` | `eas.json:4,34` | Uygun |
| `submit.production.ios.ascAppId` | `6815480891` | Uygun |
| Android SDK düzeyleri (RN 0.86 varsayılanı, `react-native/gradle/libs.versions.toml`) | `minSdk 24`, `compileSdk 36`, **`targetSdk 36`**, NDK 27.1 | Play'in hedef API şartını karşılıyor |
| iOS dağıtım hedefi | SDK 57 tabanı **16.4** (`Expo.podspec:39`), `expo-widgets` de 16.4 | Uygun; kilit ekranı widget aileleri iOS 16+ |
| 16 KB sayfa boyutu | RN 0.86 + NDK 27; üçüncü taraf yerel `.so` yalnız Sentry (7.x, 16 KB uyumlu) | Uygun. Kanıt: Play Console → App bundle explorer → "16 KB" sütunu |
| Edge-to-edge | SDK 57'de zorunlu ve açık; `expo-status-bar` + `react-native-safe-area-context` | Uygun |
| Predictive back | `predictiveBackGestureEnabled` verilmemiş → varsayılan `false`, manifestte `enableOnBackInvokedCallback=false` | Uygun (P2-6) |
| Şifreleme beyanı | `ITSAppUsesNonExemptEncryption: false` (`app.json:24`) | Uygun (yalnız HTTPS) |
| Sign in with Apple | `usesAppleSignIn: true` + `expo-apple-authentication`; nihai entitlement `com.apple.developer.applesignin` | Uygun |
| App Group | `group.com.ahmeterensiranli.maraton` ana uygulama + widget'ta aynı | Uygun; Apple Developer'da App Group kaydı EAS ile oluşturulur, ilk derlemede onayla |
| `icon.png` | 1024×1024, **RGB, alfa kanalı yok** | Uygun (Apple 1024 pazarlama ikonu şartı) |
| `adaptive-icon.png` | 1024×1024 RGBA; içerik kutusu 313–724 px (≈%40), 66/108 güvenli alanın içinde | Uygun |
| `splash-icon.png` | 1024×1024 RGBA, `imageWidth: 160` | Uygun |
| `notification-icon.png` | 96×96 RGBA, opak piksellerin **tamamı beyaz** (#FFFFFF), geri kalanı şeffaf | Uygun |
| iOS izin metinleri | Kamera, galeri, galeriye kaydetme: Türkçe ve amaca bağlı | Uygun (P1-1'deki genişletme önerisiyle) |
| `NSMicrophoneUsageDescription` | **Şu an var** (İngilizce varsayılan) | P1-1 |
| `patches/expo+57.0.26.patch` | Yüklü `expo` 57.0.26; `patch --dry-run` temiz. Yerel `node_modules`'te **uygulanmamış** (postinstall çalışmamış), EAS'ta `npm ci` → `postinstall` ile uygulanır | Uygun (P2-3) |
| Paket sürümleri | 36/36 SDK 57 beklentisine uyuyor; tek React kopyası | Uygun |
| `react-native-share` | Eklenti `LSApplicationQueriesSchemes: instagram, instagram-stories` + Android `queries` ekliyor; `appId` kodda (`src/lib/storyShare.js:20`) | Uygun |
| JS paketi | `expo export` başarılı | Uygun |

---

## 4. P2: iyileştirmeler

| # | Madde | Dosya | Değişiklik |
|---|---|---|---|
| P2-1 | `appVersion` politikası, yerel kod değiştiği halde `version` artırılmazsa uyumsuz OTA'ya izin verir | `app.json:6` | `"runtimeVersion": { "policy": "fingerprint" }` daha güvenli. Kalırsa kural: her yerel değişiklikte `version` artır. |
| P2-2 | `buildNumber` / `versionCode` yok sayılıyor (`appVersionSource: remote`) ve yanıltıcı | `app.json:15,30` | İki satırı sil ya da yorum olarak README'ye not düş. İlk derlemede EAS "yerelden başlat" diye sorar: `1` kabul et. |
| P2-3 | `expo` `~57.0.26` bir yama sürümüne yükselirse `patch-package` sürüm uyarısı verir, çakışırsa `postinstall` düşer ve EAS derlemesi kırılır | `package.json:34`, `patches/` | `"expo": "57.0.26"` (tam sürüm) ya da yamayı yeni sürüme yeniden üret. Yama yalnız geliştirme HMR'ını etkiliyor; üretime etkisi yok. |
| P2-4 | Splash yalnız koyu | `app.json:103-111` | `userInterfaceStyle: automatic` sonrası: `"dark": { "image": "./assets/splash-icon.png", "backgroundColor": "#1C1C23" }` ve açık için `backgroundColor` açık zemin tonu. |
| P2-5 | Android 13 temalı ikon yok | `app.json:58-61` | `"monochromeImage": "./assets/adaptive-icon-mono.png"` (beyaz/şeffaf, 1024²). |
| P2-6 | Predictive back kapalı | `app.json` → `android` | Gezinti test edildikten sonra `"predictiveBackGestureEnabled": true`. Android 16'da devre dışı bırakma kaldırılacak. |
| P2-7 | Uygulama dili İngilizce görünüyor: `CFBundleDevelopmentRegion = $(DEVELOPMENT_LANGUAGE)` (en). Sistem diyaloğu düğmeleri İngilizce, App Store "Dil" alanı "English" | `app.json` → `ios.infoPlist` | `"CFBundleDevelopmentRegion": "tr"`, `"CFBundleLocalizations": ["tr"]` ya da `"locales": { "tr": "./locales/tr.json" }`. |
| P2-8 | `NSUserNotificationsUsageDescription` geçerli bir iOS anahtarı değil | `app.json:25` | Sil. Zararsız. |
| P2-9 | `READ_EXTERNAL_STORAGE` `app.json`'da `maxSdkVersion` olmadan; media-library eklentisi `WRITE_EXTERNAL_STORAGE`'ı da sınırsız ekliyor ve `requestLegacyExternalStorage=true` yazıyor | `app.json:63` | P0-2'deki listeden çıkarıldı. API 33+ üzerinde etkisiz; Play bunlar için ret vermiyor. |
| P2-10 | `aps-environment = development` (expo-notifications `mode` varsayılanı) | `app.json:79-86` | App Store dışa aktarımında profil değeri `production` ile değişir. Açık olsun istersen `"mode": "production"` ekle. |
| P2-11 | ATS: introspect şablonu `NSAllowsArbitraryLoads: true` gösteriyor (gerçek prebuild şablonu farklı olabilir) | `app.json` → `ios.infoPlist` | Açıkça `"NSAppTransportSecurity": { "NSAllowsArbitraryLoads": false, "NSAllowsLocalNetworking": true }`. |
| P2-12 | `expo-build-properties` boş: varsayılanlar zaten doğru ama sabit değil | `app.json:216` | `["expo-build-properties", { "android": { "compileSdkVersion": 36, "targetSdkVersion": 36, "minSdkVersion": 24 }, "ios": { "deploymentTarget": "16.4" } }]` |
| P2-13 | Node sürümü sabit değil | `eas.json` | `"build": { "base": { "node": "22.13.0" } }` ve profillerde `"extends": "base"` (RN 0.86 motoru: `^20.19.4 \|\| ^22.13.0 \|\| ^24.3.0`). |
| P2-14 | `src/lib/purchases.js:2` `react-native-purchases`'ı içe aktarıyor, paket `package.json`'da yok | `src/lib/purchases.js`, `useSubscription.js`, `usePaywallPurchase.js` | Şu an erişilemez (paket derlendi). Premium açılırken bir ekran bunlara bağlanırsa Metro derlemesi kırılır. Premium işi başlarken `npx expo install react-native-purchases`. |
| P2-15 | `metro.config.js` git dışı (`.git/info/exclude`); EAS varsayılan Metro yapılandırmasıyla derliyor | `metro.config.js` | Bugün zararsız. P1-4'teki Sentry yapılandırmasıyla birlikte repoya alınmalı. |
| P2-16 | `.env.example` olmayan `@react-native-google-signin` eklentisinden söz ediyor | `.env.example` | Google girişi askıda; metni güncelle. |
| P2-17 | `preview` profili `ios.simulator: false` (zaten varsayılan) | `eas.json:25-27` | Gereksiz; silinebilir. |

---

## 5. Mağaza beyanlarıyla SDK uyumu

| SDK | Topladığı | Play Data Safety | App Store App Privacy |
|---|---|---|---|
| Supabase (Auth, Postgres, Storage) | E-posta, ad, kullanıcı kimliği, fotoğraf (avatar, yanlış soru), kullanıcı içeriği, uygulama içi etkileşim (`analytics_events`) | Toplanır = Evet, Paylaşılır = **Hayır** (hizmet sağlayıcı) | Linked, Tracking yok |
| Sentry | Çökme ve performans verisi, cihaz modeli; `sendDefaultPii: false` | Toplanır = Evet, Paylaşılır = **Hayır**. `store/data-safety.md:114-131, 220-221` "Paylaşılır = Evet" diyor: düzelt | Crash/Performance, Not Linked |
| expo-notifications (+ FCM eklenince) | Push token | Device or other IDs = Evet | Device ID, Linked |
| Sign in with Apple | Ad, e-posta (gizli röle olabilir) | (Android'de yok) | Name, Email |
| expo-media-library / image-picker | Fotoğraf yalnız kullanıcı seçince | Photos = Evet (isteğe bağlı) | Photos or Videos |

Reklam SDK'sı, IDFA ve ATT yok: `NSPrivacyTracking: false` doğru. Hesap silme web sayfası var (`web/delete-account.html`); Play Console "Hesap silme URL'si" alanına `https://maratonapp.com/delete-account` gir.

---

## 6. Sıra

1. P0-1: `eas env:list` ile doğrula, eksikleri ekle.
2. P0-2 + P1-1: `app.json` izin değişiklikleri → `npx expo config --type introspect` ile nihai listeyi kontrol et (beklenen Android izinleri: `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `VIBRATE`, `INTERNET`, API ≤32 için depolama, `POST_NOTIFICATIONS`, `CAMERA`).
3. P0-3 + P1-2: `web/support.html` ve `.well-known/` dosyaları → yayınla → `curl -I https://maratonapp.com/.well-known/apple-app-site-association`.
4. P1-3 / P1-4 / P1-5 / P1-6 / P1-7 → `eas build --profile production --platform all`.
5. iOS: TestFlight yüklemesinden sonra Apple e-postalarını (ITMS-90683, ITMS-91053) kontrol et. Android: ilk `.aab`'ı Play Console'dan elle yükle (P1-8), sonra `bundletool dump manifest` ile izinleri doğrula.
