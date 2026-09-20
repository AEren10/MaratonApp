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
- **Sentry kurulumu hiç yapılmamış.** Ne `sentry.properties` var, ne plugin'de
  `organization` / `project`. Bu yüzden `development` ve `preview` profillerinde
  `SENTRY_DISABLE_AUTO_UPLOAD=true` ile source map yüklemesi kapatıldı.
  **`production` profilinde kapatılmadı** — mağazaya çıkmadan önce gerçek bir
  Sentry projesi açıp org/project slug'ını girmek gerekiyor, yoksa production
  build'i aynı hatayla kırılır ve crash raporları okunamaz kalır.
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
- **Grup sistemi** — Tamamlandı ve `main`'e merge edildi. `user_rank` ve tüm grup arayüzleri entegre.

---

## Canlı Supabase — 20 Eylül 04:10 itibarıyla senkron

Beş migration da canlıda doğrulandı. MCP artık OAuth ile bağlı, canlıya
bakabiliyorum.

Bilinen küçük sapma: `public.create_group(p_name text)` tek argümanlı eski
sürüm canlıda duruyor, migration onu `DROP` etmesine rağmen. Zararsız —
`SECURITY DEFINER` değil, `search_path` kilitli, üç argümanlıyı varsayılanlarla
çağırıyor. İstemci hep üç argüman gönderdiği için hiç çağrılmıyor.

---

## Çözülmüş: veritabanını yakan sonsuz döngü (20 Eylül)

`transition_route_stop`, sürüm çakışmasını `ERRCODE 40001` ile bildiriyordu.
`40001` = *serialization_failure*, yani "geçici çakışma, aynı isteği tekrar
gönder". PostgREST bu tavsiyeye uydu. Ama sürüm çakışması geçici değil —
istemcinin beklediği sürüm eskimiş, aynı sürümle bin kere denese bin kere aynı
cevabı alır.

Sonuç: **19 gün boyunca saniyede tam 100 istek**, 302 milyon geri alınan işlem,
veritabanı süresinin %98,7'si, ve Supabase'in "kaynaklar tükeniyor" uyarısı.

Düzeltme: `PT409` — PostgREST bunu doğrudan HTTP 409 Conflict'e çevirir ve
tekrar etmez. Uygulandıktan sonra döngü aynı dakika içinde durdu (ölçüldü:
3 saniyede 0 yeni geri alma, öncesinde ~300).

**Ders:** `40001` ve `40P01` (deadlock) "tekrar dene" anlamına gelir. Kalıcı bir
iş kuralı ihlali için asla bu kodları kullanma. Yeni RPC yazarken kalıcı hatada
`PTxxx` kullan.

---

## Analiz ekranı — yarım kalan tek şey

`AnalysisInsightsCard` ("BU HAFTA NE OKUYORUZ") artık dürüst boş halini
gösteriyor, ama **gerçek içgörü üretimi hiç bağlanmadı** — ekrana `insights`
prop'u geçilmiyor. Yani o kart şu an hiçbir kullanıcıda dolmayacak.

Kaynak var: `useRecommendations` / `src/lib/smartNudge.js` zaten öneri
üretiyor. Bağlanması gereken tek şey `AnalysisScreen` → `insights={...}`.

Eskiden herkese sabit üç cümle yazıyordu ("Matematik netin son 5 denemede
düşüşte"), o yüzden kimse eksik olduğunu fark etmemişti.
