# Analiz Algoritma Briefi — deneme analizi, karşılaştırma, öncelik, tahmin

Sürüm: 2026-09-13 · Sahip: Design Director · Uygulayan: ui-designer + domain mühendisi
Otorite: `design/extracted/Maraton Uygulama.dc.html` (artboard satırları aşağıda). Bu belge
tasarımdaki HER sayının nasıl hesaplanacağını tanımlar. Tanımı olmayan sayı ekrana çıkmaz.

---

## 0. Temel ilkeler (tartışmaya kapalı)

1. **Uydurma sayı yok.** Her rakamın bir formülü, penceresi, asgari verisi ve "yetersizse ne
   gösterilir" kuralı var. Yetersizse sayı yerine dürüst cümle gösterilir; `?? 0` ile boşluğu
   sıfırla doldurmak YASAK (bugün birçok yerde var, bkz. §1).
2. **Konu bazlı net çıkarımı yok.** `src/constants/howItWorks.js:49` ürün sözü: "Konu bazlı net
   tahmini yapmıyoruz." Denemeden yalnız **ders neti** alınır. Konu tarafı yalnız çalışma
   kayıtları + yanlış defteri + rota gecikmesinden okunur.
3. **Seri ayrımı kutsal.** TYT, AYT_SAY, AYT_EA, AYT_SOZ, LGS, BRANŞ(ders) ayrı serilerdir.
   Farklı serilerin toplam neti aynı çizgide, aynı ortalamada, aynı "önceki"de BULUŞMAZ.
4. **Küçük N'de alçakgönüllülük.** Öğrencinin genelde 3–10 denemesi olur. Ortalama/OLS yerine
   robust istatistik (medyan, MAD, Theil–Sen), güven aralığı yerine 80% öngörü bandı, eşiklerin
   hepsi sabit ve test edilebilir. Hiçbir eşik "öğrenilmiş" gibi sunulmaz.
5. **Sakin dil.** Düşüş kırmızı değil (`down`), düşen eğilim geleceğe sönümlenerek taşınır,
   ama bant alt sınırı gizlenmez.

### 0.1 Ortak tanımlar (tüm formüller buna dayanır)

| Sembol | Tanım |
|---|---|
| **seri anahtarı** | `TYT` · `AYT_SAY` · `AYT_EA` · `AYT_SOZ` · `LGS` · `BRANCH:<branch_subject>`. Eski `AYT` kaydı kullanıcının `field`'ına göre eşlenir; field yoksa `AYT_SAY`. |
| **ders serisi** | (seri anahtarı, ders anahtarı). İstisna: `ayt_matematik` AYT_SAY ve AYT_EA'dan birlikte havuzlanır (aynı 40 soruluk test). Branş denemesi TYT/AYT ders serisine KARIŞMAZ. |
| **sıralama** | `trial_date` artan, eşitlikte `created_at` artan. Tarih hesabı Europe/Istanbul yerel gün (`dateKey`), `new Date("YYYY-MM-DD")` UTC tuzağına düşülmez. |
| **ham net** `r_i` | `raw_total_net` (sunucu, `create_trial` RPC). Ders ham neti: `correct − wrong × penalty` (penalty 0,25; LGS 1/3). |
| **normalize net** `v_i` | `normalized_total_net` = `r_i × m_i`, `m_i ∈ {0,94; 1,00; 1,12; 1,22}` öz-beyan (`supabase/migrations/20260909100000_product_access_companionship.sql:285-287,350`). Ders normalize neti = `min(ders_max, ders_ham × m_i)` (sunucuda tutulmuyor, istemcide türetilir). |
| **pencere** | Serinin son `K = 8` denemesi, son denemeden geriye 180 gün. 180 günde 3'ten az varsa en son 3 deneme yaşa bakılmadan alınır. |
| **max** | Seri azami neti: TYT 120 · AYT_SAY/EA/SOZ 80 · LGS 90 · BRANCH ders max. Ders max `trialTypes`'tan. |
| **σ tabanı** `σ_min` | Toplam için `max/60` (TYT 2,0 · AYT 1,33 · LGS 1,5). Ders için `max(0,5; ders_max/40)` (40 soru → 1,0; 20 → 0,5; ≤14 → 0,5). |
| **Yuvarlama** | Hesap tam hassasiyetle, yalnız gösterimde yuvarlanır (yarım sıfırdan uzağa). Aynı görünümde değer + fark birlikte duruyorsa **fark = yuvarlanmış değerlerin farkı** (61,2 → 68,5 ise +7,3; asla +7,4). Eksi işareti U+2212 "−". Sıfır fark işaretsiz "0,00" ve `text3`. |
| **Sayı biçimi** | Deneme kayıt/detay: 2 ondalık ("58,25"; tam sayıysa detay satırında "26"). Karşılaştırma ve ay özeti: 1 ondalık. Tahmin ve bant: tam sayı. |

### 0.2 Robust yapı taşları (saf fonksiyonlar)

- `median(xs)`: çift uzunlukta ortadaki ikisinin ortalaması.
- `mad(xs) = median(|x − median(xs)|)`; ölçek `σ̂ = max(σ_min, 1,4826 × mad(residuals))`.
- `theilSen(points)`: tüm `i<j` çiftleri için `(y_j − y_i)/(x_j − x_i)`, `x_j = x_i` olan çift atlanır;
  eğim = medyan. Hiç geçerli çift yoksa `null`. Seviye (son noktada):
  `L = median(y_i − s × (x_i − x_last))`.
- `jackknifeSlopeSd(points)`: her `i` çıkarılarak Theil–Sen eğimi `s_(i)`;
  `sd = sqrt((n−1)/n × Σ(s_(i) − mean)^2)`. `n < 3` → `null`.
- `mannKendallS(ys)`: `Σ_{i<j} sign(y_j − y_i)`.
- Tek taraflı p ≤ 0,05 için asgari `|S|` tablosu: n=4 → 6 · n=5 → 8 · n=6 → 11 · n=7 → 13 · n=8 → 16.
- `t80(df)`: 80% iki taraflı öngörü için t çeyreği: df1 3,078 · df2 1,886 · df3 1,638 · df4 1,533 ·
  df5 1,476 · df6 1,440 · df≥7 1,415 (df=7) → df≥30 1,282.

---

## 1. Ekran ekran metrik tanımları ve mevcut kod denetimi

Durum etiketleri: **DOĞRU** · **KISMEN** (tanıma yakın, düzeltme gerekli) · **YANLIŞ** · **YOK**.

### 1.1 Analiz (HTML satır 3280–3443)

| Tasarım öğesi | Tanım | Asgari veri / yetersizse | Kod durumu |
|---|---|---|---|
| Segment Tümü/TYT/AYT/Branş | Tümü = BRANCH dışı tüm seriler; hero serisi = filtredeki en son denemenin serisi. AYT = AYT_SAY∪AYT_EA∪AYT_SOZ ama grafik ve delta yine TEK seri (en son AYT denemesinin serisi). Branş = en son branş denemesinin `branch_subject`'i. | — | KISMEN: `src/domain/analysis/analysisModel.js:3-12` filtre doğru, fakat AYT içinde SAY/EA/SOZ tek çizgide karışabilir (`:58-60` yalnız ALL için tip süzüyor). |
| "BU HAFTA NE OKUYORUZ" 3 madde | §2.4 kural kataloğu. En fazla 3, öncelik sırası: ders düşüşü → çalışma açığı → defter bekleyen. Nokta rengi: düşüş `down`, açık `warn`, defter `accent`, yükseliş `up`. | Hiç kural tetiklenmezse blok gizlenir (boş başlık gösterilmez). | YOK — hiçbir modül üretmiyor. |
| Hero eyebrow "TYT DENEMESİ · 23 HAZİRAN 2026" | Hero serisinin en son denemesi, tarih `d MMMM yyyy` tr-TR, büyük harf. | 0 deneme → Boş durum; 1 deneme → "Analiz Veri Yetersiz" hali (§1.9). | KISMEN: `analysisModel.js:39-50` yalnız 0 için boş; 1 deneme hali yok (`src/screens/analysis/AnalysisScreen.js:73`). |
| Hero net `{{ net }}` (84px) | Son denemenin **ham** neti, 2 ondalık. Analiz ham okur; Rota normalize okur (kart altı notu bunu söylüyor). | — | DOĞRU (`analysisModel.js:55`). |
| Hero delta "↑ 2,3" | `r_son − r_önceki`, **aynı seride** önceki. 1 ondalık, ok yönü işaretten. | Serinin ilk denemesi → delta gizlenir. | YANLIŞ: `analysisModel.js:53-56` önceki = filtrelenmiş listede bir önceki; Tümü'de TYT'yi AYT ile kıyaslıyor. |
| Trend grafiği (düğümler, alan, eksen etiketleri) | Hero serisinin penceresindeki ham netler (en fazla 12, kronolojik). Eksen: 4 çizgi, `[floor(min)−1, ceil(max)+1]` aralığı 3 eşit adıma, tam sayıya yuvarlı. X etiketleri: ilk, orta, son deneme tarihi "22 HAZ". | ≥2 nokta. | KISMEN: `analysisModel.js:58-83` seri doğru (ALL), eksen kuralı yok. |
| "DERS BAZLI TREND" kartları: net, delta çipi, sparkline, "en düşük/en yüksek" | Hero serisinin ders serileri. net = son denemedeki ders ham neti; delta = aynı ders serisinde son − önceki (yuvarlı değerlerin farkı, 2 ondalık); sparkline = son 6 değer; lo/hi = sparkline penceresinin min/max'ı. | Dersin son denemede satırı yoksa kart gösterilmez; önceki yoksa çip "ilk". | KISMEN: `src/screens/analysis/SubjectListScreen.js:33` pencere 5 (tasarım 6), `?? 0` ile eksik değeri sıfırlıyor; delta `null` hali doğru (`:35-37`). |
| "DENEME KAYITLARI · 24 kayıt" + 2 satır + mood etiketi | Sayım = kullanıcının TÜM deneme sayısı (seri filtresine göre). Satır delta = §1.2 kuralı. Mood `good/okay/bad` → İYİ/ORTA/ZOR. | — | YANLIŞ: sayım `getTrials` 30 limitli (`src/supabase/trials.js:24`) → 30 üstü yanlış. Ayrıca mood "ZOR" ile zorluk "ZOR" çipi çakışıyor (bkz. §7 tasarım notları). |
| "YAYIN KARŞILAŞTIRMASI" (Limit 58 / 3D 52 / Karekök 47) | §2.6 trend-düzeltilmiş yayın etkisi. Değer = `L_bugün + median(yayın artıkları)`, tam sayı. Çubuk genişliği = değer / gösterilen en yüksek değerin 1,15 katı (bu sayede en iyi yayın ~%87). Çubuk tonu: sıralamaya göre heat3/heat3/heat2 (renk durum değil, sıra). | Hero serisinde ≥5 deneme, en az 2 yayında ≥2'şer deneme. Aksi halde kart YOK. | YOK. |
| Kart notu "Rota normalize net üzerinden çizilir" | Sabit metin; ancak §2.2 öz-beyan koruması tetiklendiyse "Bu dönemde rota ham netle çiziliyor" varyantı. | — | YOK. |
| "DAHA DERİNE" notları | Konu İlerlemesi notu: "N konuda defter yükü veya çalışma açığı" (N = §2.5 uygun konu sayısı; 0 ise "Öncelikli konu yok"). Net Tahmini notu: "Bu tempoyla sınav günü X net" (X = §2.3 `projected` tam sayı; tahmin yoksa "Üçüncü denemeden sonra açılır"). | — | YOK (statik). |

### 1.2 Deneme Kayıtları (3451–3579)

| Öğe | Tanım | Kod |
|---|---|---|
| Başlık sayısı "24" | Filtreye uyan tüm denemeler; sunucudan `count: exact` ile. | YANLIŞ (limit 30, `trials.js:24`). |
| Ay grupları "HAZİRAN" | `trial_date` yerel ayı, yeni → eski. | kontrol et `useTrialRecords.js`. |
| Satır neti "58,25" | Ham toplam, 2 ondalık. | — |
| Satır delta "+2,30 / −1,25 / ilk" | Aynı serideki bir önceki deneme ile (liste sırasındaki önceki satırla DEĞİL). Serinin ilki "ilk" (`text3`). Renk: >0 `up`, <0 `down`, 0 `text3`. | Tasarım örneği bunu doğruluyor: 58,25 − 55,95 = +2,30 aradaki AYT satırını atlıyor. |
| Filtre "Yayın · hepsi" / "Son 3 ay" | `publisher_id` eşitliği; tarih penceresi yerel güne göre `today − 90 gün`. | — |
| Kilit kartı "Son 8 hafta açık. 16 daha eski deneme kayıtlı." | Ücretsiz: `trial_date ≥ today − 56 gün` görünür; gizli sayı = filtreye uyan ve 56 günden eski deneme sayısı (sunucu count). Gizli 0 ise kart yok. Delta hesabı kilitli denemeleri de GÖRÜR (görünür satırın "önceki"si gizli olabilir; değer gösterilmez, yalnız fark). | YOK (sayım yok). |

### 1.3 Deneme Detayı (2633–2742) ve "Zor Deneme" hali (3121–3181)

| Öğe | Tanım | Asgari / yetersiz | Kod |
|---|---|---|---|
| "+2,30 önceki denemeye göre" | Aynı seri önceki ham toplam farkı. | Önceki yoksa blok yerine "Bu serideki ilk denemen". | KISMEN: `src/screens/trial/useTrialDetail.js:56` önceki yoksa 0 döndürüyor (uydurma "0"). |
| HAM NET / NORMALİZE | `raw_total_net` / `normalized_total_net`, 2 ondalık. Normalize kartı yalnız `m ≠ 1`'de vurgulu kenarlık alır; `m = 1`'de iki kart yerine tek HAM NET kartı. | — | DOĞRU (`useTrialDetail.js:52-54`). |
| "Karekök zorluk katsayısı 1,04" | Veride yayın katsayısı YOK; yalnız öz-beyan `m ∈ {0,94;1,00;1,12;1,22}`. Etiket "Zorluk katsayısı · senin işaretin", değer 2 ondalık. 1,04 gibi yayın katsayısı §4.3 v2'ye kadar gösterilemez. | — | KISMEN: kod `publisherLabel` ile yayın adı basıyor (`useTrialDetail.js:88`) → yanlış iddia. |
| DERS DERS D/Y/B/NET | `trial_subjects` satırları; NET tam sayıysa ondalıksız, değilse 2 ondalık. | Satırı olmayan ders listelenmez (0 yazılmaz). | YANLIŞ: `useTrialDetail.js:62-65` `|| 0` ile olmayan dersi 0 gösteriyor. |
| ZORLUK kartı + "ZOR" çipi | `difficulty_level ∈ {hard, very_hard}` ise. Metin öz-beyanı söylemeli: "Bu denemeyi zor olarak işaretledin. Rota bu yüzden normalize netle okur." ("ortalamanın üstünde zordu" karşılaştırma iddiası veriyle desteklenmiyor.) | — | KISMEN (`useTrialDetail.js:72`), metin değişmeli. |
| ROTAYA ETKİSİ "71'den 73'e" | `before = forecast(seri − bu deneme)`, `after = forecast(seri)`, ikisi de §2.3, `as_of = bu denemenin tarihi`. İkisi de tam sayı; eşitse "Tahmin değişmedi: 71 net." | `before` için ≥3 → seride ≥4 deneme. Yoksa kart yok. | KISMEN: gating doğru (`:75`) ama motor OLS (§2.3'te değişiyor) ve bugünkü tarihle yeniden hesaplanıyor; §4.1 snapshot'ı okunmalı. |
| **Zor Deneme tetik kuralı** | Kayıt sonrası `Δ_top = r_yeni − r_önceki` (aynı seri). Tetik: `Δ_top ≤ −max(1,5; σ̂_top)` (σ̂ yoksa σ_min). Aksi halde Deneme Özeti. | Seride önceki yoksa tetiklenmez. | YOK. |
| Zor Deneme "MATEMATİK NETİ önceki 19,5 → yeni 16,8 −2,7" | Gösterilen ders = `argmin_s (Δ_s / ders_max_s)` (en büyük göreli düşüş), eşitlikte müfredat sırası. 1 ondalık, fark yuvarlı değerlerden. | — | YOK. |
| "Matematik yükü önümüzdeki iki haftaya yeniden dağıtıldı" + %62 çubuk | Yalnız rota revizyonu gerçekten o dersin duraklarını taşıdıysa (`summarizeRouteRevision` çıktısında ders eşleşmesi). Çubuk = taşınan dakika / o dersin önümüzdeki 2 hafta toplam dakikası. Revizyon yoksa kart alt bölümü gizlenir. | — | YOK. |

### 1.4 Deneme Özeti (3184–3268)

| Öğe | Tanım | Kod |
|---|---|---|
| "58,25 +2,30", "önceki 55,95 → yeni 58,25" | Aynı seri önceki/yeni ham toplam. | kontrol: `TrialSummaryScreen.js`. |
| Hat grafiği "TAHMİN 73 · önce 71 idi" | §1.3 ROTAYA ETKİSİ ile aynı değerler, aynı gating. Gating tutmazsa sağ etiketler yok, hat yalnız geçmişi çizer. | KISMEN. |
| Açıklama "Tahmin 71'den 73'e çıktı. Matematik'teki artış rotayı yukarı çekti." | Birinci cümle before/after. İkinci cümle §2.7 sürücü kuralı; sürücü yoksa "Artış derslere yayılmış." / düşüşte "Düşüş derslere yayılmış."; tahmin değişmediyse ikinci cümle yok. | YOK. |
| DERS DERS DEĞİŞİM: net, delta, çubuk | net = ders ham neti; delta = aynı ders serisinde önceki; çubuk genişliği = `net / ders_max` (26/40 = %65). Delta yoksa "ilk". | YOK/KISMEN. |
| "TAHMİNİ SIRALAMA 162–175 bin" | Bant alt/üst `low/high` → önceki yılın net→puan→sıralama tablosuyla (§4.5 statik veri). | YOK — veri yok. Veri gelene kadar blok **gösterilmez**. |
| "Bilgisayar Mühendisliği · 7 net kaldı" | `eşik_net(hedef program) − L_bugün` (tek denemenin neti değil, §2.2 seviyesi), tam sayı yukarı yuvarlı; ≤0 ise "eşiğin üstündesin". | YOK — eşik verisi yok; gizli. |

### 1.5 Deneme Karşılaştırma (3873–3954)

| Öğe | Tanım | Kod |
|---|---|---|
| Çift seçimi | Yalnız aynı seri anahtarı (TYT–TYT, AYT_SAY–AYT_SAY, BRANCH:x–BRANCH:x). Varsayılan: en yeni + aynı serideki bir önceki. Seride tek deneme → `canCompare=false`, "Aynı türden ikinci deneme yok". | YANLIŞ: `src/hooks/useTrialCompare.js:31-32` aynı tür yoksa `sorted[1]`'e (farklı tür) düşüyor. |
| Seçici etiketleri "Karekök AYT 7" | `trial.name`. | YANLIŞ: `useTrialCompare.js:93-94` olmayan `title` alanını okuyor → hep "Eski deneme". |
| Hero "7 HAZ 61,2 → 21 HAZ 68,5 +7,3" | Ham toplam, 1 ondalık, fark yuvarlı değerlerden. | KISMEN: fark yuvarlanmamış değerden (`:75`). |
| DERS / tarih / tarih / FARK tablosu | §2.7. Satır sırası: Δ azalan; eşitlikte müfredat sırası. |Δ| < 0,25 → `text3` ve "0,0". Bir denemede satırı olmayan ders: "—" ve fark "—". | YANLIŞ: `:59-60` eksik dersi 0 sayıyor → sahte fark. |
| Uyarı kartı "İki deneme aynı yayından değil…" | Gösterim koşulu: `publisher_id` farklı **veya** herhangi biri null ("yayını bilinmiyor" varyantı) **veya** `difficulty_level` farklı. Zorluk farklıysa ikinci cümle: "Normalize netle fark +X." (X = yuvarlı normalize farkı). | KISMEN: `:79-81` yalnız ikisi de doluyken; null ve zorluk farkı atlanıyor. |

### 1.6 Konu İlerlemesi (3587–3661) ve Öncelikli Konular (3774–3861)

Önemli eşleme hatası: kapsam raporu Konu İlerlemesi'ni `SubjectListScreen`'e bağlıyor, ama o ekran
**ders trend kartları** çiziyor. Tasarımdaki Konu İlerlemesi **konu öncelik listesi**dir
(Öncelikli/Sürüyor/Kapandı). Ders trend kartları Analiz kökündeki "DERS BAZLI TREND"dir.

| Öğe | Tanım | Kod |
|---|---|---|
| Segment Öncelikli/Sürüyor/Kapandı | §2.5 sınıflandırması. | YOK. |
| "1.284 soru" | Aktif sınav kapsamındaki `study_logs.question_count` toplamı (tüm zamanlar). | YOK. |
| "Altı konuda defter yükü veya çalışma açığı var." | N = Öncelikli sınıfındaki konu sayısı. N=0 → "Öncelikli Konular Boş" hali. | YOK. |
| "İlk üçüne durak koy" / "Seçili 3 konuya durak koy" | Sıralamanın ilk 3'ü önseçili; seçim ekranda kalır. | YOK. |
| Satır: ders rengi, konu, "defter 5" (≥3 ise `warn`) | `W` = açık (`is_resolved=false`) yanlış sayısı. W=0 ise sağda "N gündür yok" gösterilir. | YOK. |
| Satır çubuğu %96 | `round(100 × P)`, §2.5. Çubuk ders renginde (Öncelikli Konular) / heat tonunda (Konu İlerlemesi) — renk sıra, durum değil. | YOK. |
| Meta "son çalışma 11 gün önce · 2 durak geride" / "rotada" / "rotada geride" / "11 gündür yok" | `R` gün = yerel bugün − son çalışma yerel günü (0 "bugün", 1 "dün", hiç → "henüz çalışılmadı"). `Lag` = §2.5. | YOK. |
| "Kalan 3 öncelikli konunu gör" (kilit) | Ücretsiz ilk 3'ü görür; kalan = N − 3. | YOK. |
| "Üstteki üç konu 12 saatlik durak demek. … kalan 4 durağın sırası kaymaz" | Saat = Σ `estimateTopicCost(konu).minutes` / 60, en yakın tam saate. İkinci cümle yalnız `distributeDebt` simülasyonu mevcut durakları kaydırmıyorsa; kaydırıyorsa "N durak bir hafta ileri kayar." | YOK. |
| Mevcut `useWeakAreas` | Ders ortalaması < %50 olan DERSLERİ "konu" diye listeliyor. Tasarımın vaadiyle çelişiyor. | YANLIŞ: `src/hooks/useWeakAreas.js:11-36`. Ekran yetim (kapsam-raporu #35). |

### 1.7 Senaryolar (2014–2059)

| Öğe | Tanım | Kod |
|---|---|---|
| "Şimdiki tempo 68 net · 20 Haz" | §2.3 `projected`, sınav tarihi. | KISMEN (motor değişecek). |
| "Haftada 5 durak · 620 soru" | Rota mevcut haftasının durak sayısı ve planlanan soru toplamı. | KISMEN: `useStudyRoute.js:175-176`. |
| "Haftada +1 durak 73 +5 net" / "Hafta sonunu aç 71 +3" | §2.8 kişisel verim modeli. Model yoksa sayı yok, yalnız yük satırı ve "Etkisini ölçmek için daha çok kayıt gerekiyor." | YANLIŞ: `src/domain/forecast/tempoScenario.js:3` senaryolar ±%10 soru (tasarım durak/hafta sonu); `:19-58` 3 noktalı kişi-içi regresyonla nedensellik iddiası; `:89` yedek formül `baselineGain × (m−1)` doğrusal esneklik varsayımı — uydurma. |
| "günde ~25 dk fazla" | Ek durakların `estimateTopicCost` dakikası / 7, en yakın 5 dk. | KISMEN (`tempoScenario.js:95-96` soru×dk/soru). |
| Not "Bandın kalınlığı … son 5 denemenin sapması" | Metin §2.3 ile uyumlu olmalı: "son denemelerindeki sapma". Senaryo bandı yarı genişliği = şimdiki tempo yarı genişliği. | DOĞRU (`tempoScenario.js:104-107`). |

### 1.8 Bölüm Eşiği (2067–2135)

| Öğe | Tanım | Kod |
|---|---|---|
| "72 net nereye yeter?" + "alt sınırı 66, üst sınırı 74" | `projected`, `floor(low)`, `ceil(high)`. | KISMEN. |
| BANDIN İÇİNDE / SINIRDA listeleri | Eşik netleri statik veri (§4.5). İçinde: `low ≤ eşik ≤ high`. Sınırda: `high < eşik ≤ high + 6`. Sıra: eşiğe mutlak mesafe artan. Sağdaki "+7 net" = `projected − eşik` (tasarım: 72 − 65), işaretli tam sayı. | YOK — `RankSimulatorScreen` veri olmadığını söylüyor (doğru davranış). |
| Uyarı: SAY/EA/SÖZ lisans programları TYT+AYT birlikte ister | Tek "72 net" TYT'dir. Lisans programı için eşik çifti (TYT, AYT) ve kullanıcının iki tahmini birlikte karşılaştırılmalı; yalnız TYT ile lisans eşiği gösterilemez. | Tasarım notu §7. |

### 1.9 Analiz Veri Yetersiz (12301–12334)

- Tetik: hero serisinde tam **1** deneme (0 → "Deneme Kayıtları Boş"/ilk deneme boşu).
- Kart: "TEK DENEME · 23 HAZİRAN", değer = o denemenin ham neti (tasarımdaki 55,95 örnek).
  Kod: `AnalysisScreen.js:74` kahraman sayı yuvasını boş geçiyor (kapsam-raporu #157) → YANLIŞ.
- Metin kararı: "İkinci denemeni girdiğinde **yön** açılır; üçüncüden sonra tahmin bandı."
  Tasarımdaki "ikinci denemede tahmin bandı açılır" cümlesi §2.3 asgari veri kuralıyla (n≥3) ve
  Ana Sayfa "Üçüncü denemeden sonra rota geleceği de çizer" cümlesiyle çelişiyor; ürün kararı: n≥3.

### 1.10 Haftalık Özet (890–1030)

| Öğe | Tanım |
|---|---|
| "37. HAFTA" | Rota başlangıç haftasından (route revision ilk `week_start`) itibaren 1 tabanlı hafta sırası. Rota yoksa ISO hafta değil, eyebrow gizlenir. |
| Başlık "Bu hafta rotanın en verimli haftası oldu." | Haftanın soru toplamı, rotanın önceki tüm haftalarından büyükse VE ≥2 önceki hafta varsa. Değilse: soru ≥ geçen hafta × 1,10 → "Geçen haftadan %X fazla soru çözdün." ; değilse "Hafta N durakla kapandı." |
| 612 SORU | Pzt–Paz yerel `study_logs.question_count` toplamı. |
| "7/9 DURAK +2" | Tamamlanan (completed_at hafta içinde) / o haftaya planlanan durak; "+2" = bu hafta tamamlanan − geçen hafta tamamlanan (0 ise gizli). |
| "14sa" | Σ duration_minutes / 60, aşağı yuvarlı; <60 dk ise "45dk". |
| En verimli gün "Cumartesi · 152 soru" | argmax gün; eşitlikte haftanın erken günü. Hepsi 0 → satır gizli. |
| Gün çubukları | Yükseklik = gün / haftanın max'ı; max'ın ≥%70'i `accent`, diğer `bar-idle`. Tasarımda Cum(110/152=%72) ve Cmt vurgulu → eşik %70 bunu üretir. |
| "Plana göre 9 durak, gerçekte 7." | `buildPlanVsActual` hafta satırı. |
| HAFTANIN ÜÇ İŞARETİ | §3'teki eski ekran katlama kuralları + §2.4 katalog; en fazla 3. "Matematik ilk kez haftalık hedefi geçti" örneği **ders bazlı haftalık hedef tutulmadığı için üretilemez** (goals dilimi ders kırılımsız) → katalogdan çıkarıldı. |

Kod: `src/hooks/useSummary.js:40-46` hafta/ay `ready:false` → YOK.

### 1.11 Ayın Özeti (1038–1214)

| Öğe | Tanım | Asgari |
|---|---|---|
| Başlık "Net ortalaman ilk kez 68'i geçti." | Birincil seri (TYT ya da LGS) ay içi ham net ortalaması `μ_ay`; `X = floor(μ_ay)`; önceki tüm ayların `μ < X` ise tetik. Değilse katalog: "Ayı N denemeyle kapattın." | Ayda ≥2 deneme, önceki ≥1 ay. |
| "68 NET ORTALAMASI" | `round(μ_ay)`. | ≥1 deneme; yoksa kahraman sayı "N soru" olur. |
| "19/22 DURAK", "2.940 SORU" | Haftalık tanımların aya toplamı. | — |
| "4. hafta · 828 soru", "HAFTA HAFTA SORU +%28" | Ayın takvim haftaları (Pzt başlangıç, ayın içindeki günleri sayar); % = (son hafta − ilk hafta)/ilk hafta, tam sayı. İlk hafta 0 → gizli. | — |
| "1 MAY 64 → 31 MAY 68 +4" | **Seviye** karşılaştırması: `L(as_of=ayın 1'i)` ve `L(as_of=ayın son günü)` §2.2. | Her iki as_of için ≥3 deneme; yoksa ayın ilk ve son denemesinin ham neti ve etiket "ilk deneme / son deneme". |
| "Tahmin bandı 66-74 nete daraldı" | Ay başı ve ay sonu `forecast_snapshots` (§4.1) yarı genişliği karşılaştırması. Daraldıysa "daraldı", genişlediyse "genişledi", ±1 içinde "aynı kaldı". "Hedef 72 bandın içinde kaldı" = `low ≤ hedef ≤ high`. | Snapshot yoksa cümle yok. |
| DERS NETLERİ · AY BAŞINA GÖRE (18,4 +0,4) | Ders serisi ay içi medyanı; fark = bu ay medyanı − önceki ay medyanı (1 ondalık, yuvarlı değerlerden). Çubuk = medyan/ders_max. | Önceki ay yoksa fark yerine "ilk". |
| AYIN İŞARETLERİ (seri 47, deneme 2, borç 12→8 sa) | Seri: `streaks.current_streak` ve başlangıç tarihi. Deneme: ay içi sayı + ilk iki adı. Borç: ay başı/sonu borç saati (route_stops `completed_at`/`status_changed_at` ile yeniden kurulabilirliği canlı DB'de doğrulanmalı; kurulamazsa snapshot gerekir, §4.4). | — |

Tasarım içi tutarsızlık: künye "21 durak · 1.640 soru" ile üst "19/22 · 2.940" çelişiyor; "Eylül planına
bak" Mayıs ekranında. Künye üstteki sayılarla aynı kaynaktan gelir, CTA "Sonraki ayın planına bak".

### 1.12 Tahmin Doğruluğu (11221–11289) ve Tahmin Şaştı (11297–11378)

| Öğe | Tanım | Kod |
|---|---|---|
| "Tahminim 71'di. 69,25 yaptın." | `predicted` = sınav tarihinden önceki SON `forecast_snapshots` kaydı (kullanıcının gerçekten gördüğü sayı), tam sayı. | KISMEN: `src/domain/exam/examForecastSnapshot.js:25-56` sonuç girilirken yeniden hesaplıyor; model sürümü değişirse "gördüğü" sayı değil. |
| "1,75 net şaşırdım." | `|actual − round(predicted)|`, 2 ondalık. | DOĞRU (`forecastAccuracyView.js:46-47`). |
| "Aralık 69–73'tü, sonuç aralığın içinde kaldı." | Gösterim sınırları `floor(low)`–`ceil(high)`; içinde/dışında kararı **gösterilen** sınırlarla verilir (böylece metin ile sayılar asla çelişmez). | YANLIŞ: `forecastAccuracyView.js:42,54-55` karar gerçek bantla, gösterim `Math.round` ile → low 68,5, actual 68,6: "69–73, içinde kaldı" çelişkisi. |
| BAŞLANGIÇ 51,00 / SINAV GÜNÜ / FARK | `profiles.baseline_net`; fark actual − baseline. | DOĞRU (`:51-53`). |
| "362 GÜNÜN KAYDI" soru/sa/durak/deneme | Rota başlangıcı → sınav günü: Σ soru; Σ dk/60 aşağı; completed durak; deneme sayısı sunucu count. | YOK (deneme sayısı limit 30 riski). |
| "NEREDE ŞAŞTIM" | §2.3.4 neden kataloğu; ilk uygulanabilir neden. | KISMEN: yalnız "son üç yükseliş" (`:90`). |
| "Bu sonucu modele işledim." | YALNIZ `exam_results` satırı kohort kalibrasyonuna (§4.2) giriyorsa gösterilir. Bugün girmiyor → satır gizlenmeli. | YANLIŞ iddia riski. |

### 1.13 Neye Göre Öneriyoruz

`howItWorks.js` metinleri bu belgeyle uyumlu; tek düzeltme: "hangisi kaçıncı kez zorlandı"
(`:36`) bugün tutulmayan veri (§4.3 `review_lapses`). Veri gelene kadar cümle "hangisinin
tekrarı geldi" olmalı.

---

## 2. Çekirdek algoritmalar

### 2.1 Seri kurulumu — `buildSeries(trials, seriesKey, { asOf })`

1. `asOf` sonrası denemeleri at (geçmişe dönük hesaplar için şart).
2. Seri anahtarına göre süz, §0.1 sıralaması.
3. Her deneme için `{ id, t (gün, ilk denemeye göre), r, v, m, publisherId, level, subjects:{key:{raw, norm, correct, wrong, empty}} }`.
4. Pencere §0.1. Aynı gün birden çok deneme: ikisi de kalır (Theil–Sen `dx=0` çiftini atlar).
5. Çıktı meta: `n`, `spanDays = t_son − t_ilk`, `staleDays = asOf − t_son`.

### 2.2 Trend, seviye, oynaklık, sıradışı deneme — `trendModel(series, { value: 'v'|'r' })`

- **Değer seçimi (öz-beyan koruması):** Varsayılan `v` (normalize). Ham değerle (`r`) trend
  kurulur ve artıklar `e(r)` alınır. `r` kullanılır (`valueBasis: 'raw_guard'`) eğer:
  (a) pencerede `m > 1` işaretli ≥4 ve `m = 1` işaretli ≥2 deneme var ve
  `median(e(r) | m>1) ≥ median(e(r) | m=1)` (yani "zor" dediği denemelerde ham net aslında düşük
  değil), VEYA (b) pencerenin ≥%80'i aynı `m ≠ 1` değerini taşıyor (işaret ayırt edici değil,
  yalnız seviyeyi şişiriyor). Sebep: gençler kötü geçen denemeyi "zor" işaretleyip 1,22 ile
  +12 net şişirebilir; tahmin buna kapılmamalı.
- **Eğim** `s` = Theil–Sen (x = gün). **Seviye** `L` = son deneme tarihindeki robust seviye (§0.2).
- **Artıklar** `e_i = y_i − (L + s(t_i − t_son))`. **Oynaklık** `σ̂ = max(σ_min, 1,4826·mad(e))`.
- **Sıradışı**: `e_i < −2,5σ̂` → `outlierLow`, `e_i > 2,5σ̂` → `outlierHigh`. Theil–Sen zaten
  dirençli; bayrak yalnız açıklama içindir (grafikte düğüm `text3` halkası, kopya: "Bu deneme
  eğiliminin belirgin altında").
- **Oynaklık etiketi** (yalnız n≥4): `σ̂/max ≤ 1/60` "istikrarlı" · `≤ 1/30` "dalgalı" · üstü "çok dalgalı".
  0–100 "tutarlılık puanı" GÖSTERİLMEZ (keyfi ölçek; bkz. §3).
- **Asgari**: n=1 → yalnız değer. n=2 → yalnız delta (`s`, `L`, `σ̂` null). n≥3 ve `spanDays ≥ 14` →
  tam model. n≥3 ama span <14 → `s=null`, `L = median(y)`, `σ̂` hesaplanır.

### 2.3 Tahmin bandı — `forecastModel(series, { examDate, today, calibration })`

#### 2.3.1 Nokta tahmini
- Koşul: n≥3, `spanDays ≥ 14`, `examDate > today`. Aksi halde `null` + `reason`
  (`too_few` | `too_short_span` | `no_exam_date` | `exam_past`).
- Eğim sınırı: `s_c = clamp(s, −max/120/7, +max/120/7)` gün başına (TYT: haftada ±1 net).
- Sönümlü ufuk: `h = examDate − t_son` gün. `H = 120` (s ≥ 0) · `H = 45` (s < 0).
  `h_eff = H × (1 − e^(−h/H))`.
- `projected = clamp(L + s_c × h_eff, 0, max)`.
- Gerekçe: bugünkü `lib/netForecast.js:82` doğrusal ekstrapolasyon 250 günlük ufukta 3–5
  noktanın eğimini olduğu gibi taşıyor → tavana çarpan tahminler. Öğrenme doygunlaşır; düşüş
  ortalamaya döner. H değerleri **varsayımdır**, `model_version` ile kayıtlı, §2.3.3 ile denetlenir.

#### 2.3.2 Bant (80% öngörü)
```
w0 = t80(n − 2) × sqrt( σ̂² × (1 + 1/n)  +  (σ_s × h_eff)²  +  σ_exam² )
w  = c_cal × w0 × (staleDays > 60 ? 1,25 : 1)
low  = clamp(projected − w, 0, max) ;  high = clamp(projected + w, 0, max)
```
- `σ_s` = jackknife Theil–Sen sd (§0.2), null ise 0.
- `σ_exam` = sınav günü kayması önseli: TYT 3,0 · AYT 2,0 · LGS 2,5. Kohort verisi (§4.2) ≥30
  sonuç olunca onunla değişir.
- `c_cal` = kalibrasyon katsayısı (§2.3.3), varsayılan 1, sınır [0,8; 2,0].
- Gösterim: `floor(low)`–`ceil(high)`, tam sayı; `projected` `round`.
- `confidence`: n≥6 ve `σ̂ ≤ max/30` → "yüksek"; n≥4 → "orta"; diğer "düşük". Kopya "Aralık geniş,
  çünkü N deneme var" düşükte zorunlu.
- Mevcut kod: `lib/netForecast.js:10,90` Z=1,96 (95%) — n=3'te df=1 için t=12,7 gerekir; Z
  aralığı ~6 kat dar gösteriyor, taban (`:89`) bunu keyfi yamıyor → YANLIŞ. `:70-71` son 5, `:72` n≥3 DOĞRU.
  `forecastBySubject` (`:118-143`) tüm türleri tek tarih eksenine koyuyor, n=2 ile sınava
  ekstrapole ediyor, ders max'ına kırpmıyor → YANLIŞ; ders tahmini ekranlarda **kullanılmaz**
  (tasarımda ders tahmini yok), fonksiyon kaldırılır.

#### 2.3.3 Kalibrasyon — "bant gerçekten %80 mi?"
- **Kişi-içi geriye dönük test (hemen yapılabilir, veri var):** Serinin her `i ≥ 3` (0 tabanlı) denemesi için
  yalnız `j < i` denemelerle model kur, `examDate := t_i` al, `e_i = y_i − projected`,
  `u_i = |e_i| / w0_i`. Ufuk kovası: `h ≤ 30` · `31–90` · `> 90` gün (uzun ufuk için `i`'yi en az 31
  gün önceki denemelerden tahmin et).
- **Kohort toplamı (sunucu, §4.2):** kova başına `c_cal = Q_0,80(u)` (en yakın sıra: `ceil(0,8·N)`-inci),
  yalnız `N ≥ 50` değerlendirmede; aksi 1. Kişi başına c hesaplanmaz (N çok küçük).
- **Kapsama raporu:** kova başına `coverage = oran(|e| ≤ w)`; hedef 0,80 ± 0,05. İzleme metriği,
  kullanıcıya gösterilmez.

#### 2.3.4 Tahmin Doğruluğu değerlendirmesi
- Girdi: `exam_results.primary_net`, sınavdan önceki son snapshot.
- Çıktı: `absDiff`, `inRange` (gösterilen tam sayı sınırlarla), `signedError = actual − projected`.
- NEREDE ŞAŞTIM neden kataloğu (ilk uyan, yalnız bant dışında):
  1. `actual < low` ve son 3 deneme kesin artan → "Son üç denemende yükseliş vardı, tahminim onlara dayanıyordu. Sınav günü performansı denemelerden farklı olabiliyor."
  2. `actual > high` → "Sınav günü denemelerinden iyi geçti; tahminim denemelerindeki seviyene dayanıyordu."
  3. snapshot `n < 5` → "Tahminim yalnız N denemeye dayanıyordu."
  4. `examDate − t_son > 45` gün → "Son denemen sınavdan N gün önceydi."
  5. hiçbiri → kart yok.
- "Bu sonucu modele işledim": yalnız §4.2 toplama işi `exam_results`'ı okuyorsa.

### 2.4 "BU HAFTA NE OKUYORUZ" kural kataloğu — `weeklyReadings(ctx)`

Her kural `{ id, priority, tone, text }` ya da `null` döner; `priority` artan sıralanır, ilk 3.

| # | id | Koşul | Metin | Ton |
|---|---|---|---|---|
| 1 | `subject_decline` | Hero serisinin ders serilerinde son `k = min(n, 5)` değer (k≥4); `S ≤ −Smin(k)` ve `ThielSen_index(s) × (k−1) ≤ −max(1,0; σ_min_ders)`. Birden çoksa en büyük göreli düşüş. | "{Ders} netin son {k} denemede düşüşte." | down |
| 2 | `subject_rise` | 1'in simetriği (yalnız 1 tetiklenmediyse). | "{Ders} netin son {k} denemede yükselişte." | up |
| 3 | `study_gap` | 1 ya da 2'deki ders (yoksa §2.5 en yüksek öncelikli konunun dersi) için, bu haftanın `study_logs`'unda o dersin rotada geçmiş/aktif durağı olan ya da defterde açık yanlışı olan konular arasında en az dakika (0 dahil); eşitlikte en eski `last_studied_at`. | "Bu hafta {Ders}te en az çalıştığın konu {Konu}." | warn |
| 4 | `notebook_due` | Açık ve `next_review_at ≤ bugün sonu` yanlış sayısı ≥1; ders = en çok bekleyen. | "Defterinde {Ders}ten {N} tekrar bekliyor." | accent |
| 5 | `personal_best` | Son deneme serinin (tüm zamanlar) en yüksek ham neti ve seride ≥3 deneme. | "{Seri}'de en yüksek netin: {net}." | up |
| 6 | `volatility` | n≥6 ve etiket "çok dalgalı". | "{Seri} netin son {n} denemede ±{round(σ̂)} net bandında oynuyor." | warn |
| 7 | `weekly_trials` | Bu hafta ≥1 deneme (§3 WeeklyTrialReview katlaması). | "Bu hafta {N} deneme; {Seri} ortalaman {μ} (geçen hafta {μ'})." — geçen hafta yoksa parantez yok. | accent |

Öncelik: 1 → 3 → 4 → 2 → 5 → 7 → 6. Türkçe ek uyumu (`trSuffix`) zorunlu ("Matematikte", "Kimyada").
Kural 1 **indeks** üzerinden (metin "son 5 denemede" diyor), gün üzerinden değil.

### 2.5 Konu önceliği — `topicPriority(ctx)` · sürüm `priority-v1`

Girdiler (konu = (ders, konu adı), müfredat anahtarıyla eşlenmiş):
- `W` açık defter sayısı (`wrong_questions`, `is_resolved=false`). Ders anahtarı eşlemesi gerekli:
  defter `matematik`/`ayt_matematik`, deneme `tyt_matematik` (`022_fix_wrong_questions_subject_check.sql:9-15`).
- `R` son çalışmadan beri gün (`topic_progress.last_studied_at` ya da `study_logs` max tarih); hiç yok → null.
- `Lag` = `route_stops` içinde bu konunun `week_start < bu hafta başı` ve durumu `completed` olmayan
  (upcoming/active/rescheduled; skipped hariç) durak sayısı. `HasFuture` = gelecekte durağı var.
- `acc̃` = `(correct + 6) / (total + 10)` (60% önselli Beta küçültme); `total < 5` → `f_A = 0`.
- `share` = ders soru sayısı / ders konu sayısı (bugün tek kaynak `data/curriculum.js`; §4.5 ÖSYM
  konu payı tablosu gelince onunla). `S_w = 0,5 + 0,5 × share / max(share)` (5 soruluk ders sıfırlanmaz).
- `decl` = konunun dersi §2.4 kural 1'de düşüşteyse 1, değilse 0 (ders düzeyi bilgi — söze uygun).

```
f_W = 1 − e^(−W/3)
f_R = R == null ? (Lag ≥ 1 ? 1 : 0) : min(1, R / 21)
f_L = min(1, Lag / 2)
f_A = total ≥ 5 ? clamp((0,8 − acc̃)/0,8, 0, 1) : 0
P   = min(1, S_w × (0,35 f_W + 0,25 f_R + 0,25 f_L + 0,15 f_A) × (1 + 0,15 decl))
```

- **Uygunluk (Öncelikli):** `W ≥ 1` VEYA (`getMastery` "mastered" değil VE (`Lag ≥ 1` veya `R ≥ 7` veya (`total ≥ 10` ve `acc̃ < 0,6`))). Defterde açık yanlışı olan konu ustalaşmış sayılsa da öncelikli kalır.
- **Kapandı:** `W = 0` VE (mastered VEYA tüm durakları completed).
- **Sürüyor:** ne Öncelikli ne Kapandı, ve (`total > 0` veya `HasFuture`). Hiçbiri değilse listelenmez (başlanmamış, rotada da yok).
- Sıralama: `P` azalan; eşitlikte `W`, `Lag`, `R` azalan, sonra `localeCompare(tr)`.
- Meta metni: `Lag ≥ 1` → "{Lag} durak geride"; `HasFuture` → "rotada"; `Lag≥1 && HasFuture` → "rotada geride".
- Ağırlıklar **öğrenilmiş değil**; ekranda "puan" diye sayı gösterilmez, yalnız çubuk. Değerlendirme:
  seçilen konuların dersinde sonraki 3 denemede ders neti yönü loglanır (konu→net iddiası yapılmadan).
- Mevcut `topicCost.priorityScoreDetails` (`src/domain/route/topicCost.js:86-126`) rota sıralaması
  içindir ve `expectedNetGain` üretir; Öncelikli Konular ekranı bunu GÖSTERMEZ (konu bazlı net iddiası).

### 2.6 Yayın etkisi — `publisherEffects(series)`

- Ham değerle (`r`) §2.2 modeli; yayın `p` için `effect_p = median(e_i : publisher_i = p)`.
- Gösterilen değer `round(L_r + effect_p)` ("bugünkü seviyende bu yayında beklenen net").
- Uygunluk: n≥5; yayın başına ≥2 deneme; ≥2 uygun yayın. En çok 3 yayın, `n_p` azalan, eşitlikte değer azalan.
- Neden detrend: öğrenci zamanla ilerliyor; eski yayınlar düz ortalamada "zor" görünür. Artık medyanı bunu ayıklar.

### 2.7 Deneme–deneme atıf — `compareTrials(a_older, b_newer)`

- Önkoşul: aynı seri anahtarı, `a.date ≤ b.date`.
- `Δ_s = b_s − a_s` (ham ders neti), yalnız iki denemede de satırı olan dersler. `Δ_total = r_b − r_a`.
- **Toplamsallık:** tüm dersler iki denemede de varsa `Σ Δ_s = Δ_total` (±0,01) — test edilir.
  Eksik ders varsa `attributionComplete = false`, sürücü cümlesi üretilmez.
- **Sürücü:** `d = sign(Δ_total)`; aday = `argmax_s (d × Δ_s)`; `share = d×Δ_s / Σ_{d×Δ_k>0} d×Δ_k`.
  Sürücü var ⇔ `|Δ_total| ≥ 1`, `d×Δ_s ≥ 1`, `share ≥ 0,40`. Eşitlikte müfredat sırası.
- **Gürültü:** `|Δ_s| < 0,25` nötr gösterilir. Satır başına "anlamlı" iddiası yok (tek fark için σ yok).
- **Uyarılar:** `publisherDiffers` (null dahil), `difficultyDiffers`, `normalizedDelta = round1(v_b) − round1(v_a)`.
- **D/Y ayrışması** (yalnız hesaplanır, tasarım yuvası yok): `ΔD`, `ΔY`, `Δ_s = ΔD − penalty×ΔY`.

### 2.8 Tempo senaryoları — `scenarioModel(ctx)` · sürüm `scenario-v2`

- **Kişisel verim** `g` (net / soru): seviye `L(as_of=t_son)` − `L(as_of=t_başlangıç)` bölü aradaki
  `study_logs` soru toplamı. Koşul: aradaki süre ≥42 gün, iki as_of için de ≥3 deneme, toplam soru ≥500, `g > 0`.
- Ek yük: "+1 durak" = mevcut haftanın ortalama durak sorusu; "Hafta sonunu aç" = 1 deneme
  (seri soru sayısı: TYT 120) + 1 tekrar durağı ortalaması.
- `Δnet = clamp( 0,7 × g × ekSoru/hafta × h_eff/7 , 0 , min(1,5 × w, 0,5 × (max − projected)) )`.
  0,7 = azalan marjinal getiri varsayımı (sabit, sürümlü).
- `g` yoksa: kartlarda sayı ve "+X net" YOK; yük satırı kalır; altta "Etkisini ölçmek için daha çok kayıt gerekiyor."
- Band yarı genişliği tüm senaryolarda aynı `w` (tasarım notuyla uyumlu).
- Neden 3 noktalı eğim değil: soru sayısı ile net artışı arasındaki kişi-içi korelasyon motivasyon,
  okul dönemi, deneme zorluğu ile karışık; 3–4 örnekten nedensel eğim çıkarılamaz.

---

## 3. Eski ekranlar — neyi tutuyor, nereye katlanıyor

| Eski | Özellik | Karar | Hedef |
|---|---|---|---|
| `TrialInsightsScreen` | Genel net çizgisi | TUT | Analiz hero grafiği (zaten var). Tümü filtresinde TYT+AYT'yi tek çizgide karıştıran davranış (`TrialInsightsScreen.js:151,156`) ATILIR. |
| | Ders bazlı trend mini grafikleri | TUT | Analiz "DERS BAZLI TREND" kartları. |
| | Değişim rozeti "% değişim" | AT | Net yüzdesi yanıltıcı (düşük tabanda şişer). Yalnız net farkı. |
| | Giriş `AnalysisTrendSection.js:25` → `TRIAL_INSIGHTS` | KALDIR | Kart tıklaması Deneme Kayıtları'na. |
| `ComparativeScreen` (GlassCard) | 7/30/90 gün dönem karşılaştırması | KATLA | Ayın Özeti "AY BAŞINA GÖRE" + Haftalık "HAFTANIN ÜÇ İŞARETİ" kural 7. Bugünkü hesap türleri karıştırıyor ve önceki dönem boşken `prevAvg=0` ile sahte artış veriyor (`src/lib/comparativeAnalytics.js:78-85`) → YANLIŞ, taşınmaz. |
| | Tutarlılık puanı /100 (`100 − sd×5`) | AT | Keyfi ölçek (`comparativeAnalytics.js:168`), türleri karıştırıyor. Yerine §2.4 kural 6 cümlesi ve Senaryolar bant notu. |
| | Kişisel rekorlar | KATLA | §2.4 kural 5 (yalnız son deneme rekorsa) + Son Hafta hero (`useTrialSummaryStats` — o da seri ayrımı yapmalı, `:13-20` karıştırıyor). |
| | Ders ortalama farkı | KATLA | Ayın Özeti DERS NETLERİ (medyan, seri içi). |
| `WeeklyTrialReviewScreen` | Haftalık deneme ort./en iyi | KATLA | Haftalık Özet §2.4 kural 7 (seri içi). `useWeeklyTrialReport.js:35-52` türleri karıştırıyor, önceki hafta yoksa `prevAvg=0` → sahte delta. |
| | Toplam D/Y sayıları | AT | Karışık türde anlamsız. |
| | Tür dağılımı, günlük deneme aktivitesi | AT | Tasarımda yuvası yok, çalışma döngüsüne katkısı yok. |
| `MoodTrend` emoji şeridi | Deneme ruh hali | KATLA | Deneme Kayıtları satır etiketi (İYİ/ORTA/ZOR); emoji şeridi atılır. |

Navigasyon temizliği: üç ekranın route kaydı, `SCREENS` sabiti ve analytics olayları katlama
tamamlandığı batch'te silinir (§6 B8).

---

## 4. Saklanması gereken yeni veri / şema değişiklikleri

Uyarı: migration dosyaları canlı DB ile senkron değil; her madde önce canlıya karşı doğrulanır.

### 4.1 `forecast_snapshots` (ZORUNLU)
```
user_id uuid, series_key text, computed_at timestamptz, as_of_date date,
trigger text check in ('trial_saved','trial_deleted','exam_date_changed','weekly'),
trial_id uuid null, projected numeric(6,2), low numeric(6,2), high numeric(6,2),
level numeric(6,2), slope_per_week numeric(6,3), sigma numeric(6,3), n int,
horizon_days int, value_basis text, model_version text
PK (user_id, series_key, computed_at)
```
Neden: "önce 71 idi" (Deneme Özeti/Detay), "bant daraldı" (Ayın Özeti), "Tahminim 71'di"
(Tahmin Doğruluğu) GEÇMİŞ zaman cümleleri; model sürümü değişince yeniden hesaplamak geçmişi
değiştirir. Uzun ufuk kalibrasyonu da gerçek gösterilmiş tahminlerle yapılır.

### 4.2 `forecast_calibration` + kohort toplama (SONRA, veri birikince)
```
series_key, horizon_bucket, c_cal numeric(4,2), coverage numeric(4,3), n_evals int,
exam_shift_mean numeric(5,2), exam_shift_sd numeric(5,2), n_exam int, model_version, computed_at
```
Sunucu tarafı SECURITY DEFINER toplama işi (kişisel veri dışarı çıkmaz, yalnız katsayı). İstemci
yalnız okur. `N < 50` → varsayılanlar.

### 4.3 Deneme ve defter alanları
- `wrong_questions.source_trial_id uuid null` — "Yanlışları deftere ekle" bağını kurar; "bu
  denemeden N soru defterde" ve defterin deneme kaynaklı/çalışma kaynaklı ayrımı.
- `wrong_questions.review_lapses int default 0` — tekrarda yine yanlış sayısı; howItWorks
  "kaçıncı kez zorlandı" sözünü doğrular ve §2.5'e ileride girdi olur.
- `trials.edition_no int null` (+ yayın seçimi teşviki) — v2 çapraz kullanıcı yayın/baskı zorluk
  katsayısı için baskı kimliği (`publisher_id, exam_type, edition_no`). Katsayı ancak baskı başına
  ≥20 farklı kullanıcı olunca, kullanıcı-trendinden arındırılmış artık medyanıyla hesaplanır.
  O zamana kadar "Karekök zorluk katsayısı" etiketi YOK.

### 4.4 Erişim / sayım
- `getTrials` limit 30 kaldırılmaz ama analiz için `get_trial_series(p_series_key, p_since)` RPC ya da
  sayfalama + `count: exact` sorgusu. Sayımlar (24 kayıt, 16 gizli, 362 günün 24 denemesi) buradan.
- Ay başı/sonu konu borcu saati `route_stops` zaman damgalarından kurulamıyorsa haftalık
  `route_debt_snapshots(user_id, week_start, debt_minutes)`.

### 4.5 Statik içerik verisi (kullanıcı verisi değil, kaynaklı)
- ÖSYM konu soru payı tablosu (son 5–7 yıl, konu başına ortalama soru) → `share`.
- Program taban/son yerleşen netleri (YÖK Atlas) → Bölüm Eşiği, "N net kaldı".
- Net→puan→sıralama tablosu (önceki yıl) → "TAHMİNİ SIRALAMA". Puan hesabı yaklaşık; aralık
  olarak ve kaynak yılıyla gösterilir.

---

## 5. Test matrisi (node:test, `tests/domain/analysis/*.test.mjs`)

Tüm fonksiyonlar saf; `today` ve `examDate` parametre. Sayılar ±0,01 toleransla.

### 5.1 Robust yapı taşları — `robust.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| R1 | `median([3,1,2])` / `median([4,1,3,2])` | 2 / 2,5 |
| R2 | `mad([1,2,3,4,100])` | 1 |
| R3 | `theilSen([(0,50),(7,52),(14,54),(21,56)])` | eğim 0,2857/gün; `L`=56 |
| R4 | `theilSen([(0,50),(7,52),(14,40),(21,56),(28,58)])` | eğim 0,2857; `L`=58; artıklar [0,0,−14,0,0] |
| R5 | Tüm x eşit `[(5,50),(5,52),(5,54)]` | eğim `null` |
| R6 | `mannKendallS([15,14.25,13.5,13,12.25])` | −10 |
| R7 | `mannKendallS([15,13,15.5,14,14.75])` | 0 |
| R8 | `jackknifeSlopeSd` R3 noktaları | 0 |
| R9 | `t80(2)` / `t80(40)` | 1,886 / 1,282 |

### 5.2 Seri — `series.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| S1 | TYT 3, AYT_SAY 2, BRANCH:tyt_matematik 1; `TYT` | n=3, yalnız TYT |
| S2 | Eski `AYT` kaydı, profil field `ea` | `AYT_EA` serisine düşer |
| S3 | ayt_matematik: 2 AYT_SAY + 1 AYT_EA | ders serisi n=3 |
| S4 | `asOf` = 2. denemenin tarihi | n=2 |
| S5 | 10 deneme, son 8'i 180 gün içinde | n=8 |
| S6 | 4 deneme, yalnız son 1'i 180 gün içinde | n=3 (en son 3) |
| S7 | Ders ham 38, m=1,22, ders_max 40 | ders normalize 40 (kırpılır) |
| S8 | Aynı gün iki deneme, `created_at` farklı | sıralama `created_at`'e göre |

### 5.3 Trend — `trendModel.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| T1 | n=1 | `{ value, delta:null, slope:null }` |
| T2 | n=2 [55,95 ; 58,25] | delta +2,30, slope null |
| T3 | R4 serisi (TYT) | σ̂=2,0 (taban), 3. deneme `outlierLow` |
| T4 | n=3, span 10 gün | slope null, `L`=medyan |
| T5 | 5 deneme, hepsi m=1,22 | `valueBasis:'raw_guard'` (kural b) |
| T5b | 4 "zor" (ham artık medyanı +1) + 2 standart (medyan −0,5) | `raw_guard` (kural a) |
| T6 | 4 "zor" (ham artık medyanı −4) + 2 standart (medyan +1) | `valueBasis:'normalized'` |
| T7 | n=6, σ̂=5 (TYT) | etiket "çok dalgalı" |

### 5.4 Tahmin — `forecastModel.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| F1 | n=2 | `null`, reason `too_few` |
| F2 | n=3, span 7 gün | `null`, `too_short_span` |
| F3 | R3 serisi TYT, `today`=gün 21, sınav gün 111, c=1 | eğim kırpılır 0,142857/gün; `h_eff`=63,32; projected 65,05 (gösterim 65); `w`=1,886×√(4×1,25+9)=7,06; low 57,99 high 72,10 → "57–73" |
| F4 | Azalan seri eğim −0,1/gün (kırpma altı), h=90 | `h_eff`=38,91; projected = L − 3,89 |
| F5 | projected + w > 120 | high=120 |
| F6 | staleDays=75 | w F3'ün 1,25 katı |
| F7 | `examDate ≤ today` | `null`, `exam_past` |
| F8 | Geriye dönük test, 6 deneme haftada bir | 3 değerlendirme (i=3,4,5), her biri `{u, h:7, bucket:'≤30'}`; 3 haftalık aralıkla 4 deneme → i=3 için span 42 ≥14, 1 değerlendirme |
| F9 | `calibrationFactor(u=[.2,.5,.9,1.1,.4,.3,.7,1.5,.6,.8])`, N<50 | 1 |
| F10 | aynı u listesi 5 kez (N=50) | 40. sıra → 0,9 |
| F11 | R4 serisi ile R4'ten (14,40) çıkarılmış seri | eğim ve `L` birebir aynı → projected eşit (dirençlilik) |

### 5.5 Tahmin Doğruluğu — `forecastAccuracyView.test.mjs` (mevcut dosya genişler)
| # | Girdi | Beklenen |
|---|---|---|
| A1 | projected 71,2 low 69,1 high 73,4, actual 69,25 | "Tahminim 71'di", absDiff 1,75, inRange true, "69–74" (floor/ceil) |
| A2 | aynı, actual 58,25, son üç artan | inRange false, absDiff 12,75, neden 1 |
| A3 | low 68,5 high 73,2, actual 68,4 | gösterim "68–74", inRange true (gösterilen sınırla) |
| A4 | actual 80, high 74 | neden 2 |
| A5 | bant dışı, snapshot n=3, son üç artan değil | neden 3 |
| A6 | forecast null | başlık "58,25 yaptın.", body null |

### 5.6 NE OKUYORUZ — `weeklyReadings.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| W1 | Mat [15,14.25,13.5,13,12.25] | kural 1 "Matematik netin son 5 denemede düşüşte." |
| W2 | Mat [15,13,15.5,14,14.75] | kural 1 yok |
| W3 | Mat [15,14.9,14.8,14.7] (S=−6, büyüklük 0,3) | kural 1 yok (büyüklük eşiği) |
| W4 | W1 + bu hafta Mat logları: Permütasyon 0 dk (defterde 2 açık), Olasılık 40 dk | kural 3 "Bu hafta Matematikte en az çalıştığın konu Permütasyon." |
| W5 | Defter: Mat 5 due, Fizik 2 due | kural 4 "Defterinde Matematikten 5 tekrar bekliyor." |
| W6 | Tüm kurallar tetik | ilk 3: 1, 3, 4 |
| W7 | Hiçbiri | `[]` |

### 5.7 Öncelik — `topicPriority.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| P1 | W=5, R=11, Lag=2, total 20 correct 10 (acc̃ .5333), S_w=1, decl=0 | f_W .8111, f_R .5238, f_L 1, f_A .3333 → P=.2839+.1310+.25+.05=.7149 → çubuk 71 |
| P2 | P1 + decl=1 | P=.8221 → 82 |
| P3 | W=0, R=3, Lag=0, total 4 | uygun değil → Sürüyor |
| P4 | Hiç çalışılmamış, Lag=1, W=0 | f_R 1, f_L .5 → P=.375×S_w; Öncelikli; meta "1 durak geride" |
| P5 | mastered, W=2 | Öncelikli (W≥1 ustalıktan bağımsız); W=0 olunca Kapandı |
| P6 | İki konu eşit P, W 3 vs 2 | W=3 önce |
| P7 | Defter `ayt_matematik`, müfredat `ayt_matematik` / defter `matematik` → `tyt_matematik` | eşleme doğru |
| P8 | S_w: share 10 ve 1 (max 10) | 1,0 ve 0,55 |

### 5.8 Karşılaştırma — `compareTrials.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| C1 | a {mat 13.75, fiz 9.25, kim 8.5, bio 11.25, tur 18.5}, b {16.75, 11, 10.25, 12, 18.5} | Δ [+3, +1.75, +1.75, +0.75, 0]; Σ=+7.25=Δ_total; sürücü Matematik (share .414); sıra mat, fiz, kim (müfredat), bio, tur; tur nötr |
| C2 | Δ [+1.2, +1.1, +1.0, +0.9] | share .286 → sürücü yok, "Artış derslere yayılmış." |
| C3 | a'da kimya satırı yok | kimya "—", `attributionComplete:false`, sürücü yok |
| C4 | TYT vs AYT_SAY | `canCompare:false` |
| C5 | publisher a=null b=Limit | `publisherDiffers:true` |
| C6 | a 61,24 b 68,56 | gösterim 61,2 → 68,6, fark +7,4 (yuvarlı değerlerden; ham fark 7,32 → "+7,3" YANLIŞ) |
| C7 | Zor Deneme tetik: Δ_top −1,0, σ̂ 2 | tetik yok; Δ_top −2,5 → tetik, ders = en büyük göreli düşüş |

### 5.9 Kayıtlar ve özetler — `trialRecordsModel.test.mjs`, `periodSummary.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| K1 | TYT 55,95 · AYT 42,75 · TYT 58,25 (tarih sırası) | TYT satırı delta +2,30, AYT "ilk" |
| K2 | Ücretsiz, 24 deneme, 8'i 56 gün içinde | görünür 8, kilit "16 daha eski" |
| K3 | Hafta gün soruları [88,102,64,96,110,152,0] | en verimli Cumartesi 152; vurgulu CUM,CMT (%70 eşiği) |
| K4 | Eşit iki gün | erken gün |
| K5 | Ay μ=68,4, önceki aylar [63,66] | "Net ortalaman ilk kez 68'i geçti." |
| K6 | Ay μ=68,4, önceki bir ay 68,1 | başlık kuralı yok |
| K7 | Ayda 1 deneme | başlık yok, kahraman sayı ortalama gösterir (≥1), "ilk kez" yok |

### 5.10 Senaryo ve yayın — `scenarioModel.test.mjs`, `publisherEffects.test.mjs`
| # | Girdi | Beklenen |
|---|---|---|
| X1 | Veri 30 gün | `g:null`, kartlarda sayı yok |
| X2 | g=0,004 net/soru, ek 124 soru/hafta, h_eff 63,3, w 7 | Δ=0,7×0,004×124×9,04=3,14 → +3 |
| X3 | Δ ham 20, w=4 | Δ=6 (1,5w) |
| Y1 | n=4 | kart yok |
| Y2 | 6 deneme; Limit 2, Karekök 2, 3D 2; artık medyanları +2, −1, −4; L=56 | 58, 55, 52 |
| Y3 | Yalnız 1 yayında ≥2 deneme | kart yok |

---

## 6. Uygulama batch'leri (her biri ~1 ajan koşusu)

**B1 · Robust çekirdek + seri** — `src/domain/analysis/robust.js`, `series.js`, ders anahtar eşleme
`subjectKeyMap.js`. Testler 5.1, 5.2. Ekran dokunulmaz.

**B2 · Trend + NE OKUYORUZ** — `trendModel.js`, `weeklyReadings.js`. Testler 5.3, 5.6.
`analysisModel.js` hero delta ve AYT seri düzeltmesi; Veri Yetersiz (n=1) hali ve kahraman sayı.

**B3 · Tahmin v2** — `src/domain/forecast/forecastModel.js` (+ `backtest.js`); `lib/netForecast.js`
`forecastNet` imzasını koruyarak yeni modele yönlendirir (`useStudyRoute`, `examForecastSnapshot`,
`useTrialDetail` kırılmasın); `forecastBySubject` silinir. `forecastAccuracyView.js` sınır/neden
düzeltmesi. Testler 5.4, 5.5; mevcut `tests/domain/forecast/netForecast.test.mjs` yeni sözleşmeye
güncellenir (Z=1,96 beklentileri t80'e).

**B4 · Deneme görünümleri** — `compareTrials.js`, `trialRecordsModel.js`, `trialSummaryModel.js`
(before/after, sürücü cümlesi, Zor Deneme tetik). `useTrialCompare` (tür fallback, `name`, eksik
ders, uyarı koşulu), `useTrialDetail` (ilk deneme, eksik ders, zorluk etiketi/metni). Testler 5.8, K1–K2.

**B5 · Konu önceliği** — `topicPriority.js` + `useTopicPriority` (defter, çalışma, rota durakları).
`useWeakAreas` kaldırılır; Konu İlerlemesi ekranı ders trend kartı yerine öncelik listesine
bağlanır; Öncelikli Konular yetimliği biter (Konu İlerlemesi "Kalan N" satırı). Test 5.7.

**B6 · Şema + snapshot yazımı** — canlı DB doğrulaması; `forecast_snapshots`,
`wrong_questions.source_trial_id / review_lapses`, deneme sayım/sayfalama RPC; deneme kaydı/silme
ve sınav tarihi değişiminde snapshot yazımı (çevrimdışı kuyruk uyumlu). Deneme Özeti/Detay ve
Tahmin Doğruluğu snapshot okur.

**B7 · Dönem özetleri** — `periodSummary.js` (hafta/ay), `useSummary` week/month `ready:true`;
WeeklyTrialReview ve Comparative katlamaları (§3). Testler K3–K7.

**B8 · Senaryo v2 + yayın etkisi + temizlik** — `scenarioModel.js` (tempoScenario yerine, tasarımın
+1 durak / hafta sonu senaryoları), `publisherEffects.js` + Analiz kartı. `TrialInsightsScreen`,
`ComparativeScreen`, `WeeklyTrialReviewScreen`, `comparativeAnalytics.js`, `useWeeklyTrialReport`
ve route kayıtları silinir. Testler 5.10.

**B9 · Veri bağımlı (sonra)** — kohort kalibrasyon toplama işi (§4.2), sınav günü kayması,
v2 baskı zorluk katsayısı (§4.3), statik veri setleri (§4.5) ile Bölüm Eşiği ve sıralama blokları.

Sıra gerekçesi: B1–B3 saf ve her ekranın bağımlılığı; B4–B5 görünür değer; B6 geçmiş zaman
cümlelerini dürüstleştirir; B7–B8 katlama ve silme en sonda (eski ekran kaldırılmadan önce
yeni yuvası çalışıyor olmalı).

---

## 7. Tasarıma geri bildirim (Design Director kararları)

1. Veri Yetersiz metni: "tahmin bandı ikinci denemede" → "yön ikinci, tahmin bandı üçüncü denemede".
2. Deneme Detayı: "Karekök zorluk katsayısı 1,04" → "Zorluk katsayısı · senin işaretin 1,12"; ZORLUK kartı karşılaştırma iddiası yerine öz-beyan cümlesi.
3. Mood etiketi "ZOR" zorluk çipi "ZOR" ile çakışıyor → mood: İYİ / ORTA / ZORLANDIM (kayıt satırında sığıyor, 11,5px).
4. Deneme Karşılaştırma örneği AYT adlarıyla TYT dersleri ve kayıtlarla uyuşmayan tarihler taşıyor; ekran yalnız aynı seri çiftini kabul eder.
5. Ayın Özeti künye sayıları üst sayılarla çelişiyor; CTA ay adı dinamik.
6. Tahmin Şaştı "Bu sonucu modele işledim." kohort kalibrasyonu yayına girene kadar gizli.
7. Haftalık Özet "Matematik ilk kez haftalık hedefi geçti" örneği ders bazlı hedef olmadığı için üretilemez; katalog cümlesiyle değişir.
8. Bölüm Eşiği tek "72 net" ile lisans programı eşiği kıyaslanamaz; SAY/EA/SÖZ programlarında TYT+AYT çifti gösterilmeli (yeni hal gerekiyor).
