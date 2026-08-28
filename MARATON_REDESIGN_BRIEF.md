# Maraton — Tasarım Revizyonu (Tur 2)

## ÖNCE: GERİ BİLDİRİM

Attığın üç yönü inceledik ve **hiçbirini beğenmedik.** Sorun senin uygulamanda değil, sana verdiğim brief'te — fazla yasak, fazla "sessiz olsun" yazmışım, sen de dediğimi yapmışsın. Sonucu birlikte düzeltelim.

**Neden çalışmadı:**

1. **Ölüler.** Üçü de temiz, disiplinli ve tamamen cansız. Teknik olarak doğru ama kimse o ekrana bakmak istemiyor. "Premium" dedim, sen sessiz ve ciddi anladın — ama bu uygulamanın kullanıcısı 17 yaşında ve hayatının en stresli sınavına hazırlanıyor; ona laboratuvar aleti estetiği duygusal olarak yanlış geliyor.
2. **Üçü aslında ayrışmıyor.** A, B ve C aynı iskeleti paylaşıyor: koyu zemin + tek vurgu rengi + üstte dev sayı + altında liste + altta sekmeler. Değişen tek şey font ve vurgu rengi. Ben üç ayrı **yön** istemiştim, ortaya aynı tasarımın üç renk varyantı çıktı. Seçebileceğimiz gerçek bir alternatif yok.
3. **Renkler çekingen.** Hardal, kiremit, kemik beyazı — üçü de soluk. Ayrıca uygulamanın en ayırt edici görsel varlığı olan **ders renkleri üç yönde de hiç görünmüyor.** "Renk sadece ders bağlamında" yazmıştım, sen bunu "renk hiç yok" olarak uygulamışsın.
4. **Hareket yok.** Ekranlar durağan. Bu uygulamanın canlı hissetmesi lazım.

**Neyi doğru yaptın, korunacak:**

- **Sadelik ve az öğe hissi.** Ekranlar kalabalık değil, bu çok iyi.
- **Öğelerin büyüklüğü.** Büyük tipografi, cömert boşluk — ekranın sade durmasının sebebi bu ve aynen sürsün.
- **Tutarlılık sistemi.** Buton envanteri, yarıçap ölçeği, sistem panosu formatı — hepsi doğru, aynen devam.
- **Yön A'nın boyut/ölçek kurgusu** en yakın olanıydı (rengi olmasa da oranları iyiydi).

---

## GÖREV

Aynı üç ekranı (**Ana Sayfa**, **Profil**, **Analiz**) **yeniden** tasarla — bu sefer birbirinden **yapısal olarak** ayrışan üç yönde. Toplam 9 artboard + 3 sistem panosu.

Yeni yönler: **A — Yolculuk**, **B — Kokpit**, **C — Tek Kart** (bölüm 9'da tanımlı). Önceki A/B/C'yi unut, bunlar farklı düzen mantıkları.

**Bu sefer farklı olan bir şey daha:** Sana her ekranda hangi bilgilerin bulunduğunu söyleyeceğim, ama bunları nasıl düzenleyeceğini söylemeyeceğim. Hiyerarşi, gruplama, neyin öne çıkacağı, neyin alt ekrana taşınacağı, neyin tamamen çıkarılacağı **senin tasarım kararın**. Verilen listeyi sırayla ekrana dizme — düşün, seç, kur.

---

## 1. ÜRÜN NEDİR

Maraton, Türkiye'deki üniversite sınavına (YKS) ve lise giriş sınavına (LGS) hazırlanan öğrenciler için bir **çalışma takip ve performans analizi** uygulamasıdır. Öğrenci çalışmasını ve çözdüğü soruları kaydeder, deneme sınavı sonuçlarını girer, uygulama ona nerede güçlü nerede zayıf olduğunu gösterir ve günlük plan önerir.

Ders anlatmıyor, içerik satmıyor. Sattığı şey **kendi ilerlemeni görmek**.

Platform: iOS + Android (React Native). Mobil, tek elle kullanım.

## 2. KULLANICI KİM

- **16-19 yaş** lise öğrencisi (YKS) ve **13-14 yaş** ortaokul öğrencisi (LGS). Ağırlık YKS'de.
- Günde 3-8 kez açıyor, oturumların çoğu **30 saniyeden kısa**.
- Çoğu zaman yorgun, sık sık kaygılı, bazen suçluluk duygusuyla açıyor.
- Telefonu tek elle tutuyor; yatakta, serviste, teneffüste kullanıyor.
- Arayüz **Türkçe**. Türkçe kelimeler uzundur ("Karşılaştır", "Tamamlanan", "Yükseköğretim") — düzen buna dayanmalı, metin kırpılmamalı.
- Uygulamanın tonu samimi, ikinci tekil şahıs: "çalışmadın", "serini koru", "hızlan".

**Tasarımın duygusal görevi:** öğrenciye suçluluk değil **ivme** hissi vermek. Sayılar kötü olduğunda bile ekran onu ezmemeli, ileri itmeli.

---

## 3. HEDEF HİS — DİKKAT, BU MADDE KRİTİK

İstenen his: **premium ve canlı, aynı anda.**

İlk turda "premium" dedim, sen sessiz ve ciddi anladın — sonuç teknik olarak temizdi ama ölüydü. **Bu sefer premium'un tanımı bu değil.**

Doğru hedef şu üçünün kesişimi:

**a) Çekici.** Ekran açıldığında bakmak isteyeceğin bir şey olmalı. Görsel bir cazibe merkezi, bir enerji. Öğrenci bu uygulamayı arkadaşına gösterdiğinde "bu ne güzelmiş" demeli.

**b) Canlı.** Hareket, ritim, ivme hissi. Uygulama nefes almalı. Statik bir tablo gibi durmamalı.

**c) Sade.** Ekranda az sayıda öğe olmalı ve bu öğeler **büyük** olmalı. Kalabalık değil. Bu kısım daha önce doğru yakalandı ve **korunmalı**: büyük tipografi, cömert boşluk, ekran başına az blok.

Bu üçü çelişmez: az sayıda ama **büyük ve canlı** öğe, hem sade hem çekici olur. Çok sayıda küçük öğe ise hem kalabalık hem cansız olur.

**Ton dengesi:** Eğlenceli bir oyun değil — çocukça, cıvık, karikatürize olmasın. Ama ciddi bir muhasebe yazılımı da değil. Doğru nokta: **enerjik ve iddialı**. Bir spor markası gibi. Nike Run Club, Strava, Spotify, Arc — premium ama canlı. Whoop ve Oura'nın sessizliği bu proje için fazla soğuk.

---

## 4. ÇEKİCİLİK NASIL ÜRETİLİR (somut mekanizmalar)

"Güzel olsun" yeterli bir talimat değil. Çekicilik şunlardan gelir — her yönde en az üçünü kullan:

1. **Bir imza görsel öğesi.** Uygulamayı ekran görüntüsünden tanıtacak tek bir şey: karakteristik bir ilerleme göstergesi, bir grafik formu, tekrar eden bir geometri. Her ekranda kendini gösteren bir motif.
2. **Ölçek kontrastı.** Ekranda gerçekten dev bir öğe ile gerçekten küçük bir öğe yan yana. Ortada kalan boyutlar az olsun. Cesaret buradan okunur.
3. **Renk enerjisi.** Doygun, canlı bir imza rengi. Soluk hardal, kırık kiremit, gri-bej gibi çekingen tonlar değil.
4. **Derinlik/katman.** Her şey aynı düzlemde durmasın — hafif yükseklik, örtüşme, kırpılma, çerçeveden taşma. Düz ve ruled bir tablo hissinden kaçın.
5. **Ritim.** Blok yükseklikleri ve boşluklar birbirinin aynısı olmasın; göz aşağı inerken bir tempo hissetsin.
6. **Veriyi görselleştir.** Sayıyı yazmakla yetinme — çizgi, halka, bar, ısı, akış. Uygulamanın malzemesi veri; asıl güzellik oradan çıkacak.
7. **Ders renklerini kullan.** Aşağıdaki ders paleti uygulamanın en ayırt edici görsel varlığı. İlk turda hiç kullanmadın ve ekranlar renksiz kaldı. Ders renkleri **görünür** olmalı — ama sadece ders bağlamında (ders satırı, ders grafiği, ders rozeti); butonda ve dekorasyonda değil.

---

## 5. HAREKET (bu proje için birinci sınıf bir tasarım katmanı, süs değil)

Uygulamanın canlı hissetmesinin ana kaynağı hareket olacak. Her yön için hareket dilini tanımla ve artboard'larda göster (ara kare, iz çizgisi, ok, ya da ayrı bir küçük pano ile):

- Sayılar yerinde **sayarak** artsın.
- Grafik çizgileri ve barlar **çizilerek/dolarak** gelsin.
- İlerleme göstergeleri hedefe doğru **akısın**.
- Ekran açılışında bloklar sırayla, kısa gecikmelerle gelsin (hepsi aynı anda değil).
- Dokunma geri bildirimi anında olsun.
- Geçişler 200–350 ms, yumuşak yavaşlama.
- Ana ekranda tek bir sürekli/canlı öğe olabilir (nefes alan bir hareket, akan bir sayaç) — ama yalnızca bir tane.

**Sınır:** Kutlama efektleri ölçülü olsun. Ekranı kaplayan konfeti, patlama, zıplayan rozet yok. Uygulama şu anda çok fazla kutlama gösteriyor ve bu ucuzlatıyor.

---

## 6. YASAKLAR

1. **Mor `#8b5cf6`** ve türevleri (Tailwind violet). Şu anki uygulamanın rengi bu ve jenerik görünmesinin sebebi.
2. Mor→pembe / mor→mavi **degradeler**.
3. **Glassmorphism** — bulanık cam paneller, sheen parlamaları.
4. Arka planda **glow / blob / aurora** lekeleri.
5. **Bento grid.**
6. Ekranı dolduran, hepsi eşit ağırlıkta **kart dizisi**.
7. Her aksiyona **farklı renk** vermek.
8. **Gereksiz emoji.**
9. **Ham veritabanı anahtarı ekranda görünmez** — `tyt_turkce`, `tyt_ayt` değil; "Türkçe", "YKS".
10. **Tek renkli, gri-beyaz, tamamen sessiz minimalizm.** Bu da en az mor-glow kadar klişe ve bu proje için yanlış.

---

## 7. RENK

Renkleri **rol** olarak tanımla (ham hex listesi olarak değil), her yön için değerleriyle birlikte:

`bg` · `surface` · `border` · `text` · `textSecondary` · `textMuted` · `accent` · `success` / `danger`

**Kurallar:**
- Zemin nötr olsun (mor/mavi kaymalı gri değil).
- **Tek** imza rengi — ama **canlı ve doygun** olsun. Çekingen ton seçme.
- Ders renkleri sadece ders bağlamında, ama gerçekten görünür.
- Hiyerarşi öncelikle boyut ve ağırlıkla kurulsun; renk vurgu için, dolgu için değil.

**Ders renkleri (korunacak — kullanıcı bunları öğrendi, koyu zemine göre tonlanabilir):**
Türkçe `#60a5fa` · Matematik `#fb923c` · Fizik `#22d3ee` · Kimya `#f472b6` · Biyoloji `#34d399` · Tarih `#fbbf24` · Coğrafya `#2dd4bf` · Felsefe `#c084fc` · Din Kültürü `#84cc16`

**Tema:** Tasarımı **koyu temada** yap. Uygulama açık temayı da destekleyecek, onu rollerden türeteceğiz — bu yüzden rol isimlendirmesi şart. İstersen bir yönü sıcak açık temada da gösterebilirsin (koyu versiyonuna ek olarak).

---

## 8. TUTARLILIK SİSTEMİ (ilk turda doğru yaptın — aynen sürdür)

Uygulamanın en büyük kalite sorunu tutarsızlık: fiilen 10'dan fazla buton görünümü, 38 farklı köşe yarıçapı değeri, 6 farklı ekran başlığı kalıbı, aynı iş için 4 farklı filtre bileşeni var.

Her yön için şu envanteri tanımla ve **sayıyı küçük tut**:

- **Buton: en fazla 3 tip** (birincil / ikincil / metin). Tek yükseklik, tek yarıçap, tek iç boşluk.
- **Panel: en fazla 2 tip.**
- **Tipografi ölçeği: en fazla 5 boyut** (biri gerçekten dev olmalı).
- **Köşe yarıçapı: en fazla 3 değer.**
- **Boşluk merdiveni: tek ölçek.**
- **Ekran başlığı: en fazla 2 kalıp** (kök ekran / alt ekran).
- **Filtre kontrolü: tek tip**, üç ekranda da aynı.

Bunları her yön için ayrı bir **sistem panosunda** göster.

---

## 9. ÜÇ YÖN — YAPISAL OLARAK AYRIŞACAKLAR

**Uyarı:** İlk turda üç yön ürettin ama üçü de aynı iskeleti paylaştı (koyu zemin + tek vurgu + üstte dev sayı + altında liste); sadece font ve vurgu rengi değişti. **Bu sefer öyle olmayacak.** Aşağıdaki üç yön farklı **düzen mantıkları**dır; birinden diğerine geçince ekranın kurgusu değişmeli, sadece rengi değil.

Test şu: üç ekranı gri tonlamaya çevirip yan yana koyduğumuzda hâlâ birbirinden ayırt edilebiliyor olmalılar. Ayırt edemiyorsak yön üretmemişsin, tema üretmişsin.

### Yön A — "Yolculuk"
Organize edici fikir: **zaman ve mesafe.** Öğrencinin sınav gününe doğru ilerlediği bir yol/hat/eğri var ve bilgiler bu hat üzerinde konumlanıyor. Dikey liste mantığından uzaklaş. İlerleme mekânsal olarak hissedilsin — nereden geldiğin ve ne kadar kaldığın görünsün. Ana ekranın kalbi bu hat.

### Yön B — "Kokpit"
Organize edici fikir: **yoğun ama ustaca.** Bilgi çok, ama hiyerarşi kusursuz; göz nereye bakacağını bir anda biliyor. Ölçüm panosu estetiği — canlı veri, göstergeler, karşılaştırmalar. Burada bilgi yoğunluğu bir erdem, ama kalabalık değil düzen olmalı. Kart çorbasından ayıran şey: net gruplama, güçlü boyut hiyerarşisi, tek baskın gösterge.

### Yön C — "Tek Kart"
Organize edici fikir: **her seferinde tek iş.** Ekran bir yığın değil, bir deste. Öğrenciye aynı anda tek bir şey sunuluyor; sıradakine kaydırarak/geçerek ulaşıyor. Bilgi yoğunluğu en düşük, netlik en yüksek. Kartların kendisi büyük, güçlü, dokunmaya davet eden nesneler olsun.

Üçü de bölüm 3, 4, 5'teki canlılık ve çekicilik gerekliliklerini karşılamak zorunda. Sadelik = az öğe demek; cansızlık demek değil.

---

## 10. EKRANLARDA HANGİ BİLGİLER VAR

Aşağıdakiler ekranlarda bulunan **bilgi ve aksiyonlardır** — sıra değil, düzen değil, öncelik değil. Neyin öne çıkacağına, neyin küçüleceğine, neyin bir alt ekrana taşınacağına, neyin tamamen çıkarılacağına **sen karar ver**. Kararını sistem panosunda bir-iki cümleyle gerekçelendir.

Veriler gerçek. Uydurma isim/sayı ve Lorem ipsum kullanma.

### EKRAN 1 — ANA SAYFA

**İşi:** Öğrenci buraya *"bugün ne yapmalıyım ve nerede duruyorum"* sorusunun cevabını alıp **tek dokunuşla çalışmaya başlamak** için gelir. Cevap açıldıktan ~2 saniye içinde görünmeli. Birincil aksiyon: çalışmaya başlamak / soru kaydetmek.

Ekranda bulunan bilgiler:
- Kullanıcı kimliği: avatar, isim (**Ahmet Yılmaz**), saate göre selamlama ("İyi akşamlar")
- Seri: **47 gün**
- Sınav geri sayımı: **YKS 2027'ye 299 gün** + canlı saniyelik sayaç (20:09:41)
- Günlük ilerleme: bugün **63 / 100 soru**
- Son deneme neti: **58.3** (+2.3 artış)
- Toplam XP: **1240**
- Koç uyarısı (tek cümle): *"Sosyal Bilimler'de 10.8 net düştün"*
- Bugünün planı — 2/5 tamamlandı:
  - Tarih · İlk Çağ Uygarlıkları — 35 soru · ~42 dk
  - Coğrafya · İklim ve Bitki Örtüsü — 30 soru · ~36 dk
  - Felsefe · Bilgi Felsefesi — 20 soru · ~24 dk
  - Matematik · Permütasyon - Kombinasyon — 24 soru · ~29 dk
  - Türkçe · Paragraf (Ana Düşünce) — 28 soru · ~34 dk
- Ders ivmesi (son 5 deneme): Türkçe 26.0 (+2.5) · Matematik 16.8 (+3.0) · Fen Bilimleri 7.5 (−5.0) · Sosyal Bilimler 10.5 (+3.8)
- Haftalık aktivite: **412 soru**, geçen haftaya göre **+%18**, 7 günlük dağılım (Pzt–Paz)
- Hızlı erişimler: Çalış · Deneme Gir · Yanlış Ekle · Yanlış Defteri · Takvim

Ayrıca: yeni kullanıcı için **boş durum** — verilerin hiçbiri yok. "Senin hiçbir şeyin yok" tablosu gibi değil, **başlangıç noktası** gibi hissettirsin.

### EKRAN 2 — PROFİL

**İşi:** Öğrenci buraya *"şu ana kadar ne biriktirdim"* görmek için gelir — emeğinin kanıtı. Şu an bu ekranın hiçbir baskın öğesi yok ve ölü duruyor; **bir kahramanı olmalı.**

Ekranda bulunan bilgiler:
- Kimlik: avatar (değiştirilebilir), isim **Ahmet Yılmaz**, sınav alanı **TYT + SAY**, seri **47 gün**
- Seviye: **Lv.7 · Odaklı**, **1240 / 2200 XP**, sonraki seviyeye **960 XP**
  (Seviye adları sırayla: Başlangıç, Çaylak, Öğrenci, Azimli, Çalışkan, Kararlı, Odaklı, Hırslı, Disiplinli, Savaşçı, Uzman, Usta, Elit, Efsane, Maratoncu)
- Kariyer toplamları: **3.480 soru** · **61 saat** · **47 gün** en uzun seri
- Haftalık lig: rütbe **GÜMÜŞ**, üst lige **160 XP**
  (Rütbeler: Bronz, Gümüş, Altın, Elmas, Obsidyen)
- Aylık aktivite: ay içindeki günlerin yoğunluğu, **18 aktif gün**
- Güç haritası (ders doğruluk %): Tarih %83 · Türkçe %78 · Biyoloji %71 · Matematik %64 · Fizik %52 · Kimya %46
- Ayarlar girişi

Ayrıca: yeni kullanıcı için **boş durum** — her şey sıfır. Boşluğu ceza gibi göstermeyen, ne biriktireceğini vaat eden bir hâl.

### EKRAN 3 — ANALİZ

**İşi:** Öğrenci buraya *"yükseliyor muyum, hangi derste kanıyorum"* sorusuna cevap almak için gelir. Tek yazma aksiyonu: **Deneme Gir** — her zaman erişilebilir olmalı ama içeriğin üstüne binmemeli.

Ekranda bulunan bilgiler:
- Filtre: Tümü / TYT / AYT / Branş (LGS kullanıcısında: Tümü / LGS / Branş)
- Net trendi: zaman içindeki net değişimi — **eksenleri okunabilir olmalı** (örn. 56 / 63 / 70 / 77 ve "22 Haz", "5 Tem", "19 Tem")
- Son deneme: **TYT Denemesi**, 23 Haziran 2026, net **58.25**, değişim **+2.3**
- Ders bazlı sonuçlar: Türkçe 26.0/40 · Matematik 16.8/40 · Fen Bilimleri 7.5/20 · Sosyal Bilimler 10.5/20
- Geçmiş denemeler (son 6): tip rozeti (TYT / AYT SAY / AYT EA / AYT SÖZ / Branş) + tarih + net + değişim
- Moral trendi: son denemelerdeki ruh hâli (şu an emoji ile; daha ölçülü bir çözüm önerebilirsin)
- Alt ekran girişleri: Detaylı Analiz · Net Tahmini · Dönem Analizi
- Pratik girişleri: Yanlış Defteri · 5dk Quiz · Simülasyon
- Aksiyon: **Deneme Gir**

Ayrıca: **boş durum** — henüz deneme girilmemiş. Dikkat: tek bir çağrı olmalı, iki ayrı "Deneme Gir" butonu değil.

---

## 11. ALT NAVİGASYON

Uygulamanın 4 ana sekmesi var: **Ana Sayfa · Analiz · Defter · Profil**, ayrıca hızlı kayıt için bir ekleme aksiyonu. Navigasyon **tahmin edilebilir ve sıkıcı** olsun — yaratıcılık içerikte olsun, navigasyonda değil. Kullanıcı düşünmeden bulmalı.

---

## 12. ÇIKTI

Her yön için:
1. **Üç ekran** — Ana Sayfa, Profil, Analiz (dolu veri hâliyle)
2. **Bir sistem panosu** — renk rolleri (isim + değer), tipografi ölçeği, buton tipleri, yarıçap değerleri, boşluk merdiveni, hareket dili notu, ve "bu yönde neyi öne çıkardım / neyi çıkardım, neden" (3-5 cümle)
3. En az bir yön için **Ana Sayfa boş durumu**

Ekranlar mobil oranında (yaklaşık 390 × 844), **koyu temada**.

**Son hatırlatma:** Sade olsun ama ölü olmasın. Az öğe, büyük öğe, canlı öğe.
