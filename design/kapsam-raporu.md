# Tasarım aktarımı · Kapsam raporu

**Tarih:** 2026-09-13 · **Yöntem:** salt okuma denetimi. Commit mesajlarına güvenilmedi; her
satır için dosya açıldı ya da import/token izine bakıldı (`STEP`/`GUTTER`/`components/design`
= yeni dil; `SPACING`/`RADIUS`/`SHADOWS`/`GlowBackground`/`SparkBurst`/`LinearGradient`/
satır içi sabit piksel = eski dil). Cihazda hiçbir şey çalıştırılmadı.

Kaynak: `design/extracted/Maraton Uygulama.dc.html` içindeki `data-screen-label` listesi,
dosyadaki sırayla. **Dosyada 170 artboard var** ("95 hedef" bunların navigasyon hedefi olan
alt kümesiydi; geri kalanı aynı ekranın halleri, bileşen durumları, OS görselleri ve sosyal).

---

## Özet

### 170 artboard

| Durum | Adet |
|---|---|
| ✅ aktarıldı | **70** |
| 🟡 var ama eski tasarımda / tasarımla örtüşmüyor | **42** |
| ⬜ yok | **26** |
| 🔴 engelli (arka uç / veri yok) | **8** |
| ⏳ şu an yapılıyor (AKIŞ 14 + 16, başka ajanlar) | **10** |
| kapsam dışı (8 sosyal + 2 OS/widget + 4 ödeme reddedildi) | **14** |
| **Toplam** | **170** |

### 95 navigasyon hedefi (eski çerçeve, karşılaştırma için)

**46/95 aktarıldı · 19 eski tasarımda · 17 yok · 3 engelli · 9 yapılıyor · 1 reddedildi.**
Bu 46'nın **5'i yetim** (ekran var, hiçbir yer oraya götürmüyor — aşağıya bak).

### Varyant / durum (hedef olmayan 73 artboard)

95 hedef 97 artboard'a denk geliyor ("Deneme Gir" tek hedef, üç artboard). Kalan 73:
24 ✅ · 21 🟡 · 9 ⬜ · 5 🔴 · 1 ⏳ · 13 kapsam dışı.

### Lejant

- ✅ — ekran/hal kodda var, kayıtlı, yeni dili görünür biçimde izliyor. Bir hal (ör. "Deneme Gir
  2/3", "Boş Gün") ancak **o hal kodda tasarıma göre çiziliyorsa** ✅; üst ekranın var olması yetmez.
- 🟡 — kodda karşılığı var ama eski görsel dil ya da tasarımdaki içerik/biçim yok (ör. tasarım tam
  ekran, kod diyalog).
- ⬜ — karşılığı yok. 🔴 — arka uç/veri eksikliği yüzünden yapılamaz. ⏳ — başka ajanda.
- **yetim** — ✅ ekran var ama giriş noktası bulunamadı (grep: `navigate(SCREENS.X)`,
  `screens.X`, `screen: SCREENS.X`; deep link sayılmadı).

---

## 170 artboard · satır satır

Başlıklar yalnız okumayı kolaylaştırır; numara dosyadaki sıradır.

### Günlük döngü (AKIŞ 1)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 1 | Ana Sayfa | ekran (hedef) | `src/screens/home/HomeScreen.js` | 🟡 | `HomeHero` yeni (dev sayı, rota grafiği, özet şeridi, CTA). Gövde eski: `HomeHeader` `LinearGradient` avatar, `ExamCountdown`, `HomeCoachNudge`, `TodayPlanCard` (330 satır, `SPACING`), `SubjectMomentum`, `WeeklyActivityCard`, hızlı eylemler, `WrappedBanner`. Tasarımda header + hero + CTA + "Son çalışmaların" listesi var; kart enflasyonu tam tersini yapıyor. |
| 2 | Çalışma Oturumu | ekran (hedef) | `src/screens/study/StudyTimerScreen.js` | ✅ | |
| 3 | Oturum Bitti | ekran (hedef) | `src/screens/study/StudySummaryScreen.js` | ✅ | |
| 4 | Sırada Ne Var | ekran (hedef) | — | ⬜ | Sınav sonrası "tercih dönemi / ikinci sezon" ekranı. Bölüm/kontenjan verisine bağlı (bkz. kararlar). |
| 5 | Günün Özeti | ekran (hedef) | `src/screens/study/SummaryScreen.js` (`period=day`) | ✅ | **yetim** — `SCREENS.SUMMARY`'ye hiçbir yer navigate etmiyor, yalnız deep link `ozet/:period`. |
| 6 | Haftalık Özet | ekran (hedef) | `src/screens/home/WeeklyReviewScreen.js` (eski) · `SummaryScreen` week | 🟡 | Erişilen ekran eski `WeeklyReviewScreen` (`SPACING`, `SHADOWS`). Yeni `SummaryScreen` week modu `ready:false` → "hazırlanıyor" boş durumu (`src/hooks/useSummary.js:28-44`). |
| 7 | Ayın Özeti | ekran (hedef) | `SummaryScreen` month (iskelet) | ⬜ | Veri bağlanmadı, yalnız boş durum gösteriyor. |
| 8 | Ayın Özeti Tipografik | aynı ekranın hali | — | ⬜ | |
| 9 | Boş Durumlar | bileşen durumu (Defter boş) | `src/screens/wrong-notebook/components/WrongNotebookMineTab.js` | 🟡 | Artboard aslında "Defter" boş hali (kesikli çerçeve, "İlk yanlışını ekle."). Defter eski dilde. |

### Rota derinliği (AKIŞ 2)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 10 | Rota Detay | ekran (hedef) | `src/screens/roadmap/RoadmapScreen.js` | 🟡 | Kök `SPACING`, eski `common/EmptyState`; gövde `RouteCreationCard`, `RouteNextActionPanel`, `RouteDebtCard`, `RouteProgressHeader`, `RouteWeekCard` — hepsi eski token, kart yığını. Net grafiği bağlanmış ama ekran dili eski. |
| 11 | Rotanın tamamı | ekran (hedef) | `RoadmapScreen` hafta listesi (`RouteWeekCard`) | 🟡 | Ayrı ekran yok; "Rotanın tamamı" şeridi Rota Detay'a gidiyor. Tasarımdaki "7/11 durak" + segment çubuğu yok. |
| 12 | Durak Detayı | ekran (hedef) | `src/screens/plan/PlanDetailScreen.js` + `components/TaskReasonSheet.js` | 🟡 | `PlanDetailScreen` **`GlowBackground`** kullanıyor (ölü primitif). Tasarımdaki "4. DURAK" tek durak sayfası birebir yok. |
| 13 | Ara Verme | ekran (hedef) | `src/screens/roadmap/useRoadmapConfirmations.js` → `AppModal` | 🟡 | Kopya tasarımdan alınmış ama tam ekran açıklama kartı yerine eski `AppModal` diyaloğu. |
| 14 | Rota Donduruldu | aynı ekranın hali (Ana Sayfa) | `src/screens/home/components/heroVariants/HomeHeroFrozen.js` | ✅ | |
| 15 | Senaryolar | ekran (hedef) | `src/screens/forecast/NetForecastScreen.js` | ✅ | Giriş: Analiz kısayol satırı. |
| 16 | Bölüm Eşiği | ekran (hedef) | `src/screens/simulator/RankSimulatorScreen.js` | ✅ | Ekran taban net verisi olmadığını açıkça söylüyor. |
| 17 | Rotayı Yeniden Çiz | ekran (hedef) | `useRoadmapConfirmations.js` → `AppModal` | 🟡 | 13 ile aynı durum: "DEĞİŞİR / DEĞİŞMEZ" kartlı tam ekran yok. |

### Veri girişi ve deneme kaydı (AKIŞ 3–4)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 18 | Hızlı Ekle | sheet (hedef) | `src/screens/trial/QuickAddSheet.js` | ✅ | |
| 19 | Deneme Gir 1/3 | aynı ekranın hali | `src/screens/trial/components/TrialEntryStep1.js` | 🟡 | Adım yapısı ve kopya tasarımdan; stil `SPACING`, `springify()` (zıplayan hareket, tasarım dışı). |
| 20 | Deneme Gir 2/3 | aynı ekranın hali | `TrialEntryStep2.js` | 🟡 | Aynı. |
| 21 | Deneme Gir 3/3 | aynı ekranın hali | `TrialEntryStep3.js` + `src/screens/trial/trialEntryStyles.js` | 🟡 | `trialEntryStyles` tamamen eski token, `C.accent + "18"` gibi satır içi alfa. |
| 22 | Fotoğrafa Dön | aynı ekranın hali (Deneme Detayı) | — | 🔴 | Deneme kaydında kaynak fotoğraf/OCR yok. |
| 23 | Deneme Detayı | ekran (hedef) | `src/screens/trial/TrialDetailScreen.js` | ✅ | |
| 24 | Fotoğraftan Oku | ekran (hedef) | yalnız `src/domain/ocr/trialOcrParser.js` | 🔴 | OCR servisi yok. |
| 25 | Okuma Onayı | ekran (hedef) | — | 🔴 | OCR'a bağlı. |
| 26 | Kayıt · Ölçülmüş | aynı ekranın hali | `src/screens/study/StudySaveScreen.js` (benzer iş) | 🟡 | Süre ölçülmüş kayıt işini StudySave yapıyor ama "Ne çalıştın?" başlıklı bu hal ayrıca kurulmadı. **Eşleme belirsiz.** |
| 27 | Kayıt · Elle | aynı ekranın hali | `src/screens/study/AddStudyScreen.js` | 🟡 | 344 satır, `SPACING`/`RADIUS`, eski `SubjectPicker`. |
| 28 | Kaydı Düzenle | ekran (hedef) | — | ⬜ | `updateStudyLog` var (`src/supabase/studyLogs.js:79`) ama hiçbir ekran çağırmıyor; yalnız silme var (`StudyLogScreen`). **Engelli değil.** |
| 29 | Zor Deneme | aynı ekranın hali | `src/screens/trial/components/TrialDetailDifficultyCard.js` | ✅ | |
| 30 | Deneme Özeti | ekran (hedef) · imza anı | `src/screens/trial/TrialSummaryScreen.js` | 🟡 | **`LinearGradient` + `SparkBurst`** — ölü primitif ve "konfeti yok" kuralı ihlali. İmza anı ("hat eski halden yeni hale geçer") yok. |

### Analiz ve defter (AKIŞ 5–6)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 31 | Analiz | ekran (sekme kökü) | `src/screens/analysis/AnalysisScreen.js` | ✅ | `TrialFilter`, `AnalysisPracticeSection` hâlâ `SPACING`; `MoodTrend` denetlenmedi. |
| 32 | Deneme Kayıtları | ekran (hedef) | `src/screens/trial/TrialRecordsScreen.js` | ✅ | |
| 33 | Konu İlerlemesi | ekran (hedef) | `src/screens/analysis/SubjectListScreen.js` | ✅ | |
| 34 | Yanlış Defteri | ekran (hedef) | `src/screens/wrong-notebook/WrongNotebookScreen.js` | 🟡 | `SHADOWS.orange`, sabit piksel stiller, `CommunityTab` (sosyal) hâlâ sekme olarak içeride. |
| 35 | Öncelikli Konular | ekran (hedef) | `src/screens/analysis/WeakAreasScreen.js` | ✅ | **yetim** — `WEAK_AREAS`'a hiçbir yer navigate etmiyor. |
| 36 | Deneme Karşılaştırma | ekran (hedef) | `src/screens/trial/TrialCompareScreen.js` | ✅ | |
| 37 | Yanlış Ekle | ekran (hedef) | `src/screens/wrong-notebook/AddWrongScreen.js` | 🟡 | 414 satır, satır içi `fontSize`/`padding`/`borderRadius` sabitleri, `C.bg + "CC"`. |
| 38 | Yanlış Detayı | ekran (hedef) | `src/screens/wrong-notebook/WrongDetailScreen.js` | 🟡 | 21 eski token kullanımı. |
| 39 | Soru Detayı | ekran (hedef) · **içerik sosyal** | `WrongDetailScreen` (`community: true`) | 🟡 | Artboard bir topluluk sorusu (yazar "Elif K.", cevaplar). Sosyal v1 dışı kararıyla çelişiyor → karar gerekli. |
| 40 | Tekrar | ekran (hedef) | `src/screens/wrong-notebook/ReviewSessionScreen.js` (+ `SwipeReviewScreen`) | 🟡 | İkisi de eski token. |
| 41 | Tekrar Bitti | ekran (hedef) | `src/screens/wrong-notebook/ReviewDoneScreen.js` | ✅ | |

### Plan ve duraklar (AKIŞ 7)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 42 | Yol Haritası | ekran (hedef) | — | ⬜ | Artboard "MÜFREDAT İLERLEMESİ 61/129 konu" ekranı. `tabAssignment.js` bunu `ROADMAP`'e eşlemiş ve `RoadmapScreen` başlığı "Yol Haritası" ama içerik rota haftaları — **yanlış eşleme**. |
| 43 | Program Hub | ekran (sekme kökü) | `src/screens/dersler/DerslerScreen.js` | ✅ | Haftalık/Aylık segment yok; alt `SubjectsSection` eski token; Plan vs Gerçek / Konu Borcu'na satır yok. |
| 44 | Takvim ve Seri | ekran (hedef) | `src/screens/calendar/CalendarScreen.js` (kısmi) | 🟡 | Artboard seri halkası + Haftalık/Aylık segment; kodda yalnız ay ızgarası. |
| 45 | Gün Detayı | ekran (hedef) | `calendar/components/DayDetailSheet.js`, `DayDetails.js` | ✅ | "Planlanan" süre kaynağı olmadığı için bilinçli olarak yok (durum notu). |
| 46 | Boş Gün | aynı ekranın hali | `EmptyState preset="calendarEmptyDay"` | ✅ | |
| 47 | Program | ekran (hedef) | `DerslerScreen` gün şeridi (`WeekDayStrip`) | 🟡 | Ayrı ekran yok; hub'daki gün şeridi kısmen karşılıyor. **Eşleme belirsiz.** |
| 48 | Ders Programı | ekran (hedef) | — | ⬜ | |
| 49 | Takvim | ekran (hedef) | `CalendarScreen.js` | ✅ | Hafta/Ay segmenti yok. |
| 50 | Durak Ekle | modal (hedef) | `src/screens/plan/AddTaskScreen.js` | ✅ | |
| 51 | Konu Detayı | ekran (hedef) | `src/screens/dersler/TopicStudyScreen.js` | ✅ | |
| 52 | Ders Konuları | ekran (hedef) | `src/screens/analysis/SubjectDetailScreen.js` | ✅ | |
| 53 | Konu Borcu | ekran (hedef) | `src/screens/plan/TopicDebtScreen.js` | ✅ | Giriş yalnız eski Rota Detay'dan ve yetim Plan vs Gerçek'ten. |
| 54 | Plan vs Gerçek | ekran (hedef) | `src/screens/plan/PlanVsActualScreen.js` | ✅ | **yetim** — `PLAN_VS_ACTUAL`'a hiçbir yer navigate etmiyor. Ayrıca `tabAssignment.js:48` `COMPARATIVE`'i de "Plan vs Gercek" diye etiketliyor (yanlış yorum). |
| 55 | Borç Dağıtıldı | aynı ekranın hali | — | ⬜ | Dağıt butonu var; sonrasındaki "12 sa üç haftaya bölündü" sonuç hali yok. |
| 56 | Boşluğu Kapatma Planı | ekran (hedef) | — | ⬜ | Plan vs Gerçek'te metin + Konu Borcu'na link var; üç seçenekli plan ekranı yok. `gapClosurePlan` hesabı var (`src/hooks/usePlanVsActual.js`). |
| 57 | Aylık Plan | ekran (hedef) | — | ⬜ | |

### Oturum detayları (AKIŞ 8)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 58 | Oturumu Etiketle | ekran (hedef) | `src/screens/study/StudySaveScreen.js` | ✅ | |
| 59 | Oturum Kurtarıldı | aynı ekranın hali | `StudyTimerScreen.js:28-38` → `AppModal` | 🟡 | Mantık var; tasarımdaki "Süreni kurtardık · 42 dakika" tam ekran onay + süre düzeltme yok. |
| 60 | Çalışma Geçmişi | ekran (hedef) | `src/screens/study/StudyHistoryScreen.js` + `StudyLogScreen.js` | 🟡 | İki eski ekran aynı işi yapıyor (Ayarlar → StudyLog, Sayaç → StudyHistory). |
| 61 | Kilit Ekranı | OS / widget | — | kapsam dışı | |

### Profil (AKIŞ 9)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 62 | Profil | ekran (sekme kökü) | `src/screens/profile/ProfileScreen.js` | ✅ | `LeagueMiniCard` (sosyal, eski token) hâlâ çiziliyor. |
| 63 | Seviye | ekran (hedef) | `src/screens/profile/LevelScreen.js` | ✅ | |
| 64 | Kilometre Taşı | ekran (hedef) | `src/screens/profile/MilestoneScreen.js` | ✅ | |
| 65 | Paylaşım Kartı | ekran (hedef) | `src/screens/social/ShareCardScreen.js` | ✅ | |
| 66 | Kart Modları | aynı ekranın hali | — | ⬜ | "Emek / İvme / Tam" seçici yok. |
| 67 | Neye Göre Öneriyoruz | ekran (hedef) | `src/screens/settings/HowItWorksScreen.js` | ✅ | |

### Sosyal (AKIŞ 10)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 68 | Topluluk | sosyal v1 dışı | `wrong-notebook/CommunityTab.js` (eski, erişilebilir) | kapsam dışı | |
| 69 | Lig | sosyal v1 dışı | `league/LeagueScreen.js` (`GlowBackground`) | kapsam dışı | Profil ve Ayarlar'dan hâlâ erişilebilir. |
| 70 | Davet | sosyal v1 dışı | `social/ReferralScreen.js` | kapsam dışı | |
| 71 | Yol Arkadaşın | sosyal v1 dışı | `social/RouteCompanionScreen.js` | kapsam dışı | |
| 72 | Arama | ekran (sosyal grubunda; v1'e konu/defter araması olarak alındı) | `src/screens/search/SearchScreen.js` | ✅ | Program Hub ve Ders Konuları'ndan açılıyor. |
| 73 | Soru Sor | sosyal v1 dışı | — | kapsam dışı | |
| 74 | Cevap Yaz | sosyal v1 dışı | `wrong-notebook/components/AnswerThread.js` (eski) | kapsam dışı | |

### Ayarlar (AKIŞ 11)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 75 | Ayarlar | ekran (hedef) | `src/screens/settings/SettingsScreen.js` | ✅ | Hâlâ 4 sosyal satır içeriyor (`:177-180`). |
| 76 | Profil Düzenle | modal (hedef) | `settings/EditProfileScreen.js` | ✅ | |
| 77 | Bildirim Halleri | bileşen durumu (bildirim metinleri) | `src/lib/notificationTemplates.js` | 🟡 | Metinler eski ton ("Streak'in tehlikede!", "Seriyi bozma!"); tasarım "Bugünkü durağın hazır". `src/lib/notifications.js` şu an başka ajanda değişiyor. |
| 78 | Bildirimler | ekran (hedef, gelen kutusu) | — | 🔴 | Tablo, RLS, üreticiler, okundu durumu yok. |
| 79 | Görünüm | ekran (hedef) | `settings/AppearanceScreen.js` | ✅ | |
| 80 | Açık Tema Ana Sayfa | tema varyantı | `src/themes/palette.js` light + HomeScreen | 🟡 | Palet light var; ekranın kendisi 🟡 olduğu için sonuç 🟡. Cihazda görülmedi. |
| 81 | Açık Tema Defter | tema varyantı | palette light + WrongNotebookScreen | 🟡 | Defter eski; `SHADOWS` light'ta farklı davranır. |
| 82 | Gizlilik | ekran (hedef) | `settings/PrivacyScreen.js` | ✅ | |
| 83 | Belge | ekran (hedef) | `settings/DocumentScreen.js` | ✅ | KVKK aydınlatma metni içeriği yok (yayın engeli, sende). |
| 84 | Veri İndir | ekran (hedef) | `settings/components/DataExportRow.js` | 🟡 | Yalnız satır (eski token); "İÇİNDE NE VAR" sayfası yok. İşlev çalışıyor. |
| 85 | Hesap Silme | ekran (hedef) | `settings/useSettingsActions.js:24` → `AppModal` | 🟡 | İşlev var; "SİLİNECEK 362 gün / 3.480 soru" tam ekran yok. |
| 86 | Hedef Düzenle | ekran (hedef) | `settings/GoalsScreen.js` | ✅ | |
| 87 | Tarih Seçici | modal (hedef) | `settings/ExamDateScreen.js` | ✅ | |

### Hesap ve kurulum (AKIŞ 12)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 88 | Karşılama | ekran (hedef) | `onboarding/OnboardingScreen.js` | ✅ | |
| 89 | Giriş | ekran (hedef) | `auth/LoginScreen.js` | ✅ | |
| 90 | Kayıt | ekran (hedef) | `auth/RegisterScreen.js` | ✅ | |
| 91 | Şifre Sıfırla | ekran (hedef) | `auth/ForgotPasswordScreen.js` | ✅ | `SetNewPasswordScreen` (tasarımda karşılığı yok) hâlâ `SPACING`. |
| 92 | Bağlantı Gönderildi | aynı ekranın hali | `ForgotPasswordScreen` → `EmailSentPanel` | ✅ | |
| 93 | Hedef Seç | ekran (hedef) | `onboarding/ExamSetupScreen.js` + `GoalSetupScreen.js` | ✅ | |
| 94 | Bölümler | ekran (hedef) | — (`src/data/programs.js` statik 2024 listesi) | ⬜ | Bölüm seçici kararı sende (durum notu karar 3). |
| 95 | Tercih Listesi | ekran (hedef) | — (`src/domain/preference/preferenceEngine.js` yalnız motor) | ⬜ | Güncel kontenjan/taban verisi yok; karar + veri. |
| 96 | Seviye Testi | ekran (hedef) | `onboarding/LevelTestScreen.js` | ✅ | |
| 97 | Rota Hazır | ekran (hedef) | `onboarding/RouteReadyScreen.js` | ✅ | |
| 98 | Bildirim İzni | ekran (hedef) | `onboarding/NotificationPermissionScreen.js` | ✅ | **yetim** — Rota Hazır doğrudan `MainTabs → ROADMAP`'e reset ediyor (`RouteReadyScreen.js:47-50`); `NOTIFICATION_PERMISSION`'a giden yol yok. |
| 99 | Sistem İzni | OS diyaloğu | — | kapsam dışı | |
| 100 | İlk Gün | aynı ekranın hali (Ana Sayfa) | — | ⬜ | Hayalet "0", kesikli rota hattı; Home'da özel ilk-gün hali yok. |
| 101 | Kurulum Yarım | aynı ekranın hali | `onboarding/SetupIncompleteScreen.js` | ✅ | |

### Premium (AKIŞ 13, 13A, 13B)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 102 | Paywall Anı | bileşen modu (Paywall) | `src/screens/premium/PaywallScreen.js` | 🟡 | Bağlam bloğu yeni; kabuk eski: `SPACING`/`RADIUS`, CTA'da `SHADOWS.fab` (gölge = kural ihlali), bağlamsız halde taç ikonu + "Sınırsız eriş, tam performans". |
| 103 | Premium | ekran (hedef) | `premium/PremiumScreen.js` | ✅ | |
| 104 | Abonelik | ekran (hedef) | `premium/SubscriptionScreen.js` | ✅ | |
| 105 | Abonelik İptali | modal (hedef) | `premium/CancelSubscriptionScreen.js` | ✅ | |
| 106 | Story · ÇALIŞMA GÜNÜ | bileşen modu (StoryCard) | `src/domain/share/shareCards.js` + `ShareCardScreen` | ✅ | |
| 107 | Story · SORU | bileşen modu | aynı ("Bu hafta çözülen") | ✅ | Başlık eşlemesi varsayım. |
| 108 | Story · DURAK | bileşen modu | aynı | ✅ | |
| 109 | Story · HAFTALIK ROTA | bileşen modu | aynı | ✅ | |
| 110 | Story · GERİ DÖNÜŞ | bileşen modu | aynı | ✅ | |
| 111 | Story · RİTİM | bileşen modu | aynı | ✅ | |
| 112 | Story · SIRADAKİ DURAK | bileşen modu | aynı | ✅ | |
| 113 | Story · ROTA HAREKETİ | bileşen modu | aynı | ✅ | |
| 114 | İlk 7 Gün | ekran (hedef) | — (`src/domain/premium/paywallGate.js` yalnız muafiyet mantığı) | ⬜ | |
| 115 | İlk Rotan Hazır | ekran (hedef) | — | ⬜ | |
| 116 | Çalışman İşlendi | ekran (hedef) | — | ⬜ | |
| 117 | Bir Hafta | ekran (hedef) | — | ⬜ | |
| 118 | 8. Gün | ekran (hedef) | — | ⬜ | |
| 119 | Pro Önizleme | overlay (hedef) | `premium/ProPreviewScreen.js` | ✅ | **yetim** — `PRO_PREVIEW`'a hiçbir yer navigate etmiyor. |
| 120 | Önizleme · OCR | bileşen modu (ProPreview) | — | 🔴 | OCR yok. |
| 121 | Önizleme · Geçmiş | bileşen modu | — | ⬜ | `ProPreviewScreen` tek sabit içerik; kaynağa göre değişmiyor. |
| 122 | Önizleme · Tempo | bileşen modu | — | ⬜ | Aynı. |
| 123 | Paywall · Karşılaştırma | bileşen modu | `paywallContexts.trial_compare` ← `useTrialRecords` | 🟡 | Bağlı; kabuk eski (102). |
| 124 | Paywall · Senaryolar | bileşen modu | `paywallContexts.route_scenarios` ← `useScenarioView` | 🟡 | Bağlı; kabuk eski. |
| 125 | Paywall · OCR | bileşen modu | `paywallContexts.ocr` | 🔴 | Tetikleyen özellik yok. |
| 126 | Paywall · Geçmiş | bileşen modu | `paywallContexts` (muhtemelen `topic_progress`) | ⬜ | Bağlam metni var, `showPaywall` çağıran yok. **Eşleme belirsiz.** |
| 127 | Paywall · Rapor | bileşen modu | `paywallContexts.monthly_report` | ⬜ | Tetikleyen yok (Ayın Özeti yok). |
| 128 | Ücretsiz Ana Sayfa | aynı ekranın hali | `HomeHeroChart` (`hasAccess=false`) | 🟡 | Kilitli grafik var; "Bugün ne çalıştın, kaydet" CTA'sı ve "SON ÇALIŞMALARIN" listesi yok. |
| 129 | Deneme Kotası Doldu | aynı ekranın hali | `TrialEntryScreen.js:72-80` | 🟡 | Eski `common/EmptyState` kilit ikonu. |

### Zamana bağlı durumlar (AKIŞ 14)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 130 | Son Hafta | zaman modu (Ana Sayfa hero) | `heroVariants/HomeHeroFinalWeek.js` | ✅ | |
| 131 | Sınav Günü | zaman modu | `heroVariants/HomeHeroExamDay.js` | ✅ | |
| 132 | Geri Dönüş Modu | zaman modu | `heroVariants/HomeHeroComeback.js` | ✅ | |
| 133 | Geri Döndün | ekran (hedef) | `components/common/comeback/` (commit edilmemiş) | ⏳ | |
| 134 | Geri Dönüş | ekran (hedef) | aynı | ⏳ | |
| 135 | Son Hafta Geride | zaman modu | `heroVariants/HomeHeroFinalWeekDebt.js` | ✅ | |
| 136 | Sınav Günü Planı | ekran (hedef) | `src/domain/exam/examDayPlan.js` (commit edilmemiş) | ⏳ | |
| 137 | Sınav Sonucu | ekran (hedef) | `src/domain/exam/examResult.js` | ⏳ | |
| 138 | Tahmin Doğruluğu | ekran (hedef) | `src/domain/exam/forecastAccuracyView.js` | ⏳ | |
| 139 | Tahmin Şaştı | aynı ekranın hali | aynı | ⏳ | |
| 140 | Deneme Provası | ekran (hedef) | `simulator/ExamSimulatorScreen.js` | ⏳ | |

### Uygulama geneli durumlar

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 141 | Boş Rota | aynı ekranın hali (Rota Detay) | `RoadmapScreen.js:137-143` | 🟡 | Eski `ListEmptyComponent` ("Rotan hazırlanıyor", `C.muted`, `SPACING`). |
| 142 | Boş Durum | bileşen durumu (jenerik) | `src/components/design/EmptyState.js` | ✅ | Ama 10+ ekran hâlâ `components/common/EmptyState` (eski) kullanıyor. |
| 143 | Yükleniyor | bileşen durumu | `components/design/Skeleton` | 🟡 | Bileşen var; Ana Sayfa, Program Hub, Çalışma Geçmişi hâlâ eski `SkeletonCard`. |
| 144 | Bağlantı Yok | bileşen durumu | `src/components/common/OfflineBanner.js` | 🟡 | Tasarım tam boş durum ("Bağlantı kurulamadı."), kod eski tokenlı üst şerit. |
| 145 | Onay | bileşen modu (Dialog) | `src/components/common/AppModal.js` | 🟡 | `SPACING`/`RADIUS`; tasarım Dialog'u yazılmadı. |
| 146 | Uyarı | bileşen modu (Dialog) | `AppModal.js` | 🟡 | Aynı. |
| 147 | Küçük Ekran | responsive kontrol | — | ⬜ | 375×667 kontrolü yapılmadı; cihazda doğrulanamaz. |

### Ödeme (AKIŞ 15)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 148 | Ödeme · Kart | reddedildi | — | reddedildi | App Store faturalandırması; kart formu yazılmaz. |
| 149 | Ödeme İşleniyor | reddedildi | — | reddedildi | Mağaza kendi sayfasını gösterir. |
| 150 | Ödeme Başarılı | reddedildi | — | reddedildi | İmza anı ("düğüm bir kez parlar") mağaza dönüşüne taşınmalı — ayrı iş. |
| 151 | Ödeme Başarısız | reddedildi | — | reddedildi | |
| 152 | Deneme Bitti | ekran (hedef) | — (`src/domain/premium/purchaseFlow.js` durumu tanımlı) | ⬜ | "7 GÜN DOLDU · Ücretsiz sürüme döndün" ekranı yok. |

### Tamamlama anları (AKIŞ 16)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 153 | Gün Tamamlandı | modal (hedef) | `components/common/completion/` (commit edilmemiş) | ⏳ | |
| 154 | Hafta Tamamlandı | modal (hedef) | aynı | ⏳ | |
| 155 | Rota Tamamlandı | modal (hedef) | aynı | ⏳ | |

### Boş / hata durumları (AKIŞ 17–18)

| # | Artboard | Tür | Kodda nerede | Durum | Not |
|---|---|---|---|---|---|
| 156 | Deneme Kayıtları Boş | EmptyState modu | `preset="trialRecords"` (TrialRecords, TrialDetail) | ✅ | |
| 157 | Analiz Veri Yetersiz | EmptyState modu | `AnalysisScreen.js:74` `preset="analysisThin"` | 🟡 | Kahraman sayı `children` yuvası boş geçiliyor; tasarımdaki "55,95 net" yok. |
| 158 | Öncelikli Konular Boş | EmptyState modu | `WeakAreasScreen` `preset="priorityTopics"` | ✅ | Ekranı yetim. |
| 159 | Çalışma Geçmişi Boş | EmptyState modu | `StudyHistoryScreen` (eski `common/EmptyState`) | 🟡 | `EMPTY_COPY.studyHistory` hazır, kullanılmıyor. |
| 160 | Topluluk Boş | sosyal v1 dışı | — | kapsam dışı | |
| 161 | Lig Boş | sosyal v1 dışı | — | kapsam dışı | |
| 162 | Arama Sonuç Yok | aynı ekranın hali | `SearchScreen.js:67` | ✅ | |
| 163 | Bildirimler Boş | EmptyState modu | `EMPTY_COPY.notifications` (kullanılmıyor) | 🔴 | Gelen kutusu yok. |
| 164 | Seri Sıfır | EmptyState modu | `SummaryScreen.js:54` `preset="streakZero"` | 🟡 | `children` (0 gün hero) verilmemiş; bulunduğu ekran yetim. |
| 165 | OCR Okunamadı | ErrorState modu | `ERROR_COPY.ocrUnreadable` | 🔴 | OCR yok. |
| 166 | Form Hatası | doğrulama deseni (Deneme Gir 2/3) | `trial/components/TotalCard.js:56` | 🟡 | "Boşu N düzelt" satırı var; kart eski token. |
| 167 | Oturum Kaydedilemedi | ErrorState modu | `ERROR_COPY.sessionUnsaved` (kullanılmıyor) | ⬜ | Preset tanımlı, hiçbir ekran çizmiyor. |
| 168 | Bildirim İzni Reddedildi | ErrorState modu | `preset="notificationDenied"` | ✅ | |
| 169 | Sunucu Hatası | ErrorState modu | `preset="server"` (7 ekran) | ✅ | |
| 170 | Çevrimdışı Kuyruk | ekran (hedef) | `settings/components/SyncStatusGroup.js` (yalnız sayaç) | ⬜ | "BEKLİYOR" etiketli kayıt listesi ekranı yok. |

---

## Yetimler (✅ ama giriş noktası yok)

| Ekran | Kanıt | Doğal giriş (tasarıma göre) |
|---|---|---|
| Günün Özeti (`SUMMARY`) | yalnız `routes.js:42` deep link | Oturum Bitti / Gün Tamamlandı (⏳ ile koordine) |
| Öncelikli Konular (`WEAK_AREAS`) | kayıtlı, çağıran yok | Analiz kökü |
| Plan vs Gerçek (`PLAN_VS_ACTUAL`) | kayıtlı, çağıran yok | Program Hub |
| Bildirim İzni (`NOTIFICATION_PERMISSION`) | Rota Hazır onu atlıyor | Rota Hazır → Bildirim İzni → rota |
| Pro Önizleme (`PRO_PREVIEW`) | kayıtlı, çağıran yok | kilitli değerler (`LockedValue`) |

## Tasarımda karşılığı olmayan, hâlâ erişilebilir eski ekranlar

`TrialInsightsScreen` (Analiz trend bölümünden) · `ComparativeScreen` (**`GlassCard`**, Analiz
kısayolundan) · `WeeklyTrialReviewScreen` (Ana Sayfa) · `SwipeReviewScreen` · `QuickPracticeScreen` ·
`TopicCardsScreen` / `CardDetailScreen` (Ayarlar) · `StudyLogScreen` (Ayarlar) · `AboutScreen` ·
`SetNewPasswordScreen` · `wrapped/WrappedCard` (Ana Sayfa'da banner) · sosyal beşli
(League, Friends, Referral, RouteCompanion, Challenge — Ayarlar + Profil'den).
Bunlar sayılara dahil değil; hepsi eski dilde. Tek tek "sil / göç / sakla" kararı gerekiyor.

---

## Kalan iş · partiler

Sıra çalışma döngüsüne göre (plan → çalış → deneme → yanlış → tekrar). Her parti bir ajan
koşusu, 3–5 ekran. ⏳ ajanların dosyalarına (`comeback/`, `completion/`, `domain/exam/`,
`notifications.js`, `ComebackModal.js`) dokunan parti onlar bitmeden başlamamalı.

**P0 · Yetimleri bağla (küçük, hemen)** — Öncelikli Konular ← Analiz · Plan vs Gerçek ←
Program Hub · Bildirim İzni zincire · Pro Önizleme ← kilitli değerler · Günün Özeti girişi
(⏳ AKIŞ 16 bitince). Ayrıca `tabAssignment.js` yorumlarındaki iki yanlış eşleme
(Yol Haritası=ROADMAP, COMPARATIVE=Plan vs Gerçek) düzeltilmeli.

**P1 · Ana Sayfa gövdesi** (#1, #128, #100, #143, #80) — header'ı tasarıma indir, kart
yığınını at (Momentum, Haftalık aktivite, hızlı eylemler, Wrapped, Coach nudge), "Son
çalışmaların" listesi, ücretsiz CTA, ilk gün hali, `Skeleton`. En çok görülen ekran; en
büyük kazanç.

**P2 · Deneme kaydı zinciri** (#19–21, #166, #129, #30) — üç adımın stili, form hatası
satırı, kota doldu hali, Deneme Özeti'nden `LinearGradient`/`SparkBurst` çıkarılıp imza anı
("hat eski halden yeni hale") kurulması.

**P3 · Yanlış defteri** (#34, #9, #37, #38, #40) — Defter + boş hali, Yanlış Ekle
(414 satır, bölünmeli), Yanlış Detayı, Tekrar. Soru Detayı ve Topluluk sekmesi karar
bekliyor, bu partiye alınmaz.

**P4 · Rota derinliği** (#10, #11, #141, #13, #17) — Rota Detay'ı yeniden kur, Rotanın
tamamı, Boş Rota, Ara Verme ve Yeniden Çiz tam ekranları.

**P5 · Durak ve program** (#12, #44, #55, #56, #47) — Durak Detayı (`GlowBackground`
çıkar), Takvim ve Seri (seri halkası + segment), Borç Dağıtıldı sonucu, Boşluğu Kapatma
Planı (hesap var), Program eşlemesini netleştir.

**P6 · Oturum kayıtları** (#60, #159, #27, #28, #59, #167) — Çalışma Geçmişi'ni tek ekranda
birleştir (StudyLog + StudyHistory), Kayıt · Elle, Kaydı Düzenle (`updateStudyLog` hazır),
Oturum Kurtarıldı ekranı, Oturum Kaydedilemedi durumu.

**P7 · Sistem durumları** (#145, #146, #144, #170, #84, #85) — tasarım Dialog'u (`AppModal`
yerine; P4/P6'daki diyaloglar da buna geçer), Bağlantı Yok, Çevrimdışı Kuyruk ekranı,
Veri İndir ve Hesap Silme tam ekranları.

**P8 · Premium kabuk** (#102, #123, #124, #121, #122, #152) — Paywall kabuğu (gölge, taç,
eski token), bağlamlı Pro Önizleme varyantları, Deneme Bitti ekranı.

**P9 · İlk 7 gün** (#114–118) — beş an; `paywallGate.firstWeekStatus` hazır. Tetikleyiciler
için hangi olayda gösterileceği tasarım eyebrow'larından doğrulanmalı.

**P10 · Özetler** (#6, #7, #8, #127) — `useSummary` hafta/ay veri kaynağı (mantık işi,
Codex'e uygun) + görsel; bitince `WeeklyReviewScreen` emekliye ayrılır, Paywall · Rapor
tetikleyicisi bağlanır.

**P11 · Artıklar** (#42, #66, #157, #164, #26, #147) — Yol Haritası (müfredat ilerlemesi),
Kart Modları, iki EmptyState'in kahraman sayı yuvası, Kayıt · Ölçülmüş eşlemesi, küçük ekran
kontrolü (cihazda). Bildirim Halleri (#77) `notifications.js` ⏳ bitince buraya eklenir.

## Senin kararın gereken engeller

1. **OCR** (#22, #24, #25, #120, #125, #165) — servis yok. v1'de mi, yoksa bu altı artboard
   ve Paywall · OCR bağlamı kaldırılsın mı?
2. **Bildirim gelen kutusu** (#78, #163) — tablo/RLS/üreticiler yok; yeni sistem (Codex).
3. **Bölüm ve tercih** (#94, #95, #4) — `programs.js` statik 2024 listesi; kontenjan/taban
   verisi yok. Bölüm seçici kurulumda mı, Profil'de mi? Sırada Ne Var buna bağlı.
4. **Ders Programı / Aylık Plan** (#48, #57) — sabit haftalık ders programı veri modeli
   kodda görünmüyor (derin doğrulanmadı). Ürün kararı.
5. **Soru Detayı + Topluluk sekmesi** (#39, `CommunityTab`) — sosyal v1 dışı kararıyla
   çelişiyor; App Store 1.2 bildirme/engelleme de ister. Defterden çıkarılsın mı?
6. **Erişilebilir sosyal kod** — Ayarlar'da 4 satır, Profil'de `LeagueMiniCard`. Gizlensin mi?
7. **Karşılığı olmayan eski ekranlar** (yukarıdaki liste) — sil / göç / sakla.
8. **KVKK aydınlatma metni** (#83) — yayın engeli, içerik sende.
