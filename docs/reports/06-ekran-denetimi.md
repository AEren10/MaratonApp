# 06 · Ekran ekran yayın öncesi denetim

Tarih: 4 Ekim 2026 · Kapsam: `screenRegistry.js`'teki bütün kayıtlı ekranlar
(110 ad, 15'i `LegacyHomeRedirectScreen`'e bağlı premium rotası) ve yerel
bileşenleri. Salt okuma; kodda değişiklik yapılmadı.

Önceki raporlarda (01–04) olup bu dalda **düzeltilmiş** maddeler tekrar
edilmedi (açılış filmi, kayıt/kurulum çökmesi, tabbar, gruplar, ReviewDone
sahte sayılar, WeeklyGains, Yakında butonu, LGS'ye YKS içeriği (Analiz/Rota),
deneme kayıt filtreleri, deneme kota kapısı, `replace` ile sekme silme).
Hâlâ açık olan eski maddeler §5'te tek satırla anıldı.

Öncelik: **P0** çökme / mağaza reddi · **P1** kırık akış / göze batan hata ·
**P2** küçük.

---

## 0. Otomatik kontroller

| Komut | Sonuç |
|---|---|
| `npm run check` | **Geçti.** sözdizimi (1191 dosya), merge çakışması yok, tasarım sapması baseline altında (fontSize 243/287, fontFamily 169/216, hex 52/71), çalışma zamanı riski yok, tanımsız değişken yok, yetim ekran yok (110), worklet dışı çağrı yok, hareket bütçesi sağlam, toplu import sağlam |
| `npm test` | **910 / 910 geçti**, 0 hata, ~8,5 sn |

Ek olarak bu denetim için dört statik tarama yazıldı (repo dışında, scratchpad):

1. **Sekmeler arası ölü `navigate`**: her ekranın import ağacındaki
   `navigate/push/replace(SCREENS.X)` hedefi, ekranın kayıtlı olduğu sekme
   yığını + kök (ROOT_ONLY) + sekme adlarıyla karşılaştırıldı. Tek bulgu:
   `TopicCardsScreen.js:74` → `HOW_IT_WORKS` (ANALİZ'de yok; rapor 02 P2-4,
   hâlâ açık). Dinamik hedefler (`go(s)`, `navigate(t.screen)`,
   bildirim `openNotification`) elle doğrulandı: temiz.
2. **Palet anahtarları**: kodda geçen bütün `C.xxx`'ler `buildPalette("dark"|"light")`
   çıktısında var. Tanımsız renk yok.
3. **`onPress`'siz buton**: tek bulgu `EditProfileAccountSection.js:47`
   (Sınav satırı, chevron yok; rapor 02 P1-8, hâlâ açık).
4. **Durum bileşeni butonları**: `ErrorState` / `EmptyState`'in preset'ten gelen
   ikincil (ve bir yerde birincil) butonu, handler verilmeden çiziliyor → §1.
5. 11 px altı metin: **yok**. `route.params.x` (`?.`'siz): **yok**.
   Ham ASCII Türkçe UI metni: yalnız premium'a ait `LockedValue` varsayılanı.

---

## 1. P1 — Kırık akış / göze batan hata

### P1-1 · Sunucu hatası ekranında ölü "Çevrimdışı devam et" butonu (17 ekran, Ana Sayfa dahil)

`constants/stateCopy.js:94` `server` preset'i `secondary: "Çevrimdışı devam et"`
taşıyor. `components/design/ErrorState.js:52` ikincil butonu **`onSecondary`
olmasa da** çiziyor. Aşağıdaki 17 kullanımın hiçbiri `onSecondary` vermiyor,
yani hata anında kullanıcının gördüğü iki butondan biri hiçbir şey yapmıyor
(App Review 2.1 "işlemeyen buton" riski, en çok da ana ekranda):

`home/HomeScreen.js:59` · `notifications/NotificationsScreen.js:70` ·
`exam/ForecastAccuracyScreen.js:37` · `exam/ExamDayPlanScreen.js:34` ·
`exam/ExamResultScreen.js:43` · `dersler/TopicStudyScreen.js:104` ·
`social/ShareCardScreen.js:69` · `profile/MilestoneScreen.js:53` ·
`program/views/ProgramCurriculumView.js:36` · `settings/DataExportScreen.js:48` ·
`analysis/SubjectDetailScreen.js:100` · `analysis/WeakAreasScreen.js:58` ·
`study/SummaryScreen.js:82` · `trial/components/TrialDetailStateViews.js:23` ·
`trial/TrialCompareScreen.js:52` · `trial/TrialRecordsScreen.js:63` ·
`analytics/ComparativeScreen.js:77`

**Düzeltme (tek yer):**
```js
// components/design/ErrorState.js:46-57 — EmptyState.js:53-62 için de aynısı
{_primary && onPrimary ? ( <Button …>{_primary}</Button> ) : null}
{_secondary && onSecondary ? ( <Button …>{_secondary}</Button> ) : null}
```
Ana Sayfa'da ikinci buton anlamlı; orada bağlansın:
`HomeScreen.js:59` → `<ErrorState preset="server" onPrimary={h.onRefresh} onSecondary={h.continueOffline} …/>`

Ayrıca `ShareCardScreen.js:69` "Tekrar dene" yazan butona `nav.goBack` bağlı:
`primary="Geri dön"` verin ya da gerçek yeniden yükleme bağlayın.

### P1-2 · Deneme Kayıtları boş halinde iki buton da ölü

`trial/TrialRecordsScreen.js:65`
`<EmptyState preset="trialRecords" style={…} />` — preset "İlk denemeni gir"
ve "Nasıl çalıştığını gör" çiziyor, ikisine de handler yok. Yeni kullanıcının
Analiz → "Tümünü gör"den düştüğü ilk ekran.
```js
<EmptyState preset="trialRecords"
  onPrimary={() => navigation.navigate(SCREENS.TRIAL_ENTRY)}
  secondary={null}   // HOW_IT_WORKS ANALİZ yığınında yok; ya openHere(navigation, TAB_KEYS.PROFIL, SCREENS.HOW_IT_WORKS)
  style={{ paddingHorizontal: GUTTER }} />
```
(P1-1'deki merkezi düzeltme ikinci butonu zaten gizler; birincil yine bağlanmalı.)
Aynı preset `TrialDetailStateViews.js:25`'te de ikincil butonu ölü çiziyor.

### P1-3 · LGS öğrencisi üniversite bölüm eşiği / tercih listesine giriyor

Rapor 04 döneminde Analiz'deki "Simülasyon" ve Rota'daki eşik LGS'den
gizlendi, ama iki giriş açık kaldı:

- `analysis/components/DeeperAnalysisSection.js:27-31` "Net & Sıralama Tahmini"
- `settings/SettingsScreen.js:59` "Net eşiği · Hedef bölüm karşılaştırması"

İkisi de `RankSimulatorScreen`'i açıyor; orada `ThresholdViewSection`
(`getProgramsNearNet`, AYT veri seti) ve `PreferenceListSection` (TYT/AYT,
"say"/"dil") LGS kullanıcısına üniversite bölümleri gösteriyor.
```js
// DeeperAnalysisSection.js:27
isLGS ? null : { name: "Net & Sıralama Tahmini", … },
// SettingsScreen.js:59
{vm.examType !== "lgs" ? <SettingsRow label="Net eşiği" … /> : null}   // vm'den examType döndürün
// RankSimulatorScreen.js:42 sonrası, savunma için
if (examType === "lgs") return <EmptyState title="Bölüm eşiği YKS için" body="LGS hedef netin Hedefler ekranında." primary="Geri dön" onPrimary={navigation.goBack} />;
```
("Yakında" gibi vaat içeren metin kullanmayın; yalnız geri dön yeter.)

### P1-4 · Açık temada Davet ekranındaki "Uygula" butonu görünmez

`social/ReferralScreen.js:140` + `:282-285`: kod girilmeden buton zemini
`C.surface2`, yazı `C.textOnFill`. Açık temada ikisi de `#FFFFFF`
(palet çıktısıyla doğrulandı) → kullanıcı boş beyaz kutu görüyor.
```js
<Text style={[s.applyBtnText, friendCode.trim().length < 4 && { color: C.text3 }]}>Uygula</Text>
```

### P1-5 · Görünür İngilizce "Challenge" / "Streak"

Terim sözlüğü "seri" ve "meydan okuma" diyor (Profil satırı da "Meydan
okumalar"); aynı özellik başka ekranlarda İngilizce:

| Yer | Metin | Öneri |
|---|---|---|
| `settings/SettingsScreen.js:95` | "Challenge" | "Meydan okuma" |
| `social/ChallengeScreen.js:159` | başlık "Challenges" | "Meydan okumalar" |
| `social/ChallengeScreen.js:108` | "Yeni Challenge" | "Yeni meydan okuma" |
| `social/ChallengeScreen.js:69,74,82,177` | "Challenge oluşturulamadı / iptal edilemedi / başladı / reddedildi", "Challenge Oluştur", "Bir challenge oluştur" | "Meydan okuma …" |
| `social/FriendsScreen.js:205-206,213` | "Challenge Başlat" (etiket + a11y) | "Meydan okuma başlat" |
| `settings/NotificationsSettingsScreen.js:89-90` | "Streak Uyarısı", "Streak'in tehlikedeyse…" | "Seri uyarısı", "Serin tehlikedeyse akşam hatırlatırız" |
| `study/useStudySaveController.js:215`, `study/useAddStudyController.js:97` | "jokerin streak'ini korudu!" | "joker serini korudu." |
| `components/common/StreakDetailSheet.js:102` (Ana Sayfa'dan açılıyor) | "Henüz streak yok" | "Seri henüz başlamadı" |

### P1-6 · Rota etkisi cümlesi ekleri sabit, eşitlikte yanlış fiil

`trial/components/TrialDetailRouteImpact.js:10,16`
`Bu deneme tahmini {before}'den {after}'e {verb}.` → 60 için "60'den 60'e
çıkardı". Hem ek hem fiil yanlış (eşitken "çıkardı").
```js
import { numberWithCase } from "../../../lib/turkishSuffix";
const verb = after > before ? "çıkardı" : after < before ? "düşürdü" : "değiştirmedi";
… {`Bu deneme tahmini ${numberWithCase(before, "ablative")} ${numberWithCase(after, "dative")} ${verb}.`}
// eşitse: `Bu deneme tahmini ${before} netten değiştirmedi.` gibi ayrı cümle
```

---

## 2. P2 — Küçük ama düzeltilmeli

### Metin / Türkçe

| Dosya:satır | Sorun | Düzeltme |
|---|---|---|
| `plan/components/TopicDebtHero.js:38-39`, `plan/components/TopicDebtImpactCard.js:32` | `%${weekShare}'i` → %50'i, %40'i (doğrusu 'si, 'ı) | Eksiz kur: `` `Haftalık kapasitenin %${weekShare} kadarı · rahat kapanır` `` |
| `lib/notificationTemplates.js:21` | "Günlük hedefinin %{percent}'i tamam" (aynı sorun, push bildirimi) | "Günlük hedefinde %{percent} tamam." |
| `lib/notificationTemplates.js:20` | Başlık "Bitmemiş görevlerin var", gövde "durak" | "Açık durakların var" |
| `home/components/heroVariants/HomeHeroFinalWeekDebt.js:34` | `${trialStats.best}'i` — net ondalıklı (54,25'i); ek okunuşa uymuyor | `` `En iyi denemende ${formatNet(trialStats.best)} net yaptın — …` `` |
| `settings/NotificationsSettingsScreen.js:103-104` | "Görev Hatırlatıcı" (rapor 01'de de var, açık) | "Durak hatırlatıcı" |
| `calendar/components/DayTasks.js:70,73`, `TaskInputPanel.js:45,55`, `plan/planTaskMappers.js:52` | "Görev ekle", "Kendi görevini yaz", "Senin eklediğin görev" (Program › Ay'da canlı) | "Durak ekle", "Kendi durağını yaz", "Senin eklediğin durak" |
| `wrong-notebook/components/WrongNotebookMineTab.js:179-180` | "hakim ol" (→ hâkim); "30 saniye sürer!" ama ekle ekranı "~15 sn" diyor | "konularına hâkim ol", "15 saniye" |
| `settings/AboutScreen.js:11` | "Maraton Team" | "Maraton ekibi" |
| `settings/AboutScreen.js:37` | Sürüm sabit "v1.0.0"; app.json değişince kayar (Ayarlar zaten app.json'dan okuyor) | `` `v${appConfig.expo.version}` `` (`import appConfig from "../../../app.json"`) |
| `simulator/components/ThresholdViewSection.js:41-42` | `currentNet.toFixed(1)` → "54.3" (nokta); `gapResult.gap` biçimsiz | `formatNet(currentNet)`, `formatNet(gapResult.gap)` |
| `social/ChallengeScreen.js:250` | `{Math.round(oppPct*100)}%` → Türkçe "%50" | `` `%${Math.round(oppPct * 100)}` `` |
| `settings/SettingsScreen.js:72` | İpucu "günlük tekrar" diyor; Bildirimler'de böyle bir anahtar yok | "Durak hatırlatması, seri uyarısı, haftalık rapor" |
| `home/components/heroVariants/HomeHeroFinalWeekDebt.js:96` | Açık durak yokken CTA "Tekrara başla" ama `startTask(null)` **Durak Ekle**'yi açıyor | label `"Durak ekle"` |
| `plan/components/PlanDetailEmptyState.js:16-28` | "ÖNERİLEN 20 dk dönüş durağı" kartı tıklanmıyor; altındaki buton genel "Bugüne durak ekle" | Kartı `Press` yapıp `navigate(SCREENS.ADD_TASK, { durationMin: 20 })` ya da kartı kaldırın |

### Hata metinleri ham (çoğu İngilizce) gösteriliyor

`e.message` doğrudan `showAlert`'e gidiyor; supabase/istemci istisnaları
("Invalid userId", "Apple identity token missing", PostgREST mesajları)
kullanıcıya çıkar. `handleSupabaseError` zaten `error._safeMessage` üretiyor.

`hooks/useEditProfileForm.js:63` · `social/ChallengeScreen.js:84` ·
`social/components/FriendCodeCard.js:58` · `league/groupExitHandler.js:17,29,46` ·
`auth/components/SocialAuthButtons.js:41,52` · `hooks/useFriends.js:98,110,119,156`

```js
showAlert("Hata", e?._safeMessage || "İşlem tamamlanamadı. Tekrar dene.");
```

### Erişilebilirlik (44 px / etiket)

| Dosya:satır | Sorun | Düzeltme |
|---|---|---|
| `social/FriendsScreen.js:132,135` | Kabul/Reddet yalnız ikon, etiket yok; `actionBtn` ≈ 28 px | `accessibilityLabel="İsteği kabul et"` / `"İsteği reddet"`, `hitSlop={8}`, `minHeight: 36` |
| `social/FriendsScreen.js:276-279` (`actionBtn`) | Tüm satır aksiyonları ~28 px | `hitSlop={{top:8,bottom:8,left:4,right:4}}` |
| `social/ChallengeScreen.js:107` | Oluşturma adımında geri: etiket yok | `accessibilityRole="button" accessibilityLabel="Geri"` |
| `social/ChallengeScreen.js:275-283` | "İsteği Geri Çek / İptal Et" 11 px `micro`, dokunma alanı ~16 px, onaysız | `hitSlop={14}`, `minHeight: 44`; `showAlert` ile onay |
| `social/ReferralScreen.js:51,64` | Geri butonu etiketsiz | `accessibilityRole="button" accessibilityLabel="Geri"` |
| `social/components/FriendCodeCard.js:70,73` | Kopyala/Paylaş yalnız ikon | `accessibilityLabel="Kodu kopyala"` / `"Kodu paylaş"` |
| `social/ShareCardScreen.js:52` | Kapat etiketsiz | `accessibilityLabel="Kapat"` |
| `topics/TopicCardsScreen.js:68,74` | Geri ve bilgi ikonları etiketsiz | etiket ekleyin |
| `plan/components/ReorganizeDayModal.js:41`, `TopicPickerModal.js:38,53`, `program/components/StopActionModal.js:69`, `calendar/components/DayTasks.js:31`, `study/components/CustomTimerModal.js:45`, `topics/components/FlashcardActions.js:10,24`, `dersler/components/TopicMasteryRing.js:46` | Kapat/ok/bilgi ikonları etiketsiz | `accessibilityLabel="Kapat"` vb. |
| `notifications/NotificationsScreen.js:134-136` | "Okundu yap" metin butonu ~33 px, etiket belirsiz | `hitSlop={14}`, metin "Tümünü okundu say" |

### Durum (boş / hata / yükleniyor) dürüstlüğü

| Dosya:satır | Sorun | Düzeltme |
|---|---|---|
| `stats/StatsScreen.js:51-55` | Hata dalı yok: istek düşerse "— saat" ve **"0 Deneme"** gösterilir (yanlış sıfır) | `error ? <ErrorState preset="server" onPrimary={reload} /> :` (`useStatsOverview` `error`,`reload` zaten dönüyor) |
| `social/ChallengeScreen.js:48-50` | Yükleme hatası boş liste sayılıyor ("Arkadaşlarınla yarışarak motive ol") | `catch` içinde `setLoadError(true)` + `ErrorState` |
| `social/ChallengeScreen.js:41` | `user` yoksa `setLoading(false)` hiç çağrılmıyor → sonsuz iskelet | `if (!user?.id) { setLoading(false); return; }` |
| `social/RouteCompanionScreen.js:86-87` | Arkadaş yokken boş durumda eylem yok | `actionLabel="Arkadaş ekle" onAction={() => navigation.navigate(SCREENS.FRIENDS)}` |
| `hooks/useNotificationPrefs.js:72` | `setNotifPrefs` sunucu hatasında `try/finally` → yakalanmamış promise reddi, kullanıcıya bilgi yok | `catch { showAlert("Kaydedilemedi", "Ayar cihazında kaldı, bağlantı gelince tekrar dene."); }` |
| `topics/TopicCardsScreen.js:51-55` → `CardDetailScreen.js:19` | `flashcards` hiçbir zaman dolmuyor; her kart boş detay açar (ekran yalnız `maraton://kartlar` derin bağıyla açılıyor) | `routes.js:87` `deepLink: false` yapın ya da kart dokunuşunu `TOPIC_STUDY`'ye yönlendirin |
| `settings/useSettingsActions.js:15-17` | "Yardım" yalnız e-postayı yazan bir uyarı; dokununca posta açılmıyor | `Linking.openURL("mailto:destek@maratonapp.com")` (uyarı yedek kalsın) |
| `social/FriendsScreen.js` + `ReferralScreen.js` | İki farklı 6 haneli kod: "SENİN KODUN" (arkadaş) ve "DAVET KODUN" (davet). Kullanıcı hangisini paylaşacağını bilemez | Birini kaldırın ya da başlıkları "Arkadaşlık kodu" / "Davet kodu" + tek satır açıklama |

### Metin taşması (kullanıcı içeriği)

Satır düzeninde (row) duran uzun ad/konu metinleri `numberOfLines`'sız:
`social/RouteCompanionScreen.js:20,40` (ad, yanında buton),
`social/ChallengeScreen.js:119,221`, `topics/components/CardItem.js:15`,
`plan/components/TaskReasonSheet.js:46`. → `numberOfLines={1}` (başlıklar 2).

---

## 3. P0

Bu turda **yeni P0 bulunmadı.** Doğrulananlar:

- `route.params` erişimlerinin tamamı `?.` ya da `?? {}` ile korumalı
  (`TopicStudyScreen.js:31`, `useWrongDetail.js` varsayılan `{}`).
- Kritik `toFixed` çağrıları ya `?? 0` ile besleniyor (`useTrialDetail.js:63-64`)
  ya da çağrı yeri null'ı süzüyor (`RankSimulatorScreen.js:61` → `ThresholdViewSection`).
- `new Date(x).toLocale…` kullanımları guard'lı (`TrialDetailScreen.js:63`,
  `NotificationsScreen.js:20-23`, `EditProfileAccountSection.js:16-19`).
- Premium: `PREMIUM_ENABLED=false` iken Pro metni gösteren her yer (`RouteAccessGate`,
  `TrialQuotaSheet`, `LockedValue`, Profil "Premium" satırı, `SubjectProgressLockCard`,
  hesap silme notu) ya bayrakla ya da `checkFeature → true` ile erişilemez;
  15 premium rotası `LegacyHomeRedirectScreen`'e bağlı. Yasal metinlerde premium yok.
- Hesap silme (5.1.1(v)) Ayarlar › tehlikeli grup › tam ekran onay ile erişilebilir.
- "Yakında / coming soon / TODO" uyarısı açan buton kalmadı.

---

## 4. Ekran karnesi (kayıtlı 110 ad)

✔ = okundu, sorun yok · ⚠ = bu raporda madde var · ○ = yalnız otomatik
taramalar (nav, palet, onPress, durum bileşeni, params) — temiz.

| Grup | Ekranlar | Durum |
|---|---|---|
| Sekme kökleri | Home ⚠ (P1-1) · Program ○ · Analysis ✔ · Profile ✔ | |
| Auth | Login ✔ · Register ✔ · ForgotPassword ○ · SetNewPassword ○ · Terms/Privacy/Document ✔ | Sosyal giriş hata metni ham (P2) |
| Kurulum | Onboarding/SetupIncomplete/ExamSetup/GoalSetup/LevelTest/RouteReady/NotificationPermission ○ | Bu dalda yeniden yapıldı |
| Rota | Roadmap ✔ · RouteFull ✔ · RouteStopDetail ✔ · RoutePause ○ · RouteRedraw ○ · RouteHabits ○ · TopicDebt ⚠ (ek) | |
| Plan / Program | PlanDetail ⚠ · AddTask ○ · ClassSchedule ○ · Search ○ · TopicStudy ⚠ (P1-1) · SubjectDetail ⚠ (P1-1) | |
| Çalışma | AddStudy ⚠ (streak) · StudyTimer ○ · StudySave ⚠ (streak) · StudySummary ✔ · Summary/WeeklyReview/WeeklyTrialReview ⚠ (P1-1) · StudyHistory/StudyLog ○ · EditStudyLog ○ | |
| Deneme | TrialEntry ✔ · TrialSummary ✔ · TrialDetail ⚠ (P1-6) · TrialCompare ⚠ (P1-1) · TrialRecords ⚠ (P1-2) | |
| Analiz | SubjectList ✔ · SubjectAnalysis ○ · WeakAreas ⚠ (P1-1) · Comparative ⚠ (P1-1) · PublisherDetail ○ · NetForecast ○ · RankSimulator ⚠ (P1-3) · ExamSimulator ○ | |
| Defter | WrongNotebook ⚠ (metin) · AddWrong ○ · WrongDetail ✔ · ReviewSession/SwipeReview/QuickPractice ✔ · ReviewDone ○ · TopicCards ⚠ · CardDetail ⚠ | |
| Sosyal | League ○ (yeni) · Friends ⚠ · Challenge ⚠ · Referral ⚠ (P1-4) · RouteCompanion ⚠ · ShareCard ⚠ | |
| Profil | Level ✔ · Milestone ⚠ (P1-1) · Stats ⚠ · WidgetGuide ○ | |
| Sınav | ExamDayPlan ⚠ (P1-1) · ExamResult ⚠ (P1-1) · ForecastAccuracy ⚠ (P1-1) · ExamDate ○ | |
| Ayarlar | Settings ⚠ (P1-3/5) · Goals ○ · Appearance ○ · EditProfile ⚠ (eski P1-8) · ChangePassword ○ · EditEmail ○ · Notifications ⚠ · NotificationsSettings ⚠ · About ⚠ · HowItWorks ✔ · DataExport ⚠ (P1-1) · AccountDelete ✔ · OfflineQueue ○ | |
| Premium (15) | Paywall … EighthDayLock | `LegacyHomeRedirectScreen` — gösterilmiyor ✔ |

---

## 5. Önceki raporlardan hâlâ açık olanlar (doğrulandı)

| Madde | Yer | Tek satır |
|---|---|---|
| 02 · P1-8 | `settings/components/EditProfileAccountSection.js:47` | Sınav türü satırı dokunulmaz; kurulumu atlayan / yanlış seçen geri dönemez |
| 02 · P2-2 | `EditProfileAccountSection.js:43` | `` `${since}'ten beri` `` → `withCase(since, "ablative")` |
| 02 · P2-4 | `topics/TopicCardsScreen.js:74` | ANALİZ'de `HOW_IT_WORKS` yok → `openHere(navigation, TAB_KEYS.PROFIL, SCREENS.HOW_IT_WORKS)` |
| 01 · terminoloji | `NotificationsSettingsScreen.js:103`, `calendar/*` | "görev" → "durak" (§2) |
| 04 · #3-#5 | Friends / Challenge / Referral | Eski tasarım dili, 300+ satır (AGENTS.md 150 satır kuralı); bu rapordaki P1-4/P1-5 bu ekranlarda |

---

## 6. Önerilen sıra

1. `ErrorState`/`EmptyState`'te handler'sız butonu çizme (P1-1, tek dosya, 17 ekranı düzeltir) + Ana Sayfa `onSecondary`.
2. `TrialRecordsScreen` boş hal `onPrimary` (P1-2).
3. LGS'den "Net & Sıralama Tahmini" ve "Net eşiği"ni gizle (P1-3).
4. Referral "Uygula" açık tema rengi (P1-4).
5. Challenge/Streak metinleri (P1-5) ve `TrialDetailRouteImpact` ekleri (P1-6).
6. §2 tabloları (yarım gün).
