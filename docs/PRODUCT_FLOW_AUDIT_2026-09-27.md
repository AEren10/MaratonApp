# Maraton — Ürün Kurgusu ve Akış Denetimi

**Tarih:** 27 Eylül 2026  
**Kapsam:** Ürün kurgusu, bilgi mimarisi, ekranlar arası akış, kullanılabilirlik ve QA senaryoları  
**Kapsam dışı:** Görsel estetik, renk paleti ve kod değişikliği

## Yönetici özeti

Maraton'un temeli kötü değil. Hatta ürünün iki ana döngüsü oldukça güçlü:

1. `Bugünkü durağı gör → çalış → kaydet → etkisini gör → sonraki durağa geç`
2. `Deneme gir → sonucu gör → yanlışları ayır → analiz ve rotayı güncelle`

Asıl problem, bu güçlü çekirdeğin etrafında aynı kavramların birden fazla ekran ve ad altında yaşaması. Özellikle **Rota / Yol haritası / Müfredat / Programım / Haftalık Program / Takvim / Aylık Plan** birbirine karışıyor. Profil, Sosyal ve Ayarlar da sınırlarını kaybetmiş durumda.

Kısa karar:

- **Çekirdek döngü:** Güçlü ve anlaşılır.
- **Ana navigasyon fikri:** Doğru; dört sekme + merkez `+` mantıklı.
- **Program alanı:** Yüksek derecede karışık ve tekrarlı.
- **Home:** Orta derecede gürültülü; ana iş sosyal ve otomatik pop-up'larla rekabet ediyor.
- **Profil/Ayarlar:** Fazla sorumluluk taşıyor.
- **Onboarding:** Güçlü bir vaadi var fakat bazı ekranlarda vaat ile gerçek veri/eylem uyuşmuyor.
- **Teknik navigasyon sağlığı:** Statik kontroller ve testler geçiyor; sorun esas olarak ürün anlamı ve uç durumlar.

En kritik ürün güveni sorunları:

1. TYT+AYT hedefi, yalnız TYT başlangıç netiyle karşılaştırılabiliyor.
2. “Rotan hazır” ekranındaki bazı çıkışlar rotayı kalıcı oluşturmadan ilerliyor.
3. Planlı rota durağı yanlışlıkla tek dokunuşla tamamlanabiliyor ve geri alınamayabiliyor.
4. Boş program gününde gerçek plan gibi görünen sabit örnek dersler gösteriliyor.
5. “İlk durağını ekle” butonu durak eklemek yerine çalışma kaydı açıyor.

## Bu işe normalde kim bakar?

Bu iş tek başına testçinin veya tek başına ürün yöneticisinin işi değildir:

- **Product Manager:** Ürünün ana vaadini, kullanıcı yolculuğunu, ana döngüyü, öncelikleri ve hangi ekranın hangi işi sahiplendiğini belirler.
- **Product/UX Designer:** Bilgi mimarisini, ekranlar arası geçişleri, CTA hiyerarşisini, geri dönüşleri ve bilişsel yükü tasarlar.
- **QA / Usability Researcher:** Akışların gerçekten tamamlanabildiğini; geri, kesinti, offline, deep link ve hata durumlarını doğrular.
- **Product Analyst:** Kullanıcının nerede düştüğünü event ve funnel verisiyle ölçer.

Bu rapor bu dört bakışı birlikte kullandı.

## GitHub'dan seçilen yöntemler ve beceriler

Araştırmada popülerlik tek ölçüt olarak kullanılmadı; repo kalitesi, yöntemin bu uygulamaya uygunluğu ve çıktının uygulanabilir olması birlikte değerlendirildi.

- [Customer Journey Map — phuryn/pm-skills](https://github.com/phuryn/pm-skills): edinimden bağlılığa kadar temas noktası, duygu, sorun ve fırsat haritası için kullanıldı.
- [User Story Mapping — deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills): ürünü özellik listesi yerine kullanıcının yaptığı işler üzerinden parçalamak için kullanıldı.
- [Usability Test Plan — owl-listener/designer-skills](https://github.com/owl-listener/designer-skills): görev, başarı ölçütü, hata ve süre temelli test planı için kullanıldı.
- Yerel `mobile-design` ve `ui-ux-designer` becerileri: mobil CTA, geri davranışı, dokunma riski, odak ve bilişsel yük denetimi için kullanıldı.

İlk üç beceri yerel Codex becerilerine kuruldu. `ux-friction-analyzer` adayı da incelendi fakat kurulumu tamamlanmadığı için rapor onun çıktısına dayandırılmadı.

## Ürünün gerçek ana işi

Birincil kullanıcı: YKS veya LGS'ye hazırlanan, her gün ne çalışacağını yeniden düşünmek istemeyen ve emeğinin sınav hedefine etkisini görmek isteyen öğrenci.

Temel kullanıcı işi:

> “Bugün ne yapacağımı bilmek, çalışmayı kaydetmek ve bu emeğin sınav hedefime etkisini görmek.”

Önerilen kuzey yıldızı akış:

`Hedef kur → kalıcı kişisel rota gör → ilk kısa durağı bitir → etkisini gör → sonraki durağa geç`

İlk görsel aha anı `RouteReadyScreen`; gerçek güven/retention aha anı ise ilk çalışmanın bitip rota etkisinin görüldüğü `StudySummaryScreen`.

## Ana navigasyon

Gerçek alt navigasyon:

`Rota · Program · [+] · Analiz · Profil`

Kaynak: `src/navigation/TabBar.js:19-25`

| Alan | Mevcut sahiplik | Yorum |
|---|---|---|
| Rota | Home / bugünün işi | Doğru ana alan; odağı korunmalı. |
| Program | İlk olarak Müfredat/Yol haritası açılıyor | Sekme adıyla açılan içerik uyuşmuyor. |
| + | Çalışma, deneme, yanlış, durak ekleme | Ürünün en temiz bilgi mimarisi kararlarından biri. |
| Analiz | Deneme + Defter + derin analiz | Yoğun ama kavramsal olarak tutarlı. |
| Profil | Kimlik, başarı, sosyal, rota yönetimi, premium | “Geri kalan her şey” ekranına dönüşmüş. |

## Ekran ve buton akış haritası

### 1. İlk açılış ve kurulum

`Tanıtım slaytları → Kayıt/Giriş → Sınav → Hedef → Başlangıç seviyesi → Rota hazır → Bildirim → Rota/Home`

| Ekran / kontrol | Hedef | Not |
|---|---|---|
| Tanıtım “Rotamı kur” | Kayıt | Gerçek rota burada kurulmaz; sadece auth niyeti seçilir. |
| Tanıtım “Hesabım var” | Giriş | Doğru. |
| Sınav seçimi “Devam” | Hedef kurulumu | LGS, TYT, TYT+AYT seçenekleri var. |
| Hedef “Devam” | Seviye testi | Hedef net + günlük soru alınır. |
| Hedef “Şimdilik atla” | Home | Metin geçici hissettiriyor ama bütün kurulumu kalıcı olarak atlıyor. |
| Seviye “Devam” | Rota hazır | LGS dışında yalnız TYT dersleri kullanılıyor. |
| Rota hazır “İlk durağa başla” | Timer | Rotayı oluşturup güçlü aha yoluna sokuyor. |
| Rota hazır “Ana sayfaya git” | Home | Mevcut kodda kalıcı rota oluşturma garantisi yok. |
| Rota hazır “Rotanın tamamını gör” | Rota detayı | Mevcut kodda kalıcı rota yoksa boş duruma düşebilir. |

Kanıtlar: `src/navigation/AppNavigator.js:230-253`, `src/screens/onboarding/RouteReadyScreen.js:36-53`, `src/hooks/useRouteReadySummary.js:15-24`, `src/hooks/useRouteDetail.js:68-77`.

### 2. Rota / Home

Home'un ana görevi “şimdi ne çalışacağım?” sorusunu cevaplamak olmalı.

| Kontrol | Hedef | Ürün yorumu |
|---|---|---|
| Avatar | Profil | Beklenen davranış. |
| Sosyal ikon | Profil yığını / Sosyal Hub | Grup kartıyla yineleniyor. |
| Seri/takvim çipi | Takvim | Beklenen davranış. |
| Ana çalışma CTA'sı | StudyTimer | Çekirdek döngünün doğru başlangıcı. |
| Görev yokken “İlk durağını ekle” | AddStudy | Etiket ile hedef uyuşmuyor; AddTask olmalı. |
| Durak satırı gövdesi | StudyTimer | Doğru. |
| Durak satırı halkası | Doğrudan tamamla | Plan/rota durağında yanlış dokunma ve geri alınamama riski. |
| “Programın tamamı” | PlanDetail | Program sekmesi/hub yerine gün detayı açıyor. |
| Rota grafiği | Rota detayı | Yatay swipe ve tap aynı alanda; ikinci sayfa yalnız noktalarla keşfediliyor. |
| Defter kartı | Doğrudan review | İyi; gereksiz adımı kaldırıyor. |
| Grup kartı | Sosyal Hub | Günlük ana işle rekabet ediyor. |
| Dikkat isteyen ders | Analiz / ders detayı | Bağlamsal ise değerli. |

Kaynaklar: `src/screens/home/components/HomeTopBar.js:31-55`, `src/screens/home/useHomeActions.js:12-54`, `src/screens/home/components/HomeTodayStops.js:47-80`, `src/screens/home/components/HomeProBody.js:29-56`.

### 3. Çalışma döngüsü

`Home → StudyTimer → StudySave → StudySummary → yanlış ekle / sonraki durak / Home`

Bu uygulamanın en iyi kurgulanmış akışı. Timer'ın kısa oturumları engellemesi, kayıt güvenceye alındıktan sonra özet ekranına geçmesi ve özetin bir sonraki anlamlı işi sunması doğru.

Riskler:

- Android donanım geri tuşu timer'daki çıkış onayını atlayabilir.
- StudySave ekranında Android geri tuşu sessizce yutulurken header geri farklı davranıyor.
- Home'daki checkbox benzeri halka, oturum olmadan rota durağını tamamlayabiliyor.

Kaynaklar: `src/screens/study/useStudyTimerController.js:376-431`, `src/screens/study/StudySaveScreen.js:18-21`, `src/hooks/useBlockBack.js:8-20`, `src/screens/study/useStudySaveController.js:73-100`.

### 4. Merkez `+`

`+ → Şimdi çalış / Manuel çalışma kaydet / Deneme gir / Yanlış ekle / Plana durak ekle`

Bu bölüm başarılı. “Şimdi”, “Kaydet” ve “Plana ekle” gruplaması, farklı niyetleri tek üretim kapısında topluyor. Testlerde her niyetin ilk seçimde doğru bulunup bulunmadığı ölçülmeli.

Kaynak: `src/screens/trial/QuickAddSheet.js:52-84`.

### 5. Deneme döngüsü

`+ → Deneme gir → 3 adımlı form → Özet → Kayıtlar / Yanlışları ekle → Analiz ve rota etkisi`

Akış güçlü. Ana kusur, taslağın alanları saklayıp kullanıcının kaldığı form adımını saklamaması. “Kaldığın yerden” vaadi tam karşılanmıyor.

Kaynaklar: `src/screens/trial/TrialEntryScreen.js:33-55`, `src/screens/trial/useTrialEntryForm.js:83-93`, `src/screens/trial/useTrialEntrySteps.js:6-43`, `src/screens/trial/trialEntrySubmit.js:162-178`.

### 6. Program

Mevcut gerçeklik:

`Program sekmesi → Yol haritası / Müfredat → Programım → Haftalık/Aylık → gün detayı`

Fakat kodda aynı işi paylaşan paralel yüzeyler var:

- `CurriculumMapScreen`: Sekmenin kökü, “Yol haritası”, varsayılan “Müfredat”.
- `DerslerScreen / DAILY_PLAN`: “Programım”, hafta/ay, gün, ders programı, konu borcu.
- `WeekProgramScreen`: Yine “Programım”, hafta/ay ve günün rota durakları.
- `CalendarScreen`: Aylık ızgara, seri ve gün detayı.
- `MonthPlanScreen`: Neredeyse aynı aylık ızgara, seri ve gün detayı.
- `PlanDetailScreen`: Seçili günün durakları ve düzenleme.

Bu alanın sorunu görsel değil, **birden fazla otorite** olmasıdır. Kullanıcı “Benim programım hangisi?” sorusuna tek cevap alamıyor.

Kaynaklar: `src/navigation/TabBar.js:19-24`, `src/navigation/screenRegistry.js:118-122,219-222`, `src/screens/roadmap/CurriculumMapScreen.js:19-56`, `src/screens/dersler/DerslerScreen.js:83-127`, `src/screens/program/WeekProgramScreen.js:66-109`, `src/screens/calendar/CalendarScreen.js:57-100`, `src/screens/program/MonthPlanScreen.js:77-108`.

### 7. Analiz ve yanlış defteri

`Analiz → Denemeler / Defter → filtre → skor ve trendler → ders → kayıtlar → derin analiz`

Derin analiz kapıları:

- Konu ilerlemesi
- Öncelikli konular
- Net tahmini
- Yayın karşılaştırması
- Simülasyon

Alan yoğun fakat aynı zihinsel modele hizmet ediyor. Ana riskler:

- Her kullanıcıya sabit “Bu tempoyla sınav günü 71 net” gibi kişiselleştirilmiş görünen iddia.
- LGS veya yalnız TYT kullanıcısına sabit TYT/AYT/Branş filtreleri.
- Ekran açıldıktan 3 saniye sonra otomatik nudge; kullanıcı inceleme yaparken kesinti.
- Yanlış detayındaki işlevsiz üç nokta ve yalnız “Yakında” mesajı veren güçlü “Topluluğa sor” butonu.

Kaynaklar: `src/screens/analysis/AnalysisScreen.js:60-126`, `src/screens/analysis/components/DeeperAnalysisSection.js:19-22`, `src/screens/analysis/components/AnalysisFilterPills.js:6-11`, `src/screens/analysis/useAnalysisController.js:25-37`.

### 8. Profil, Sosyal ve Ayarlar

Profil bugün şunları aynı sayfada taşıyor:

`Kimlik + hedef + yıllık ilerleme + güç haritası + davet + gruplar + geçmiş + rotayı dondur + rotayı çiz + premium + sınav akışı + seviye + lig`

Sosyal ayrıca Home ikonunda, Home grup kartında ve Ayarlar'da tekrar ediyor. Ayarlar da tercih ve hesap dışında takvim, geçmiş ve bütün sosyal linkleri sahipleniyor.

Hedef sahiplik:

- **Profil:** kimlik, hedef, uzun vadeli ilerleme, kilometre taşları.
- **Rota:** rotayı dondur/yeniden çiz ve rota ayarları.
- **Sosyal Hub:** grup, lig, arkadaş, challenge, davet.
- **Ayarlar:** bildirim, görünüm, veri/senkronizasyon, hesap ve gizlilik.

Kaynaklar: `src/screens/profile/ProfileScreen.js:50-117`, `src/screens/settings/SettingsScreen.js:99-180`, `src/screens/league/LeagueScreen.js:301-374`.

## Journey map

| Aşama | Kullanıcının amacı | Mevcut duygu | Ana sürtünme | Fırsat |
|---|---|---|---|---|
| İlk temas | Uygulamanın bana ne sağlayacağını anlamak | Merak | “Rota” vaadi güçlü ama gerçek rota auth sonrasında | Vaadi ilk kısa göreve bağla. |
| Kurulum | Hedefime göre plan almak | Umut / sabırsızlık | Hedef ve başlangıç eksenleri bazı sınavlarda uyumsuz | TYT ve AYT'yi ayrı modelle. |
| Rota hazır | Kişisel planımı görmek | Yüksek güven potansiyeli | Bazı çıkışlar kalıcı rota oluşturmuyor; üç CTA odağı bölüyor | Rota önce kalıcı olsun; tek baskın CTA. |
| Günlük kullanım | Ne çalışacağımı bilmek | Rahatlama | Home'da sosyal ve pop-up rekabeti | Ana iş tek baskın CTA. |
| Çalışma | Oturumu tamamlamak | Odak | Geri davranışları platformlar arasında tutarsız | Tek kurtarma/onay modeli. |
| Ölçme | Deneme sonucunu girmek | Kontrol | Taslak adımı hatırlanmıyor | Gerçek devam ettirme. |
| Öğrenme | Neden yükselip düştüğünü anlamak | Merak | Analiz yoğun, bazı metinler sahte kişiselleştirme | Bir önerilen sonraki aksiyon. |
| Planlama | Haftayı ve ayı düzenlemek | Belirsizlik | Birden fazla Program ve Takvim | Tek Program Hub. |
| Bağlılık | İlerlemeyi sürdürmek | Başarı / baskı | Sosyal ve ödül modalları ana döngüyü kesebilir | Tek olay kuyruğu, bağlamsal sosyal. |

## Önceliklendirilmiş bulgular

### P0 — Ürün güveni veya veri doğruluğu

> Not: Statik QA açısından açılışı tamamen engelleyen veya doğrudan veri silen bir P0 bulunmadı. Aşağıdaki P0'lar ürün vaadi ve kullanıcı verisinin anlamı açısından kritiktir.

1. **TYT+AYT hedefi ile yalnız TYT başlangıcı aynı eksende karşılaştırılıyor.**  
   `src/screens/onboarding/useGoalSetupForm.js:65-78`, `src/hooks/useLevelTestForm.js:22-25`, `src/screens/onboarding/LevelTestScreen.js:23-31`.

2. **“Rotan hazır” deniyor fakat Home veya tüm rota çıkışında rota kalıcı oluşturulmayabiliyor.**  
   `src/screens/onboarding/RouteReadyScreen.js:36-53`, `src/hooks/useRouteReadySummary.js:15-24`.

3. **Plan/rota durağı tek dokunuşla tamamlanıyor ve sonra geri alınamıyor.**  
   `src/screens/home/components/HomeStopRow.js:54-64,89-96`, `src/screens/home/components/HomeStopCheckRing.js:15-27`, `src/hooks/useTodayStops.js:111-115`.

4. **Boş günde sabit örnek program gerçek veri gibi gösteriliyor.**  
   `src/screens/dersler/components/SelectedDayPanel.js:61-65`.

5. **“İlk durağını ekle” CTA'sı AddTask yerine AddStudy açıyor.**  
   `src/screens/home/components/HomeHeroNormal.js:81-86`, `src/screens/home/useHomeActions.js:12-16`.

6. **LGS kullanıcısına ilk gün “YKS'ye…” metni gösteriliyor.**  
   `src/screens/home/components/firstDay/HomeFirstDay.js:11-27`.

### P1 — Ana akış ve bilgi mimarisi

1. Program sekmesi Programım yerine Yol haritası/Müfredat açıyor.
2. `DerslerScreen` ve `WeekProgramScreen` iki ayrı “Programım” otoritesi.
3. `CalendarScreen` ve `MonthPlanScreen` aynı ürünü iki farklı adla sunuyor.
4. “Şimdilik atla” bütün kurulumu kalıcı atlıyor; görünür devam kapısı yok.
5. Android geri davranışları Timer ve StudySave'de tasarlanan uyarılarla tutarlı değil.
6. Deneme taslağı kaldığı adımı saklamıyor.
7. Profil/Sosyal/Ayarlar sahipliği dağınık.
8. Analiz filtre ve tahmin metinleri sınav türü/veriyle uyumlu değil.
9. Oturumsuz cold-start sosyal deep link'in auth sonrası kaybolma riski var; cihazda doğrulanmalı.

### P2 — Gürültü, keşfedilebilirlik ve kesinti

1. Home'daki büyük grup edinim kartı günlük ana CTA ile rekabet ediyor.
2. Sosyal, Home'da ikon ve kart olarak iki kez; Profil ve Ayarlar'da tekrar sunuluyor.
3. Home açıldıktan 2 saniye, Analiz açıldıktan 3 saniye sonra nudge deneniyor.
4. Home overlay'leri tek olay kuyruğu kullanmadığı için aynı dönüşte modal bombardımanı riski var.
5. Rota hazır ekranındaki üç güçlü çıkış aha anını dağıtıyor.
6. Home grafik sayfalarının anlamı yalnız iki noktayla ifade ediliyor.
7. Bazı kayıtlı ekranların canlı kullanıcı giriş noktası yok: `TOPIC_CARDS`, bazı premium/ödeme yüzeyleri.
8. Yanlış detayındaki işlevsiz “more” ikonu ve “Yakında” butonu yanlış affordance.

### P3 — Bakım ve gelecekteki kurgu riski

1. Premium kapalıyken bile büyük satış/ödeme akışı kayıtlı; tekrar açılmadan baştan denetlenmeli.
2. `StudySave` rota metadata'sı `STUDY_SESSION` yerine `TRIAL_CAPTURE` akışına bağlı: `src/navigation/routes.js:44`.
3. 14 ürün akışının tamamı aynı anda ana navigasyona görünürse kişisel rota vaadi bulanır.

## Önerilen hedef bilgi mimarisi

### Rota

- Bugünkü sıradaki görev
- Bugünün durakları
- Rota ilerlemesi
- Rota ayrıntısı: `Özet | Tüm duraklar`
- Rota ayarları: dondur, yeniden çiz, eşik

`RoadmapScreen` ile `RouteFullScreen` aynı kavramın özet/tümü görünümleri olmalı; iki ayrı hub olmamalı.

### Program

Tek kök ekran: **Programım**

- `Hafta | Ay`
- Gün seçimi
- Günün durakları
- Durak ekle
- İkincil alan: Müfredat

`DerslerScreen + WeekProgramScreen` tek Program Hub'a, `CalendarScreen + MonthPlanScreen` tek aylık görünüme birleşmeli. Müfredat, Program kökünün ikinci görünümü olabilir; sekmenin varsayılanı Programım olmalı.

### + Kaydet

Mevcut yapı korunmalı:

- Şimdi çalış
- Çalışma kaydet
- Deneme gir
- Yanlış ekle
- Plana durak ekle

### Analiz

- Özet
- Deneme geçmişi
- Ders analizi
- Yanlış defteri
- Veri yeterliyse tahmin ve karşılaştırma
- Ekranın tepesinde en fazla bir “önerilen sonraki aksiyon”

### Profil

- Kimlik ve hedef
- Uzun vadeli ilerleme
- Seviye ve kilometre taşları
- Paylaşım
- Sosyal Hub'a tek giriş
- Ayarlar'a tek giriş

## Önerilen release sırası

### R1 — Güven ve doğruluk

1. TYT+AYT başlangıç/hedef modelini aynı eksene getir.
2. RouteReady'den her çıkışta idempotent rota oluştur.
3. Rota durağını doğrudan tamamlamayı kaldır veya anında geri al ekle.
4. Sabit sahte program verisini kaldır.
5. “İlk durağını ekle” hedefini düzelt.
6. LGS/YKS ilk gün metnini sınav türüne bağla.

### R2 — Tek otorite

1. Program sekmesini Programım ile aç.
2. İki haftalık program ekranını birleştir.
3. Calendar ve MonthPlan'ı birleştir.
4. Roadmap ve RouteFull sorumluluklarını özet/tümü olarak tekleştir.
5. Profil, Sosyal ve Ayarlar sınırlarını ayır.
6. “Şimdilik atla” için devam edilebilir kurulum modeli oluştur.

### R3 — Sürtünme ve gürültü

1. Android geri davranışlarını tek kurtarma modeline bağla.
2. Deneme taslak adımını sakla.
3. Home'daki sosyal edinim yüzeyini azalt.
4. Home ve Analiz otomatik nudge'larını bağlamsal yap.
5. Tek celebration/event queue kur.
6. Canlı olmayan butonları gizle veya açıkça devre dışı göster.

## Kullanılabilirlik test planı

**Katılımcı:** 6–8 YKS/LGS öğrencisi; yarısı yeni kullanıcı, yarısı en az bir haftadır takip uygulaması kullanmış.  
**Yöntem:** Gerçek cihaz, think-aloud; Android ve iOS dengeli.  
**Ölçüm:** Görev başarısı, süre, yanlış dokunuş, geri dönüş, SEQ 1–7; oturum sonunda SUS.

| # | Görev | Başarı ölçütü |
|---|---|---|
| 1 | Hesap aç, hedef/seviye gir, ilk durağı başlat | Yardımsız timer; ≤4 dk |
| 2 | Kurulumu “şimdilik” atla, sonra kaldığın yerden tamamla | Görünür giriş ≤30 sn |
| 3 | Home'dan Matematik durağını başlat, 45 sn sonra Android geri | Kaydet/çık kararı sorulur; oturum kaybolmaz |
| 4 | `+` ile çalışma, deneme, yanlış ve yarına durak eklemeyi ayrı ayrı bul | Her biri ilk seçimde; ≤15 sn |
| 5 | Geçen haftaki yanlış çalışma kaydını bul ve düzelt | Bağlam korunur; ≤60 sn |
| 6 | Son denemedeki düşüşün dersini bul ve ilgili konuyu plana ekle | Yanlış sekme ≤1; ≤90 sn |
| 7 | Uçak modunda çalışma kaydet, bağlantıyı aç ve senkronu doğrula | Yerel kayıt korunur; pending/failed anlaşılır |
| 8 | Oturum kapalıyken arkadaş davet linkini aç, kayıt ol | Kod ve hedef ekran korunur |
| 9 | Premium açıldığında kilitli özelliğe gir, yasal linkleri aç ve satın almayı iptal et | İptal banka reddi gibi gösterilmez |

Eşikler:

- Kritik görev başarısı ≥ %90
- Görev 1, 3 ve 4 hata oranı ≤ %10
- SEQ ≥ 5.5
- SUS ≥ 80
- Deep link ve offline veri korunumu %100

## Teknik doğrulama

Çalıştırılan kontroller:

- `npm run check:orphans` — geçti; 110 ekran, 936 canlı dosya tarandı.
- `npm run check:undefined` — geçti; 1039 dosya tarandı.
- `npm run check:conflicts` — geçti.
- `npm test` — 621 test geçti.
- QA ajanı ayrıca navigation testlerini 23/23 doğruladı.

Bu sonuç “ürün akışı iyi” demek değildir. Yalnızca ekran kayıtlarının ve temel sözleşmelerin teknik olarak tutarlı olduğunu gösterir. Orphan kontrolü kayıtlı ama canlı kullanıcı giriş noktası olmayan ekranları veya aynı kullanıcı işini yapan iki ayrı ekranı tespit etmez.

## Son hüküm

Maraton'un kurgusu baştan yanlış değil. Ürünün farklılaşan fikri — **hedefe göre kişisel rota ve günlük bir sonraki durak** — gerçek ve güçlü. En büyük problem yeni özellik eksikliği değil; güçlü vaadin etrafına biriken paralel gerçekliklerdir.

En yüksek getirili karar şudur:

> Önce veriye güveni düzelt; sonra her kullanıcı işi için tek otorite belirle.

Yani önce rota gerçekten oluşmalı, netler doğru karşılaştırılmalı ve yanlış dokunuş veri bozmamalı. Ardından tek Program, tek Takvim, tek Sosyal Hub ve net bir Rota ayrıntısı kurulmalı. Bu yapıldığında uygulama daha az ekranla daha zengin, daha güvenilir ve daha “kendinden emin” hisseder.
