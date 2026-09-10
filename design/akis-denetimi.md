# FAZ 1.6 · Akış ve Bilgi Mimarisi Denetimi

Kaynak: `design/extracted/Maraton Uygulama.dc.html` (170 `data-screen-label`),
`design/ekran-envanteri.md` (94 hedef), `src/navigation/*`, `src/constants/screens.js`.
Her iddia HTML satır numarasına dayanır. Tahmin yok; doğrulanamayan yerler
**DOĞRULANMADI** işaretli.

Yöntem: 170 artboard etiketi + her artboard'ın üstündeki kendi "eyebrow" başlığı
(`font:600 11.5px ... color:var(--text3)`) + her artboard'ın birincil butonu
(`font:700 16px 'Archivo'`) + tabbar durumu (`class="tab tabon"`) + tasarımcının
kendi "ÇAPRAZ BAĞLAR" blokları çıkarıldı. Eyebrow başlığı, akış haritasından
DAHA GÜVENİLİR bir kaynak: tasarımcı ekranı çizerken oraya yazmış, akış haritasını
sonradan toplamış. Aşağıdaki hataların çoğu tam bu ikisinin çeliştiği yerlerde.

---

## 0. Önce iki yapısal çelişki

### 0.1 Tasarımda 5 sekme YOK — 4 sekme + ortada FAB var  🔴 KRİTİK

Tabbar 27 artboard'da çiziliyor. Etiketleri her seferinde aynı ve tam olarak dört:
`ROTA · PROGRAM · [+] · ANALİZ · PROFİL`
(satır 408-412, 1645-1649, 2326-2330, 3436-3440, 3748-3752, 4475-4479, 4627-4631,
4809-4813, 4907-4911, 4968-4972, 5035-5039, 5206-5210, 6364-6368, 6447-6451,
6970-6974, 7046-7050, 7854-7858, 7928-7932, 9146-9150, 10611-10615, 10781-10785,
11516-11520, 12293-12295, 12328-12330, 12358-12360, 12411-12413, 12440-12442).

Hiçbir artboard'da `BUGÜN` etiketli bir sekme yok. Dahası tasarımcı bunu yazıyla da
söylüyor: AKIŞ 1 açıklaması "**ROTA sekmesinin kökü Ana Sayfa'dır**; oturum bitince
buraya döner" (satır 226) ve AKIŞ 2 açıklaması "Tabbar bozulmaz — hepsinde ROTA
sekmesi yanmaya devam eder. **Ana Sayfa kök**, diğerleri üstüne açılan katmanlar"
(satır 1517). Ana Sayfa artboard'ında aktif sekme `ROTA` (satır 408).

Yani tasarıma göre **BUGÜN ve ROTA aynı sekme**; Ana Sayfa o sekmenin kökü,
Rota Detay onun üstüne push edilen katman (Rota Detay'da da aktif sekme ROTA,
satır 1645).

BUGÜN'ü ayrı sekme yapmak iki şeyi bozar:
- 390px genişlikte 5 sekme + 54px FAB = 6 slot → sekme başına ~62px. Tasarımın
  dokunma kuralı (`tokens.md:93`, min 44px) sınırda kalır, 11px büyük harf +
  `.14em` letter-spacing etiketler ("PROGRAM", "PROFİL") sığmaz.
- Ana Sayfa'nın kendisi rotayı gösteriyor (satır 246-275'te tam rota SVG'si, BUGÜN
  düğümü, projeksiyon hattı). BUGÜN ve ROTA aynı grafiği iki sekmede iki kez
  gösterir — sekme ayrımının anlamı kalmaz.

**Öneri:** Tasarımın çizdiği yapıya uy: **4 sekme + FAB**
(`ROTA · PROGRAM · + · ANALİZ · PROFİL`), ROTA kökü Ana Sayfa. "BUGÜN" adı
sekmede değil, Ana Sayfa'nın rota grafiğindeki düğüm etiketinde yaşıyor
(satır 268: `BUGÜN` kırmızı etiket). Aşağıdaki tüm eşleme bu yapıya göre.
Karar 5 sekmede ısrar ederse: BUGÜN kökü = Ana Sayfa, ROTA kökü = Rota Detay
olur ve AKIŞ 2'nin 7 ekranı ROTA'ya, AKIŞ 1'in 7 ekranı BUGÜN'e gider —
mapping tablosunda bu satırlar `[BUGÜN]` ile ayrıca işaretli.

### 0.2 Mevcut navigasyon "tabbar bozulmaz" kuralını KARŞILAMIYOR  🔴 KRİTİK

`src/navigation/AppNavigator.js:51-62` — `MainTabs` altında yalnızca 4 tab ekranı +
`Add` stub var. Geri kalan her şey `AppStackInner`'da (satır 106-110) **kök stack'te**
tanımlı. Yani `PlanDetail`, `TrialDetail`, `WrongNotebook` gibi her push tabbar'ı
ekrandan kaldırıyor. Tasarım bunun tersini şart koşuyor (satır 1517) ve bunu
artboard'larla kanıtlıyor: Durak Detayı, Gün Detayı, Takvim, Seviye gibi *derin*
ekranlarda tabbar hâlâ çizili ve doğru sekme yanıyor (4810, 5207, 6451).

**Öneri:** `MainTabs` → her sekme kendi `createNativeStackNavigator`'ına sahip
4 nested stack. Kök stack'te yalnızca: auth/onboarding, paywall/ödeme, tam ekran
kutlama modalları ve `Çalışma Oturumu` kalır (tabbar'ın kasten kaybolduğu tek
akış: satır 423-497'de Çalışma Oturumu artboard'ında tabbar YOK — odak ekranı).

---

## 1. Sekme kökleri ve tam eşleme (94 hedef)

Kökler: **Ana Sayfa** (ROTA) · **Program Hub** (PROGRAM) · **Analiz** (ANALİZ) ·
**Profil** (PROFİL). `+` bir sekme değil, her kökten açılan sheet (satır 2222:
"Tabbar'ın ortasındaki + her kök ekrandan açılır").

Sunum tipi: `ekran` = stack push · `sheet` = alttan yarım/tam sheet ·
`dialog` = ortada onay kutusu · `modal` = tam ekran örtü, tabbar üstünde.

### ROTA sekmesi stack'i — 21 hedef

| Ekran | Satır | Sunum | Not | Mevcut kod |
|---|---|---|---|---|
| Ana Sayfa | 231 | **kök** | aktif sekme ROTA (408) | `HomeScreen.js` ✎ |
| Çalışma Oturumu | 423 | modal (tabbar yok) | kök stack'te tutulmalı | `StudyTimerScreen.js` ✎ |
| Oturum Bitti | 498 | modal | CTA "Sıradaki durağı başlat" (575) | `StudySummaryScreen.js` ✎ |
| Oturumu Etiketle | 5937 | sheet | eyebrow "OTURUM BİTTİ · NE ÇALIŞTIN" | `StudySaveScreen.js` ✎ |
| Günün Özeti | 660 | ekran | CTA "Yarının planına bak" (877) | ✚ |
| Haftalık Özet | 890 | ekran | CTA "Kartı gör" (1017) | `WeeklyReviewScreen.js` ✎ |
| Ayın Özeti | 1038 | ekran | CTA "Eylül planına bak" (1210) | ✚ |
| Rota Detay | 1531 | ekran `[ROTA kökü, 5-sekme senaryosunda]` | aktif sekme ROTA (1645) | `RoadmapScreen.js` ✎ |
| Rotanın tamamı | 1660 | ekran | eyebrow "KAPI" — hub | ✚ |
| Durak Detayı | 1802 | ekran | CTA "Çalışmaya Başla" (1894) | `PlanDetailScreen.js` ✎ |
| Ara Verme | 1906 | **dialog** | eyebrow "ARA VERME · ONAY" | ✚ |
| Senaryolar | 2014 | ekran (premium) | CTA "Bu tempoyu uygula" (2056) | `NetForecastScreen.js` ✎ |
| Bölüm Eşiği | 2067 | ekran | eyebrow "NET EŞİĞİ · BÖLÜMLER" | `RankSimulatorScreen.js` ✎ |
| Rotayı Yeniden Çiz | 2147 | **dialog** | eyebrow "ONAY ·" | ✚ |
| Sırada Ne Var | 601 | ekran | ⚠ sınav sonrası zinciri, bkz. 2.1 | ✚ |
| Sınav Sonucu | 11178 | ekran | eyebrow "SINAV SONRASI · 1" | ✚ |
| Tahmin Doğruluğu | 11221 | ekran | eyebrow "SINAV SONRASI · 2" | ✚ |
| Sınav Günü Planı | 11089 | ekran | CTA "Planı kaydet" (11165) | ✚ |
| Deneme Provası | 11390 | ekran | CTA "Provayı kur" (11444) | `ExamSimulatorScreen.js` ✎ |
| Geri Döndün | 10912 | modal | eyebrow "GERİ DÖNÜŞ MODU · BAŞARI" | ✚ |
| Geri Dönüş | 10957 | modal | eyebrow "RETENTION · GERİ DÖNÜŞ" | ✚ |

Ana Sayfa varyantları (ekran değil, aynı ekranın state'i): Boş Durumlar (1412),
Ücretsiz Ana Sayfa (10542), Son Hafta (10686, aktif sekme ROTA 10781),
Sınav Günü (10796), Geri Dönüş Modu (10865), Son Hafta Geride (11009),
İlk Gün (9090, aktif sekme ROTA 9146), Boş Rota (11468, aktif sekme ROTA 11516),
Açık Tema Ana Sayfa (7779), Küçük Ekran (11699).

### PROGRAM sekmesi stack'i — 13 hedef

| Ekran | Satır | Sunum | Kanıt | Mevcut kod |
|---|---|---|---|---|
| Program Hub | 4490 | **kök** | aktif sekme PROGRAM (4628) | ✚ |
| Yol Haritası | 4406 | ekran | aktif sekme PROGRAM (4476) | `RoadmapScreen.js` ✎ |
| Takvim ve Seri | 4644 | ekran | aktif PROGRAM (4810), eyebrow "TAKVİM · GEÇMİŞ AY" | `CalendarScreen.js` ✎ |
| Takvim | 5135 | ekran | aktif PROGRAM (5207), eyebrow "TAKVİM · BU AY" | `CalendarScreen.js` ✎ |
| Aylık Plan | 5798 | ekran | eyebrow "TAKVİM · GELECEK AY" | ✚ |
| Gün Detayı | 4842 | **sheet** | aktif PROGRAM (4908) | ✚ |
| Program | 4979 | ekran | aktif PROGRAM (5036), eyebrow "PROGRAM · HAFTA" | ✚ |
| Durak Ekle | 5221 | **modal** | CTA "Rotaya ekle" (5285) | `AddTaskScreen.js` ✎ |
| Konu Detayı | 5297 | ekran | CTA "Bu konuya durak koy" (5391) | `TopicStudyScreen.js` ✎ |
| Ders Konuları | 5403 | ekran | eyebrow "DERS · KONU LİSTESİ" | `SubjectDetailScreen.js` ✎ |
| Konu Borcu | 5473 | ekran | CTA "Borcu üç haftaya dağıt" (5567) | ✚ |
| Plan vs Gerçek | 5580 | ekran | eyebrow "PLANLANAN vs GERÇEKLEŞEN" | `ComparativeScreen.js` ✎ |
| Boşluğu Kapatma Planı | 5739 | ekran | CTA "Planı uygula" (5787) | ✚ |

Varyantlar: Boş Gün (4924, aktif PROGRAM 4969) = Gün Detayı boş state'i;
Borç Dağıtıldı (5666) = Konu Borcu sonuç state'i.

### ANALİZ sekmesi stack'i — 13 hedef

| Ekran | Satır | Sunum | Kanıt | Mevcut kod |
|---|---|---|---|---|
| Analiz | 3280 | **kök** | aktif sekme ANALİZ (3439) | `AnalysisScreen.js` ✎ |
| Deneme Kayıtları | 3451 | ekran | eyebrow "TÜM DENEME KAYITLARI" | `TrialInsightsScreen.js` ✎ DOĞRULANMADI |
| Konu İlerlemesi | 3587 | ekran | eyebrow "ANALİZ · KONU İLERLEMESİ" | `SubjectListScreen.js` ✎ |
| Deneme Karşılaştırma | 3873 | ekran | eyebrow "KARŞILAŞTIRMA · İKİ DENEME" | `TrialCompareScreen.js` ✎ |
| Deneme Detayı | 2633 | ekran | CTA "Yanlışları deftere ekle" (2736) | `TrialDetailScreen.js` ✎ |
| Deneme Özeti | 3184 | ekran | eyebrow "RETENTION · DENEME ÖZETİ" | `TrialSummaryScreen.js` ✎ |
| Yanlış Defteri | 3669 | ekran | ⚠ tabbar var, aktif sekme YOK (3748-3752) | `WrongNotebookScreen.js` ✎ |
| Öncelikli Konular | 3774 | ekran | CTA "Seçili 3 konuya durak koy" (3858) | `WeakAreasScreen.js` ✎ |
| Yanlış Ekle | 3986 | **modal** | CTA "Kaydet" (4086) | `AddWrongScreen.js` ✎ |
| Yanlış Detayı | 4099 | ekran | CTA "Bu soruyu kapat" (4171) | `WrongDetailScreen.js` ✎ |
| Tekrar | 4250 | modal | eyebrow "TEKRAR OTURUMU" | `ReviewSessionScreen.js` ✎ |
| Tekrar Bitti | 4319 | modal | CTA "Deftere dön" (4370) | ✚ |
| Çalışma Geçmişi | 6046 | ekran | tabbar yok → push. Giriş noktası DOĞRULANMADI | `StudyHistoryScreen.js` ✎ |

Varyantlar: Zor Deneme (3121) = Deneme Detayı state'i; Açık Tema Defter (7871);
Deneme Kayıtları Boş (12271), Analiz Veri Yetersiz (12301), Öncelikli Konular Boş
(12337), Çalışma Geçmişi Boş (12366), Boş Defter (11526).

### PROFİL sekmesi stack'i — 18 hedef

| Ekran | Satır | Sunum | Kanıt | Mevcut kod |
|---|---|---|---|---|
| Profil | 6237 | **kök** | aktif sekme PROFİL (6368) | `ProfileScreen.js` ✎ |
| Seviye | 6379 | ekran | aktif PROFİL (6451) | ✚ |
| Kilometre Taşı | 6463 | **modal** | eyebrow "RETENTION ·", CTA "Kartı paylaş" (6507) | ✚ |
| Paylaşım Kartı | 6519 | **modal** | CTA "Paylaş" (6566) | `ShareCardScreen.js` ✎ |
| Neye Göre Öneriyoruz | 6683 | sheet | ⚠ ulaşılamaz, bkz. 2.3 | ✚ |
| Ayarlar | 7441 | ekran | "Çıkış yap" satırı (7543) | `SettingsScreen.js` ✎ |
| Profil Düzenle | 7555 | ekran | ⚠ kaydet butonu yok, bkz. 2.12 | `EditProfileScreen.js` ✎ |
| Bildirimler | 7671 | ekran | eyebrow "BİLDİRİMLER" | `NotificationsSettingsScreen.js` ✎ |
| Görünüm | 7703 | ekran | eyebrow "AYARLAR · GÖRÜNÜM" | `AppearanceScreen.js` ✎ |
| Gizlilik | 7944 | ekran | 3 belge satırı (7956-7970) | `PrivacyScreen.js` ✎ |
| Belge | 8011 | ekran (param) | eyebrow "BELGE · GİZLİLİK POLİTİKASI" | `TermsScreen.js` ✎ |
| Veri İndir | 8061 | ekran | CTA "E-postama gönder" (8105) | ✚ |
| Hesap Silme | 8120 | **dialog** | eyebrow "ONAY ·", CTA "Vazgeç" (8153) | ✚ |
| Hedef Düzenle | 8177 | ekran | CTA "Kaydet" (8226) | `GoalsScreen.js` ✎ |
| Tarih Seçici | 8237 | **sheet** | 8322: "Hedef Düzenle'deki satırın ucu" | ✚ |
| Ders Programı | 5050 | ekran | eyebrow "**AYARLAR** · HAFTALIK DERS PROGRAMI" | ✚ |
| Abonelik | 9368 | ekran | eyebrow "AYARLAR · ABONELİK VE HESAP" | ✚ |
| Abonelik İptali | 9441 | **dialog** | eyebrow "ONAY ·" | ✚ |

Varyant: Bildirim Halleri (7614) = bildirim önizleme bileşeni, ekran değil.

### `+` FAB sheet'i — 5 hedef

| Ekran | Satır | Sunum | Kanıt | Mevcut kod |
|---|---|---|---|---|
| Hızlı Ekle | 2227 | **sheet** | eyebrow "ARTI BUTONU", birincil buton yok | `QuickActionSheet` ✎ |
| Deneme Gir (1/3·2/3·3/3) | 2344·2443·2536 | modal sihirbaz | CTA'lar 2428 / 2523 / 2598 | `TrialEntryScreen.js` ✎ |
| Fotoğraftan Oku | 2754 | modal (kamera) | eyebrow "DENEME GİR · FOTOĞRAFTAN OKU" | ✚ |
| Okuma Onayı | 2817 | modal | CTA "Onayla ve rotaya işle" (2888) | ✚ |
| Kaydı Düzenle | 3044 | modal | eyebrow "MOD 3 · DÜZENLEME" | `AddStudyScreen.js` ✎ |

Varyantlar: Fotoğrafa Dön (2610, 22 satır → dialog), Kayıt · Ölçülmüş (2900) ve
Kayıt · Elle (2977) — eyebrow'ları "MOD 1 / MOD 2", üçünün de CTA'sı "Kaydet"
(2966 / 3033 / 3107) → tek ekranın üç modu, tasarımcı da böyle adlandırmış.

### Kök seviye (sekme dışı) — 23 hedef

**Auth + kurulum (11):** Karşılama 8355 (`OnboardingScreen.js` ✎) ·
Giriş 8410 (`LoginScreen.js` ✎) · Kayıt 8476 (`RegisterScreen.js` ✎) ·
Şifre Sıfırla 8541 (`ForgotPasswordScreen.js` ✎) · Hedef Seç 8613
(`ExamSetupScreen.js`+`GoalSetupScreen.js` ✎) · Bölümler 8670 ✚ ·
Tercih Listesi 8747 ✚ · Seviye Testi 8870 ✚ · Rota Hazır 8926 ✚ ·
Bildirim İzni 8989 ✚ · Kurulum Yarım 9161 ✚
Varyant: Bağlantı Gönderildi 8576.

**İlk 7 gün (5, hepsi modal):** İlk 7 Gün 9718 ✚ · İlk Rotan Hazır 9829 ✚ ·
Çalışman İşlendi 9865 ✚ · Bir Hafta 9901 ✚ · 8. Gün 9932 ✚

**Premium (2):** Premium 9308 (`PaywallScreen.js` ✎) · Pro Önizleme 10000 ✚
Bileşen modları: Paywall Anı 9223, Paywall · Karşılaştırma/Senaryolar/OCR/
Geçmiş/Rapor (10347-10503), Önizleme · OCR/Geçmiş/Tempo (10077-10253),
Deneme Kotası Doldu 10623.

**Ödeme (2):** Ödeme · Kart 11779 ✚ · Deneme Bitti 11971 ✚
Varyantlar: Ödeme İşleniyor 11837, Başarılı 11858, Başarısız 11923.

**Tamamlama modalları (3):** Gün Tamamlandı 12062 ✚ · Hafta Tamamlandı 12120 ✚ ·
Rota Tamamlandı 12197 ✚

**Toplam:** 21 (ROTA) + 13 (PROGRAM) + 13 (ANALİZ) + 18 (PROFİL) + 5 (FAB)
+ 23 (kök) = **93**. 94'ün kalanı **Soru Detayı** (4186) — v1 dışı, bkz. 2.2.

---

## 2. Akış hataları

### 2.1 · "Sırada Ne Var" günlük döngüye yanlış bağlanmış  🔴 KRİTİK
Akış haritası (satır 132) yazıyor: `Oturum Bitti → Sırada Ne Var → Günün Özeti`.
Ama artboard'ın kendi eyebrow'u **"SINAV SONRASI · 3 · SIRADA NE VAR"** (satır 600).
1 ve 2 numaralı adımlar da var: "SINAV SONRASI · 1 · SONUCU GİR" (11177 = Sınav
Sonucu), "SINAV SONRASI · 2 · TAHMİN NE KADAR TUTTU" (11220 = Tahmin Doğruluğu),
"· 2B · BANT DIŞINDA" (11296 = Tahmin Şaştı). Yani Sırada Ne Var, **gerçek YKS
sonucu girildikten sonra "şimdi ne yapacaksın" ekranı** — günde bir kez değil,
yılda bir kez görülür. Oturum Bitti'nin birincil butonu da onu desteklemiyor:
"Sıradaki durağı başlat" (575) doğrudan yeni oturum açıyor.

**Öneri:** Sırada Ne Var'ı AKIŞ 1'den çıkar, AKIŞ 14'ün sınav-sonrası zincirine
bağla: `Sınav Sonucu → Tahmin Doğruluğu (/Tahmin Şaştı) → Sırada Ne Var`. Günlük
döngü `Oturum Bitti → (Oturumu Etiketle) → Ana Sayfa` olarak kapanır — satır
590-592'deki tasarımcı notu da bunu diyor: "DÖNÜŞ · Ana Sayfa · sayaç güncellenmiş
halde".

### 2.2 · "Soru Detayı" bir SOSYAL ekranı, defter akışına yanlış konmuş  🔴 KRİTİK
Akış haritası onu AKIŞ 6'ya (Yanlış Defteri) koyuyor (satır 152), envanter de
94'e dahil ediyor. Ama eyebrow: **"TOPLULUK · SORU DETAYI"** (satır 4185). İçinde
"Yanıtla" aksiyonu var (4229) ve tasarımcının kendi çapraz bağı: "Soru Detayı ·
'Yanıtla' → AKIŞ 10 · Cevap Yaz" (4384-4386). Aynı blokta "Yanlış Detayı ·
'Topluluğa sor' → AKIŞ 10 · Soru Sor" (4379-4381).

**Öneri:** Soru Detayı v1'den DÜŞER (94 → 93). Ayrıca Yanlış Detayı'ndaki
"Topluluğa sor" satırı ve Yanlış Defteri'ndeki "Topluluk" satırı (çapraz bağ
3969-3971) kaldırılmalı — aksi halde ölü butonlar kalır. Ana Sayfa'daki Defter
satırının alt metni de sosyal veri içeriyor: "16 çözülmemiş soru · **Topluluktan
3 yeni cevap**" (satır 400) → ikinci yarı silinir.

### 2.3 · "Neye Göre Öneriyoruz" hiçbir yerden açılamıyor  🟠 YÜKSEK
Bölümün kendi açıklaması: "Rota Detay ve Premium'daki **'Bu öneri neye dayanıyor?'
satırlarının ucu**" (satır 6679). O satır hiçbir artboard'da yok: `neye dayanıyor`
ifadesi dosyada sadece 6679 (açıklama metni) ve 6692 (ekranın kendi içi) satırlarında
geçiyor. Rota Detay (1531-1658) ve Premium (9308-9366) artboard'larında böyle bir
satır çizilmemiş.

**Öneri:** Şeffaflık ekranı v1 için değerli (KVKK + öğrenci güveni). Rota Detay'ın
"Senaryolar"/"Söz ve gerçek" satır grubuna (1614-1621) üçüncü satır olarak
"Bu öneri neye dayanıyor?" ekle ve sheet olarak aç. Premium tarafına ekleme —
paywall'da meta-açıklama dönüşümü düşürür.

### 2.4 · "Arama" sosyal sanılıp yanlışlıkla düşürüldü  🟠 YÜKSEK
Akış haritası Arama'yı AKIŞ 10 · SOSYAL içine yazmış (satır 168), envanter de
v1-dışı 10 artboard'a dahil etmiş (`ekran-envanteri.md:7`). Ama eyebrow:
**"YOL HARİTASI · ARAMA"** (satır 7209) ve içeriği konu adları:
"Permütasyon - Kombinasyon" (7228), "Olasılık" (7236), "Binom Açılımı" (7244).
Bu, müfredat/konu aramasıdır — sosyalle ilgisi yok. Aynı şekilde
"Arama Sonuç Yok" (12449) boş durumunun CTA'sı "**İntegral olarak ara**" (12466),
yani konu arama.

**Öneri:** Arama v1'e GERİ ALINIR ama ayrı ekran değil: Yol Haritası'nın üstünde
arama sheet'i. Düşen sosyal artboard sayısı 10 → 8 (Arama + Arama Sonuç Yok geri).

### 2.5 · Takvimin üç ayı üç ekran sayılmış — tasarımcı tersini yazmış  🟠 YÜKSEK
AKIŞ 7 açıklaması net: "**Takvim tek ızgara, üç ay durumu**: geçmiş ayda ne
çalışıldığı ve seri, bu ayda seçili günün durakları, gelecek ayda planlanan
yoğunluk. Ay ileri geri kaydırılır; ızgara ve gösterge dili üçünde aynı"
(satır 4401). Eyebrow'lar da bunu doğruluyor: "TAKVİM · GEÇMİŞ AY (MAYIS)" (4643),
"TAKVİM · BU AY (HAZİRAN)" (5134), "TAKVİM · GELECEK AY (EYLÜL)" (5797).
Buna rağmen akış haritası (satır 156) ve envanter üçünü ayrı hedef olarak sayıyor:
Takvim ve Seri · Takvim · Aylık Plan.

**Öneri:** Tek `Takvim` ekranı, `month` parametresi + geçmiş/şimdi/gelecek modu.
3 → 1. "Aylık Plan" adı kalksın; Ayın Özeti'nin CTA'sı "Eylül planına bak" (1210)
`Takvim(month=+1)` açar.

### 2.6 · "Program Hub" ve "Program" aynı işi yapıyor  🟠 YÜKSEK
Eyebrow'lar: "PROGRAM HUB · **HAFTA**" (4489) ve "PROGRAM · **HAFTA**" (4978).
İkisi de PROGRAM sekmesinde (aktif sekme 4628 ve 5036). Birincil butonlar
neredeyse aynı: "Bugüne durak ekle" (4624) ve "Durak ekle" (5031).
Dahası dört artboard tamamen aynı birincil butonu taşıyor: Program Hub (4624),
Takvim ve Seri (4798), Gün Detayı (4903), Boş Gün (4964) — hepsi "Bugüne durak ekle".

**Öneri:** `Program` düşer, `Program Hub` kalır (sekme kökü). Haftalık görünüm
Hub'ın içinde segmented kontrol; AKIŞ 7 açıklaması da "Haftalık görünüm Program
Hub'da kalır" diyor (satır 4401). 2 → 1.

### 2.7 · Rota Detay ve Rotanın tamamı iki hub, tek iş  🟡 ORTA
Rota Detay'ın satırları: "72 net ≈ hangi bölümler?" (1614), "Söz ve gerçek" (1621).
Rotanın tamamı'nın satırları: "Yol haritası" (1754), "Program" (1762),
"Konu borcu" (1770), "Söz ve gerçek" (1778). "Söz ve gerçek" ikisinde de var →
Plan vs Gerçek'e iki ayrı kapı. Eyebrow'lar "ROTA DETAY · **YENİ**" (1530) ve
"ROTANIN TAMAMI · **KAPI**" (1659) — ikisi de gezinme kapısı olarak çizilmiş.

**Öneri:** Tek `Rota` ekranı; "tüm rota" zoom-out bir *görünüm* (segmented:
Bu hafta / Tamamı), ayrı ekran değil. Sekme kökü Ana Sayfa olduğu için bu ekran
onun tek katman üstünde durur. 2 → 1.

### 2.8 · Onboarding zinciri tasarımcının kendi numaralandırmasına aykırı  🟠 YÜKSEK
Akış haritası düz bir zincir yazıyor: `Hedef Seç → Bölümler → Tercih Listesi →
Seviye Testi → Rota Hazır` (satır 176). Ama artboard'ların kendi numaraları:
`ONBOARDING · 1 · KARŞILAMA` (8354), `· 2 · HEDEF` (8612),
`· 3 · BAŞLANGIÇ NOKTASI` (8869 = Seviye Testi), `· 4 · ROTA HAZIR` (8925).
Bölümler ve Tercih Listesi numarasız: eyebrow'ları "BÖLÜMLER · HEDEF
KARŞILAŞTIRMA" (8669) ve "TERCİH · BÖLÜMLERİ GÖR" (8746). Tasarımcının kendi
çapraz bağları da bunları başka yerlerden açıyor: "Bölüm Eşiği · 'Tercih
listesine ekle' → AKIŞ 12 · Tercih Listesi" (2190-2192) ve "Profil Düzenle ·
hedef bölüm satırı → AKIŞ 12 · Bölümler" (8338-8340).

Üstüne, Bölümler'in birincil butonu **"Rotayı bu hedefe göre kur"** (8735) —
yani rotayı çiziyor. Ama akışa göre arkasından daha 3 adım var (Tercih Listesi,
Seviye Testi, Rota Hazır). Kullanıcı 2. adımda rota kurulduğunu sanır, 3 ekran
daha görür.

**Öneri:** Onboarding **4 adım**: Karşılama → Hedef Seç → Seviye Testi →
Rota Hazır. Bölümler ve Tercih Listesi zincirden çıkar, iki yerden açılan
opsiyonel yan ekranlar olur (Hedef Seç'te "bölümleri gör" satırı, Bölüm Eşiği,
Profil Düzenle). Bölümler'in CTA'sı "Rotayı bu hedefe göre kur" → "Bu hedefi seç".

### 2.9 · "Rota Hazır" ve "İlk Gün" ve "İlk Rotan Hazır" üç kez aynı an  🟠 YÜKSEK
Üç artboard'ın birincil butonu neredeyse aynı: Rota Hazır → "İlk durağa başla"
(8974), İlk Gün → "İlk durağa başla" (9134), İlk Rotan Hazır → "Rotayı gör" (9853).
Eyebrow'lar: "ONBOARDING · 4 · ROTA HAZIR" (8925), "ROTA · İLK GÜN" (9089),
"1. GÜN SONU" (9828). İlk Gün'de aktif sekme ROTA (9146) → o zaten Ana Sayfa'nın
1. gün varyantı, ayrı ekran değil.

**Öneri:** `Rota Hazır` kalır (onboarding kapanışı). `İlk Gün` → Ana Sayfa
varyantı. `İlk Rotan Hazır` → `Rota Hazır`ın 1. gün sonu tekrarı, düşer;
o an zaten AKIŞ 16'nın "Gün Tamamlandı" modalıyla karşılanıyor. 3 → 1.

### 2.10 · Pro Önizleme ve bağlama özel Paywall aynı şeyin iki kopyası  🟠 YÜKSEK
Sekiz artboard, birebir aynı CTA metinleriyle eşleşiyor:
- Önizleme · OCR (10077) → "Okumayı dene" (10151) ‖ Paywall · OCR (10425) → "Okumayı dene" (10455)
- Önizleme · Tempo (10253) → "Senaryoları aç" (10333) ‖ Paywall · Senaryolar (10386) → "Senaryoları aç" (10416)
- Önizleme · Geçmiş (10165) → "Geçmişi aç" (10239) ‖ Paywall · Geçmiş (10464) → "Tümünü aç" (10494)

Ayrıca `Pro Önizleme` (10000) ekranının birincil butonu **"Pro önizlemesini aç"**
(10064) — kendini açan bir ekran. Ve AKIŞ 13 ile AKIŞ 13B çelişiyor: AKIŞ 13
"Kilitli özelliğe dokunulduğunda" `Paywall Anı → Premium` diyor (satır 218, 180),
AKIŞ 13B aynı tetik için "Kilitli özelliğe ilk dokunuş **Pro Önizleme'yi açar**;
ödeme sayfası ancak ondan sonra gelir" diyor (satır 9996). Aynı dokunuş iki farklı
yere gidiyor.

**Öneri:** Tek `Paywall` bileşeni, `context` parametresi
(`ocr | gecmis | tempo | karsilastirma | rapor | kota | 8gun`). Sıra:
kilitli özelliğe dokunuş → `Paywall(context)` sheet (arkadaki ekran açık kalır,
tasarımcının kendi kuralı, satır 9996) → "7 gün ücretsiz dene" → `Ödeme · Kart`.
`Premium` ekranı yalnızca Profil'den açılan tam sayfa olarak kalır.
Ayrıca `Paywall Anı` (9223) ve `8. Gün` (9932) aynı an: eyebrow'lar "PAYWALL ANI ·
**8. GÜN** · KİLİTLİ ROTA" ve "**8. GÜN** · KİLİT İNİYOR", ikisinin CTA'sı da
"7 gün ücretsiz dene" (9289, 9970). 2 → 1.

### 2.11 · Geri dönüş üç ekrana bölünmüş, sırası da ters  🟠 YÜKSEK
Akış haritası: `Geri Dönüş Modu → Geri Döndün → Geri Dönüş` (satır 184). Eyebrow'lar:
"GERİ DÖNÜŞ MODU · **İLK EKRAN**" (10864), "GERİ DÖNÜŞ MODU · **BAŞARI**" (10911),
"RETENTION · GERİ DÖNÜŞ" (10956). Yani gerçek sıra: teklif → kabul → başarı.
Geri Dönüş Modu'nun içi üç seçenekli bir liste: "20 dakikayla başla" (10887),
"Bugünkü plana dön" (10891), "Rotayı yeniden düzenle" (10895). `Geri Dönüş`
(10957) ekranının tek birincil butonu ise **"20 dakikayla dön"** (10997) — yani
aynı listenin birinci satırı, tek başına bir ekran olmuş.

**Öneri:** `Geri Dönüş Modu` = Ana Sayfa'nın dönüş varyantı (üç seçenekli kart).
`Geri Dönüş` düşer. `Geri Döndün` = başarı modalı kalır. 3 → 2 (biri varyant).
Akış: Ana Sayfa (dönüş modu) → seçim → Çalışma Oturumu → Geri Döndün.

### 2.12 · Profil Düzenle'nin kaydet aksiyonu yok  🟡 ORTA
Profil Düzenle artboard'ı 7555-7612 arasında; bu aralıkta `font:700 16px 'Archivo'`
birincil buton yok (en yakınları 6652 ve 8105). Formu olan ama kaydeden butonu
olmayan ekran. **DOĞRULANMADI:** buton farklı bir tipografiyle çizilmiş olabilir,
ama h52/r12 birincil buton kalıbıyla değil.
**Öneri:** Hedef Düzenle ile aynı kalıp (8226: "Kaydet" + "Vazgeç").

### 2.13 · Form Hatası ekranının birincil butonu pasif → çıkmaz sokak  🟡 ORTA
Satır 12664: `font:700 16px 'Archivo';color:var(--text3)">Devam` — kenarlıksız,
tint'siz, `cursor:pointer` yok. Yani devre dışı. Çapraz bağı da "Aynı ekran · alan
düzeltilir" (12832-12834) diyor. Hata ekranı, kullanıcı alanı düzeltmeden hiçbir
yere gidemeyecek şekilde çizilmiş ama AKIŞ 18'in kendi kuralı "tek birincil ve
**tek ikincil yol** bırak" (satır 12578). İkincil yol yok.
**Öneri:** İkincil olarak "Vazgeç / Taslağı sakla" ekle — özellikle Deneme Gir
sihirbazında 3 adım veri kaybı riski var.

### 2.14 · "Deneme Bitti" ödemenin 5. adımı sayılmış, aslında tetikleyici  🟡 ORTA
Eyebrow: "ÖDEME · **5** · DENEME BİTTİ" (11970), akış haritası da
`... → Ödeme Başarılı / Başarısız → Deneme Bitti` (satır 196). Ama içeriği
"deneme süresi bitti, Pro'ya geç" ve CTA'sı "Pro'ya geç" (12021), çapraz bağı
"Deneme Bitti · 'Pro'ya geç' → **AKIŞ 15 · Ödeme · Kart**" (12046-12048). Yani
akışın SONU değil, BAŞI. Başarılı ödemeden sonra "deneme bitti" göstermek mantık
hatası.
**Öneri:** `Deneme Bitti` → Paywall'ın `context=deneme_bitti` varyantı, ödeme
zincirinin önüne taşınır. Ödeme akışı 4 hâl: Kart → İşleniyor → Başarılı/Başarısız.

### 2.15 · Takvimde güne dokunmak iki farklı yere gidiyor  🟡 ORTA
Çapraz bağ: "Takvim ve Seri · **güne dokun** → AKIŞ 1 · Günün Özeti" (1490-1492).
Ama AKIŞ 7'de aynı hareketin hedefi "PROGRAM HUB · GÜN DETAYI" (4841) ve Gün
Detayı da Takvim ve Seri ile aynı sekmede/aynı CTA'da (4903).
**Öneri:** Kural: **geçmiş güne** dokun → Günün Özeti (okunur, ne oldu).
**Bugün/gelecek güne** dokun → Gün Detayı (düzenlenir, ne yapılacak). Aynı sheet
iki modda; Takvim'in üç-ay modu bunu zaten belirliyor.

### 2.16 · "Son Hafta Geride" adı içeriğiyle uyuşmuyor  🟢 DÜŞÜK
Envanter bunu zamana bağlı global mod olarak listeliyor ("Son Hafta Geride",
`ekran-envanteri.md:123`) — sanki sınavdan sonraki hafta. Eyebrow ise
"**SON HAFTA · HEDEFİN BELİRGİN ALTINDA**" (11008), CTA "Bugünün tekrar seti ·
40 dk" (11077). Yani son haftadayken hedefin çok altında olma hâli.
**Öneri:** Ad `Son Hafta · Hedef Altı` olsun; `Son Hafta` (10686) ekranının
state'i, ayrı global mod değil.

### 2.17 · "Boş Durum" jenerik değil, boş defter  🟢 DÜŞÜK
Envanter onu "Boş Durum (jenerik)" diye listeliyor (`ekran-envanteri.md:119`).
Eyebrow: "DURUM · **BOŞ DEFTER**" (11525), CTA "İlk yanlışını ekle" (11554),
başlığı da bunu doğruluyor. Ayrıca AKIŞ 17'nin 9 boş durumu arasında
Yanlış Defteri YOK (satır 204) — yani gerçek defter boş durumu buymuş, yanlış
yere konmuş.
**Öneri:** `Boş Defter` = Yanlış Defteri'nin boş state'i. Jenerik boş durum
şablonu ayrıca tanımlanır (AKIŞ 17 kuralı, satır 12267 — ikon · başlık · tek
cümle · tek aksiyon).

### 2.18 · Yanlış Defteri'nin sekmesi yok  🟠 YÜKSEK
AKIŞ 5 açıklaması "**İki ayrı sekme.** Analiz geçmişi okur, Defter yanlışları
biriktirir" (satır 3275). Ama tabbar'da Defter sekmesi yok ve Yanlış Defteri
artboard'ının tabbar'ında **hiçbir sekme aktif değil** (3748-3752'de `tabon` yok).
Aynı sorun 11 artboard'da: Hızlı Ekle (2326), Topluluk (6970), Açık Tema Ana Sayfa
(7854), Açık Tema Defter (7928), Ücretsiz Ana Sayfa (10611) ve 5 boş durum
(12293-12442). Ücretsiz Ana Sayfa'nın ROTA'sı yanmıyor ama koyu Ana Sayfa'nın
yanıyor (408) → tutarsız.
**Öneri:** Defter, ANALİZ stack'inin altında yaşar; Analiz kökünde segmented
"Denemeler / Defter". Ana Sayfa'daki Defter satırı (399) `Analiz → Defter`'e
derin bağ atar. Tüm tabbar'lı artboard'larda doğru sekme yanmalı — bunu ui-designer
için kabul kriteri yap.

### 2.19 · Hesap aksiyonları iki ekranda birden  🟢 DÜŞÜK
"Çıkış yap" hem Ayarlar'da (7543) hem Abonelik'te (9420). Abonelik ayrıca
"Verilerimi indir" (9415) ve "Hesabımı sil" (9424) taşıyor — ama Ayarlar'ın
altında zaten Veri İndir (8061) ve Hesap Silme (8120) ekranları var.
**Öneri:** Hesap aksiyonları TEK yerde: Ayarlar. `Abonelik` yalnızca plan, fiyat,
yenileme tarihi ve iptal.

### 2.20 · Paylaşım kartı iki farklı sistem olarak çizilmiş  🟡 ORTA
İki ayrı bölüm var: "PAYLAŞIM SİSTEMİ · **BEŞ MOD**" (satır 6762, altında
etiketsiz 5 kart: EMEK 6769, İVME 6791, SERİ 6813, KÖTÜ HAFTA 6835, ROTA HAZIR
6857) ve "**8 KART**" (satır 9490, 8 etiketli Story kartı 9497-9679). Beş modun
artboard'larında `data-screen-label` yok → 170 sayımına girmiyorlar ama çizilmişler.
İki sistem çelişiyor: 5 mod mu, 8 kart mı?
**Öneri:** 8 Story kartı kanon (karar gereği kalıyor). 5 mod bloğu, 8 kartın
*içerik kategorileri* olarak okunmalı, ayrı bir kart iskeleti değil. `Kart Modları`
(6583) → `Paylaşım Kartı`nın mod seçici state'i (CTA'sı da aynı: "Paylaş",
6566 ve 6652).

### 2.21 · "Ders Programı" iki farklı akışa ait gösteriliyor  🟢 DÜŞÜK
Akış haritası ve envanter onu AKIŞ 7'ye koyuyor (satır 156). Eyebrow'u
"**AYARLAR** · HAFTALIK DERS PROGRAMI" (5049) ve tasarımcının çapraz bağı
"Program Hub · 'Haftalık ders programı' → AKIŞ 7 · Ders Programı" (8333-8335)
— bu bağ ise AYARLAR bölümünün çapraz bağ bloğunda duruyor. Ekranın tabbar'ı yok.
**Öneri:** Ekran PROFİL/Ayarlar stack'inde yaşar; Program Hub'dan da açılabilir
(iki giriş, tek ekran). Kod tarafında `push` ile geldiği stack'te açılır.

### 2.22 · Sınav Sonucu, premium-kilitli OCR'a bağlanmış  🟡 ORTA
Çapraz bağ: "Sınav Sonucu · 'Belgeyi fotoğrafla' → AKIŞ 4 · Fotoğraftan Oku"
(11452-11454). Fotoğraftan Oku premium (Paywall · OCR, 10425). Sınav sonucu girişi
yılda bir olan ve uygulamanın "tahminim tuttu mu" değerini kanıtlayan an;
oraya paywall koymak akışı kilitler.
**Öneri:** OCR'ın sınav sonucu bağlamı ücretsiz kalsın (yılda 1 kullanım),
deneme kaydı OCR'ı premium kalsın. Kota mantığı `Deneme Kotası Doldu` (10623)
ile aynı motoru kullanır.

---

## 3. Birleştirilebilir ekranlar: 94 → 73

Düşen / birleşen 21 hedef:

| # | Hedef | Ne olur | Gerekçe (satır) |
|---|---|---|---|
| 1 | Soru Detayı | **düşer** (sosyal) | eyebrow "TOPLULUK ·" 4185 |
| 2 | Takvim | → `Takvim` modu | 4401, 5134 |
| 3 | Aylık Plan | → `Takvim` modu | 4401, 5797 |
| 4 | Program | → Program Hub segmenti | 4489 vs 4978, CTA 4624/5031 |
| 5 | Rotanın tamamı | → Rota Detay görünümü | 1530/1659, ortak satır 1621/1778 |
| 6 | Ders Konuları | → Öncelikli Konular ile tek konu seçici | aynı CTA 3858 / 5459 |
| 7 | Deneme Özeti | → Deneme Detayı state'i | 3183 "RETENTION ·", 2632 |
| 8 | Gün Tamamlandı | → Günün Özeti kutlama state'i | CTA "Günün özetine bak" 12112 |
| 9 | Hafta Tamamlandı | → Haftalık Özet kutlama state'i | CTA "Gelecek haftaya bak" 12189 |
| 10 | İlk Rotan Hazır | → Rota Hazır varyantı | CTA 9853 vs 8974 |
| 11 | Çalışman İşlendi | → Oturum Bitti varyantı | 9864 "İLK OTURUM SONU" |
| 12 | Bir Hafta | → Haftalık Özet varyantı | 9900 "7. GÜN SONU", CTA "Haftalık özeti aç" 9925 |
| 13 | 8. Gün | → Paywall Anı ile tek an | 9222 / 9931, CTA 9289/9970 |
| 14 | Paywall Anı | → `Paywall(context)` | 2.10 |
| 15 | Geri Dönüş | → Geri Dönüş Modu satırı | 10887 vs 10997 |
| 16 | Boşluğu Kapatma Planı | → Konu Borcu'nun dağıtım adımı | 5567 / 5787, ikisi de borç dağıtır |
| 17 | Deneme Bitti | → `Paywall(context)` | 2.14 |
| 18 | Günün Özeti | → tek `Özet(period)` | üçü de dönem özeti |
| 19 | Haftalık Özet | → tek `Özet(period)` | 660 / 890 / 1038 aynı iskelet, `/5` `/9` `/22` sayaçları |
| 20 | Ayın Özeti | → tek `Özet(period)` | + "Ayın Özeti Tipografik" (1223) zaten varyant |
| 21 | İlk 7 Gün | → Ana Sayfa'nın aktivasyon kartı | 9717 "İLK 7 GÜN · AKTİVASYON", tek liste |
| +1 | Arama | **geri gelir** (sheet) | 2.4 |

**94 → 73 navigation hedefi.**
Bunların sunum dağılımı: **17 sheet/modal/dialog**
(Hızlı Ekle, Arama, Ara Verme, Rotayı Yeniden Çiz, Gün Detayı, Tarih Seçici,
Hesap Silme, Abonelik İptali, Durak Ekle, Yanlış Ekle, Oturumu Etiketle,
Kaydı Düzenle, Paylaşım Kartı, Kilometre Taşı, Neye Göre Öneriyoruz,
Fotoğraftan Oku, Okuma Onayı) + **3 tam ekran kutlama modalı**
(Rota Tamamlandı, Geri Döndün, Tekrar Bitti) → **53 gerçek ekran dosyası**.

18-20 numaralı `Özet(period)` birleşmesi en tartışmalı olanı: üç artboard farklı
görünüyor. Ama iskelet aynı — kahraman sayı + `/period` sayacı (684, 914, 1062),
altında dağılım, altta tek CTA. Üç dosya yerine bir dosya + üç veri sağlayıcısı.
Karşı argüman kabul edilirse 73 → 75.

---

## 4. Eksik ekran / durum

| # | Eksik | Neden gerekli | Öneri |
|---|---|---|---|
| 1 | **Şifre değiştirme** | Dosyada `Şifre değiştir` ifadesi HİÇ yok (grep: 0 sonuç). Ayarlar'da satır yok. Mevcut kodda var: `ChangePasswordScreen.js` | Ayarlar → Profil Düzenle altına satır + form. Tasarım gerekiyor. |
| 2 | **E-posta değiştirme / doğrulama** | Kayıt (8476) doğrudan Hedef Seç'e gidiyor; Supabase e-posta doğrulama adımı hiç çizilmemiş. Mevcut kodda `EditEmailScreen.js` var | Kayıt sonrası "E-postanı doğrula" ekranı (Bağlantı Gönderildi 8576 şablonu birebir kullanılabilir). |
| 3 | **Bildirim merkezi** | `Bildirimler Boş` (12482) boş bir LİSTE ima ediyor ama CTA'sı "Bildirim ayarlarına bak" (12495) ve `Bildirimler` (7671) bir ayar ekranı. Liste ekranı yok. | Ya bildirim merkezi ekle, ya `Bildirimler Boş`u sil. Öneri: v1'de sil — bildirim merkezi çekirdek döngüye hizmet etmiyor. |
| 4 | **Yanlış Defteri boş durumu** | AKIŞ 17'nin 9 boş durumunda yok (satır 204). `Boş Defter` (11526) yanlış etiketlenmiş bu. | 2.17'deki düzeltme yeterli, yeni artboard gerekmez. |
| 5 | **Tekrar oturumunda "bilemedim" kolu** | Tekrar (4250) tek birincil buton taşıyor: "Bildim" (4307). Bilemedim kolunun ne olduğu (aralık sıfırlanır mı, çözüm gösterilir mi) çizilmemiş. **DOĞRULANMADI** — ikincil buton farklı tipografide olabilir. | Spaced-repetition motoru için zorunlu. Tekrar'ın iki-kollu hali netleşmeli. |
| 6 | **Yol Haritası boş durumu** | Yeni kullanıcıda müfredat ağacı doluyken rota boş olur; `Boş Rota` (11468) Ana Sayfa'nın hali, Yol Haritası'nın değil. **DOĞRULANMADI** — gerçekten boş kalabilir mi, ürün kararı. | Gerekirse AKIŞ 17 şablonuyla üretilir, yeni tasarım gerekmez. |
| 7 | **Deneme Kayıtları filtre/arama** | 3451'de liste var, filtre bileşeni **DOĞRULANMADI**. TYT/AYT/branş ayrımı (MEMORY: trial-system-redesign) filtre olmadan liste kullanılamaz hale gelir. | Segmented TYT/AYT/Branş + tarih sırası. |
| 8 | **Çevrimdışı kuyruk için ikincil yol** | `Çevrimdışı Kuyruk` (12767) hiçbir buton taşımıyor (grep'te CTA yok). Hem `Oturum Kaydedilemedi` hem `Sunucu Hatası` buraya bağlanıyor (12837-12849) → butonsuz varış = çıkmaz sokak. | "Şimdi dene" + "Rotaya dön" ekle. |

---

## 5. Kodlama sırası

İlke: her fazın sonunda uygulama derlenir, açılır ve *o faza kadarki* iş
uçtan uca yapılabilir. İşaretler: ✎ = mevcut kod güncellenecek · ✚ = sıfırdan.

### FAZ 0 · Navigasyon iskeleti (tasarım ekranı yok, en önce)
`AppNavigator.js:51-110` yeniden kurulur: 4 nested tab stack + kök modal katmanı +
FAB sheet. `screens.js` 73 hedefe göre yeniden yazılır, `routes.js` path'leri
korunur (deep link kırılmaması için — `routes.js:109-135`'teki duplicate-config
tuzağı hâlâ geçerli). Neden önce: 0.2'deki hata düzeltilmeden çizilen her ekran
yanlış yerde doğar ve iki kez taşınır.
✎ `AppNavigator.js`, `routes.js`, `screenRegistry.js`, `TabBar.js`, `screens.js`

### FAZ 1 · AKIŞ 12 · Hesap ve kurulum (11 → 9 ekran)
Neden önce: tek başına çalışan, tabbar'a bağımlı olmayan, kökte yaşayan ve
uygulamaya girişin ön koşulu olan tek akış. 2.8'deki düzeltmeyle 4 adım.
✎ Karşılama · Giriş · Kayıt · Şifre Sıfırla · Hedef Seç
✚ Seviye Testi · Rota Hazır · Bildirim İzni · Kurulum Yarım · Bölümler · Tercih Listesi
✚ **YENİ:** e-posta doğrulama (4/2)

### FAZ 2 · AKIŞ 1 · Günlük döngü (7 → 5 ekran)
Neden ikinci: ürünün kendisi. Ana Sayfa + oturum + kayıt olmadan hiçbir veri
üretilmiyor, dolayısıyla sonraki fazların hepsi boş ekran gösterir.
✎ Ana Sayfa · Çalışma Oturumu · Oturum Bitti · Oturumu Etiketle
✚ Özet(period) — gün modu önce, hafta/ay modu FAZ 6'da
Yanında: `Gün Tamamlandı` (Özet state'i), Ana Sayfa boş/ücretsiz/ilk-gün varyantları.

### FAZ 3 · AKIŞ 3 + 4 · Veri girişi (7 → 6 hedef)
Neden üçüncü: rota ve analiz ancak deneme + çalışma verisi varsa anlam kazanır.
OCR (Fotoğraftan Oku / Okuma Onayı) bu fazın SONUNDA, premium kapısıyla birlikte
gelir — çekirdek elle girişle çalışır durumda olmalı.
✎ Hızlı Ekle (`QuickActionSheet`) · Deneme Gir 1-3 · Kaydı Düzenle · Deneme Detayı
✚ Fotoğraftan Oku · Okuma Onayı · Fotoğrafa Dön dialog

### FAZ 4 · AKIŞ 2 · Rota derinliği (7 → 6 hedef)
Neden dördüncü: Ana Sayfa'nın rota grafiği FAZ 2'de zaten çalışıyor; bu faz onun
üstüne katman açar. Senaryolar premium → paywall stub ile bağlanır, gerçek kapı
FAZ 8'de kapanır.
✎ Rota Detay (`RoadmapScreen.js`, `RouteNextActionPanel.js` mevcut) · Bölüm Eşiği · Senaryolar · Durak Detayı
✚ Ara Verme dialog · Rotayı Yeniden Çiz dialog · Rota Donduruldu varyantı

### FAZ 5 · AKIŞ 5 + 6 · Analiz ve defter (11 → 10 hedef)
Neden beşinci: FAZ 3'ün ürettiği veriyi okuyan ilk sekme. Defter tekrar döngüsü
(Yanlış → Tekrar → Tekrar Bitti) kendi içinde kapanan ikinci bir günlük döngü.
Soru Detayı ve topluluk satırları YAZILMAZ (2.2).
✎ Analiz · Deneme Kayıtları · Konu İlerlemesi · Deneme Karşılaştırma · Yanlış Defteri · Öncelikli Konular · Yanlış Ekle · Yanlış Detayı · Tekrar · Çalışma Geçmişi
✚ Tekrar Bitti · Deneme Kayıtları filtresi (4/7)

### FAZ 6 · AKIŞ 7 · Plan ve duraklar (14 → 10 hedef)
Neden altıncı: en büyük ve en çok birleşen akış (2.5, 2.6). FAZ 2-5 çalışırken
kullanıcı zaten plan olmadan çalışabiliyor; plan katmanı bir üst seviye.
Özet'in hafta/ay modları burada tamamlanır.
✎ Yol Haritası · Takvim (3 ay tek ekran) · Durak Ekle · Konu Detayı · konu seçici (Ders Konuları + Öncelikli Konular) · Plan vs Gerçek
✚ Program Hub · Gün Detayı sheet · Konu Borcu · Arama sheet

### FAZ 7 · AKIŞ 9 + 11 · Profil ve ayarlar (15 → 15 hedef)
Neden yedinci: hiçbir başka akış buna bağımlı değil, ama yayın için zorunlu
(KVKK belgeleri, hesap silme, veri indirme). Seviye / Kilometre Taşı / Paylaşım
Kartı organik büyüme kanalı — bu fazda geliyor.
✎ Profil · Ayarlar · Profil Düzenle · Bildirimler · Görünüm · Gizlilik · Belge · Hedef Düzenle · Paylaşım Kartı
✚ Seviye · Kilometre Taşı · Neye Göre Öneriyoruz · Veri İndir · Hesap Silme dialog · Tarih Seçici sheet · Ders Programı · 8 Story kartı
✚ **YENİ:** şifre değiştir (4/1), e-posta değiştir (4/2)

### FAZ 8 · AKIŞ 13 + 13A + 13B + 15 · Premium ve ödeme (11 → 6 hedef)
Neden sekizinci: 13A'nın kendi kuralı "ilk hafta paywall açılmaz" (satır 9714) —
yani ücretsiz çekirdek FAZ 1-7'de tek başına çalışıyor olmalı, paywall en son
takılır. FAZ 3-6'da bırakılan premium stub'ları burada gerçek kapıya bağlanır.
✎ Paywall (`PaywallScreen.js` → `Paywall(context)` bileşeni, 7 bağlam)
✚ Premium · Pro Önizleme (3 mod) · Abonelik · Abonelik İptali dialog · Ödeme · Kart (4 hâl)
Yanında: İlk 7 Gün aktivasyon kartı (Ana Sayfa'ya), Deneme Kotası Doldu.

### FAZ 9 · AKIŞ 14 + 16 · Zamana bağlı durumlar ve kutlamalar (9 → 8 hedef)
Neden dokuzuncu: hepsi `ExamContext` bayrağına bağlı, mevcut ekranların varyantı
veya üstüne binen modal. Altındaki ekranlar bitmeden yazılamaz.
✚ Sınav Günü Planı · Sınav Sonucu · Tahmin Doğruluğu · Sırada Ne Var · Geri Döndün · Rota Tamamlandı
✎ Deneme Provası
Varyantlar: Son Hafta, Son Hafta·Hedef Altı, Sınav Günü, Geri Dönüş Modu.

### FAZ 10 · AKIŞ 17 + 18 · Boş ve hata durumları (bileşen)
Neden en son: iki şablon (`EmptyState`, `ErrorState`) + bağlam metinleri. Şablonlar
FAZ 2'de iskelet olarak yazılır, gerçek metin/aksiyon eşlemesi burada tamamlanır.
Sosyal olanlar (Topluluk Boş, Lig Boş) yazılmaz; Arama Sonuç Yok yazılır (2.4).
✚ `EmptyState` 6 bağlam · `ErrorState` 6 bağlam · `Skeleton` · `OfflineBanner` ·
`Dialog` (Onay/Uyarı) · Çevrimdışı Kuyruk butonları (4/8)

---

## Kabul kriterleri (ui-designer'a devir notu)

1. Tabbar'ı olan HER ekranda tam olarak bir sekme aktif. Şu anda 27 tabbar'ın
   11'inde aktif sekme yok — bu bir tasarım hatası, kopyalanmayacak.
2. Push edilen hiçbir ekran tabbar'ı kaldırmaz. Tek istisna: Çalışma Oturumu
   (satır 423, kasten tabbar'sız) ve kök seviye modallar.
3. Bir ekranda en fazla bir birincil buton (h52/r12, `--brand-fill`) —
   `tokens.md:90`. Aynı birincil CTA metni iki farklı ekranda geçiyorsa
   (bkz. "Bugüne durak ekle" ×4, "Kaydet" ×5, "Seçili 3 konuya durak koy" ×2)
   o ekranlar birleştirilecek demektir.
4. Her hata ve boş durumda tek birincil + tek ikincil yol; pasif birincil buton
   yasak (2.13).
5. Sosyal referansı olan hiçbir satır kodlanmaz: Ana Sayfa Defter alt metni (400),
   Yanlış Defteri "Topluluk" satırı, Yanlış Detayı "Topluluğa sor", Profil
   "Arkadaşını davet et" (6666).
