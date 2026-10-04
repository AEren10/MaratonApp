# Maraton · ASO araştırması ve son mağaza metinleri

Tarih: 4 Ekim 2026 · Kapsam: v1.0 Türkiye lansmanı (iOS + Android, yalnız Türkiye, Türkçe) · Kaynak kod DEĞİŞTİRİLMEDİ.

Bu belge `docs/reports/03-magaza-hazirligi.md` (3 Ekim) ve `store/listing-tr.md` üzerine kurulur. **Mağaza metinlerinde bu belge onların yerine geçer.** Makinede okunur kopya: `docs/store/metadata.json`. Bütün karakter ve bayt sayıları Python `len()` ve `len(s.encode("utf-8"))` ile ölçüldü (§6).

> **Araştırma notu (neyin engellendiği):** Bu oturumda ağ çıkış vekili `apps.apple.com`, `play.google.com`, `itunes.apple.com` (Search API), `appfigures.com`, `apptweak.com`, `mobileaction.co`, `aso.dev`, `respectaso.com`, `appbrain.com`, `support.google.com` ve benzeri ASO sitelerine doğrudan erişimi engelledi. Yalnız `developer.apple.com` doğrudan okunabildi. Diğer bütün bulgular arama motoru sonuç özetlerinden alındı. Rakip puan ve indirme sayıları bu yüzden **"arama özetinden, mağazada doğrulanmadı"** diye işaretlendi. Sensor Tower ve AppMagic gibi araçların hacim verisine erişilemedi. Hacim tahminleri dolaylı göstergelere dayanıyor: sınava giren aday sayısı, terimi adına yazan rakip uygulama sayısı ve web'deki hesaplayıcı sitelerin yoğunluğu.

---

## 1. Bulgular

### 1.1 Apple App Store: 2025-2026'da ne sıralamayı belirliyor?

1. **Dizine giren alanlar:** ad (30 karakter), alt başlık (30 karakter) ve anahtar kelime alanı. Apple'ın kendi sayfasına göre anahtar kelimeler virgülle ayrılır, boşluk bırakılmaz. Şunlar yazılmaz: tekil hali zaten olan kelimenin çoğulu, kategori adı, "app" sözcüğü, tekrar eden kelime, rakip ya da marka adı [1].
2. **Anahtar kelime alanında sınır karakter değil, 100 BAYT.** App Store Connect başvuru sayfası "Keywords: 100 bytes" diyor. Her anahtar kelime 2 karakterden uzun olmalı [2]. Ürün sayfası rehberi aynı alan için "100 characters" diyor [1]. Uygulamada sınır UTF-8 bayt olarak işletiliyor. Lehçe örneğinde 83 karakterlik bir alan 111 bayt tuttuğu için reddedilmiş [10].
   - **Türkçe için anlamı:** ç, ğ, ı, ö, ş, ü harflerinin her biri 2 bayt yer tutar. Önceki rapordaki 91 karakterlik liste 99 bayt ediyordu ve sınıra dayanmıştı. Bu belgedeki son liste **96 bayt**.
3. **Promosyon metni dizine girmez** [1]. İncelemeye girmeden değiştirilebilir, bu yüzden fiyat ve lansman mesajları için doğru yer burası.
4. **Kelimeler alanlar arasında birleşir.** Apple ad, alt başlık ve anahtar kelime alanındaki kelimeleri birbiriyle birleştirerek öbek arar. Bu yüzden öbek değil, tek tek kelime yazılır. İngilizce için tekil/çoğul eşlemesi yapılıyor [11].
   - **Türkçe çekim eklerinde böyle bir eşleme olduğuna dair kanıt bulunamadı.** "takip" ile "takibi" arasında ünsüz yumuşaması da var. Bu yüzden iki biçim farklı alanlara konuldu: adda "Takibi", anahtar kelimede "takip". Böylece hem "deneme takip" hem "deneme takibi" araması karşılanır.
5. **Ekran görüntüsü başlıklarının dizine girip girmediği tartışmalı.**
   - Destekleyen görüş: Appfigures, 6 Haziran 2025 algoritma güncellemesinden sonra Apple'ın ekran görüntüsü başlık metnini çıkarıp anahtar kelime gibi kullandığını yazdı [3]. Phiture'ın 2026 trend yazısı da bunu kayda geçiyor [5].
   - Karşı görüş: ConsultMyApp 8 uygulamada ekran görüntülerinden alınmış 64 ifadeyi test etti. 36'sı hiç sıralanmadı. 27'si zaten ad, alt başlık ya da anahtar kelime alanıyla açıklanıyordu. Yalnız 1'i açıklanamadı. Sonuç: "Apple'ın ekran görüntüsü başlıklarını geniş çapta dizine aldığına dair güçlü kanıt yok" [4]. Apple'ın bunu yalanladığı ve AppTweak'in de aynı görüşte olduğu aktarılıyor [4].
   - **Uygulanan karar:** başlıklar öncelikle dönüşüm için yazıldı. Ama hiçbir maliyeti olmadığı için her başlıkta bir aranan terim de var. Sıralama planı bu başlıklara dayandırılmadı.
6. **Custom Product Pages (CPP) artık organik aramada da görünüyor.**
   - WWDC25'te duyuruldu. 30 Temmuz 2025'ten beri CPP'lere anahtar kelime atanabiliyor ve sayfa organik arama sonuçlarında çıkabiliyor.
   - 29 Ekim 2025'te CPP sınırı 35'ten 70'e çıktı [6].
   - Atanacak kelimeler en son onaylı sürümün anahtar kelime alanından seçilir [31].
   - Yeni bir uygulama için bu güçlü bir araç: LGS arayan 8. sınıf öğrencisine LGS ekranlarıyla açılan bir sayfa gösterilebilir (§5.3).
7. **In-app event'ler dizine giriyor.** Etkinlik adı (30 karakter) ve kısa açıklaması (50 karakter) aranabiliyor. Uzun açıklama dizine girmiyor. Aynı anda en çok 10 etkinlik canlı olabiliyor [12].
   - Fırsat: "LGS'ye 250 gün" ya da "TYT deneme haftası" gibi takvim anlarına bağlı etkinlikler, ek dizin metni ve Today sekmesinde görünürlük sağlar.
   - Uyarı: etkinlik uygulama içinde gerçekten yaşanan bir şey olmalı.
8. **Sıralamayı metadata dışında da etkileyen sinyaller:**
   - Son günlerdeki indirme hızı, toplam indirmeden daha belirleyici.
   - Gösterimden indirmeye dönüşüm oranı.
   - Puan (4,5 üstü belirgin avantaj sağlıyor) ve elde tutma [13].
   - Bu sinyallerin ağırlıkları üçüncü taraf tahminidir; Apple yayımlamaz. Pratik sonuç: lansman haftasında indirmeleri tek bir pencerede toplamak (okul grupları, Instagram) ve ilk olumlu deneyimden sonra `SKStoreReviewController` ile puan istemek.

### 1.2 Türkiye vitrini ve Türkçe kelime davranışı

1. **Çapraz yerelleştirme:** Birden çok ASO kaynağı Türkiye vitrininde birincil yerel ayarın Türkçe, dizine giren ikincil yerel ayarın **İngilizce (BK)** olduğunu yazıyor [7]. Bir kaynak buna Fransızcayı da ekliyor [7]. **İngilizce (BK) konusunda kaynaklar tutarlı, Fransızca tartışmalı.**
   - Apple kelimeleri yerel ayarlar arasında birleştirmez. Her öbek tek bir yerelleştirme içinde kurulur. Aynı kelimeyi iki yerelleştirmeye yazmak ek ağırlık getirmez [7].
   - Apple bu tabloyu resmî olarak yayımlamıyor. **Lansmandan 2-3 hafta sonra İngilizce (BK) kelimelerinden 3-4'ünün sıralamasına bakarak doğrula** (§5.4).
2. **Aksan ve Türkçe harfler:** Apple'ın aksanları ve çoğu özel karakteri normalleştirdiği yaygın kabul görüyor. Ancak tek kaynak bir Apple geliştirici forumunda topluluk yanıtı, Apple personeli değil [8].
   - AppTweak'in verisine göre mobilde aksanlı kelimeler çoğu zaman aksansız aranıyor. İstisna İspanyolcadaki ñ: ayrı bir harf sayıldığı için aksanlı hali daha çok aranıyor [9].
   - Türkçedeki ı, ş, ğ, ç, ö, ü de ayrı harflerdir ve Türkçe iPhone klavyesinde kendi tuşları vardır. **Apple'ın "calisma" ile "çalışma"yı, özellikle ı ile i'yi eşleştirip eşleştirmediğini gösteren bir test bulunamadı.**
   - Karar: Türkçe alana doğru Türkçe yazım konur. İngilizce klavye ya da aksansız yazan kullanıcı için İngilizce (BK) alanına bazı ASCII biçimler konur (`calisma`, `yanlis`). Normalleştirme varsa bu biçimler boşa gider ama zararı olmaz. Yoksa ek kapsama sağlar.
3. **Büyük/küçük harf:** Apple aramada harf büyüklüğüne bakmaz. "YKS" ve "yks" ayrı ayrı yazılmaz. Anahtar kelime alanı küçük harfle yazılır.
4. **Ad ya da alt başlıktaki kelime anahtar kelimede tekrar edilmez** [1][11]. Kontrol script ile yapıldı (§6).

### 1.3 Google Play

1. **Dizine giren alanlar:** başlık (30), kısa açıklama (80), tam açıklama (4000) [15]. Ayrı bir anahtar kelime alanı yoktur.
   - Tam açıklamanın ilk 160-250 karakteri daha ağır sayılır. Ana terim ilk cümlede geçmeli [15].
   - Ana terim için yaklaşık %2-3 yoğunluk öneriliyor (her 250-300 karakterde bir tam eşleşme). Bütün hedef terimlerin toplamı %4-5'i aşmamalı. 4000 karakterde 15-20 tekrar manipülasyon gibi okunur [15].
   - Google anlamsal eşleşme yapar. Aynı ifadeyi tekrarlamak, ilgili ifadeleri doğal biçimde kullanmaktan daha az işe yarar [15].
2. **Metadata politikası:**
   - Başlıkta, ikonda ve geliştirici adında emoji, ifade ve tekrarlı özel karakter olmaz.
   - "top", "#1", "best", "free", "no ads" gibi ifadeler olmaz [14].
   - Türkçe yardım sayfası açıkça şunları sayıyor: **"En iyi", "1 numara", "Birinci", "Yeni", "Ücretsiz", "İndirim", "Kampanya", "Bir Milyon İndirme"**. Önizleme öğelerinde özel karakter, emoji ve tekrarlı noktalama da kullanılmaz [14].
   - Büyük harfle bağırmak ve anahtar kelime yığmak yasak.
   - **Sonuç:** Play açıklamasında da "ücretsiz" ve "yeni" geçmiyor. Bölüm başlıkları büyük harf değil, cümle düzeninde.
3. **Görseller** [16]:
   - Ekran görüntüleri JPEG ya da 24-bit PNG, her kenar 320-3840 px, uzun kenar kısa kenarın en çok 2 katı. Önerilen boyut 1080×1920 (9:16).
   - Öne çıkarılmaya aday olmak için en az 4 ekran görüntüsü, kenarı 1080 px ya da üstü.
   - Feature graphic tam 1024×500. Tanıtım videosu eklemek için zorunlu; önemli içerik ortadaki yaklaşık %80 alanda kalmalı.
   - Tanıtım videosu: YouTube bağlantısı, herkese açık ya da liste dışı, reklamsız, yaş kısıtlamasız.
   - iPhone 6.9" görselleri (1320×2868, oran 2,17) **Play'in 2:1 sınırını aşar.** Play için ayrı dışa aktarılmalı.

### 1.4 Ekran görüntüleri (2025-2026 uygulamaları)

- **İlk üç kare belirleyici.** Apple, App Preview yoksa arama sonucunda ilk 1-3 dikey kareyi gösterir. İlk karede uygulamanın özünü göstermeyi önerir [1]. Kullanıcıların çoğu karar verirken ilk karelerin ötesine kaydırmaz [17].
- **Başlık:** kare başına 3-5 kelime, kalın yazı, küçük önizleme boyutunda da okunur olmalı. 1290×2796 kanvasta en az yaklaşık 80 pt. Özellik adı yerine fayda anlatan başlık [17].
- **Koyu tema:** Mağazanın açık zemininde koyu kareler göze çarpar. Ama koyu zemin üstünde orta gri metin küçük boyutta kaybolur; başlıklar beyaza yakın ya da doygun vurgu renginde olmalı [17].
  - App Store Connect'te ayrı bir koyu tema yükleme alanı yok [17].
  - Maraton'un tek teması koyu (`userInterfaceStyle: dark`), bu yüzden set koyu.
- **Panorama:** Birden çok kareye yayılan tek kompozisyon kaydırmayı teşvik eder [17]. Maraton'un rota hattı bunun için doğal bir araç.
- **Türkiye'deki rakipler:** arama özetlerine göre YKS sayaç ve deneme takip uygulamaları başlıkta ürün adı yerine doğrudan arama terimini kullanıyor: "YKS Sayaç ve Widget", "YKS Deneme Takip - Analiz", "LGS Net Takip - LGS Sayaç 2026". Ekran görüntüsü stilleri doğrulanamadı (mağaza sayfalarına erişim engelli).

### 1.5 Pazar ve rakipler

**Kitle büyüklüğü:**
- 2026 YKS: 2.425.560 başvuru. TYT'ye 2.255.076 aday girdi, AYT'ye 1.473.113. En büyük yaş grubu 18 (696.766) [18].
- 2026 LGS: 1.022.658 başvuru, 994.358 katılım [18].
- 2027 YKS için tahmini tarihler 19-20 Haziran 2027, LGS için 12 Haziran 2027. Resmî takvim henüz yok [19].
- Ekim, yeni hazırlık döneminin başı; deneme sezonu da başlıyor. Lansman zamanlaması iyi.

**Rakipler.** Puan ve indirme sayıları arama özetinden alındı, mağazada doğrulanmadı.

| Uygulama | Mağaza | Görünen konumlanma ve hedef terimler | Sinyal |
|---|---|---|---|
| Kunduz - YKS LGS Soru Çözümü | iOS/Play | soru çözümü, YKS, LGS, TYT AYT | iOS TR ~19,5 bin puan, 4,7 [20] |
| YKS Sayaç ve Widget | iOS/Play | sayaç, widget, geri sayım | Play 100 bin+ indirme [21] |
| YKS Deneme Takip - Analiz (Pandorina) | Play | deneme takip, analiz, grafik, geri sayım | 50 bin+ indirme [22] |
| Deneme Sınavı Takip (Mzt Apps) | Play | deneme, net hesaplama, grafik, tahmin | 10 bin+ indirme [22] |
| Konu Takip - YKS, TYT | iOS | konu takip | 597 puan, 4,2 [23] |
| Kant Akademi: YKS, AYT & TYT | iOS | YKS AYT TYT, içerik | 207 puan, 4,6 [23] |
| NetKoç: YKS Net Takibi | iOS | net takibi, yapay zekâ analizi, veli raporu | yeni [24] |
| YKS Net Hesaplama / Net Hesapla / Limon (TYT ve YKS Puan Hesabı) | iOS | net hesaplama, puan, sıralama | — [24][25] |
| YKS Sayacı - Pomodoro / YKS 2026 Sayaç ve Forum / YKS Sayaç | iOS | sayaç, pomodoro, forum, motivasyon | — [25] |
| LGS Net Takip - LGS Sayaç 2026 / LGS NetMatik / LGS Konu Takibi ve Sayaç | Play | LGS net takip, puan hesaplama, sayaç | — [26] |
| Yanlış Defteri (M. A. Kara) / Soru Hafızam / Sorio | iOS | yanlış defteri, soru fotoğrafı, tekrar | — [27] |
| Ders Takip: AI Plan Odak Koçu / FLIP - Odak Zamanlayıcısı / DersTakip | iOS | ders takip, odak, pomodoro, plan | DersTakip sitesi "100 bin+ öğrenci, 4,6" diyor [28] |
| Forest, Study Bunny, Focus Plant | iOS/Play | odaklanma, pomodoro | Türk öğrenci listelerinde sürekli geçiyor [29] |
| YKS Asistan / Hedefine / SoruGO | iOS | yapay zekâ asistan, soru bankası, "tamamen ücretsiz" | yeni [30] |

**Tablodan çıkanlar:**
1. Niş alanda (sayaç, deneme takibi, net hesaplama) rakiplerin çoğu tek geliştiricili, az puanlı ve başlığa dayanan uygulamalar. Yeni bir uygulamanın bu terimlerde ilk 10'a girmesi gerçekçi.
2. "YKS + LGS + yanlış defteri + rota" birleşimini aynı anda sunan güçlü bir rakip görülmedi.
3. Pek çok yeni rakip "yapay zekâ" ve "tamamen ücretsiz" vaadiyle çıkıyor. Maraton'un farkı somut ve dürüst konumlanma: "her sabah hazır rota" ve "netinin nereye gittiği".
4. **Marka riski (önceki rapordan, hâlâ geçerli):** *Maraton Yayıncılık* LGS'ye yönelik yayın yapıyor. Ad hiçbir zaman tek başına "Maraton" bırakılmamalı. Anahtar kelimelere "yayın" ya da "yayınları" yazılmamalı.

---

## 2. Anahtar kelime haritası

Hacim kademesi bir tahmindir. Gerekçe her satırda yazılı.
- Hacim: **Y** yüksek, **O** orta, **D** düşük.
- Rekabet: kaç uygulamanın terimi adında taşıdığı ve büyük oyuncuların varlığı.
- Alan kısaltmaları: **Ad** · **Alt** (alt başlık) · **KW-TR** (Türkçe anahtar kelime alanı) · **KW-GB** (İngilizce (BK) anahtar kelime alanı) · **KA** (Play kısa açıklama) · **UA** (uzun açıklama) · **GB** (görsel başlığı).

| # | Kelime / öbek | Hacim | Gerekçe | Rekabet | Alan |
|---|---|---|---|---|---|
| 1 | yks | Y | 2,4 milyon aday. Neredeyse bütün rakipler adında taşıyor | Yüksek | Ad, KW-GB, UA, GB7 |
| 2 | tyt | Y | Bütün YKS adayları giriyor. Sık aranan kısaltma | Yüksek | KW-TR, KA, UA, GB8 |
| 3 | ayt | Y | 1,47 milyon aday | Yüksek | KW-TR, KA, UA, GB8 |
| 4 | lgs | Y | 1 milyon aday, ayrı ve büyük bir dikey | Orta | KW-TR, KW-GB, KA, UA, GB8, CPP |
| 5 | ydt | D | Dil adayı küçük bir kitle | Düşük | KW-TR, UA, GB8 |
| 6 | deneme | Y | Deneme kültürü çok yaygın; "deneme takip", "deneme analizi" | Orta | Ad, KA, UA |
| 7 | deneme takip / takibi | O | Play'de 3+ uygulama adında taşıyor | Orta | Ad (takibi) + KW-TR (takip), KA, UA |
| 8 | net hesaplama | Y | Web'de onlarca hesaplayıcı sitesi var, güçlü niyet | Orta-Yüksek (web) / Orta (mağaza) | Alt, UA, GB3 |
| 9 | net takip / net takibi | O | NetKoç, "LGS Net Takip" | Orta | Alt (net) + KW-TR (takip), KA, UA, GB2 |
| 10 | net tahmini | D | Az uygulamada var, ayırt edici | Düşük | UA, GB2 |
| 11 | deneme analizi | O | Pandorina "Analiz" | Orta | UA (iOS alternatif alt başlık) |
| 12 | çalışma planı | O | Genel planlayıcı niyeti | Orta | Alt, UA |
| 13 | ders çalışma programı | Y | Klasik öğrenci araması, web'de de çok güçlü | Yüksek (genel planlayıcılar) | Alt (çalışma) + KW-TR (ders, programı), KA, UA |
| 14 | ders planı | O | | Orta | Alt (planı) + KW-TR (ders) |
| 15 | çalışma takip / ders takip | O | "Ders Takip", "DersTakip" | Orta | KW-GB ad "Ders Çalışma Takibi" + KW-TR (takip), UA |
| 16 | haftalık program | O | | Orta | UA, GB6 |
| 17 | yks sayaç / sayacı | Y | En çok indirilen niş tür (100 bin+) | Yüksek | KW-TR (sayaç), KW-GB alt "Sınav sayacı", GB7 |
| 18 | geri sayım | O | Genel geri sayım widget'ları rakip | Yüksek (genel) | UA (dolaylı). Bilinçli olarak dışarıda bırakıldı: Maraton'un ana işi değil |
| 19 | pomodoro | O | Forest ve FLIP gibi büyük rakipler var | Yüksek | KW-TR, UA, GB5 |
| 20 | kronometre | D | | Orta | KW-GB, UA |
| 21 | odaklanma / odak | O | Forest ve Focus Plant alanı | Yüksek | KW-GB, UA |
| 22 | çalışma sayacı | D | | Düşük | UA, GB5 |
| 23 | yanlış defteri | O | Kendi adıyla bir uygulama var; net bir niyet | Düşük-Orta | KW-TR (yanlış, defteri), KA, UA, GB4 |
| 24 | soru takip / soru takibi | O | "YKS Konu, Deneme, Soru Takibi" | Orta | KW-TR (soru, takip), UA |
| 25 | soru defteri | D | Sorio | Düşük | KW-TR birleşimi (soru + defteri) |
| 26 | tekrar / aralıklı tekrar | D | | Düşük | KW-TR, UA |
| 27 | konu takip | O | "Konu Takip - YKS, TYT" 597 puan | Orta | KW-TR (konu, takip) |
| 28 | sıralama / sıralama hesaplama | Y | Web'de çok güçlü. Mağazada tercih robotlarıyla çakışıyor | Yüksek | KW-TR. **Not:** Maraton'da bölüm eşleşmesi (taban sıralamasına yakınlık) var, puan hesaplayıcı değil. Açıklamada abartılmadı |
| 29 | puan hesaplama | Y | Web baskın | Yüksek | **Konmadı:** Maraton puan hesaplamıyor, alakasız trafik dönüşüm oranını düşürür |
| 30 | tercih robotu | Y (dönemsel, Temmuz) | | Yüksek | **Konmadı:** özellik yok (Guideline 2.3.7 riski) |
| 31 | taban / bölüm | O (dönemsel) | | Yüksek | KW-GB (taban, bolum), UA ("hedef bölüm") |
| 32 | hedef | D | Tek başına zayıf | — | UA ("hedef net"). KW-TR'den bayt kazanmak için çıkarıldı |
| 33 | sınav | Y (genel) | KPSS ve ehliyet de dahil gürültülü bir terim | Çok yüksek | KW-GB alt ("Sınav sayacı"), UA |
| 34 | öğrenci / lise / mezun / üniversite | O | Kitle sözcükleri, "lise öğrenci ajandası" gibi aramalar | Orta | KW-GB |
| 35 | hazırlık / üniversite hazırlık | O | | Orta | KW-GB (hazirlik), UA |
| 36 | ajanda / planlayıcı | O | Genel planlayıcılar | Yüksek | KW-GB alt (ajandası) |
| 37 | seri / streak | D | | Düşük | UA, GB6 |
| 38 | motivasyon | O | Sayaç uygulamalarının ana vaadi | Orta | **Konmadı:** v1 zayıf bir eşleşme, bayt yetmiyor. CPP'de denenebilir |
| 39 | çalışma grubu / arkadaşlarla ders | D | | Düşük | UA, Play GB7 |
| 40 | widget | O | "YKS Sayaç ve Widget" | Orta | UA (iOS). App Store'da kategori benzeri genel bir kelime olduğundan KW'ye konmadı |
| 41 | yapay zekâ / ai | Y (moda) | | Yüksek | **Asla:** özellik yok |
| 42 | ücretsiz | Y | | — | **Asla:** Play politikası yasaklıyor; bir ay sonra premium geliyor |

---

## 3. Strateji özeti

- **Ad:** marka + en güçlü iki niyet (`YKS`, `Deneme Takibi`). Adın en ağır alan olduğu konusunda kaynaklar hemfikir [13].
- **Alt başlık:** ikinci en güçlü iki niyet: `Net hesaplama` ve `çalışma planı`. Anahtar kelimedeki `ders` ve `programı` ile birleşince "ders çalışma programı" araması da karşılanır.
- **KW-TR:** ad ve alt başlıkta olmayan, ilgili, tek kelimelik terimler. Hepsi Türkçe doğru yazımla. 96 bayt.
- **KW-GB (İngilizce (BK) yerelleştirmesi):** ikinci bir ad, alt başlık ve 100 bayt alan. Türkiye'de dizine girdiği varsayılıyor; doğrulanmalı. Tamamen yeni kelimeler ve ASCII yedekleri içerir.
  - Bu sayfayı yalnız cihaz dili İngilizce olan Türk kullanıcılar görür; çoğunluk Türkçe sayfayı görür.
- **Bilinçli dışarıda bırakılanlar:** puan hesaplama, tercih robotu, yapay zekâ, ücretsiz, motivasyon. Gerekçeler tabloda.

---

## 4. Son metinler (kopyala-yapıştır)

### 4.1 App Store (Türkçe, birincil)

| Alan | Metin | Ölçü |
|---|---|---|
| **Ad** | `Maraton: YKS Deneme Takibi` | 26 kr |
| **Alt başlık** | `Net hesaplama, çalışma planı` | 28 kr |
| **Anahtar kelimeler** | `tyt,ayt,lgs,ydt,takip,sayaç,pomodoro,yanlış,defteri,soru,ders,programı,sıralama,konu,tekrar` | 91 kr / 96 bayt |

Ad ve alt başlıkta zaten bulunan kelimeler (`maraton, yks, deneme, takibi, net, hesaplama, çalışma, planı`) anahtar kelimede yok. Alanda boşluk ve tekrar da yok.

**Kelime birleşimleriyle karşılanan başlıca aramalar:**
- yks deneme takip / takibi
- tyt / ayt / lgs deneme takibi
- net hesaplama
- tyt net hesaplama
- lgs net takip
- ders çalışma programı
- çalışma planı
- ders planı
- yks sayaç
- lgs sayaç
- pomodoro
- yanlış defteri
- soru defteri
- soru takip
- konu takip
- deneme sıralama
- yks konu tekrar
- tyt deneme

**Promosyon metni** (153 kr; dizine girmez, incelemesiz değişir):
```
Sınava giden yol bir rotaya dönüşsün: her sabah günün durakları hazır, denemeni gir, netinin nereye gittiğini gör. Lansman döneminde tüm özellikler açık.
```
Premium açılınca son cümle değiştirilir (ör. "Temel rota herkese açık, gelişmiş analizler Premium'da."). Fiyat metadata'ya yazılmaz; "tamamen ücretsiz" hiçbir alanda kullanılmaz.

**Açıklama** (2344 kr):
```
Sınava giden yol bir rotaya dönüşür.

Maraton, YKS'ye (TYT, AYT, YDT) ve LGS'ye hazırlanan öğrenciler için kişisel çalışma planı ve deneme takibi uygulaması. Sınav gününe kadar kalan konuları gün gün duraklara böler; sabah açtığında hangi dersten, hangi konudan, kaç soru çözeceğini bilirsin. Ders anlatmaz, içerik satmaz: kendi ilerlemeni net görmeni sağlar.

BUGÜNÜN DURAKLARI
- Rotan sınav tarihine, hedef netine ve bitirdiğin konulara göre çizilir.
- Her gün birkaç durak: ders, konu, soru sayısı.
- Durağı bitirince işaretle, hat ilerlesin.
- Gün aksarsa durağı ertele ya da haftayı yeniden düzenle. Rota seni cezalandırmaz, yeniden hesaplar.

DENEME TAKİBİ VE NET HESAPLAMA
- TYT, AYT, YDT ve LGS denemelerini ders ders gir: doğru, yanlış, boş.
- Net kendiliğinden hesaplanır.
- Net grafiğin ve net tahminin her yeni denemeyle güncellenir.
- Hangi derste yükseldiğini, hangisinde durduğunu görürsün.
- Hedef netinle aranda kaç net kaldığını ve son netine yakın bölümleri gör.

YANLIŞ DEFTERİ
- Yanlış yaptığın soruyu fotoğrafla ya da not al.
- Tekrar günü gelince önüne gelir.
- Çözdüğünü kapatırsın, çözemediğin yeniden sıraya girer.

ÇALIŞMA SAYACI VE POMODORO
- Kronometre ya da pomodoro ile odaklan.
- Bitince ders, konu, süre ve soru sayısını tek ekranda kaydet.
- Çalışma geçmişin takvimde ve haftalık programında birikir.

SERİ VE HAFTALIK ÖZET
- Her gün kayıt girdikçe serin uzar.
- Haftanın sonunda ne kadar çalıştığını, kaç soru çözdüğünü ve rotada nerede olduğunu tek sayfada gör.

ÇALIŞMA GRUBU
- Arkadaşlarınla davet koduyla grup kur.
- Haftalık soru hedefinizi ve grup içi soru sıralamasını birlikte takip edin.

ANA EKRAN VE KİLİT EKRANI WIDGET'LARI
- Sınava kalan gün, sıradaki durak, serin, net çizgin ve tekrarı gelen yanlışların bir bakışta.

İNTERNETSİZ DE ÇALIŞIR
- Bağlantın yokken girdiğin kayıtlar cihazda bekler, bağlantı gelince eşitlenir.

VERİN SENİN
- Reklam yok, verin reklam için kullanılmaz.
- Verilerini istediğin an indirebilir, hesabını uygulama içinden silebilirsin.

Not: Net tahmini ve bölüm eşleşmeleri, girdiğin deneme sonuçlarına ve geçmiş yılların açık taban verilerine dayanan yaklaşık hesaplardır; resmî sonuç yerine geçmez. Maraton, ÖSYM ya da MEB ile bağlantılı değildir.

Gizlilik: https://maratonapp.com/privacy
Kullanım koşulları: https://maratonapp.com/terms
Destek: destek@maratonapp.com
```

**Yenilikler (1.0)** (210 kr). Apple ilk sürümde bu alanı zorunlu tutmaz [2]; istenirse:
```
Maraton'un ilk sürümü. Kişisel çalışma rotası, deneme net takibi ve net tahmini, yanlış defteri, pomodoro sayacı, seri, çalışma grupları ve ana ekran widget'ları. Görüşlerini destek@maratonapp.com adresine yaz.
```

#### 4.1.1 İngilizce (BK) yerelleştirmesi: ek dizin alanı (deney)

| Alan | Metin | Ölçü |
|---|---|---|
| Ad | `Maraton: Ders Çalışma Takibi` | 28 kr |
| Alt başlık | `Sınav sayacı, öğrenci ajandası` | 30 kr |
| Anahtar kelimeler | `yks,lgs,calisma,kronometre,odaklanma,lise,mezun,universite,hazirlik,haftalik,taban,bolum,yanlis` | 95 kr / 95 bayt |
| Açıklama | Türkçe açıklamanın aynısı | — |

- Ad ve alt başlık Türkçe ve doğru yazımlı. Bu sayfayı görecek az sayıda kullanıcı da Türk.
- Anahtar kelimede ASCII yedekleri var: `calisma` ("çalışma"), `yanlis` ("yanlış"). Ayrıca Türkçe alanda olmayan yeni terimler var: kronometre, odaklanma, lise, mezun, üniversite, hazırlık, haftalık, taban, bölüm.
- `yks` ve `lgs` burada tekrar ediliyor. Gerekçe: Apple yerel ayarlar arasında öbek kurmaz [7]; "yks ders çalışma" öbeğinin bu yerelleştirmenin içinde kurulabilmesi gerekiyor.

#### 4.1.2 Alternatif ad ve alt başlık birleşimleri

| | Ad | Alt başlık | Anahtar kelimeler | Ne zaman |
|---|---|---|---|---|
| **A (önerilen)** | `Maraton: YKS Deneme Takibi` | `Net hesaplama, çalışma planı` | yukarıda | Varsayılan. En geniş YKS niyeti: deneme, net, plan |
| B | `Maraton: TYT AYT LGS Net Takip` (30 kr) | `Deneme analizi, çalışma planı` (29 kr) | `yks,ydt,tekrar,takibi,sayaç,pomodoro,yanlış,defteri,soru,ders,programı,hesaplama,sıralama,konu` (94 kr / 99 bayt) | Sınav kısaltmaları adda en ağır alanda. LGS kitlesi adda görünür. "yks" ise anahtar kelime alanına düşer. Önerilen yol: lansmandan 4-6 hafta sonra sıralama verisiyle karşılaştır, gerekirse yeni sürümde geç |
| C | `Maraton: Ders Çalışma Planı` (27 kr) | `YKS ve LGS deneme, net, sayaç` (29 kr) | `tyt,ayt,ydt,takip,pomodoro,yanlış,defteri,soru,programı,hesaplama,sıralama,konu,tekrar,odak` (91 kr / 95 bayt) | En büyük genel niyeti ("ders çalışma") adda hedefler. Rekabet daha sert (Forest, FLIP, genel planlayıcılar). Maraton'un rota ve plan vaadine en yakın seçenek. A, YKS niş terimlerinde ilk 10'a yerleşince denenebilir |

### 4.2 Google Play

| Alan | Metin | Ölçü |
|---|---|---|
| **Başlık** | `Maraton: YKS Deneme Takibi` | 26 kr |
| **Kısa açıklama** | `TYT, AYT ve LGS deneme net takibi, ders çalışma programı, sayaç, yanlış defteri` | 79 kr |

**Tam açıklama** (2411 kr):
```
Maraton, YKS (TYT, AYT, YDT) ve LGS'ye hazırlanan öğrenciler için ders çalışma programı ve deneme takibi uygulaması. Sınav gününe kadar kalan konuları gün gün duraklara böler; sabah açtığında hangi dersten, hangi konudan kaç soru çözeceğini bilirsin.

Sınava giden yol bir rotaya dönüşür. Maraton ders anlatmaz, içerik satmaz; kendi ilerlemeni net görmeni sağlar.

Her sabah hazır çalışma programı
Çalışma programın sınav tarihine, hedef netine ve okulda bitirdiğin konulara göre çizilir. Her gün birkaç durak: ders, konu, soru sayısı. Durağı bitirince işaretle, hat ilerlesin. Gün aksarsa durağı ertele ya da haftalık programı yeniden düzenle; rota seni cezalandırmaz, yeniden hesaplar.

Deneme takibi ve net hesaplama
TYT, AYT ve LGS denemelerini ders ders gir: doğru, yanlış, boş. Net hesaplama kendiliğinden yapılır. Net grafiğin ve net tahminin her yeni denemeyle güncellenir; hangi derste yükseldiğini, hangisinde durduğunu görürsün. Hedef netinle aranda kaç net kaldığını ve son netine yakın bölümleri takip et.

Yanlış defteri ve soru takibi
Yanlış yaptığın soruyu fotoğrafla ya da not al; yanlış defteri her soruyu ders ve konusuyla saklar. Tekrar günü gelince önüne gelir; çözdüğünü kapat, çözemediğin yeniden sıraya girsin. Günlük çözdüğün soru sayısı hedefinle birlikte görünür, böylece soru takibi tek yerde kalır.

Çalışma sayacı ve pomodoro
Kronometre ya da pomodoro sayacı ile odaklan. Bitince ders, konu, süre ve soru sayısını tek ekranda kaydet. Ders çalışma geçmişin takvimde birikir; haftanın hangi günü ne kadar çalıştığını görürsün.

Seri ve haftalık özet
Her gün kayıt girdikçe serin uzar; YKS ya da LGS gününe kaç gün kaldığını her an görürsün. Hafta sonunda ne kadar çalıştığını, kaç soru çözdüğünü ve rotada nerede olduğunu tek sayfada gör.

Arkadaşlarınla çalışma grubu
Davet koduyla YKS ya da LGS çalışma grubu kur. Haftalık soru hedefinizi ve grup içindeki soru sıralamasını birlikte takip edin.

İnternetsiz de çalışır
Bağlantın yokken girdiğin kayıtlar cihazda bekler, bağlantı gelince eşitlenir.

Verin senin
Reklam yok. Verilerini istediğin an indirebilir, hesabını uygulama içinden silebilirsin.

Net tahmini ve bölüm eşleşmeleri, girdiğin deneme sonuçlarına ve geçmiş yılların açık taban verilerine dayanan yaklaşık hesaplardır; resmî sonuç yerine geçmez. Maraton, ÖSYM ya da MEB ile bağlantılı değildir.

Gizlilik: https://maratonapp.com/privacy
Destek: destek@maratonapp.com
```

**Tam açıklamadaki terim yoğunluğu** (script ile ölçüldü; toplam 346 kelime):

- 'yks': 3 kez tam açıklamada (~0.9% kelime)
- 'tyt': 2 kez tam açıklamada (~0.6% kelime)
- 'ayt': 2 kez tam açıklamada (~0.6% kelime)
- 'lgs': 4 kez tam açıklamada (~1.2% kelime)
- 'deneme': 5 kez tam açıklamada (~1.4% kelime)
- 'deneme takibi': 2 kez tam açıklamada (~1.2% kelime)
- 'net hesaplama': 2 kez tam açıklamada (~1.2% kelime)
- 'net': 10 kez tam açıklamada (~2.9% kelime)
- 'çalışma programı': 3 kez tam açıklamada (~1.7% kelime)
- 'ders çalışma': 2 kez tam açıklamada (~1.2% kelime)
- 'pomodoro': 2 kez tam açıklamada (~0.6% kelime)
- 'yanlış defteri': 2 kez tam açıklamada (~1.2% kelime)
- 'soru takibi': 2 kez tam açıklamada (~1.2% kelime)
- 'sayaç': 0 kez tam açıklamada (~0.0% kelime)
- 'net tahmini': 2 kez tam açıklamada (~1.2% kelime)
- 'haftalık program': 1 kez tam açıklamada (~0.6% kelime)

İlk cümle "YKS, TYT, AYT, YDT, LGS, ders çalışma programı, deneme takibi" terimlerini taşıyor. Hiçbir terim 4 tekrarı geçmiyor; "net" kelimesi doğal anlatımdan geliyor. Yoğunluk yığma eşiğinin altında [15].

**Sürüm notları** (178 kr):
```
Maraton'un ilk sürümü: kişisel çalışma rotası, deneme net takibi ve net tahmini, yanlış defteri, pomodoro sayacı, seri ve çalışma grupları. Görüşlerin için: destek@maratonapp.com
```

Play'e özel ayarlar, önceki rapordaki gibi:
- Kategori: Eğitim.
- Hedef kitle: 13-15, 16-17, 18+. 13 yaş altı işaretlenmez.
- Reklam: Hayır.
- Hesap silme URL'si zorunlu.
- **Widget paragrafı Play metninde yok** (Android widget'ı yok).

### 4.3 Ekran görüntüsü başlıkları (8 kare)

Kurallar:
- Başlık en çok 26 karakter, alt satır en çok 40 karakter. Script ile doğrulandı.
- Her başlık bir arama terimi taşıyor.
- Görsel dil önceki raporun §2.2'sindeki gibi: koyu zemin, Bricolage başlık, tek kızıl vurgu kelimesi, kareler arasında akan rota hattı.

| # | Gösterilecek ekran | Başlık | Kr. | Alt satır | Kr. |
|---|---|---|---|---|---|
| 1 | Ana sayfa: kahraman sayı + rota hattı + BUGÜNÜN DURAKLARI (HomeHeroNormal, HomeTodayStops) | **Günlük ders planın hazır** | 24 | Sınav gününe kadar durak durak rota | 35 |
| 2 | Net tahmini grafiği (NetForecastScreen) | **Net takibi ve net tahmini** | 25 | Her denemeyle grafiğin güncellenir | 34 |
| 3 | Deneme detayı, ders ders net (TrialDetailScreen) | **Deneme net hesaplama** | 20 | Doğru, yanlış, boş gir; netin hazır | 35 |
| 4 | Yanlış defteri listesi + tekrar oturumu (WrongNotebookScreen, ReviewSessionScreen) | **Yanlış defteri ve tekrar** | 24 | Fotoğrafla, tekrar günü önüne gelsin | 36 |
| 5 | Çalışma sayacı, pomodoro modu (StudyTimerScreen) | **Pomodoro çalışma sayacı** | 26 | Süre, ders ve konu tek dokunuşla kayıtta | 40 |
| 6 | Program > hafta/ay takvimi + seri (Program sekmesi, SummaryScreen) | **Haftalık program ve seri** | 24 | Her günün ve serin bir bakışta | 30 |
| 7 | iOS ana ekran + kilit ekranı widget'ları (Rota, Bugün, Seri). Play setinde: çalışma grubu (GroupsTab) | **YKS sayacı kilit ekranında** | 26 | Sınava kalan gün ve sıradaki durak | 34 |
| 8 | Sınav ve hedef kurulumu (ExamSetupScreen, GoalSetupScreen) | **TYT, AYT, YDT ya da LGS** | 23 | Sınavını ve hedef netini seç | 28 |
| Play 7 | Çalışma grubu, haftalık soru sıralaması (GroupsTab / LeagueBoard grup görünümü) | Arkadaşlarınla grup kur | 23 | Davet kodu, haftalık soru sıralaması | 36 |

**Sıralama gerekçesi:**
- **1-3 (arama sonucunda görünen üçlü):** ürünün özü (her sabah hazır plan) ve en güçlü iki arama niyeti (net takibi, net hesaplama). İlk üç kare birbirine bağlı panorama olur. Rota hattı 1'den başlayıp 3'te deneme grafiğine bağlanır.
- **4-5:** ayırt edici iki özellik, yanlış defteri ve pomodoro.
- **6:** alışkanlık: haftalık program ve seri.
- **7:** iOS'ta YKS sayacı widget'ı. "Sayaç" aramasının karşılığı ve en çok indirilen niş tür. Play'de bu kare yerine çalışma grubu karesi kullanılır.
- **8:** kapsam: TYT, AYT, YDT ya da LGS. LGS arayanlara kendilerinin de hedef kitlede olduğunu gösterir.

Kurulum ve hesap ekranları sona yakın tutuldu: mağazada sonuç gösterilir, kurulum değil.

Dikkat:
- Kare 7'deki widget'ta "Sınava kalan gün" görünmeli. Bunu `MaratonRoute` widget'ı sağlıyor (app.json'daki açıklaması: "Sınava kalan gün ve net çizgin").
- Grup karesinde gerçek kişi adı ya da fotoğrafı kullanılmaz; demo hesap kullanılır. Genel lig gösterilmez.

### 4.4 Kategori ve yaş derecelendirmesi

- **App Store:** birincil Eğitim, ikincil Verimlilik.
  - Eğitim hem doğru niyet hem kategori sıralamasında görünürlük sağlar.
  - Verimlilik ikinci bir liste açar (pomodoro ve planlayıcı niyeti).
- **Google Play:** Eğitim. Etiketler: Eğitim, Sınav hazırlığı, Verimlilik.
- **Yaş derecelendirmesi:**
  - iOS anketi: kısıtlanmamış web erişimi yok, kullanıcı içeriği sınırlı (grup adı ve davet kodu). Beklenen sonuç 4+, kullanıcı etkileşimi varsa 9+. Anketi dürüst doldur. Çalışma grubu için engelleme ve raporlama mekanizması varsa belirt.
  - Play IARC: "kullanıcılar etkileşime girebilir" işaretlenir.
  - Hedef kitlede 13 yaş altı seçilmez; LGS öğrencisi 13-14 yaşındadır ve 13-15 grubuna düşer. 13 yaş altı seçilirse Families politikası devreye girer.

---

## 5. Lansman sonrası: CPP, etkinlik ve doğrulama

### 5.1 Ölçüm (ilk 30 gün)
- App Store Connect > Analytics: Gösterim → Ürün sayfası görüntüleme → İndirme oranı, arama ve göz atma kaynaklarına göre ayrı ayrı.
- Ücretsiz bir araçla (ör. Apple Search Ads arama popülerliği ya da bir ASO aracının deneme sürümü) şu terimlerin sırası haftalık izlenir: `yks deneme takibi`, `net hesaplama`, `lgs net takip`, `yanlış defteri`, `yks sayaç`, `ders çalışma programı`.

### 5.2 In-app event fikirleri (ad ≤30, kısa açıklama ≤50; ikisi de dizine girer)
- "LGS'ye 250 gün kala rota" (Ekim-Kasım)
- "TYT deneme haftası: net takibi" (deneme kampı dönemleri)
- "Yarıyıl tatili çalışma planı" (Ocak)

Her etkinlik uygulamada gerçek bir içerikle (ör. özel rota haftası) karşılanmalı.

### 5.3 Custom Product Pages (anahtar kelime atanmış)

**Kural (Apple dokümanı, doğrudan okundu [31]):**
- CPP'ye yalnız **en son onaylı sürümün anahtar kelime alanından** kelime seçilebilir. Serbest kelime girilemez.
- Her sayfa için benzersiz bir kelime kümesi seçilir.
- Atama her yerelleştirme için ayrı yapılır.
- Üçüncü taraf kaynaklara göre ad ve alt başlıktaki kelimeler atanamaz ve bir kelime aynı anda tek sayfaya bağlanır [6][32].

Bu yüzden CPP'ler §4.1'deki KW-TR listesinden beslenir. Lansman sürümü onaylandıktan sonra kurulur.

| CPP | Atanacak kelimeler (KW-TR'den) | Yakaladığı tipik aramalar (ad/alt ile birleşerek) | Kare sırası | İlk kare başlığı |
|---|---|---|---|---|
| **LGS** | `lgs` (İngilizce (BK) sayfasında da `lgs`) | lgs deneme takibi, lgs net hesaplama, lgs sayaç | 8 (LGS seçili) → 2 → 3 → 1 → 4 | "LGS net takibi, gün gün" |
| **TYT / AYT deneme** | `tyt`, `ayt`, `ydt`, `sıralama` | tyt deneme takibi, tyt net hesaplama, ayt net, deneme sıralama | 3 → 2 → 1 → 4 → 6 | "TYT netin ders ders" |
| **Çalışma programı / odak** | `ders`, `programı`, `pomodoro`, `sayaç` | ders çalışma programı, çalışma planı, pomodoro, yks sayaç | 1 → 5 → 7 → 6 → 2 | "Ders çalışma programın hazır" |

`yanlış`, `defteri`, `soru`, `konu`, `tekrar`, `takip` varsayılan sayfada kalır. Dördüncü bir "Yanlış defteri" CPP'si sonra eklenebilir.

**Dikkat:** CPP'ye atanan kelimede o aramada varsayılan sayfa yerine CPP görünür. Varsayılan sayfa bu kelimelerde daha iyi dönüştürüyorsa atamayı kaldır. Atama tek tek kapatılabilir [31].

### 5.4 Çapraz yerelleştirme doğrulaması
Lansmandan 2-3 hafta sonra Türkiye vitrininde yalnız İngilizce (BK) alanında bulunan `kronometre`, `mezun` ve `taban` terimlerinde Maraton'un sıralanıp sıralanmadığına bak.
- **Sıralanıyorsa:** İngilizce (BK) dizine giriyor, strateji geçerli.
- **Sıralanmıyorsa:** bu alan boşa çalışıyor; o terimler sırayla Türkçe alana taşınır.
- Aynı testte `calisma` gibi aksansız bir aramada Türkçe "çalışma" kelimesinin sıralanıp sıralanmadığına bak. Sonuç, Apple'ın ı, ş, ç harflerini normalleştirip normalleştirmediğini gösterir.

---

## 6. Ölçüm çıktısı (script)

```
AS name: 26 kr / 26 bayt (sınır 30 char) OK
AS subtitle: 28 kr / 32 bayt (sınır 30 char) OK
AS keywords: 91 kr / 96 bayt (sınır 100 byte) OK
AS promo: 153 kr / 169 bayt (sınır 170 char) OK
AS description: 2344 kr / 2547 bayt (sınır 4000 char) OK
AS whatsNew: 210 kr / 229 bayt (sınır 4000 char) OK
enGB name: 28 kr / 31 bayt (sınır 30 char) OK
enGB subtitle: 30 kr / 35 bayt (sınır 30 char) OK
enGB keywords: 95 kr / 95 bayt (sınır 100 byte) OK
Alt1 name: 30 kr / 30 bayt (sınır 30 char) OK
Alt1 subtitle: 29 kr / 33 bayt (sınır 30 char) OK
Alt1 keywords: 94 kr / 99 bayt (sınır 100 byte) OK
Alt2 name: 27 kr / 31 bayt (sınır 30 char) OK
Alt2 subtitle: 29 kr / 30 bayt (sınır 30 char) OK
Alt2 keywords: 91 kr / 95 bayt (sınır 100 byte) OK
GP title: 26 kr / 26 bayt (sınır 30 char) OK
GP short: 79 kr / 86 bayt (sınır 80 char) OK
GP full: 2411 kr / 2643 bayt (sınır 4000 char) OK
GP release: 178 kr / 197 bayt (sınır 500 char) OK
SS1: başlık 24 OK | alt 35 OK
SS2: başlık 25 OK | alt 34 OK
SS3: başlık 20 OK | alt 35 OK
SS4: başlık 24 OK | alt 36 OK
SS5: başlık 26 OK | alt 40 OK
SS6: başlık 24 OK | alt 30 OK
SS7: başlık 26 OK | alt 34 OK
SS8: başlık 23 OK | alt 28 OK
SSP7: başlık 23 OK | alt 36 OK
TR kw: tekrar(ad/alt): yok | iç tekrar: yok | boşluk: False | kelime sayısı 15
enGB kw: tekrar(ad/alt): yok | iç tekrar: yok | boşluk: False | kelime sayısı 13
Alt1 kw: tekrar(ad/alt): yok | iç tekrar: yok | boşluk: False | kelime sayısı 14
Alt2 kw: tekrar(ad/alt): yok | iç tekrar: yok | boşluk: False | kelime sayısı 14
density 'yks': 3 kez tam açıklamada (~0.9% kelime)
density 'tyt': 2 kez tam açıklamada (~0.6% kelime)
density 'ayt': 2 kez tam açıklamada (~0.6% kelime)
density 'lgs': 4 kez tam açıklamada (~1.2% kelime)
density 'deneme': 5 kez tam açıklamada (~1.4% kelime)
density 'deneme takibi': 2 kez tam açıklamada (~1.2% kelime)
density 'net hesaplama': 2 kez tam açıklamada (~1.2% kelime)
density 'net': 10 kez tam açıklamada (~2.9% kelime)
density 'çalışma programı': 3 kez tam açıklamada (~1.7% kelime)
density 'ders çalışma': 2 kez tam açıklamada (~1.2% kelime)
density 'pomodoro': 2 kez tam açıklamada (~0.6% kelime)
density 'yanlış defteri': 2 kez tam açıklamada (~1.2% kelime)
density 'soru takibi': 2 kez tam açıklamada (~1.2% kelime)
density 'sayaç': 0 kez tam açıklamada (~0.0% kelime)
density 'net tahmini': 2 kez tam açıklamada (~1.2% kelime)
density 'haftalık program': 1 kez tam açıklamada (~0.6% kelime)
Play full desc kelime: 346
Play ilk 250: Maraton, YKS (TYT, AYT, YDT) ve LGS'ye hazırlanan öğrenciler için ders çalışma programı ve deneme takibi uygulaması. Sınav gününe kadar kalan konuları gün gün duraklara böler; sabah açtığında hangi dersten, hangi konudan kaç soru çözeceğini bilirsin.
AS desc emoji: yok; 'ücretsiz' geçiyor mu: False; 'en iyi': False
GP full emoji: yok; 'ücretsiz' geçiyor mu: False; 'en iyi': False
```

---

## Kaynaklar

1. Apple: Creating your product page. https://developer.apple.com/app-store/product-page/ (doğrudan okundu)
2. Apple: App Store Connect, Platform version information (Keywords 100 bytes). https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information (doğrudan okundu)
3. Appfigures: The Biggest App Store Algorithm Change is Here (2025). https://appfigures.com/resources/guides/app-store-algorithm-update-2025
4. ConsultMyApp: Is Apple Now Indexing Screenshot Titles on the App Store? https://www.consultmyapp.com/blog/-is-apple-now-indexing-screenshot-titles-on-the-app-store
5. Phiture: ASO Trends in 2026. https://phiture.com/asostack/aso-trends-in-2026/
6. CPP: MobileAction, Apple doubles the CPP limit. https://www.mobileaction.co/blog/apple-doubles-the-custom-product-page-limit/ · RespectASO, Custom Product Pages in 2026. https://respectaso.com/blog/custom-product-pages-app-store-guide-2026/ · Adapty. https://adapty.io/blog/custom-product-pages-app-store/
7. Çapraz yerelleştirme: MobileAction. https://www.mobileaction.co/blog/app-store-cross-localization/ · AppTweak. https://www.apptweak.com/en/aso-blog/how-to-benefit-from-cross-localization-on-the-app-store · aso.dev. https://aso.dev/metadata/cross-localization/ · AppFollow. https://appfollow.io/app-store-keywords-localizations · HowManyWords. https://howmanywords.app/blog/app-store-cross-localization-guide · AppRadar. https://appradar.com/blog/ios-localization-list-of-primary-secondary-languages
8. Apple Developer Forums: special characters in App Store keywords (topluluk yanıtı). https://developer.apple.com/forums/thread/810030 (doğrudan okundu)
9. AppTweak: Do accents on mobile search matter for ASO? https://www.apptweak.com/en/aso-blog/do-accents-on-mobile-search-matter-for-aso
10. Bayt sınırı: AsoBeast PR #110. https://github.com/AsoBeast/asobeast/pull/110 · Itsyconnect. https://itsyconnect.com/guides/app-store-keyword-optimization
11. Kelime birleşimi ve çoğullar: AppRadar. https://appradar.com/academy/ios-app-store-optimization/ios-keyword-field · Apptamin. https://www.apptamin.com/blog/app-store-optimization-aso-app-name-and-keywords/
12. In-app events: MobileAction. https://www.mobileaction.co/guide/in-app-events-promotional-content-guide/ · AppTweak. https://www.apptweak.com/en/aso-blog/what-are-in-app-events-how-do-they-impact-aso
13. Sıralama faktörleri: ASOMobile. https://asomobile.net/en/blog/app-store-listing-2026-what-actually-affects-rankings/ · ASO World. https://asoworld.com/insight/app-store-search-algorithm-2026-what-actually-decides-your-keyword-ranking/ · SplitMetrics. https://splitmetrics.com/blog/apple-app-store-ranking-factors/
14. Google Play metadata politikası. https://support.google.com/googleplay/android-developer/answer/9898842 · Google Play'de keşfedilme (TR). https://support.google.com/googleplay/android-developer/answer/4448378?hl=tr · AppTweak politika özeti. https://www.apptweak.com/en/aso-blog/how-to-prepare-for-new-google-metadata-policy-changes
15. Play anahtar kelime ve yoğunluk: AppFollow. https://appfollow.io/blog/google-play-aso-keywords · ASOMobile. https://asomobile.net/en/blog/keyword-strategy-in-the-app-store-and-google-play/
16. Play önizleme öğeleri. https://support.google.com/googleplay/android-developer/answer/9866151 · AppRadar ekran görüntüsü boyutları. https://appradar.com/blog/android-app-screenshot-sizes-and-guidelines-for-google-play
17. Ekran görüntüsü uygulamaları: AppTweak. https://www.apptweak.com/en/aso-blog/how-to-optimize-your-app-screenshots · SplitMetrics. https://splitmetrics.com/blog/app-store-screenshots-aso-guide/ · AppScreenshotStudio. https://appscreenshotstudio.com/app-store-screenshot-best-practices · Playmockup (koyu tema). https://playmockup.com/blog/dark-mode-app-screenshots-worth-it-2026
18. YKS 2026 sayıları: Hürriyet. https://www.hurriyet.com.tr/bilgi/galeri/bu-sene-yks-sinavina-kac-kisi-girdi-tyt-ayt-ydt-oturumlarina-kac-kisi-basvurdu-43246459 · Yeni Şafak. https://www.yenisafak.com/foto-galeri/ozgun/2026-yksye-kac-kisi-girecek-osym-tyt-ayt-ve-ydt-aday-sayilari-aciklandi-4833085 · LGS 2026: MEB. https://www.meb.gov.tr/2026-lgs-kapsaminda-merkezi-sinav-raporu-yayimlandi/haber/41333/tr · AA. https://www.aa.com.tr/tr/gundem/meb-2026-lgs-kapsamindaki-merkezi-sinav-raporunu-yayimladi/3994011
19. 2027 tahmini takvim: https://hangibolum.org/takvim · https://pro-analitik.com/blog/yks-lgs-2027-sinav-tarihleri
20. Kunduz (App Store TR). https://apps.apple.com/tr/app/kunduz-yks-lgs-soru-%C3%A7%C3%B6z%C3%BCm%C3%BC/id1083827128?l=tr
21. YKS Sayaç ve Widget. https://play.google.com/store/apps/details?id=com.eminakcay.ygs2018sayacvewidget · https://apps.apple.com/us/app/yks-saya%C3%A7-ve-widget/id1536300435
22. YKS Deneme Takip - Analiz. https://play.google.com/store/apps/details?id=com.pandorina.yks_deneme_takip · Deneme Sınavı Takip. https://play.google.com/store/apps/details?id=com.sinav.takip · YKS Deneme Takip. https://play.google.com/store/apps/details?id=com.yks.tracker · Neon YKS. https://play.google.com/store/apps/details?id=com.ei.neonyks
23. Konu Takip - YKS, TYT. https://apps.apple.com/tr/app/konu-takip-yks-tyt/id1447372131 · Kant Akademi. https://apps.apple.com/tr/app/kant-akademi-yks-ayt-tyt/id6743700077
24. NetKoç. https://apps.apple.com/tr/app/netko%C3%A7-yks-net-takibi/id6759757762?l=tr · YKS Net Hesaplama. https://apps.apple.com/us/app/yks-net-hesaplama/id6760604053 · Net Hesapla. https://apps.apple.com/tr/app/net-hesapla/id6466212353?l=tr
25. YKS Sayacı - Pomodoro. https://apps.apple.com/tr/app/yks-sayac%C4%B1-pomodoro/id6472943288 · YKS 2026 Sayaç ve Forum. https://apps.apple.com/tr/app/yks-2026-saya%C3%A7-ve-forum/id6738329270 · YKS Sayaç. https://apps.apple.com/tr/app/yks-saya%C3%A7/id6456098391?l=tr · Limon. https://apps.apple.com/tr/app/limon-tyt-ve-yks-puan-hesab%C4%B1/id1207428337?l=tr · Netify. https://apps.apple.com/tr/app/yks-tyt-ayt-netify/id6761605760
26. LGS Net Takip. https://play.google.com/store/apps/details?id=com.takcilabs.nettakip · LGS NetMatik. https://play.google.com/store/apps/details?id=com.hazdevstudios.netmatik_lgs.netmatik_lgs · LGS Konu Takibi ve Sayaç. https://play.google.com/store/apps/details?id=com.eminakcay.lgskonutakibivesayac
27. Yanlış Defteri. https://apps.apple.com/tr/app/yanl%C4%B1%C5%9F-defteri/id1620702483?l=tr · Soru Hafızam. https://apps.apple.com/tr/app/soru-haf%C4%B1zam-yks-kpss-dgs/id1484330581?l=tr · Sorio. https://apps.apple.com/us/app/sorio-soru-defteri-ve-analiz/id6777352304
28. Ders Takip: AI Plan Odak Koçu. https://apps.apple.com/tr/app/ders-takip-ai-plan-odak-ko%C3%A7u/id1590300077?l=tr · FLIP. https://apps.apple.com/tr/app/flip-odak-zamanlay%C4%B1c%C4%B1s%C4%B1/id1435127190?l=tr · DersTakip. https://derstakip.app/
29. Odaklanma uygulamaları: Webtekno. https://www.webtekno.com/odaklanma-uygulamalari-android-ios-h107750.html · Focus Plant. https://apps.apple.com/tr/app/focus-plant-odaklanma-ve-ders/id1459096306?l=tr
30. YKS Asistan. https://apps.apple.com/tr/app/yks-asistan/id6751056131?l=tr · Hedefine. https://hedefine.app/ · SoruGO. https://www.sorugo.app/
31. Apple: Configure multiple product page versions (CPP anahtar kelimeleri). https://developer.apple.com/help/app-store-connect/create-custom-product-pages/configure-multiple-product-page-versions/ (doğrudan okundu)
32. MobileAction: Custom product pages meet organic search. https://www.mobileaction.co/blog/custom-product-pages-meet-organic-search/ · Phiture: Keyword-based CPPs arrive. https://phiture.com/asostack/keyword-based-custom-product-pages-cpps-arrive-in-app-store-connect/

