# 03 · Mağaza hazırlığı (App Store + Google Play)

Tarih: 3 Ekim 2026 · Kapsam: v1.0.0 Türkiye lansmanı, Türkçe · Kaynak kod DEĞİŞTİRİLMEDİ; bu belge yalnız rapor.

Bu belge `store/listing-tr.md`, `store/appreview.md`, `store/privacy-labels.md`, `store/data-safety.md` ve `docs/YAYIN_5_GUN.md` üzerine kuruldu. Çeliştiği yerde **bu belge günceldir**: koddaki gerçek durumla karşılaştırıldı (commit `408462d`).

---

## 0. Önce bilmen gerekenler (5 madde)

1. **Uygulama ikonu hâlâ Expo'nun gri ızgara şablonu.** `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png` (son ikisi aynı dosya). Bu ikonla gönderim Guideline 2.1 (yer tutucu içerik) ile reddedilir; geçse bile mağazada dönüşümü öldürür. **Yarınki gönderimin önündeki tek gerçek engel bu.**
2. **"Topluluğa sor" butonu "Yakında" uyarısı açıyor.** `src/screens/wrong-notebook/components/detail/OwnWrongDetail.js:94`, her yanlış detayında görünüyor. Guideline 2.1(a)/2.2: "yakında" özellik ve yer tutucu ret sebebidir. Butonun kaldırılması gerekiyor (kod değişikliği, bu raporun kapsamı dışında).
3. **Lig, grup ve arkadaş özellikleri binary'de AÇIK** (Profil > Gruplarım / Meydan okumalar / Davet; Ayarlar > ARKADAŞLAR; Profil'de `LeagueMiniCard` → "Genel Lig"). `store/appreview.md` bunları "V1 kapsamı dışında" diye anlatıyor. İnceleyici ekranda lig görüp notta "yok" okursa bu yanıltıcı sayılır. Ayrıca Genel Lig'de yabancıların adı ve fotoğrafı görünüyor. Bu durum Guideline 1.2'ye (UGC) giriyor; ayrıntı §4.2'de.
4. **Google Play yarın canlıya çıkamayabilir.** Kasım 2023'ten sonra açılmış kişisel Play hesabında üretim erişimi için **12 test kullanıcısı × 14 gün kesintisiz kapalı test** şart. `docs/YAYIN_5_GUN.md` bu testi iOS gönderiminden sonra başlatmayı planlıyor. Hesap kurum hesabı değilse Android lansmanı en erken 14 gün + Google incelemesi (~7 gün) sonra olur. Mağaza metinleri ve görseller şimdiden hazır olsun.
5. **"Maraton" adı eğitim pazarında başka bir markayla çakışıyor.** *Maraton Yayıncılık* LGS'ye yönelik 5–8. sınıf soru bankası ve deneme sınavı yayımlıyor; App Store'da "Maraton Öğretmen + Kütüphane" uygulaması var. LGS kitlesinde karışıklık ve marka şikâyeti riski var (Guideline 4.1 / 5.2.1). Hukuki görüş değildir, ama şunlar öneriliyor: adı hiçbir zaman tek başına "Maraton" olarak bırakma, hep tanımlayıcıyla kullan (aşağıdaki seçenekler böyle). TÜRKPATENT'te 9. ve 41. sınıf taraması yap. Anahtar kelimelere "yayın", "yayıncılık", "maraton yayınları" gibi sözcükler KOYMA.

---

## 1. Mağaza metinleri (HAZIR, kopyala-yapıştır)

Ton: ikinci tekil şahıs, sakin, iddiasız. Uygulamanın kendi dili korundu: rota, durak, net, seri. Şunlar kullanılmadı:
- "yapay zekâ"
- "en iyi", "#1"
- "ücretsiz" (gerekçe aşağıda)
- emoji
- lig ve sosyal vaatler (§4.2 çözülene kadar)

> **Neden "tamamen ücretsiz" yok?** Bir ay sonra abonelik açılacak. "Tamamen ücretsiz" yazan ilk sürüm, premium gelince kötü yorum ve yanıltıcı metadata riski doğurur. Ayrıca Apple 2.3.7 fiyat bilgisini metadata'da istemez, Play de "free" kelimesini başlıkta yasaklar. Lansman mesajını **promosyon metnine** koy: o alan incelemesiz, istediğin an değişir.

### 1.1 App Store

#### Ad (en çok 30 karakter) ve alt başlık (en çok 30 karakter)

| | Ad | Kr. | Alt başlık | Kr. |
|---|---|---|---|---|
| **A (önerilen)** | `Maraton: YKS Deneme Takibi` | 26 | `Net hesaplama, günlük program` | 29 |
| B | `Maraton: TYT AYT Net Takibi` | 27 | `Deneme, rota ve yanlış defteri` | 30 |
| C | `Maraton: YKS Rota ve Net` | 24 | `Her gün hazır çalışma rotası` | 28 |

Neden A:
- Arama hacmi en yüksek iki ifade ("yks", "deneme takibi") ada giriyor.
- Alt başlık en çok aranan iki niyeti taşıyor: "net hesaplama" ve "program".
- B, TYT/AYT aramalarında daha güçlü ama "yks" kelimesini anahtar kelime alanına itiyor.
- C markaya en sadık seçenek ama arama gücü en zayıf olanı.

Ana ekrandaki ad (`app.json` → `expo.name`) "Maraton" olarak kalabilir.

#### Anahtar kelimeler (en çok 100 karakter, virgüllü, boşluksuz)

A ad ve alt başlığıyla kullanılacak liste. Ad ve alt başlıkta geçen kelimeler tekrar edilmedi: maraton, yks, deneme, takibi, net, hesaplama, günlük, program.

```
tyt,ayt,lgs,çalışma,ders,soru,yanlış,defteri,sınav,sayaç,pomodoro,sıralama,konu,plan,tekrar
```

91 karakter (UTF-8'de 99 bayt). App Store Connect alanı bayt sayarsa bile sığar.

B seçeneğine geçersen bu listede `tyt,ayt` yerine `yks,deneme,hesaplama,program` yaz, `yanlış,defteri` kelimelerini çıkar.

Kurallar:
- Apple, ad, alt başlık ve anahtar kelime alanlarındaki kelimeleri kendisi birleştirir. "yanlış" + "defteri" birlikte "yanlış defteri" aramasını, "ders" + "çalışma" birlikte "ders çalışma" aramasını yakalar. Bu yüzden öbek değil tek kelime yazılır.
- Rakip uygulama adı, "ÖSYM", "MEB" gibi kurum adları ve fiyat kelimeleri yazılmaz (2.3.7).
- **Ek alan (doğrula):** üçüncü taraf ASO kaynaklarına göre Türkiye vitrininde Türkçe'ye ek olarak **English (UK)** yerelleştirmesi de indeksleniyor. App Store Connect'te en-GB yerelleştirmesi açıp ad ve alt başlığı aynı Türkçe metinle bırakırsan, ikinci bir 100 karakterlik alana Türkçe karakterli aramaları yakalamak için ASCII varyantları yazabilirsin. Lansmandan sonra arama sıralaması izlenerek doğrulanmalı.
  ```
  calisma,takip,netler,sayac,kronometre,ogrenci,lise,mezun,universite,bankasi,odak,ajanda,hazirlik
  ```
  (96 karakter)

#### Promosyon metni (en çok 170 karakter, incelemesiz değişir)

```
Sınava giden yol bir rotaya dönüşsün. Her sabah günün durakları hazır; denemeni gir, netinin nereye gittiğini gör. Şu an bütün özellikler herkese açık.
```

151 karakter. Premium açılınca son cümle değişir (§5).

#### Açıklama (en çok 4000 karakter)

```
Sınava giden yol bir rotaya dönüşür.

Maraton, YKS'ye (TYT, AYT) ve LGS'ye hazırlanan öğrenciler için kişisel bir çalışma rotası. Yüzlerce konuyu gün gün duraklara böler; sen sabah açtığında ne çalışacağını bilirsin. Ders anlatmaz, içerik satmaz. Sattığı tek şey kendi ilerlemeni net görmek.

BUGÜNÜN DURAKLARI
Rotan sınav tarihine, hedef netine ve okulda bitirdiğin konulara göre çizilir. Her gün birkaç durak: hangi ders, hangi konu, kaç soru. Bir durağı bitirince işaretle, hat ilerlesin. Gün kötü geçtiyse durağı ertele ya da haftanın programını yeniden düzenle; rota seni cezalandırmaz, yeniden hesaplar.

DENEME VE NET TAKİBİ
TYT, AYT ve LGS denemelerini ders ders gir: doğru, yanlış, boş. Net kendiliğinden hesaplanır. Net grafiğin ve tahmin bandın her yeni denemeyle güncellenir; hangi derste yükseldiğini, hangisinde durduğunu ders ders görürsün. Hedef bölümünle aranda kaç net kaldığını takip et.

YANLIŞ DEFTERİ
Yanlış yaptığın soruyu fotoğrafla ya da not al. Tekrar günü geldiğinde önüne gelir; çözdüğünü kapatırsın, çözemediğin yeniden sıraya girer.

ÇALIŞMA SAYACI
Kronometre ya da pomodoro ile çalış, bitince ders, konu, süre ve soru sayısını tek ekranda kaydet. Çalışma geçmişin takvimde birikir.

SERİ VE HAFTALIK ÖZET
Her gün kayıt girdikçe serin uzar. Haftanın sonunda ne kadar çalıştığını, kaç soru çözdüğünü ve rotada nerede olduğunu tek sayfada gör.

ANA EKRAN VE KİLİT EKRANI WIDGET'LARI
Bugünün durakları, sınava kalan gün, net çizgin ve serin bir bakışta.

İNTERNETSİZ DE ÇALIŞIR
Bağlantın yokken girdiğin kayıtlar cihazda bekler, bağlantı gelince kendiliğinden eşitlenir.

VERİN SENİN
Reklam yok, verin reklam için kullanılmaz. Verilerini istediğin an indirebilir, hesabını uygulama içinden silebilirsin.

Not: Net ve sıralama tahminleri senin girdiğin deneme sonuçlarına ve geçmiş yılların açık verilerine dayanan yaklaşık hesaplardır; resmî sonuç yerine geçmez. Maraton, ÖSYM ya da MEB ile bağlantılı değildir.

Gizlilik: https://maratonapp.com/privacy
Kullanım koşulları: https://maratonapp.com/terms
Destek: destek@maratonapp.com
```

2.059 karakter.

Kontrol:
- Widget paragrafı **yalnız iOS içindir**; Play metninde yok, çünkü Android widget'ları henüz yok.
- "Geçmiş yılların açık verileri" ifadesi `RankSimulator` veri kaynağıyla doğrulanmalı. Kaynak farklıysa cümleyi düzelt.

#### Diğer App Store alanları

| Alan | Değer |
|---|---|
| Kategori | Birincil: Eğitim · İkincil: Verimlilik |
| Destek URL | `https://maratonapp.com/support` (repoda `web/support.html` YOK, canlıda var mı doğrula) |
| Pazarlama URL | `https://maratonapp.com` |
| Gizlilik URL | `https://maratonapp.com/privacy` |
| Telif | `2026 Ahmet Eren Sıranlı` |
| Fiyat | Ücretsiz · uygulama içi satın alma YOK (v1) |
| Erişilebilirlik | **Yalnız Türkiye** (§4.1 madde 13) |

### 1.2 Google Play

| Alan | Metin | Kr. |
|---|---|---|
| **Başlık** (en çok 30) | `Maraton: YKS Deneme Takibi` | 26 |
| **Kısa açıklama** (en çok 80) | `YKS ve LGS için günlük rota, deneme net takibi, yanlış defteri ve sayaç.` | 72 |
| Kısa açıklama alternatifi | `Her sabah hazır çalışma rotası, deneme net grafiği ve yanlış defteri.` | 69 |

Play kuralları:
- Başlıkta, ikonda ve geliştirici adında emoji, "ücretsiz", "en iyi", "#1" ve büyük harf bağırması yasak.
- Play'de anahtar kelime alanı yoktur. Arama, başlık, kısa açıklama ve tam açıklamadan beslenir. Bu yüzden tam açıklamada ana terimler (YKS, TYT, AYT, LGS, deneme takibi, net hesaplama, çalışma programı, ders çalışma, pomodoro, soru takibi) doğal cümle içinde 2–3 kez geçmeli; sıralı liste olarak yığılmamalı.

#### Tam açıklama (en çok 4000 karakter)

```
Sınava giden yol bir rotaya dönüşür.

Maraton, YKS'ye (TYT, AYT) ve LGS'ye hazırlanan öğrenciler için kişisel bir çalışma programı ve deneme takibi uygulaması. Yüzlerce konuyu gün gün duraklara böler; sabah açtığında bugün hangi dersten, hangi konudan kaç soru çözeceğini bilirsin.

Bugünün durakları
Ders çalışma rotan sınav tarihine, hedef netine ve okulda bitirdiğin konulara göre çizilir. Durağı bitirince işaretle, hat ilerlesin. Gün aksarsa durağı ertele ya da haftayı yeniden düzenle; rota seni cezalandırmaz, yeniden hesaplar.

Deneme takibi ve net hesaplama
TYT, AYT ve LGS denemelerini ders ders gir: doğru, yanlış, boş. Net hesaplama kendiliğinden yapılır. Net grafiğin ve tahmin bandın her denemeyle güncellenir; hangi derste yükseldiğini, hangisinde durduğunu görürsün. Hedef bölümünle aranda kaç net kaldığını takip et.

Yanlış defteri ve soru takibi
Yanlış yaptığın soruyu fotoğrafla ya da not al. Tekrar günü gelince önüne gelir; çözdüğünü kapat, çözemediğin yeniden sıraya girsin. Günlük çözdüğün soru sayısı hedefinle birlikte görünür.

Çalışma sayacı ve pomodoro
Kronometre ya da pomodoro ile odaklan, bitince ders, konu, süre ve soru sayısını tek ekranda kaydet. Çalışma geçmişin takvimde birikir.

Seri ve haftalık özet
Her gün kayıt girdikçe serin uzar. Hafta sonunda ne kadar çalıştığını ve rotada nerede olduğunu tek sayfada gör.

İnternetsiz de çalışır
Bağlantın yokken girdiğin kayıtlar cihazda bekler, bağlantı gelince eşitlenir.

Verin senin
Reklam yok. Verilerini istediğin an indirebilir, hesabını uygulama içinden silebilirsin.

Net ve sıralama tahminleri senin girdiğin sonuçlara dayanan yaklaşık hesaplardır; resmî sonuç yerine geçmez. Maraton, ÖSYM ya da MEB ile bağlantılı değildir.

Gizlilik: https://maratonapp.com/privacy
Destek: destek@maratonapp.com
```

1.789 karakter.

#### Play'e özel alanlar

| Alan | Değer |
|---|---|
| Kategori | Eğitim · Etiketler: Eğitim, Sınav hazırlığı, Verimlilik |
| İletişim | `destek@maratonapp.com`, web sitesi, gizlilik URL'si |
| Hedef kitle | 13–15, 16–17, 18+ (**13 yaş altı işaretlenmez**; işaretlenirse Families politikası devreye girer) |
| "Çocuklara hitap ediyor mu?" | Hayır |
| Reklam | Hayır |
| Hesap silme URL (zorunlu) | `https://maratonapp.com/delete-account` |

---

## 2. Ekran görüntüsü planı

### 2.1 Boyutlar

| Mağaza | Gerekli | Not |
|---|---|---|
| App Store iPhone **6.9"** | **1320 × 2868** (ya da 1290 × 2796) PNG/JPG, alfa yok, 1–10 adet | Tek zorunlu set; 6.5" ve küçük boyutlar bundan ölçeklenir. |
| App Store iPhone 6.5" | İsteğe bağlı: 1284 × 2778 | Ayrıca yüklemek gerekmez. |
| App Store iPad | **Gerekmez** | `app.json` → `ios.supportsTablet: false` |
| Play telefon | En az 2, en çok 8; **önerilen 1080 × 1920 (9:16)**, en uzun kenar ≤ 2 × kısa kenar | iPhone 6.9" görselleri (1:2,17) **2:1 sınırını aşar**, olduğu gibi yüklenemez. Play için 1080×1920 ya da 1080×2160 ayrı dışa aktar. |
| Play ikon | 512 × 512 PNG | |
| Play feature graphic | **1024 × 500**, JPG ya da 24-bit PNG, alfa yok | Zorunlu |

`store/listing-tr.md` içindeki "6.7" + 5.5" zorunlu" bilgisi **eskidi**. 5.5" artık gerekmiyor.

### 2.2 Ortak görsel dil

Tasarım dili AGENTS.md ve `design/extracted/tokens.md` ile uyumlu.

- **Zemin:** `bg #1C1C23` düz. Gradyan, cam efekti ve gölge yok; derinlik yalnız yüzey tonuyla (`surface #28282F`) ve 1px `border` ile kurulur.
- **Başlık:**
  - Yazı: Bricolage Grotesque 400, 6.9" kanvasta yaklaşık 104–120px, `letter-spacing -0.03em`, en çok 2 satır, sola yaslı.
  - Vurgu: tek kelime `accentBright #FF6A72`, gerisi `text #ECE8E4`.
- **Alt metin:** Archivo 500, yaklaşık 44px, `text2 #B0ADB5`, en çok 2 satır.
- **İmza öğe, rota hattı:** Tüm setin üstünden ince (yaklaşık 10px) kızıl `#E5343F` bir hat geçer.
  - Her karede bir düğüm (durak) bulunur.
  - Hat bir sonraki kareye taşar: kullanıcı kaydırdıkça "yolculuk" devam eder.
  - İlk 3 kare panorama olarak birbirine bağlanır.
- **Cihaz:**
  - Çerçeve yok ya da çok ince koyu çerçeve.
  - Ekran görüntüsü kanvasın yaklaşık %78'i, `radius ~64px`, 1px `#3A3A42` kenarlık.
  - Ekran üst üçte birde başlığın altından başlar ve kanvasın altına taşabilir.
- **Ders renkleri:** yalnız ders bağlamında (net kırılımı, ders şeridi). Başlıkta ve arka planda kullanılmaz.
- **Yasaklar:** konfeti, rozet, kupa, yıldız, "%xx başarı" gibi iddia, gerçek öğrenci adı ya da fotoğrafı, Instagram/ÖSYM logosu (2.3.10), ham "Premium"/"Pro" ibaresi.
- **Veri:** Demo hesaptan alınır (`scripts/seed-review-account.mjs`).
  - Sayılar inandırıcı olmalı: TYT 72 → 81 net gibi; uç değerler (119/120) kullanılmaz.
  - Durum çubuğu 9:41, tam pil.
- **Tema:** Koyu tema. Açık tema v1'de belirsiz, kullanılmaz.

### 2.3 Sıralama (8 kare; ilk 3 belirleyici)

Arama sonuç listesinde App Store ilk 3 dikey kareyi gösterir. Kullanıcı çoğu zaman bu 3 kareye bakıp karar verir.

| # | Uygulama ekranı (kaynak) | Başlık (≤5 kelime) | Alt metin | Görsel yön |
|---|---|---|---|---|
| **1** | Ana sayfa, normal hero: bugün çözülen /hedef kahraman sayısı + rota hattı + "BUGÜNÜN DURAKLARI" (`src/screens/home/components/HomeHeroNormal.js`, `HomeTodayStops.js`) | **Her sabah rotan hazır.** | Ne çalışacağını düşünme. Günün durakları seni bekliyor. | Hat ekranın içindeki rota hattıyla aynı hizada başlar ve sağa taşar. "BURADASIN" düğümü kanvas düzeyinde hafif `accentGlow` alır (tek parlama). Duraklardan biri tikli, biri aktif. |
| **2** | Net tahmini / deneme grafiği (`src/screens/forecast/NetForecastScreen.js` ya da Analiz sekmesi net çizgisi) | **Netin nereye gidiyor, gör.** | Her denemeden sonra tahmin bandın yeniden çizilir. | Grafik büyük ve ekranın ortasında. Geçmiş hat dolu kızıl, projeksiyon kesikli (`proj`), hedef çizgisi `targetLine`. "+9 net" yalnız `up #34D399` ile, okla. |
| **3** | Deneme detayı, ders ders (`src/screens/trial/TrialDetailScreen.js`) | **Net, ders ders hesaplansın.** | Doğru, yanlış, boş gir; gerisini Maraton yapar. | Ders şeritleri ders renkleriyle (Türkçe `s-tur`, Matematik `s-mat`…). Net değerleri Bricolage 26px, `tabular-nums`. "Net hesaplama" arama niyetini karşılar. |
| 4 | Yanlış defteri listesi + tekrar (`src/screens/wrong-notebook/WrongNotebookScreen.js`, `ReviewSessionScreen.js`) | **Yanlışın unutulmasın.** | Fotoğrafla, tekrar günü gelince önüne düşsün. | Fotoğraflı 2–3 kart. Fotoğraf demo için elle çekilmiş temiz bir soru olmalı; telifli yayın sayfası **kullanılmaz**. Tekrar merdiveni görünür. |
| 5 | Çalışma sayacı, pomodoro (`src/screens/study/StudyTimerScreen.js`) | **Odaklan, süre kendiliğinden yazılsın.** | Kronometre ya da pomodoro; bitince tek dokunuşla kaydet. | Büyük sayaç rakamı 96px Bricolage. Halka `track` üzerinde kızıl ilerleme. |
| 6 | Seri + haftalık özet / takvim ısı haritası (`src/screens/study/SummaryScreen.js`, Program > ay) | **Her gün bir adım.** | Serin ve haftan tek sayfada. | Isı takvimi `heat1…4` kademeleri. Seri sayısı kahraman sayı. Rozet ve alev ikonu yok. |
| 7 | Widget + kilit ekranı (iOS, `app.json` → `expo-widgets`: Bugün, Rota, Seri) | **Rotan kilit ekranında.** | Sınava kalan gün ve sıradaki durak, bir bakışta. | Gerçek iPhone ana ekran mockup'ı, nötr koyu duvar kâğıdı. **Play setinde bu kare olmaz** (Android widget'ı yok). |
| 8 | Sınav tarihi / hedef kurulumu (`src/screens/onboarding/ExamSetupScreen.js`, `GoalSetupScreen.js`) | **YKS ya da LGS, sana göre.** | Sınavını ve hedef netini seç; rota 1 dakikada çizilsin. | TYT+AYT Sayısal seçili. LGS seçeneği görünür (LGS aramalarını karşılar). |

Play sırası: 1-2-3-4-5-6-8 (7 kare). Hesap ve onboarding kareleri sona yakın tutuldu; mağazada kurulum değil sonuç satılır.

Lig/grup karesi **v1 setine konmaz**. §4.2'deki moderasyon tamamlanınca v1.0.x'te "Arkadaşlarınla aynı hatta" başlıklı 9. kare olarak eklenebilir.

### 2.4 Feature graphic (Play, 1024 × 500)

- Zemin `#1C1C23`.
- Soldan sağa yükselen tek kızıl rota hattı. Solda içi boş "bugün" düğümü, sağda dolu "sınav günü" düğümü; arada 3 küçük durak (`stop` tonu).
- Sol üstte "Maraton" kelime markası, Bricolage 400, yaklaşık 64px, `#ECE8E4`.
- Altında "Sınava giden yol bir rotaya dönüşür." Archivo 500, yaklaşık 26px, `text2`.
- Önemli öğeler ortadaki yaklaşık 900×400 alanda kalmalı. Play bazı yüzeylerde kenarları kırpar; video eklenirse ortaya oynat düğmesi biner.
- Ekran görüntüsü ve cihaz koyma: küçük boyutta okunmaz.

### 2.5 App Preview videosu (isteğe bağlı ama önerilir)

Teknik özellikler (Apple):
- 15–30 saniye, en çok 3 video.
- **886 × 1920** dikey (6.9" ve 6.5" için aynı).
- H.264, en çok 30 fps, 10–12 Mbps, AAC 256 kbps stereo.
- En çok 500 MB.
- Uygulama içi gerçek ekran kaydı olmalı. Elle dokunma görüntüsü ve cihaz dışı sahne olmaz. Yazı üst katmanı serbest.
- İlk karesi poster olarak kullanılır, bu yüzden 1. ekran görüntüsüyle aynı his verilmeli.

Hareket kuralı (AGENTS.md): imza anlardan en çok ikisi gösterilir. Konfeti, ses efekti ve rozet olmaz. Müzik sakin, isteğe bağlı; çoğu kişi sessiz izler.

| Süre | Görüntü | Üst yazı |
|---|---|---|
| 0–3 sn | Ana sayfa açılır, rota hattı soldan çizilir, "BURADASIN" düğümü oturur | Her sabah rotan hazır |
| 3–8 sn | İlk durağa dokunulur → sayaç (pomodoro) başlar, hızlandırılmış | Ne çalışacağını düşünme |
| 8–12 sn | Kaydet → **imza an 1:** durak tamamlandı, hat ilerler, düğüm oturur | Durak tamam |
| 12–19 sn | + → Deneme gir: ders ders D/Y/B, net kendiliğinden → **imza an 2:** net çizgisi eski halden yeni hale geçer | Netin nereye gidiyor, gör |
| 19–24 sn | Yanlış defteri: fotoğraf eklenir, tekrar listesi | Yanlışın unutulmasın |
| 24–28 sn | Kilit ekranı widget'ı (yalnız iOS videosu) | Rotan kilit ekranında |
| 28–30 sn | Bitiş kartı: kelime markası + "Sınava giden yol bir rotaya dönüşür." | — |

Play için aynı kurgudan widget'sız bir YouTube videosu hazırlanır: herkese açık ya da liste dışı, reklamsız, yaş kısıtlamasız.

### 2.6 Sonraki adım: Custom Product Pages ve deneyler (lansmandan 2–3 hafta sonra)

- Apple 2025'ten beri **70 Custom Product Page** izni veriyor ve bu sayfalara **anahtar kelime atanabiliyor**; organik aramada da çıkıyorlar.
- Önerilen üç sayfa:
  1. **LGS:** 8. sınıf dili, LGS kurulum karesi en başta.
  2. **Deneme takibi / net hesaplama:** 2-3-1 sırası.
  3. **Çalışma programı / pomodoro:** 1-5-6 sırası.
- Apple Product Page Optimization ile ilk karede A/B denemesi yap: "Her sabah rotan hazır" ile "Netin nereye gidiyor" karşılaştırılır.
- Play'de Store Listing Experiments ile kısa açıklama A/B denemesi yap.

---

## 3. İkon, renk ve marka notları

**Şu anki durum (engel):**
- `assets/icon.png` ve `assets/adaptive-icon.png` / `splash-icon.png` Expo yer tutucusu (gri çember ızgarası).
- `app.json` uyumsuzlukları:
  - `android.adaptiveIcon.backgroundColor` ve splash `backgroundColor` = `#0A0A0F`, ama uygulamanın zemini `#1C1C23`. Açılışta ton atlaması görünür.
  - `expo-notifications` → `color: "#F5A623"`: turuncu, eski tasarımdan kalma ve marka dışı. Doğrusu `#E5343F`.
  - `expo-notifications` → `icon: "./assets/icon.png"`: Android bildirim ikonu tek renkli (beyaz + şeffaf) olmalı. Tam renkli ikon Android'de gri kare olarak görünür.

**İkon yönü** (onboarding'deki rota çizimi `OnboardingSlideRoute` ile aynı dil):
- Zemin: düz `#1C1C23`. Gradyan yok; isteğe bağlı çok hafif `surface` vinyet.
- Figür: sol alttan sağ üste yükselen tek kızıl `#E5343F` hat (S eğrisi, yuvarlak uç).
  - Başta içi boş halka (başlangıç).
  - Ortada dolu düğüm (bugün).
  - Uçta küçük halka (sınav).
- Yazı, harf ve rakam yok. "M" kelime markası ikonda kullanılmaz; küçük boyutta okunmuyor ve Maraton Yayıncılık'la görsel çakışma riskini artırıyor.
- Hat kalınlığı 1024px kanvasta yaklaşık 70–80px olmalı, 40px ana ekran ve 29px ayarlar boyutunda test edilmeli.
- Dolu düğüm, ana ekranda ikonu tanıtacak tek öğe.

**Platform teslimleri:**

| Teslim | Nasıl |
|---|---|
| iOS 1024 × 1024 | Alfa yok, köşe yuvarlatma yok (sistem yapar) |
| iOS 18+ koyu / renklendirilmiş varyant | İsteğe bağlı. Koyu varyantta zemin şeffaf, hat `#FF6A72`. Expo SDK 57 Icon Composer `.icon` dosyası destekliyorsa iOS 26 cam görünümü de oradan gelir; v1 için şart değil. |
| Android adaptive | Ön plan şeffaf PNG 1024², figür ortadaki %66 güvenli dairede. Arka plan rengi `#1C1C23`. Android 13+ temalı ikonlar için **monochrome** katmanı ekle. |
| Android bildirim | 96 × 96 beyaz siluet (yalnız hat + düğüm), şeffaf zemin. `expo-notifications.icon` buna, `color` → `#E5343F`. |
| Splash | Ortada yalnız dolu düğüm ya da kısa hat; zemin `#1C1C23` (`app.json` splash + adaptiveIcon renkleri de buna). |
| Play 512² ve App Store 1024² | Aynı tasarımdan dışa aktarılır. Mağaza ikonunda ek çerçeve ya da yazı olmaz (Play politikası). |

**Marka cümlesi** (mağaza, story, feature graphic'te ortak): **"Sınava giden yol bir rotaya dönüşür."** Onboarding'in ilk slaytındaki cümle; uygulama içiyle mağaza aynı sesle konuşsun.

---

## 4. İnceleme riskleri ve lansman kontrol listesi

### 4.1 P0: Gönder düğmesinden önce

| # | Madde | Durum / dosya | Kural |
|---|---|---|---|
| 1 | **Gerçek ikon + splash + adaptive ikon** | `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png` yer tutucu. `app.json` renkleri `#0A0A0F` → `#1C1C23`, bildirim rengi `#F5A623` → `#E5343F` | 2.1 (yer tutucu), 2.3 |
| 2 | **"Topluluğa sor" → "Yakında" kaldırılacak** | `src/screens/wrong-notebook/components/detail/OwnWrongDetail.js:89-95` | 2.1(a), 2.2 |
| 3 | **UGC önlemleri (lig/grup/arkadaş açık)** | Ayrıntı §4.2. Dosyalar: `src/screens/league/LeagueScreen.js` (Genel Lig: ilk 50 yabancı ad + foto), `src/components/common/ReportableAvatar.js` (yalnız fotoğraf bildirimi var), `src/hooks/useFriends.js:145` (engelleme yalnız Arkadaşlar'da), `web/terms.html` (sıfır tolerans maddesi yok) | 1.2 |
| 4 | **App Review notunu gerçeğe uydur** | `store/appreview.md` "lig/sosyal V1 kapsamı dışında" diyor, ama binary'de açık. Notta lig, grup ve arkadaş özelliklerini, bildir/engelle yollarını, bildirimlerin 24 saat içinde incelendiğini ve destek e-postasını yaz. | 2.1, 2.3.1 (gizli özellik izlenimi) |
| 5 | **Demo hesap dolu** | `scripts/seed-review-account.mjs` hazır; hesap açılıp betik çalıştırılmadı (`docs/YAYIN_5_GUN.md` Gün 2). Hesaba bir gruba üyelik de eklenmeli ki inceleyici sosyal yüzeyi boş görmesin. | 2.1 |
| 6 | **Premium sızıntısı yok, doğrulandı** | `src/constants/premium.js` → `PREMIUM_ENABLED = false`. `src/navigation/screenRegistry.js` PAYWALL/PREMIUM/PAYMENT_* rotalarını `LegacyHomeRedirectScreen`'e bağlıyor. `ProfileScreen.js:103`, `AccountDeleteScreen.js:59`, `SubjectListScreen.js:99` bayrağa bağlı. `useLockedFeatureEntry` ve `HomeHeroFree` kilitleri `checkFeature` true döndüğü için tetiklenmiyor. **Kalan iş:** cihazda `maraton://premium`, `/pro`, `/pro/onizleme` deep link'lerinin ana sayfaya düştüğünü dene. App Store Connect'te IAP ürünü **oluşturulmamış** olmalı. | 2.1(b), 3.1.1 |
| 7 | **Mağaza metni ve görsellerinde v1 dışı vaat yok** | §1 metinleri bu kurala uyuyor. `store/listing-tr.md` içindeki eski metinde "XP", "Yol haritası & müfredat", "Tamamen ücretsiz" ve emojiler var: **kullanma**. `store/store-yapilacaklar.md` §1.4'teki "Lig & sosyal — Arkadaşlarınla yarış" karesi de kaldırılmalı. | 2.3.1, 2.3.7 |
| 8 | **Yaş derecelendirmesi (yeni anket)** | Apple 2025 sistemi: 4+/9+/13+/16+/18+. 31 Ocak 2026'dan beri yeni sorular zorunlu. "Kullanıcı tarafından oluşturulan içerik / kullanıcılar etkileşir" sorusuna **dürüstçe "Evet"** (ad, foto, grup adı). Mesajlaşma yok. Sonuç büyük olasılıkla 4+/9+ yerine **13+** çıkar, ki bu LGS (13–14) kitlesiyle uyumlu. Elle 16+ seçme. "Made for Kids": **Hayır** (Kids kategorisi dış bağlantı ve analitik yasakları getirir). `store/listing-tr.md` → "4+" bilgisi eskidi. Play IARC: "Users Interact" = Evet. | 2.3.8, 1.3 |
| 9 | **Privacy Nutrition Label düzeltmeleri** | `store/privacy-labels.md` büyük ölçüde doğru. Kontrol: **Name** Sign in with Apple tam adı ve profil adı için "Evet". **Product Interaction** birinci taraf `analytics_events` için amaç "Analytics". **Crash/Performance Data** Sentry (`src/lib/errorReporting.js`, `sendDefaultPii:false`). **Tracking = Hayır.** Bildirim token'ı "Device ID" altında. | 5.1.2 |
| 10 | **Hesap silme** | Var: Ayarlar → Hesabı Sil (`src/screens/settings/AccountDeleteScreen.js`, "SİL" yazma onayı), web `web/delete-account.html`. Notta yolu yaz. | 5.1.1(v) |
| 11 | **Sign in with Apple** | `app.json` → `usesAppleSignIn: true`, `src/hooks/useSocialAuth.js`. Google girişi askıda, bu yüzden 4.8 sorunu yok; e-posta/şifre alternatifi de var. Apple ile girişte **e-postayı gizle** (relay) hesabında hesap silme ve şifre sıfırlama uçtan uca denenmeli. | 4.8 |
| 12 | **Yasal URL'ler canlı** | `https://maratonapp.com/privacy`, `/terms`, `/support`, `/delete-account`, `/.well-known/apple-app-site-association`. Bu ortamdan erişilemedi (proxy), elle doğrula. Repoda `web/support.html` YOK. | 2.1, 5.1.1(i) |
| 13 | **Erişilebilirlik: yalnız Türkiye** | App Store Connect → Pricing & Availability → yalnız Türkiye. Play'de de yalnız Türkiye. Böylece ABD eyalet yaş doğrulama yasaları (Texas SB 2420, Haziran 2026'dan beri yürürlükte; Declared Age Range API) ve AB DSA "trader" beyanı kapsam dışında kalır. | yerel hukuk |
| 14 | **Bildirim izni zorunlu değil** | `NotificationPermissionScreen.js` "atla" düğmesi var. Uygun. | 5.1.2 |
| 15 | **Kamera ve galeri izin metinleri** | `app.json` infoPlist Türkçe ve amaca bağlı. Uygun. `NSUserNotificationsUsageDescription` iOS'ta geçerli bir anahtar değil; zararsız. Final `.ipa`'da `NSMicrophoneUsageDescription` olmamalı (`store/appreview.md` Kalanlar §1). | 5.1.1 |
| 16 | **Şifreleme beyanı** | `ITSAppUsesNonExemptEncryption: false`. Uygun. | export |

### 4.2 UGC (Guideline 1.2): ne var, ne eksik

Apple'ın şartı dört öğe: **içerik filtresi + bildirme + engelleme + yayımlanmış iletişim bilgisi.** Kitle reşit olmayanlar olduğu için inceleyici bu noktaya daha sıkı bakar.

| Öğe | Durum | Eksik |
|---|---|---|
| Filtre | Ad ve grup adı için küfür/uygunsuzluk filtresi bulunamadı (`src/validations`, `supabase/migrations` taraması) | Sunucuda `display_name` ve grup adı kontrolü (Türkçe kara liste) |
| Bildirme | Profil fotoğrafı bildirimi var (`report_avatar`, 2 bildirimde otomatik kaldırma, `supabase/migrations/20261001150903_clde_avatar_reports.sql`) | **Ad** ve **grup adı** için bildir yok; Genel Lig ve grup üye satırında "Bildir" eksik |
| Engelleme | Arkadaşlar ekranında var (`src/hooks/useFriends.js`) | Genel Lig ve grup üyesi satırından engelleme yok |
| İletişim | Ayarlar > Yardım `destek@maratonapp.com` | `web/terms.html` içine "uygunsuz içeriğe sıfır tolerans; bildirimler 24 saatte incelenir; ihlalde hesap kapatılır" maddesi |

**Lansman sabahı için iki yol:**
- **(a) Hızlı ve güvenli:** v1'de Genel Lig sekmesini gizle. Arkadaş ve grup yalnız davet koduyla tanışılan kişileri gösterdiği için risk düşer. Kalan eksik: ad bildirme + terms maddesi.
- **(b) Tam:** ad ve grup adı filtresi + bildir/engelle her satırda.

Kod değişikliği gerektiği için karar senin.

### 4.3 P1: Yayından sonraki ilk hafta

| Madde | Dosya / not |
|---|---|
| **Sign in with Apple token iptali** | Hesap silinirken Apple REST API `/auth/revoke` çağrılmıyor (repoda `revoke` yok; `src/hooks/useSocialAuth.js` `authorizationCode` saklamıyor). Apple'ın hesap silme rehberi bunu istiyor; ret sebebi olarak nadir ama görülüyor. Edge Function + `authorizationCode` → refresh token → revoke. |
| Android izinleri (Play gönderiminden önce) | `app.json` → `READ_EXTERNAL_STORAGE`. `expo-media-library` ve `expo-image-picker` `READ_MEDIA_IMAGES/VIDEO` ekleyebilir. Play "Photo and Video Permissions" politikası tek seferlik kullanımda sistem seçicisi ister. Final `.aab` manifestinde kontrol et, gerekirse `android.blockedPermissions`. `RECORD_AUDIO` olmamalı. |
| Android bildirim ikonu | Bkz. §3. |
| Play hedef API | 31 Ağustos 2026'dan beri yeni uygulamalar ve güncellemeler için güncel hedef API şartı var. Expo SDK 57 varsayılanını final `.aab`'da doğrula. |
| Play Data Safety | `store/data-safety.md` Sentry'yi "Paylaşılır = Evet" işaretlemiş. Google tanımında yalnız senin adına işleyen **hizmet sağlayıcıya aktarım "paylaşım" sayılmaz**; "Toplanır = Evet, Paylaşılır = Hayır" doğru. Fazla beyan yasak değil ama kullanıcıyı korkutur. |
| Sıralama/tahmin iddiası | Uygulama içi `RankSimulatorScreen` ve `NetForecastScreen`'de "tahmini" ibaresi ve veri kaynağı görünür olmalı (2.3.1 yanıltıcı iddia). |
| KVKK ve reşit olmayanlar | `web/privacy.html` "13 yaş ve üzeri" diyor. LGS kullanıcıları 13–14 yaşında. Aydınlatma metninde veli bilgilendirmesi ve açık rıza (fotoğraf yükleme) dilinin bir hukukçuya okutulması önerilir. Hukuki görüş değildir. |
| Metadata tutarlılığı | `docs/APP_STORE_RELEASE.md` "4+", "5.5" screenshot", "3+ yaş" gibi eski bilgiler taşıyor; bu belgeye yönlendir. |

### 4.4 Lansman günü sırası (iOS)

1. İkon, splash ve "Topluluğa sor" düzeltmesi → production build (`eas build -p ios --profile production`) → TestFlight'ta son senaryo turu (`docs/YAYIN_5_GUN.md` "Her build'de oynanacak senaryolar").
2. Demo hesabı aç → `node scripts/seed-review-account.mjs <e-posta>` → uygulamada kontrol et.
3. App Store Connect:
   - Metinler (§1.1), 6.9" görseller (§2), Gizlilik etiketi, Yaş anketi, Erişilebilirlik = Türkiye.
   - Review notu (§4.1 madde 4).
   - Sürüm yayını: **"Manually release"**. Onay gelince saati sen seç; gece yarısı yayına çıkma.
4. Gönder. İnceleme genelde 24–48 saat; ilk uygulamada daha uzun sürebilir. "Yarın mağazada" hedefi için gönderim bugün olmalı ya da beklenti "yarın incelemede" olarak düzeltilmeli.
5. Android: kapalı testi **bugün** başlat. Sayaç 14 gün; 12 kişinin uygulamayı yükleyip gerçekten kullanması gerekiyor.

---

## 5. Bir ay sonra: premium açılışı için hazırlık

Kod hazır: `src/constants/premium.js` bayrağı, `src/screens/premium/*`, `PaywallLegalRow` (geri yükle bağlantısı). Mağaza tarafı ise bir ay önceden başlamalı.

### 5.1 Hemen başlanacaklar (uzun süren dış işler)
- [ ] **Paid Applications Agreement** + banka + vergi formları (App Store Connect → Business). Onay günler sürebilir; bu olmadan IAP test bile edilemez.
- [ ] **App Store Small Business Program** başvurusu: yıllık 1 milyon $ altı gelirde komisyon %30 yerine %15. Gelir başlamadan başvur.
- [ ] Play Console: ödeme profili, **Play Billing Library 8+** (31 Ağustos 2026'dan beri yeni gönderimler için şart; 9.0 güncel). Not: `react-native-purchases` kaldırıldı (`store/appreview.md`). Yeni SDK seçimi (RevenueCat ya da expo-iap) native modül olduğu için **yeni binary** ister; premium **OTA ile açılamaz**.

### 5.2 Ürün kurulumu
- Abonelik grubu: "Maraton Pro". Ürünler aylık ve yıllık.
- Kodda fiyatlar sabit (`src/constants/premium.js` `PLANS`: ₺149/ay, ₺1.068/yıl). Mağazada **mağazadan gelen yerelleştirilmiş fiyat** gösterilmeli; sabit TL metni Apple 3.1.2 ve Play'de reddedilir ya da yanlış fiyat gösterir.
- `ProfileScreen.js:106` "7 gün ücretsiz" deniyor. Bu yalnız App Store Connect / Play'de **tanıtım teklifi (introductory offer)** tanımlıysa ve kullanıcı uygunsa gösterilmeli; deneme sonrası fiyat aynı ekranda net yazmalı.
- **`PaymentCardScreen` (kart numarası/CVC) asla geri açılmaz.** Dijital abonelik için kendi ödeme formu 3.1.1 ihlali; Play'de de Ödemeler politikası ihlali.

### 5.3 Paywall'da bulunması zorunlu olanlar (Apple 3.1.2 + Schedule 2, Play abonelik politikası)
- [ ] Abonelik adı, süresi, fiyatı (dönem başına) ve deneme varsa deneme sonrası fiyat.
- [ ] "Abonelik, dönem bitiminden en az 24 saat önce iptal edilmezse otomatik yenilenir; iptal App Store / Google Play hesap ayarlarından yapılır."
- [ ] İşlevsel **Kullanım Koşulları (EULA)** ve **Gizlilik** bağlantıları, paywall'da ve mağaza açıklamasında. Açıklamaya şu satırı ekle: `Kullanım koşulları (EULA): https://maratonapp.com/terms`. Ya da App Store Connect'te özel EULA alanını doldur.
- [ ] **Satın alımları geri yükle** (var: `PaywallLegalRow`).
- [ ] Hesap silme ekranındaki abonelik notu (`AccountDeleteScreen.js:59`) zaten bayrağa bağlı; açılınca görünür.
- [ ] Paywall baskı kuralları korunuyor: `src/domain/premium/paywallGate.js`, ilk hafta, sınav arifesi ve sınav günü satış yok. İnceleyici bunu "paywall'a ulaşamıyorum" diye görmesin. Review notunda paywall'un nasıl açılacağını (ör. Profil > Premium) yaz.

### 5.4 Gönderim sırası (ilk IAP'yi bozmadan)
1. v1.1 binary'sini IAP SDK'sıyla, `PREMIUM_ENABLED = true` olarak hazırla. TestFlight'ta Sandbox ile satın alma, geri yükleme, iptal ve deneme bitişini dene.
2. App Store Connect'te abonelik ürünlerini doldur: yerelleştirilmiş ad ve açıklama, **inceleme için paywall ekran görüntüsü**, inceleme notu.
3. **İlk abonelik ve ilk abonelik grubu yeni bir uygulama sürümüyle birlikte gönderilmek ZORUNDA.** v1.1 sürüm sayfasında "In-App Purchases and Subscriptions" bölümünden ürünleri seçip birlikte gönder. Ayrı gönderilen ilk IAP "Developer Action Needed"da kalır. Sonraki ürünler sürümsüz eklenebilir.
4. Gizlilik etiketi: "Purchases → Purchase History" (RevenueCat kullanılırsa "Identifiers" da) ekle. Play Data Safety: "Financial info → Purchase history".
5. Yaş: Apple'da reşit olmayan kullanıcılarda "Satın Almak İçin İzin İste" otomatik devreye girer; ek iş yok. Türkiye'de abonelik tüketici tarafında platform üzerinden yürür. `web/terms.html` içine abonelik, yenileme ve iptal bölümü eklenmeli.
6. Mevcut kullanıcı iletişimi:
   - Lansmanda "şu an bütün özellikler açık" denildi; premium günü promosyon metnini "Maraton Pro geldi: …" olarak değiştir.
   - Erken kullanıcılara iyi niyet jesti öner: kurucu dönem indirimi ya da uzun deneme. Bunlar App Store'da **teklif kodu (offer code)** ya da promosyon teklifiyle yapılır, kendi kodunla değil.
   - Ücretsiz katman korunmalı (`FREE_LIMITS`: ayda 4 deneme, sınırsız yanlış defteri). Bir anda kilitlenen özellik kötü yoruma döner.
7. Mağaza görselleri: premium özelliği gösteren karelerde "Pro" etiketi açık olmalı. Ücretli özellik ücretsizmiş gibi gösterilmez (2.3.2). Açıklamaya kısa bir "Maraton Pro" bölümü ekle (fiyat yazmadan).

---

## 6. Kaynaklar

**Apple**
- App Review Guidelines (1.2, 2.1, 2.2, 2.3.7, 2.3.8, 2.3.10, 3.1.1, 3.1.2, 4.8, 5.1.1(v), 5.1.2): https://developer.apple.com/app-store/review/guidelines/
- Ekran görüntüsü ölçüleri: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- App Preview ölçüleri: https://developer.apple.com/help/app-store-connect/reference/app-information/app-preview-specifications
- Yeni yaş derecelendirmesi (13+/16+/18+, 31 Ocak 2026): https://developer.apple.com/news/?id=ks775ehf
- Hesap silme zorunluluğu: https://developer.apple.com/news/?id=12m75xbj
- Texas yaş doğrulama şartları: https://developer.apple.com/news/?id=btkirlj8 · https://www.macrumors.com/2026/06/03/apple-app-store-texas-sb-2420/
- Otomatik yenilenen abonelik (ilk abonelik yeni sürümle): https://developer.apple.com/help/app-store-connect/manage-subscriptions/offer-auto-renewable-subscriptions/
- Custom Product Pages 70 sayfa ve anahtar kelime: https://developer.apple.com/news/?id=gf6mgrs6 · https://respectaso.com/blog/custom-product-pages-app-store-guide-2026/

**Google Play**
- Ekran görüntüsü ve feature graphic ölçüleri (2026): https://appradar.com/blog/android-app-screenshot-sizes-and-guidelines-for-google-play · https://studio.adalo.com/blog/google-play-screenshot-sizes
- Metadata politikası (emoji, "free/best/#1" yasağı): https://www.apptweak.com/en/aso-blog/how-to-prepare-for-new-google-metadata-policy-changes
- Yeni kişisel hesaplar için kapalı test (12 kişi × 14 gün): https://support.google.com/googleplay/android-developer/answer/14151465
- Data Safety, hizmet sağlayıcı paylaşım sayılmaz: https://support.google.com/googleplay/android-developer/answer/10787469
- Fotoğraf ve video izinleri politikası: https://support.google.com/googleplay/android-developer/answer/14115180 · https://github.com/expo/expo/issues/34662
- Play Billing Library 8 son tarihi (31 Ağustos 2026): https://www.revenuecat.com/blog/engineering/play-billing-8-migration

**Sign in with Apple token iptali**
- https://github.com/thomasbardhi01/parkagent/issues/129 (5.1.1(v) + `/auth/revoke` özeti) · Apple REST API: https://developer.apple.com/documentation/sign_in_with_apple/revoke_tokens

**Rakipler (Türkiye, YKS)**

Ortak tablo: hepsi "net hesaplama / deneme takibi" vaat ediyor, çoğu "yapay zekâ" iddiası ve sayaç kullanıyor. Kişisel günlük rota ve durak dili kimsede yok; ilk karede bu farkı göster.
- App Store:
  - YKS Net Hesaplama https://apps.apple.com/us/app/yks-net-hesaplama/id6760604053
  - YKS Sayaç https://apps.apple.com/tr/app/yks-saya%C3%A7/id6456098391
  - YKS Konu, Deneme, Soru Takibi https://apps.apple.com/tr/app/yks-konu-deneme-soru-takibi/id1543183092
  - Netle: YKS Asistanı https://apps.apple.com/tr/app/netle-yks-asistan%C4%B1/id6751005976
  - NetKoç https://apps.apple.com/us/app/netko%C3%A7-yks-net-takibi/id6759757762
  - Testy https://apps.apple.com/tr/app/testy-yks-kpss-s%C4%B1nav-asistan%C4%B1m/id6738379731
  - YKS Cepte https://apps.apple.com/tr/app/yks-cepte/id1545778610
- Google Play:
  - **Yks Rota** (ad olarak "rota" kullanıyor; farkı görselle kur) https://play.google.com/store/apps/details?id=com.kaya.yksrota
  - Neon YKS https://play.google.com/store/apps/details?id=com.ei.neonyks
  - YKS Deneme Takip – Analiz https://play.google.com/store/apps/details?id=com.pandorina.yks_deneme_takip

**Ad çakışması**
- Maraton Yayıncılık (LGS soru bankası/deneme): https://maratonyayincilik.com/
- Maraton Öğretmen + Kütüphane (App Store): https://apps.apple.com/us/app/id1523803290

Not: apps.apple.com, play.google.com ve support.google.com bu ortamdan doğrudan açılamadı. Rakip ve Play bilgileri arama sonuçlarından derlendi; mağaza sayfaları elle gözden geçirilmeli.
