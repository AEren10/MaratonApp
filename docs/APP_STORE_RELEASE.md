# Maraton — App Store / Play Store Yayinlama Rehberi

## On Hazirlik

### Asset gereksinimleri
- `assets/icon.png` — 1024x1024 px, kose yumusatma yok (iOS otomatik)
- `assets/adaptive-icon.png` — 1024x1024 px, transparan zemin (Android)
- `assets/splash-icon.png` — 1284x2778 px, koyu zemin
- `assets/favicon.png` — 48x48 px (web icin)
- Store screenshot'lari (en az 3 adet, sirasiyla iPhone 6.7", 5.5" boyutlari)

### Hesaplar
- Apple Developer hesabi ($99/yil)
- Google Play Developer hesabi ($25 bir kerelik)
- Expo hesabi (ucretsiz)

### EAS CLI kurulumu
```
npm install -g eas-cli
eas login
eas init
# Bu islem app.json'daki eas.projectId'yi otomatik doldurur
```

## Build (EAS)

### Preview build (test icin)
```
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### Production build
```
eas build --profile production --platform all
```

## Submit

### iOS App Store
```
eas submit --platform ios
```
Gerekli bilgiler:
- Apple ID
- App Store Connect App ID (ascAppId)
- Apple Team ID

### Google Play Store
```
eas submit --platform android
```
Gerekli: Google Play Console service account JSON dosyasi (`pc-api-key.json`).

## Kontrol Listesi

### Kod
- [ ] DEV_BYPASS false ([src/contexts/AuthContext.js](../src/contexts/AuthContext.js))
- [ ] .env.local commitlenmedi (.gitignore'da)
- [ ] console.log kalmadi production'da
- [ ] EAS projectId app.json'a eklendi

### Supabase
- [ ] Tum migration'lar production database'de calistirildi
- [ ] Storage bucket'lari olusturuldu (`avatars`, `wrong-questions`)
- [ ] Email confirmation politikasi karar verildi
- [ ] RLS policy'leri test edildi

### Store metadata
- [ ] App ikonu, splash hazirlandi
- [ ] App store screenshot'lari hazirlandi (en az 3)
- [ ] App description (TR ve EN) yazildi
- [ ] Privacy policy URL hazirlandi
- [ ] Support URL hazirlandi
- [ ] Yas siniri belirlendi (3+ yeterli)
- [ ] Kategori secimi: Education

### iOS ozel
- [ ] Camera/Photo permission acikalamalari Turkce
- [ ] ITSAppUsesNonExemptEncryption: false (kripto kullanmiyoruz)
- [ ] App Transport Security HTTPS only

### Android ozel
- [ ] Adaptive icon hazir
- [ ] versionCode artirilarak her surumde guncelleniyor
- [ ] Play Store icin signing key olusturuldu

## OTA Updates (Expo)

Kucuk degisiklikler icin yeniden build gerekmiyor:
```
eas update --branch production --message "Hata duzeltmesi"
```

## Sorun Giderme

### Build basarisiz oluyor
- `npx expo-doctor` calistir
- `package.json` versiyon uyumluluklarini kontrol et
- `expo install --fix` ile bagimliliklari guncelle

### iOS submit reddedildi
- Privacy disclosure formunu doldur (App Store Connect)
- Test login bilgileri sagla (Apple inceleyicisi icin)

### Android internal track'te kaldi
- Production track'e cikarmadan once minimum 14 gun internal/closed testing yap
