# Yapılacaklar

Unutulmaması gereken, bilerek ertelenmiş işler. Bir madde bitince sil.

---

## Askıya alınmış — geri açılacak

### Google ile giriş (2026-09-20'de kaldırıldı)

**Neden kaldırıldı:** iOS dev build'i `pod install` aşamasında kırılıyordu:

```
The Swift pod `AppCheckCore` depends upon `GoogleUtilities` and
`RecaptchaInterop`, which do not define modules.
```

Paket zaten hiçbir işe yaramıyordu: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` /
`EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` tanımlı olmadığı için Google butonu
uygulamada hiç görünmüyordu. Yani build'i kıran ama karşılığında hiçbir
işlev vermeyen bir bağımlılıktı.

**Geri açmak için sırasıyla:**

1. Google Cloud Console'da OAuth client oluştur (iOS + Web), client ID'leri al.
2. `.env`'e `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` ve
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` ekle.
3. `npm i @react-native-google-signin/google-signin`
4. `app.json` → `plugins` dizisine geri koy:
   ```json
   ["@react-native-google-signin/google-signin",
     { "iosUrlScheme": "com.googleusercontent.apps.<GERÇEK_IOS_CLIENT_ID>" }]
   ```
5. `src/hooks/useSocialAuth.js` içindeki yorum bloğunun yorumunu kaldır
   (2., 7., 8. satırlardaki import/const'lar dahil).
6. **Pod hatası o an geri gelecek.** İki çözümden biri:
   - *Dar kapsamlı (tercih):* config plugin ile `GoogleUtilities`,
     `RecaptchaInterop`, `AppCheckCore` için `:modular_headers => true`.
   - *Geniş kapsamlı (yedek):* `expo-build-properties` kurup
     `ios.useFrameworks: "static"`. Tek satır ama Sentry/RevenueCat/Hermes
     dahil bütün pod'ların bağlanma şeklini değiştirir.

**Not:** Apple ile giriş etkilenmedi, çalışmaya devam ediyor.

---

## Premium (askıda, silinmedi)

`PREMIUM_ENABLED = false` (`src/constants/premium.js`). Kullanıcı tabanı
oluşunca tek bayrakla geri açılır; testler `enabled: true` geçerek gerçek
kuralları doğrulamaya devam ediyor.

---

## Bilinen, henüz düzeltilmemiş

- `DeeperAnalysisSection.js` — "Bu tempoyla sınav günü 71 net" sabit yazı
- `ReviewDoneScreen.js` — "Yarın 4 soru bekliyor" sabit yazı
- `TopicDebtHero` — yüklenirken kısa süre "0 sa" görünüyor
- `AGENTS.md` — accent-ink açıklamasında çelişki
- Sentry expo plugin'inde `organization` / `project` eksik
- "Rota hazır" ekranındaki iki buton farklı yerlere gitmeli (düzeltildi,
  cihazda doğrulanmadı)
- Kurulumu yarıda bırakan kullanıcının takılması (düzeltildi, cihazda
  doğrulanmadı)

---

## Sonraki özellikler

- **Story Kademe B** — doğrudan Instagram'a etiket gönderme. Meta App ID
  gerekiyor; başvuru bugün başlatılabilir. Tek dokunulacak yer
  `src/lib/storyShare.js`.
- **Widget** — `expo-widgets` (iOS, SDK 57'de stabil) +
  `react-native-android-widget`. Ertelendi.
- **Grup sistemi** — `user_rank` hiçbir yerde üretilmiyor ama
  `GroupCard.js:34` render ediyor; guard'lı olduğu için sessizce hiç
  görünmüyor. Codex'in işi.
