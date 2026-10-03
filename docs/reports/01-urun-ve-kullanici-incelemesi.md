# 01 — Ürün ve Kullanıcı İncelemesi (launch'tan bir gün önce)

Tarih: 2026-10-03 · İnceleyen: ürün yöneticisi + "zor beğenen YKS/LGS öğrencisi" şapkası
Kapsam: kod okuması (uygulama çalıştırılmadı). Her iddia dosya:satır ile verildi; doğrulayamadığım şeyler "doğrula" diye işaretli.

Kanka, kısaca: çekirdek ürün (rota → durak → çalışma → deneme → tahmin) gerçekten iyi düşünülmüş, kopyanın çoğu dürüst ve sakin. Ama premium "kapalı" olmasına rağmen premium altyapısı hâlâ çekirdek akışları kilitleyebiliyor, birkaç kritik anda da yalan söyleyen metinler var. Yarın çıkmadan önce düzeltilmesi gerekenler aşağıda P0 olarak listeli, çoğu tek satırlık iş.

---

## 1. Özet

**En güçlü 3 şey**

- **İlk gün tasarımı dürüst ve yönlendirici.** `HomeFirstDay` sahte sayı göstermiyor ("Sıfır kahraman olmaz", `src/screens/home/components/firstDay/HomeFirstDay.js:27-29`). Tek CTA "İlk durağa başla", yanında "Rotanı gör" ve "Ana sayfayı göster" var. Boş durumların çoğu `PendingSection` ile "henüz yok, şunu yapınca dolar" diye anlatılıyor (`AnalysisHeroScore.js:24-31`, `AnalysisTrialHistory.js:12-19`, `PublisherComparisonCard.js:11-21`).
- **Sınav dönemi hassasiyeti çok iyi.** Son hafta hero'su lig, sıralama ve tahmini neti bilerek kapatıyor: "Değiştiremediğin bir sayıyı göstermek yardım etmez…" (`heroVariants/HomeHeroFinalWeekDebt.js:13-14`). Paywall ilk hafta ve sınav dönemlerinde bastırılıyor (`domain/premium/paywallGate.js:51-67`). Konfeti ve rozet kuralına da uyulmuş (`StreakMilestoneModal.js:10-11`, `completion/CompletionShell.js:11`).
- **Premium ekranları güvenli şekilde kapatılmış.** 15 premium/ödeme rotasının hepsi `LegacyHomeRedirectScreen`'e bağlı (`navigation/screenRegistry.js:233-247`). Profil'deki "Premium" satırı bayrağa bağlı (`ProfileScreen.js:103-109`). Sunucu tarafında kotalar da kapatılmış (`supabase/migrations/20260929022720_clde_premium_suspended_quotas_off.sql`).

**Launch günü için en riskli 5 şey**

1. **Premium kapalıyken bile deneme girişi ve Rota ekranı premium RPC'sine bağlı.** `get_product_access_snapshot` cevap vermezse (çevrimdışı, yavaş ağ ya da RPC hatası) kullanıcı "Deneme hakkın doğrulanamadı" (`TrialEntryScreen.js:70-76`) ya da "Rota erişimi doğrulanamadı" (`RouteAccessGate.js:19-29`, kaynak `useStudyRoute.js:881`) ekranına düşüyor. Ürünün iki ana eylemi kilitleniyor.
2. **Kritik anlarda yalan söyleyen metinler var.** Kayıt ekranı, rota daha kurulmadan "Rotan hazır." diyor (`RegisterScreen.js:94`). Bildirim izni ekranı, deneme girmemiş kullanıcıya "ROTA YENİDEN ÇİZİLDİ · İlk denemen rotaya işlendi" diyor (`NotificationPermissionScreen.js:84,89`). "+" menüsü olmayan bir özelliği vaat ediyor: "Deneme gir · Fotoğraftan veya elle" (`QuickAddSheet.js:114`), oysa OCR yok (`ExamResultScreen.js:14-15`).
3. **Sahte sayılar ve görünür bir bug.** `ReviewDoneScreen` sabit "Yarın 4 soru, üç gün sonra 7 soru bekliyor." (`:41`) ve "Bu konu 9 gün sonra tekrar önerilecek." (`:89`) yazıyor. Ekranda düz `→` metni çıkıyor (`:79`, JSX metninde kaçış dizisi çalışmaz). İlerleme çubuğu da sabit 3/2/2/1 (`:82-85`).
4. **LGS öğrencisi YKS içeriği görüyor.** Analiz'de "Simülasyon · Tam süreli TYT provası" (`DeeperAnalysisSection.js:48`). Rota'da "… net ≈ hangi bölümler? · 24 devlet üniversitesi" (`RoadmapScreen.js:103-106`). Bölüm Eşiği varsayılan olarak "say" sekmesiyle açılıyor (`RankSimulatorScreen.js:90`). 8. sınıf öğrencisi üniversite bölümü görüyor. Üstelik "24 devlet üniversitesi" iddiası verinin kendisiyle de çelişiyor: `data/programs.js`'te yaklaşık 14 isimli üniversite var, Koç ve "Vakıf" da bunların içinde.
5. **v1 için fazla geniş bir yüzey.** 111 kayıtlı ekran var. Sosyal tarafta beş ayrı alan açık (Lig, Gruplar, Arkadaşlar, Challenge, Yol Arkadaşı), üstüne Referral, XP/Seviye, Kilometre taşı, Story ve Widget geliyor. Lansman günü kimse olmadığı için Lig/Arkadaş ekranları boş açılacak ("Henüz kimse yok", `LeagueScreen.js:300`). Bu alanların bir kısmı da eski tasarım dilinde: "Sosyal Hub" (`LeagueScreen.js:327`), kırmızı "DÜŞME BÖLGESİ" (`:286`), dosyalar 300+ satır.

Ek operasyon notu: `eas.json:48` Android submit track'i `"internal"`. Yarın Play Store'da herkese açık çıkmayı bekliyorsanız bu ayar yanlış (doğrula).

---

## 2. Ekran ekran karne

### Ana Sayfa (Rota sekmesi kökü) — **B+**
Dosyalar: `src/screens/home/HomeScreen.js`, `components/HomeHero.js`, `components/firstDay/HomeFirstDay.js`

- **İyi:** Hero sekiz hale göre değişiyor (dondurulmuş, sınav günü, son hafta, borçlu son hafta, geri dönüş, ilk gün, normal; `HomeHero.js:56-125`). Yükleniyor, hata (`ErrorState preset="server"`) ve çevrimdışı (`HomeOffline`) halleri ayrı ayrı var. Gövde "şimdi ne yapayım" sorusuna odaklanmış: bugünün durakları, gerekiyorsa defter, bir keşif kartı (`HomeProBody.js`).
- **Kötü / kafa karıştıran:**
  - Üst bant kalabalık: avatar (Profil sekmesinin kopyası), "Sosyal" ikonu, takvim ikonu (Program > Ay'ın kopyası), selam, büyük tarih başlığı ve seri şeridi (`HomeTopBar.js:52-86`). Böylece durağa gelmeden önce iki tekrar giriş, bir de sosyal ikon görülüyor.
  - `HomeOverlays` aynı ekrana XP toast, seviye atlama modalı, kilometre taşı modalı, hedef tamamlandı modalı, nudge popup ve geri dönüş overlay'i bağlıyor (`HomeScreen.js:96-132`). İlk hafta üst üste modal görme riski var; sıra ve kuyruk cihazda doğrulanmalı.
  - "Çalışmaya Başla" büyük harfle yazılmış, diğer butonlar cümle düzeninde ("İlk durağa başla") (`HomeHeroNormal.js:98`).
- **Düzeltme:** Üst bantta takvim ikonunu kaldır, sosyal ikonu Profil'e taşı. Overlay'ler için tek bir kuyruk kur: oturum başına en fazla bir modal.

### İlk açılış: tanıtım slaytları, kayıt ve kurulum — **C+**
Dosyalar: `src/screens/onboarding/*`, `src/screens/auth/*`

- **İyi:** Üç slayt var ve otomatik ilerliyor (`OnboardingScreen.js:17-18`). Kurulum dört adım (`screenRegistry.js:130-139`). "Denemem yok, atla" seçeneği var (`LevelTestScreen.js:111`). Kurulum yarıda kalırsa "Kurulum Yarım" ekranı açılıyor. Bildirim izni sistem penceresinden önce ayrı bir ekranla soruluyor.
- **Kötü:**
  - `RegisterScreen.js:94`: "Rotan hazır. Hesap yalnızca onu buluta almak için". Akış sırası slayt → **kayıt** → kurulum (`rootGate.js`), yani bu noktada rota yok. İlk temasta yalan söylüyoruz.
  - `NotificationPermissionScreen.js:84-90`: "ROTA YENİDEN ÇİZİLDİ / İlk denemen rotaya işlendi. … tek bir bildirim gelir — daha fazlası değil." Kurulumdaki kullanıcının ilk denemesi yok (`useFinishOnboarding.js:52`). Üstelik Ayarlar'da 5 ayrı hatırlatıcı türü var (`NotificationsSettingsScreen.js:70-111`), yani "tek bildirim" vaadi de doğru değil.
  - Android'de Google girişi kaldırıldığı (`TODO.md`) ve Apple butonu yalnız iOS'ta göründüğü için (`SocialAuthButtons.js:71,80`) "VEYA" ayracının altı boş kalıyor (`RegisterScreen.js:128-134`, `LoginScreen.js:102`).
  - Slayt dili jargonlu: "DİNAMİK TAHMİN · KALİBRASYON", "borçlarını otomatik olarak…", "+40 XP" (`OnboardingScreen.js:89-97`, `OnboardingSlideDaily.js:52`). 17 yaşındaki biri "kalibrasyon" görünce kaydırıp geçer.
  - "Rota Hazır" ekranındaki "İlk durağa başla" doğrudan sayaç ekranını açıyor (`RouteReadyScreen.js:47-48`). Gece 23:00'te uygulamayı keşfetmek için indiren öğrenci bir anda 25 dakikalık oturumun içinde buluyor kendini.
- **Düzeltme:** Kayıt alt metnini "Hesabın rotanı buluta kaydeder; hangi telefondan girersen aynı yerden devam edersin." yap. Bildirim ekranının başlığını kurulum için ayır ("ROTAN HAZIR · Değişince haber vereyim mi?"), "tek bildirim" cümlesini sil. Android'de sosyal buton yoksa ayracı gizle. Slayt etiketlerini sadeleştir ("HER DENEMEDEN SONRA GÜNCELLENİR").

### Program sekmesi — **B−**
Dosyalar: `src/screens/program/ProgramScreen.js`, `views/ProgramWeekView.js`

- **İyi:** Hafta, Ay ve Müfredat tek ekranda tek seçiciyle toplanmış. "Geride kalan konular" satırı açık ve net (`ProgramWeekView.js:111-121`).
- **Kötü:**
  - Hafta görünümünde günün durak paneli, üst üste üç keşif kartının altında kalıyor: `ScheduleDiscoverCard`, `HabitDiscoverCard`, `KnownTopicsReminder` (`ProgramWeekView.js:104-108`). Aynı Schedule kartı Ana Sayfa'da da var (`HomeProBody.js:20`).
  - Ay görünümü takvim bileşeninde "Görev ekle" diyor (`calendar/components/DayTasks.js:70-73`), "+" menüsü ise "Durak ekle" (`QuickAddSheet.js:125`). Aynı eylemin iki adı var.
  - Kapatma ikonları küçük: 13px ikon, `padding 4` ve `hitSlop 8` toplamda 44px'in altında kalıyor (`ScheduleDiscoverCard.js:51-58`). AGENTS.md'deki 44px kuralını ihlal ediyor.
  - `weekSummary` fonksiyonu tanımlı ama hiç kullanılmıyor (`ProgramWeekView.js:25-30`).
- **Düzeltme:** Keşif kartlarından aynı anda en fazla birini göster ve gün panelinin altına al. Ay görünümünde "Görev" kelimesini "Durak" yap.

### Rota (Roadmap / Rotanın tamamı / Durak detayı) — **B**
Dosyalar: `src/screens/roadmap/RoadmapScreen.js`, `hooks/useRouteDetail.js`

- **İyi:** Rotasız kullanıcıya boş durum (`RouteEmptyState`) gösteriliyor. Kullanıcının kendi beyan ettiği başlangıç ve hedef netleri tahmin yokken bile ekranda (`useRouteDetail.js:55-60`). Bilgi sırası doğru: net, bu hafta, sıradaki durak, borç, projeksiyon.
- **Kötü:**
  - Premium kapalıyken bile `routeAccessError: accessError` (`useStudyRoute.js:881`) değeri `RouteAccessGate` (`:19-29`) üzerinden ekranı "Rota erişimi doğrulanamadı" hatasına düşürüyor. (Yükleniyor durumu bayrakla korunmuş, `:882`. Hata durumu korunmamış.)
  - "24 devlet üniversitesi" iddiası yanlış, LGS'de de görünüyor (`RoadmapScreen.js:103-106`).
- **Düzeltme:** `routeAccessError: PREMIUM_ENABLED ? accessError : false`. Bölüm satırını `examType !== "lgs"` koşuluna bağla, alt metni "YÖK Atlas tahmini taban netleri" yap.

### Analiz sekmesi — **C+**
Dosyalar: `src/screens/analysis/AnalysisScreen.js`, `useAnalysisController.js`

- **İyi:** Sahte veri temizlenmiş; kod içi notlar eskiden sahte "58,25" ve "24 kayıt" gösterildiğini belirtiyor. Tek denemeyle açılan ekranda dürüst bir not var: "Bir denemeyle rota çizilir, eğilim çizilmez" (`AnalysisHeroChartEmpty.js:24`).
- **Kötü:**
  - İlk gün ekranı üst üste dört "bekliyor" kartından oluşuyor ("İlk denemeni bekliyorum", "Ders netlerin henüz yok", "Henüz deneme girmedin", "Karşılaştıracak yayın yok"), altında da altı "DAHA DERİNE" satırı var. Öğrenci boş bir sayfa görüp çıkar. Bunun yerine tek bir boş durum ve tek bir CTA olmalı.
  - Deneme geçmişinde etiket net değişiminden türetiliyor: net düştüyse "ZOR", çıktıysa "İYİ" (`AnalysisTrialHistory.js:29`). Oysa deneme girişinde gerçek zorluk ve ruh hali alanı var (`trialEntrySubmit.js`: `difficulty_level`, `mood`). Kullanıcı zor demediği denemenin "ZOR" yazdığını görür. Tür varsayılanı da LGS için yanlış: `t.trialType || "TYT"` (`:24`).
  - Skeleton ekranı yalnız bir frame görünüyor (`useAnalysisController.js:38`, `setLoading(false)` hemen çağrılıyor). Sekme açıldıktan 3 saniye sonra nudge popup çıkıyor (`:39`). Analiz'e bakmaya gelen öğrenciyi popup bölüyor.
  - Sağ altta sabit kırmızı "Deneme gir" hapı var (`AnalysisAddTrialButton.js:24-27`), hemen altında tabbar'ın kırmızı "+" butonu. İki kırmızı birincil eylem üst üste geliyor. `notes.md` 2026-09-16 kararı bunun tam tersiydi ("ayrı FAB çakışma yaratıyor").
  - "Simülasyon · Tam süreli TYT provası" LGS'de de görünüyor (`DeeperAnalysisSection.js:48`; `AnalysisPracticeSection.js` de aynı metni taşıyor ama import edilmiyor — ölü kod).
  - `notes.md` sonunda geçen "BU HAFTA NE OKUYORUZ" içgörü kartı artık ekranda yok. Analiz'in "ne yapmalıyım" katmanı eksik, `useRecommendations` yalnızca popup'a gidiyor.
- **Düzeltme:** Deneme sayısı 0 iken tek bir boş durum göster ("İlk denemeni gir, bu sayfa senin olsun" + CTA) ve "DAHA DERİNE"yi gizle. `mood` etiketini kaldır ya da gerçek `difficulty_level` alanına bağla. Popup'ı Analiz'den kaldır.

### Deneme girişi / özeti / kayıtları — **B− (P0 bug ile)**
Dosyalar: `src/screens/trial/*`

- **İyi:** Üç adımlı form. Taslak koruması var ("Taslak olarak çık", `TrialEntryScreen.js:34-57`). "Kaydettiğinde rota yeniden çizilir" açıklaması iyi (`TrialEntryStep3.js:35`).
- **Kötü:**
  - **P0:** `useTrialQuotaGate.js:19,53`: `ready = !accessLoading && !accessError`. Premium kapalı olsa bile erişim RPC'si dönmeden form açılmıyor (skeleton). RPC hata verirse "Deneme hakkın doğrulanamadı … Henüz kotandan kullanım düşülmedi." çıkıyor. Kotası olmayan bir üründe "kota" kelimesi geçiyor. Kaydet butonu da aynı kapıya takılıyor: "Kaydını göndermeden önce üyelik durumunu kontrol edemedik." (`trialEntrySubmit.js:48-54`). `getProductAccessSnapshot` önbelleksiz (`supabase/productAccess.js:4-14`).
  - Deneme Kayıtları'ndaki "Yayın · hepsi" ve "Son 3 ay" filtreleri `onPress`'i olmayan sahte dropdown'lar (`TrialRecordFilters.js:54-63`).
- **Düzeltme:** `useTrialQuotaGate` ve `useTrialEntryForm` içinde `if (!PREMIUM_ENABLED)` ile hemen `ready/allowed=true` dön. Sahte dropdown'ları gizle.

### Çalışma (sayaç / kaydet / özet / geçmiş) — **B**
Dosyalar: `src/screens/study/*`

- **İyi:** Değerlendirme isteği ölçülü: en az 5 oturum, 3 günlük seri ve 90 günlük bekleme şartı var (`hooks/useInAppReview.js:9-27`). Özet ekranından deftere yanlış ekleme köprüsü kurulmuş.
- **Kötü:**
  - `StudySummaryScreen.js:69` her durumda "DURAK TAMAMLANDI" yazıyor. Durakla ilgisi olmayan "Çalışma kaydet (sayaç açmadan)" akışı da buraya geliyor (`useAddStudyController.js:131`).
  - `useStudyTimerController.js` 498 satır, `useStudySaveController.js` 341 satır. 150 satır kuralı aşılmış; kullanıcı açısından bakım riski demek.
- **Düzeltme:** `route.params.routeStopId` yoksa başlık "KAYDA GEÇTİ" olsun.

### Yanlış defteri ve tekrar — **C**
Dosyalar: `src/screens/wrong-notebook/*`

- **İyi:** Konuya göre gruplama, "Bekleyen / Çözüldü / Tümü" seçimi, fotoğraf kaybı bandı ve ders bazlı boş durum var (`WrongNotebookScreen.js:22-26,64-75`).
- **Kötü:** `ReviewDoneScreen.js` bu ürünün en sahte ekranı:
  - `:21-26` parametre gelmezse 6/2/4/2/14/12 değerleri uyduruluyor.
  - `:41` "Yarın 4 soru, üç gün sonra 7 soru bekliyor." sabit.
  - `:79` `→` düz metin olarak görünüyor.
  - `:82-85` ilerleme çubuğu sabit `flex: 3/2/2/1`.
  - `:89` "Bu konu 9 gün sonra tekrar önerilecek." sabit.
  - `:40` Türkçe ek sabit: `{n}'ünü bildin, {n}'si …`. 2 için "2'ünü" (doğrusu 2'sini), 4 için "4'si" (doğrusu 4'ü) çıkar. Projede `lib/turkishSuffix.js` zaten var.
  - Adlandırma dağınık: başlık "Defterim", Analiz'de "Yanlış defteri", Home'da "Defter".
- **Düzeltme:** Sabit cümleleri sil ya da gerçek zamanlama verisine bağla. Ok işaretini `{"→"}` ya da "→" yap. Ekleri `withCase` ile üret. Varsayılan parametreleri 0 yap.

### Lig / Sosyal Hub — **D**
Dosyalar: `src/screens/league/LeagueScreen.js` (419 satır), `src/screens/social/*` (300+ satır dosyalar)

- **İyi:** Netler gösterilmiyor, kıyas emek üzerinden yapılıyor (`notes.md` 2026-09-16). Arkadaşlar ekranında engelleme var (`FriendsScreen.js:138,186`).
- **Kötü:**
  - Eski tasarım sistemi kullanılıyor: `SPACING`/`RADIUS`, kırmızı `GlowBackground` (`LeagueScreen.js:303-306`), elle yazılmış `fontFamily` (screens altında 158 adet). AGENTS.md "derinlik gölgeyle değil" diyor, burada glow var.
  - "Sosyal Hub" İngilizce jargon (`:327`). "DÜŞME BÖLGESİ" `C.danger` ile boyanmış (`:286`); AGENTS.md'ye göre `danger` yalnız yıkıcı aksiyonlar için.
  - "Sıralama yüklenemedi / Tekrar dene" yazıyor ama tıklanabilir bir aksiyonu yok (`:295`).
  - Lansman günü Genel Lig boş: "Henüz kimse yok" (`:300`).
  - Lig ve grup adlarında şikayet etme yok. Engelleme yalnız Arkadaşlar'da. Apple 1.2 (kullanıcı içeriği) açısından risk; `docs/CIKMADAN_ONCE_V1.md` "kullanıcı üretimi içerik yok" diyor ama grup adları ve görünen kullanıcı adları başkalarına gösteriliyor (doğrula).
- **Düzeltme:** v1'de Genel Lig, Challenge ve Yol Arkadaşı'nı bayrakla gizle; yalnız Gruplar kalsın. Başlığı "Sosyal" ya da "Gruplar" yap.

### Profil — **C+**
Dosya: `src/screens/profile/ProfileScreen.js`

- **İyi:** Kimlik, hedef ve seviye en üstte. "Premium" satırı bayrağa bağlı.
- **Kötü:** Tek sayfada 7 blok (Hero, Hedef bölüm, Seviye, İstatistik, Lig mini kartı, Güç haritası, Paylaş/Widget kutuları) ve 8 bağlantı (`:58-120`). "Meydan okumalar" (`:94`) ile Ayarlar'daki "Challenge" (`SettingsScreen.js:95`) aynı ekranın iki adı. "Arkadaşını davet et" bir ödül sunmuyor; ekranda "Davetin kaydedilir, kimin davet ettiği görünür" yazıyor (`ReferralScreen.js:157`), yani davet etmek için bir sebep yok.
- **Düzeltme:** v1 Profil'i kimlik, istatistik, çalışma geçmişi ve rota yönetimi olarak sadeleştir. Sosyal satırları bayrakla gizle.

### Ayarlar ve Hakkında — **B−**
Dosyalar: `src/screens/settings/*`

- **İyi:** Gruplama net (Rota, Çalışma, Bildirimler, Uygulama, Hesap). Veri indirme ve hesap silme ekranları var.
- **Kötü:**
  - Aynı ekranın üç adı var: "Net eşiği" (`SettingsScreen.js:59`), "Net & Sıralama Tahmini" (`DeeperAnalysisSection.js:26`) ve kod yorumlarında "Bölüm Eşiği". Hepsi `RANK_SIMULATOR`.
  - "Streak Uyarısı / Streak'in tehlikedeyse…" (`NotificationsSettingsScreen.js:89-90`), oysa uygulamanın her yerinde "seri" deniyor.
  - Hakkında ekranında sabit "v1.0.0" (`AboutScreen.js:37`) ve "React Native ile yapıldı" (`:49`) var. İkincisi kullanıcıya bir şey anlatmıyor, profesyonel durmuyor. Sürüm `app.json`'dan okunmalı (EAS `appVersionSource: remote`).
  - Gizlilik metni: "Verileriniz üçüncü taraflarla paylaşılmaz" ile "Supabase, Sentry, Expo kullanılır" aynı metinde (`constants/legalDocs.js:22-27`). RevenueCat, kamera/fotoğraf (yanlış sorusu) ve kullanım analitiği anılmıyor. Yaş sınırı 13 (`:38-39`); LGS kitlesi 13-14 yaşında, KVKK açısından veli onayı meselesine bakılmalı (hukukçuya sor).
- **Düzeltme:** Ekran adını her yerde "Bölüm Eşiği" olarak tekle. "Streak"i "Seri" yap. Hakkında'dan "React Native ile yapıldı"yı sil. Gizlilik metnini gerçek veri akışına göre güncelle.

### Premium klasörü — **N/A (gizli)**
Ayrıntısı 5. bölümde.

---

## 3. Kullanıcı gözüyle ilk 10 dakika

Persona: **Zeynep, 17, 12. sınıf, TYT+AYT Sayısal.** Arkadaşı Instagram'da story paylaşmış, gece 22:40'ta uygulamayı indiriyor.

- **0:00 — Slaytlar.** Üç slayt kendiliğinden kayıyor (6 sn). "Sınava giden yol bir rotaya dönüşür" güzel bir cümle. İkinci slayttaki "+40 XP" ve "borçlarını otomatik olarak…" ifadeleri onu biraz duraksatıyor. Üçüncü slaytta "DİNAMİK TAHMİN · KALİBRASYON" yazısını görünce "Atla"ya basıyor; o da doğrudan kayda gidiyor.
- **0:40 — Kayıt.** "Hesap oluştur. Rotan hazır." Zeynep "hangi rota, daha bir şey seçmedim" diye düşünüyor. İlk güven çatlağı burada. Android kullanıyorsa "VEYA" çizgisinin altı boş ve uygulama yarım görünüyor. Ad, e-posta, şifre ve onay kutusu var; kısa sürüyor. E-posta doğrulaması açıksa uygulamadan çıkıp mail'e gitmesi gerekiyor ve **ilk churn noktası** burası, çünkü gece mail'e bakıp geri dönmeyecek.
- **1:30 — Kurulum.** Sınavını seçiyor (LGS/YKS, sonra alan, sonra tarih), ardından hedef net ve günlük soru (varsayılan 80). "Şu an neredesin?" ekranı ders ders net istiyor. Son denemesinin netlerini ders ders hatırlamıyor ve "Denemem yok, atla"ya basıyor. Buraya kadar iyi.
- **3:00 — Rota hazır.** Büyük bir gün sayısı, "N durak, tek yol" ve ilk durak. Bu ekran güzel. "İlk durağa başla"ya basınca önce bildirim ekranı açılıyor: "ROTA YENİDEN ÇİZİLDİ. İlk denemen rotaya işlendi." Zeynep deneme girmedi. İkinci güven çatlağı. Ayrıca "tek bildirim gelir" sözü veriliyor ve izin veriyor.
- **3:40 — Sayaç.** Doğrudan çalışma sayacına atılıyor. Gece 22:45, kitap yanında değil. **İkinci churn noktası:** uygulamayı yalnız keşfetmeye gelmişti ama sayaç "şimdi çalış" diyor. Geri çıkınca Ana Sayfa'ya iniyor.
- **4:30 — Ana Sayfa (ilk gün).** "YKS'ye N gün. İlk durağın hazır." Kesikli rota çizgisi ve tek durak. Sakin ve anlaşılır. "Ana sayfayı göster"e basınca gövde açılıyor: keşif kartı "Haftalık programını kur · 2 dk". Üst bantta avatar, sosyal ve takvim ikonları var, hangisinin ne olduğu belli değil.
- **5:30 — Tabbar turu.** Program sekmesinde üç keşif kartı üst üste. Analiz sekmesinde dört "bekliyor" kartı, 3 saniye sonra da bir nudge popup. Profil sekmesinde Seviye 1, boş lig kartı ve 8 bağlantı. Zeynep'in bu turdan aklında kalan: "çok şey var ama hepsi boş".
- **7:00 — "+" ile deneme girmeyi deniyor.** "Deneme gir · Fotoğraftan veya elle" yazısını görüp fotoğraf çekmeyi umuyor. Form açılıyor ama fotoğraf seçeneği yok. Wi-Fi'ı zayıfsa form yerine skeleton görüyor, sonra "Deneme hakkın doğrulanamadı". **Üçüncü churn noktası, en kötüsü bu.** Ücretsiz bir uygulamada "hakkın" kelimesini görünce "demek paralı" diye düşünüyor.
- **9:00 — Lig.** "Sosyal Hub" ekranında "Henüz kimse yok" yazıyor. Arkadaşını eklemek için kod paylaşması gerekiyor, davet etmenin karşılığında bir şey yok.
- **10:00 — Karar.** Rota fikrini sevdi; yarın sabah gelen ilk bildirim iyiyse geri dönecek. Ama ilk on dakikada üç ayrı metin ona doğru olmayan bir şey söyledi. 17 yaşındaki bir öğrenci bu tür yalanları affetmez.

**Özet:** Değer önerisi 3. dakikada geliyor (Rota Hazır) ve doğru. Kaybı yaratan şey içerik eksikliği değil; yanlış metin, yanlış zamanda sayaç ve premium RPC'sinin oluşturduğu sahte "hak" kapısı.

---

## 4. Fazlalıklar — v1 için bayrak arkasına alınacaklar

Bugün premium dışında bir feature flag sistemi yok (`src/constants/` altında yalnız `premium.js` var). Öneri: `src/constants/features.js` içinde `SOCIAL_LEAGUE`, `CHALLENGE`, `COMPANION`, `REFERRAL`, `SIMULATOR` gibi boolean bayraklar tanımlayıp ekran girişlerini bunlara bağlamak. Rotalar `PREMIUM` ekranlarında yapıldığı gibi `LegacyHomeRedirectScreen`'e yönlendirilebilir.

| Alan | Ekranlar | Öneri | Gerekçe |
|---|---|---|---|
| Sosyal (5 alan) | `LEAGUE` (Genel Lig sekmesi), `FRIENDS`, `CHALLENGE`, `ROUTE_COMPANION`, `REFERRAL` | **Gizle**, yalnız Gruplar kalsın | Ağ etkisi olmadan boş açılıyor; eski tasarım dili; Apple 1.2 riski; davet etmenin karşılığı yok |
| Oyunlaştırma | `LEVEL`, `MILESTONE`, XP toast'ları, "Haftalık Savaşçı / Aylık Titan" (`lib/streakMilestones.js:5-10`, elle yazılmış hex renklerle) | Seri kalsın; Seviye/XP/Kilometre taşı **gizlensin** | Ürünün sakin ve dürüst tonuyla çelişiyor; AGENTS.md "rozet yok" diyor |
| Simülatörler | `EXAM_SIMULATOR`, `NET_FORECAST`, `RANK_SIMULATOR`, `FORECAST_ACCURACY` | Simülatör **gizlensin**, Bölüm Eşiği LGS'de **gizlensin** | 4 ekran benzer soruya cevap veriyor; LGS'de yanlış içerik gösteriyor |
| Karşılaştırmalar | `TRIAL_COMPARE`, `COMPARATIVE`, `PUBLISHER_COMPARISON_DETAIL` | Biri kalsın (Deneme karşılaştırma) | Üç karşılaştırma ekranı var, yeni kullanıcıda hepsi boş |
| Ders analizi | `SUBJECT_LIST`, `SUBJECT_DETAIL`, `SUBJECT_ANALYSIS`, `WEAK_AREAS`, `TOPIC_CARDS`, `CARD_DETAIL` | `SUBJECT_ANALYSIS` + `WEAK_AREAS` kalsın | `TOPIC_CARDS` hiçbir yerden açılmıyor; diğerleri iç içe geçiyor |
| İstatistik | `STATS`, `STUDY_HISTORY`/`STUDY_LOG`, Profil istatistik kartı, `SUMMARY` (+ `WEEKLY_REVIEW`, `WEEKLY_TRIAL_REVIEW` takma adları) | `STUDY_HISTORY` + `SUMMARY` kalsın | Aynı verinin 3-4 farklı görünümü |
| Sınav günü | `EXAM_DAY_PLAN`, `EXAM_RESULT` | Kalsın ama Haziran'a kadar girişleri gizli | Ekim lansmanında anlamsız |
| Widget / Story | `WIDGET_GUIDE`, `SHARE_CARD` | Kalsın (iOS'ta doğrulandı, `docs/DURUM.md`) | Büyüme kanalı; ama `TODO.md` "Widget ertelendi" diyor, yani dokümanlar çelişiyor |
| Premium | 15 ekran | Zaten yönlendiriliyor | 5. bölüm |
| Ölü kod | `trial/TrialInsightsScreen.js`, `wrong-notebook/CommunityTab.js`, `…/detail/CommunityQuestionDetail.js`, `wrapped/WrappedCard.js`, `plan/components/AddTaskWhenBlock.js` (sabit "Bugün · 23 Haz", "19:30") | Sil ya da arşivle | Hiçbir yerden import edilmiyor; ileride biri yanlışlıkla bağlarsa sahte veri sızar |

Takma ad olan rotalar (aynı bileşene bağlı): `SWIPE_REVIEW` ve `QUICK_PRACTICE` → `ReviewSessionScreen`, `WEEKLY_*` → `SummaryScreen`, `STUDY_LOG` → `StudyHistoryScreen`, `LEGAL_DOC` → `DocumentScreen` (`screenRegistry.js:180-226`). Kullanıcıya zararları yok, ama "111 ekran" sayısını şişiriyorlar. Gerçek benzersiz ekran sayısı daha düşük.

---

## 5. Premium askıdayken

### Şu an sızanlar (premium kapalı ama kullanıcı görüyor ya da etkileniyor)

1. **Deneme girişi kapısı.** `useTrialQuotaGate.js:19,53` ve `useTrialEntryForm.js:25-26` → `trialEntrySubmit.js:48-54` zinciri. Ekranda "Deneme hakkın doğrulanamadı", "kotandan kullanım düşülmedi" ve "üyelik durumunu kontrol edemedik" metinleri çıkıyor. **P0.**
2. **Rota erişim hatası.** `useStudyRoute.js:881` değeri `RouteAccessGate.js:19-29`'a gidiyor ("Rota erişimi doğrulanamadı"). Aynı değer `useMilestone.js:69` üzerinden `MilestoneScreen.js:52`'yi de etkiliyor. **P0.**
3. **`useFeatureEntry` uyarısı.** RPC hata verirse "Bağlantı doğrulanamadı / Üyelik durumunu kontrol edemedik" (`hooks/useFeatureEntry.js:26-37`). Senaryolar, Bölüm Eşiği, deneme karşılaştırma ve aylık rapor girişlerinde çıkıyor. **P0** (tek satır: `if (!PREMIUM_ENABLED) return true;`).
4. **Seri ödülleri sessizce premium gün yazıyor.** `useGamification.js:246` → `claimStreakMilestoneReward`. 14/30/60 günlük seride 1/3/7 premium gün kazanılıyor (`lib/streakMilestones.js:6-8`). Bir ay sonra premium açıldığında bu birikmiş günler kullanılacak mı, yanacak mı? Karar verilmeli.
5. **Paywall kopyalarında "Pro" ve "Premium" karışık.** `constants/paywallContexts.js`, `proPitch.js`, `accessEnded.js` ("Premium" başlığı ve "Pro'ya geç" butonu aynı ekranda). Şu an görünmüyor, ama açılınca tutarsız olacak.

### Bir ay sonra açmak için hazırlık listesi

- **Bayrağı `true` yapmak yetmez.** `premium.js:3` "bu bayrağı true yapmak yeterli" diyor, ama PAYWALL, PREMIUM, PRO_PREVIEW, SUBSCRIPTION ve diğer 15 ekran registry'de sabit olarak `LegacyHomeRedirectScreen`'e bağlı (`screenRegistry.js:231-247`; yorum: "premium gövdesi bundle'a girmez"). Bayrak açılınca `showPaywall` paywall'a gidecek ve kullanıcı hemen Ana Sayfa'ya geri sekecek. Registry'nin de bayrağa bağlanması gerekiyor.
- **`PaymentCardScreen` / `PaymentFailedScreen` / `PaymentSuccessScreen` mock kart formu.** Uygulama içinde kart numarası alınan bir ekran (`PaymentCardScreen.js`, TextInput ile) dijital abonelikte Apple 3.1.1 ve Google Play Billing kurallarını ihlal eder. Bu ekranlar silinmeli; ödeme yalnız RevenueCat üzerinden (`lib/purchases.js`) yapılmalı. İçlerindeki sabit metinler de yanlış: "sonraki yenileme 23 Haziran 2027" (`PaymentSuccessScreen.js:130`), "İlk ödeme 30 Haziran 2026'da alınır" (`PaymentCardScreen.js:44`), "Kart limiti yetersiz · kod 51" (`PaymentFailedScreen.js:46`).
- **Ücretsiz deneme sayısı üç farklı yerde üç farklı değer.** "İlk iki deneme ücretsiz" (`paywallContexts.js:53,120`), "Ayda 4 deneme kaydı ücretsiz" (`paywallContexts.js:75`, `paywallMoment.js:17`, `FREE_LIMITS.trials_per_month: 4`) ve "5 deneme sınırı kalktı" (`PaymentSuccessScreen.js:102`). Tek kaynağa (`FREE_LIMITS`) bağlanmalı.
- **Fiyatlar** `PLANS` içinde yedek değer (₺149 / ₺1.068). Mağaza ürünleri, RevenueCat offering'leri ve yerel yedek değerler aynı olmalı.
- **"8. GÜN · Buradan sonrası Pro" kurgusu** (`EighthDayLockScreen.js:51-52`). İlk hafta herkese açık kurgusunda, lansmandan bu yana bir aydır her şeyi ücretsiz kullanan kullanıcı açılış günü 8. gün kilidiyle karşılaşmamalı. Mevcut kullanıcılar için ayrı bir "geçiş" kampanyası ve iletişim gerekiyor (ör. "Kurucu üye: ilk ay %50").
- **İptal ve hesap silme.** `AccountDeleteScreen.js:59-63` abonelik uyarısı bayrağa bağlı, iyi. Ama `SUBSCRIPTION_CANCEL` ekranı da açılmalı ve App Store/Play abonelik yönetimi deep link'i test edilmeli.
- **Analitik.** `PAYWALL_SUPPRESSED` olayı `reason: "premium_disabled"` ile yazılıyor (`paywallGate.js:52`, `PremiumContext.js:160-170`). Bu bir aylık veri "hangi kilit en çok tetiklendi" sorusuna ücretsiz cevap veriyor. Açılıştan önce bu raporu çekin.

---

## 6. Tutarsızlıklar

### Terminoloji

| Kavram | Kullanılan varyantlar | Öneri |
|---|---|---|
| Plan birimi | "durak" (her yerde), "görev" (`calendar/components/DayTasks.js:70-73`, `DayDetailSheet.js:28`, `TaskInputPanel.js:45,55`, `NotificationsSettingsScreen.js:103`, `planTaskMappers.js:52`) | Hep **durak** |
| Geride kalan iş | "Konu borcu", "BORÇ DAĞITIMI" (`DebtDistributedView.js:28`), "Geride kalan konular" (`ProgramWeekView.js:117`), "saat geride" (`RouteTopicDebtRow.js:19`) | Kullanıcıya **"geride kalan"**; "borç" yalnız iç terim |
| Bölüm eşiği ekranı | "Net eşiği", "Net & Sıralama Tahmini", "Bölüm Eşiği" | **Bölüm Eşiği** |
| Prova | "Simülasyon", "Deneme Provası", "Sınav Simülatörü" | **Deneme Provası** |
| Meydan okuma | "Meydan okumalar" (Profil), "Challenge" (Ayarlar ve ekranın kendisi, `ChallengeScreen.js:69-177`, `FriendsScreen.js:205-213`) | **Meydan okuma** |
| Seri | "seri" (genel), "Streak" (`NotificationsSettingsScreen.js:89-90`) | **Seri** |
| Defter | "Defterim", "Yanlış defteri", "Defter" | **Yanlış defteri** (başlık), "Defter" (kısa) |
| Ücretli sürüm | "Pro", "Premium", "MARATON PRO" | **Pro** |
| Sosyal | "Sosyal Hub", "Sosyal ve Gruplar" (a11y), "Gruplarım" | **Sosyal** |

### Ses ve ton
- Uygulamanın kendisi konuşan kişi mi, değil mi, belli değil. Bazı yerlerde birinci tekil şahıs ("İlk denemeni bekliyorum", `AnalysisHeroScore.js:28`; "ikisini karşılaştırırım", `PublisherComparisonCard.js:18`; "haber vereyim mi?"), bazı yerlerde üçüncü şahıs ("Maraton söylesin", `paywallMoment.js:20`), bazı yerlerde edilgen ("rota yeniden çizilir"). Birini seçin. Benim önerim sakin bir birinci tekil: "Maraton" bir koç gibi konuşsun.
- Oyunlaştırma dili ürünün sakin tonuyla çatışıyor: "Haftalık Savaşçı", "Aylık Titan", "Çelik İrade" (`lib/streakMilestones.js`), "Rakibini bul, motivasyonunu katla" (`LeagueScreen.js:298`), "DÜŞME BÖLGESİ". Bunun karşısında "Değiştiremediğin bir sayıyı göstermek yardım etmez" gibi çok olgun bir dil var. İkisi aynı üründe olunca uygulama iki ayrı kişi yazmış gibi görünüyor.

### Sabit ya da sahte sayılar (TODO.md'dekilere ek)

| Yer | Metin | Durum |
|---|---|---|
| `ReviewDoneScreen.js:41` | "Yarın 4 soru, üç gün sonra 7 soru bekliyor." | **Hâlâ var** (TODO'da listeli) |
| `ReviewDoneScreen.js:89` | "Bu konu 9 gün sonra tekrar önerilecek." | **Yeni** |
| `ReviewDoneScreen.js:21-26` | Varsayılan 6/2/4/2/14/12 | **Yeni** |
| `ReviewDoneScreen.js:82-85` | İlerleme çubuğu sabit 3/2/2/1 | **Yeni** |
| `RoadmapScreen.js:105` | "24 devlet üniversitesi" | **Yeni**, veriyle çelişiyor |
| `QuickAddSheet.js:114` | "Fotoğraftan veya elle" | **Yeni**, özellik yok |
| `TrialRecordFilters.js:56,61` | "Yayın · hepsi", "Son 3 ay" (çalışmayan dropdown) | **Yeni** |
| `AnalysisTrialHistory.js:29` | "İYİ"/"ZOR" net değişiminden türetiliyor | **Yeni** |
| `PlanDetailEmptyState.js:13-28` | "20 dakikalık dönüş durağı · 10 dakika konu tekrarı · 10 soru" önerisi var ama ekleme butonu yok | **Yeni**, çıkmaz sokak |
| `AboutScreen.js:37` | "v1.0.0" sabit | **Yeni** |
| `NotificationBenefitList.js:6` | "Tahminin 71'den 73'e çıktı." | Örnek olduğu belli değil; "Örnek:" ibaresi eklenmeli |
| `DeeperAnalysisSection.js` | "Bu tempoyla sınav günü 71 net" | **Artık yok**, TODO.md eskimiş |
| `TopicDebtHero.js:10` | "0 sa" anlık görünmesi | `loading` dalı eklenmiş, TODO.md eskimiş görünüyor (cihazda doğrula) |

### Doküman sapmaları
- `TODO.md`: "71 net" ve TopicDebt maddeleri çözülmüş görünüyor. "Widget ertelendi" maddesi `docs/DURUM.md`'deki "Widget'lar cihazda doğrulandı" ile çelişiyor. Sentry maddesi de eskimiş: `eas.json` production profilinde artık `SENTRY_DISABLE_AUTO_UPLOAD=true` var, yani build kırılmaz ama **lansman günü crash raporları sembolsüz olur.**
- `AGENTS.md` `design/extracted/tokens.md` dosyasına atıf yapıyor, ama klasörde böyle bir dosya yok (yalnız `.dc.html` dosyaları ve `Denetim Raporu.md` var).
- `premium.js:3` "bayrak yeterli" diyor; 5. bölümde açıklandığı gibi yetmiyor.

### Boş durum kalitesi
- **İyi:** Ana Sayfa ilk gün, Defter, Bildirimler ("Şimdilik yeni haber yok." + ayarlara link), Rota boş durumu.
- **Zayıf:** Analiz (4 boş kart üst üste), Lig ("Henüz kimse yok", CTA yok), Lig hata durumu ("Tekrar dene" yazıyor ama buton yok), Plan detay (öneri var, aksiyon yok).

### Tasarım kuralı ihlalleri (kullanıcıya yansıyanlar)
- `C.danger` yıkıcı olmayan bir etikette kullanılıyor: "DÜŞME BÖLGESİ" (`LeagueScreen.js:286`).
- 44px altı dokunma alanları: keşif kartı kapatma ikonları (`ScheduleDiscoverCard.js:51-58`, `HabitDiscoverCard.js` closeBtn).
- screens altında 158 elle yazılmış `fontFamily` ve 25 dosyada 150 satır aşımı var (en büyükleri `LeagueScreen.js` 421, `ChallengeScreen.js` 315, `FriendsScreen.js` 307, `ReferralScreen.js` 307). Bunların çoğu tam da gizlenmesini önerdiğim sosyal ekranlar.

---

## 7. Öncelikli aksiyon listesi

### P0 — launch'tan önce şart (çoğu tek satır)
1. Premium kapalıyken deneme girişi erişim RPC'sini beklememeli: `!PREMIUM_ENABLED` ise `ready=true, blocked=false`. Dosyalar: `src/screens/trial/useTrialQuotaGate.js`, `src/screens/trial/useTrialEntryForm.js`
2. `routeAccessError: PREMIUM_ENABLED ? accessError : false`. Dosya: `src/hooks/useStudyRoute.js:881`
3. `useFeatureEntry` için premium kapalıyken erken `return true`. Dosya: `src/hooks/useFeatureEntry.js:20`
4. "Rotan hazır." cümlesini kaldır. Dosya: `src/screens/auth/RegisterScreen.js:94`
5. Bildirim izni ekranında "ROTA YENİDEN ÇİZİLDİ / İlk denemen rotaya işlendi / tek bildirim" metinlerini kurulum bağlamına göre düzelt. Dosya: `src/screens/onboarding/NotificationPermissionScreen.js:84-90`
6. "Fotoğraftan veya elle" yerine "Ders ders net gir" yaz. Dosya: `src/screens/trial/QuickAddSheet.js:114`
7. `ReviewDoneScreen`'deki sabit cümleleri, sahte varsayılanları, `→` bug'ını ve Türkçe ek hatalarını düzelt. Dosya: `src/screens/wrong-notebook/ReviewDoneScreen.js:21-26,40-41,79,82-89`
8. LGS'de "TYT provası" ve üniversite/bölüm girişlerini gizle. Dosyalar: `src/screens/analysis/components/DeeperAnalysisSection.js:44-49`, `src/screens/roadmap/RoadmapScreen.js:101-107`
9. "24 devlet üniversitesi" metnini düzelt. Dosya: `src/screens/roadmap/RoadmapScreen.js:105`
10. Android'de sosyal buton yokken "VEYA" ayracını gizle. Dosyalar: `src/screens/auth/RegisterScreen.js:128-134`, `src/screens/auth/LoginScreen.js:~100-104`
11. Çalışmayan "Yayın · hepsi / Son 3 ay" dropdown'larını gizle. Dosya: `src/screens/trial/components/TrialRecordFilters.js:54-63`
12. Android submit track'ini (`internal`) ve Sentry source map yüklemesini kontrol et. Dosya: `eas.json:36-48`

### P1 — ilk hafta
1. Sosyal yüzeyi bayrakla daralt: Genel Lig, Challenge, Yol Arkadaşı ve Referral'ı gizle. Dosyalar: yeni `src/constants/features.js`, `src/screens/profile/ProfileScreen.js:84-99`, `src/screens/settings/SettingsScreen.js:92-97`, `src/screens/league/LeagueScreen.js:352-356`
2. Analiz'de 0 deneme varken tek bir boş durum göster, nudge popup'ı kaldır, sabit FAB ile tabbar "+" çakışmasını çöz. Dosyalar: `src/screens/analysis/AnalysisScreen.js`, `useAnalysisController.js:38-39`, `components/AnalysisAddTrialButton.js`
3. "İYİ/ZOR" etiketini kaldır ya da `difficulty_level` alanına bağla; LGS için "TYT" varsayılanını düzelt. Dosya: `src/screens/analysis/components/AnalysisTrialHistory.js:24,29`
4. Durak dışı kayıtta "DURAK TAMAMLANDI" yerine "KAYDA GEÇTİ" yaz. Dosya: `src/screens/study/StudySummaryScreen.js:69`
5. "Rota Hazır" ekranından sayaca direkt geçmek yerine "Şimdi başla / Ana sayfaya git" seçimini öne çıkar. Dosya: `src/screens/onboarding/RouteReadyScreen.js:44-48`
6. Terminolojiyi tekle (görev → durak, Challenge → Meydan okuma, Streak → Seri, eşik adı). Dosyalar: `src/screens/calendar/components/DayTasks.js`, `src/screens/social/ChallengeScreen.js`, `src/screens/settings/NotificationsSettingsScreen.js:89-103`, `src/screens/settings/SettingsScreen.js:59,95`
7. Program > Hafta'da aynı anda en fazla bir keşif kartı göster. Dosya: `src/screens/program/views/ProgramWeekView.js:104-108`
8. Home overlay'leri için tek kuyruk kur (oturum başına bir modal). Dosya: `src/screens/home/components/HomeOverlays.js`
9. Gizlilik metnini RevenueCat, kamera/fotoğraf ve analitiği içerecek şekilde güncelle; 13 yaş ve veli onayı konusunu hukukçuya sor. Dosya: `src/constants/legalDocs.js:17-45`
10. Hakkında ekranında sürümü dinamik oku, "React Native ile yapıldı"yı sil. Dosya: `src/screens/settings/AboutScreen.js:37,49`
11. Plan detay boş durumuna "Bu durağı ekle" butonu koy. Dosya: `src/screens/plan/components/PlanDetailEmptyState.js`
12. Lig hata durumuna bir "Tekrar dene" aksiyonu ekle, `danger` rengini kaldır. Dosya: `src/screens/league/LeagueScreen.js:286,295`

### P2 — sonra (premium açılışına doğru)
1. Premium registry'sini bayrağa bağla; bayrak tek başına çalışmıyor. Dosya: `src/navigation/screenRegistry.js:231-247`
2. Mock kart ödeme ekranlarını (`PaymentCard/Processing/Success/Failed`) sil, yalnız RevenueCat kullan. Dosya: `src/screens/premium/Payment*.js`
3. Ücretsiz deneme limit metnini tek kaynağa bağla (2/4/5 karmaşası). Dosyalar: `src/constants/paywallContexts.js:53,75,120`, `paywallMoment.js:17`, `src/screens/premium/PaymentSuccessScreen.js:102`
4. Seri ödülü premium günleri için politika kararı ver. Dosyalar: `src/lib/streakMilestones.js`, `src/hooks/useGamification.js:246`
5. Mevcut kullanıcılar için "8. gün kilidi" yerine geçiş kampanyası tasarla. Dosyalar: `src/screens/premium/EighthDayLockScreen.js`, `src/hooks/useAccessEndedMoment.js`
6. "Pro" / "Premium" adını tekle. Dosyalar: `src/constants/accessEnded.js`, `proPitch.js`, `paywallMoment.js`
7. Analiz içgörü kartını `useRecommendations` ile geri bağla. Dosyalar: `src/screens/analysis/AnalysisScreen.js`, `notes.md` (son bölüm)
8. Ölü kodu temizle. Dosyalar: `src/screens/trial/TrialInsightsScreen.js`, `src/screens/wrong-notebook/CommunityTab.js`, `.../detail/CommunityQuestionDetail.js`, `src/screens/wrapped/`, `src/screens/plan/components/AddTaskWhenBlock.js`
9. Sosyal ekranları yeni token sistemine ve 150 satır kuralına taşı. Dosyalar: `src/screens/league/LeagueScreen.js`, `src/screens/social/*.js`
10. `TODO.md`, `AGENTS.md` (`design/extracted/tokens.md` atfı) ve `premium.js:3` yorumunu güncelle.
