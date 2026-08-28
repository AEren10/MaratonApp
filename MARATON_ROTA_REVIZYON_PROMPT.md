# Maraton — Rota Yönü: Sadeleştirme (Tur 7)

Son tur içerik olarak doğruydu. Bu turda esas iş **Ana Sayfa'yı sadeleştirmek**: dev "63" geri gelecek, ışık hüzmesi kalkacak, ve derinleşen içerik yeni bir Rota Detay ekranına taşınacak.

---

## 1. DEV "63" GERİ GELSİN

Daha önceki bir turda Ana Sayfa'nın kalbi buydu: **dev bir "63 / 100"** (bugün çözülen soru / günlük hedef), altında "hedefe 37 kaldı". Ekranın en büyük öğesiydi ve en çok beğenilen hâl buydu.

Son turda rota gerçek veriye bağlanırken üst kısım kalabalıklaştı ve "63" küçülüp aşağı itildi. Geri gelsin.

- **"63 / 100" ekranın en büyük öğesi olsun.** Kullanıcı uygulamayı bunun için açıyor: bugün ne kadar yaptım, ne kadar kaldı.
- **"299 gün" ikinci büyük öğe olsun.**
- Rota bu ikisinin altında/yanında yaşasın — gerçek veriyi taşımaya devam etsin ama ekranın kahramanı bu iki sayı olsun.

---

## 2. "IŞIK HÜZMESİ" GİTSİN

Rota'nın geleceğe uzanan kısmı, hattan kopuk çapraz bir ışın gibi duruyor. Dekoratif görünüyor, "yol" hissi vermiyor, boşlukta asılı kalıyor.

- **Projeksiyon, rotanın kendi devamı olsun** — aynı hattın kesikli/soluk hâli, aynı eğim mantığıyla. Ayrı bir çizgi, ışın veya hüzme değil.
- **Güven aralığı**, genişleyen bir koni/hüzme olarak değil, **hattın etrafında ince bir bant** olarak çözülsün. Belirsizliği anlatsın ama ekranı bölen bir ışık demeti gibi görünmesin.

---

## 3. SADELİK VE BOŞLUK — SAYISAL KURAL

Ekran "pazar yeri" gibi görünmemeli. Her turda bir şey daha ekleniyor ve fark edilmeden kalabalıklaşıyor. Bundan sonra kural:

- **Ana Sayfa'nın ilk ekranında (kaydırmadan görünen kısımda) en fazla 4 blok.**
- **Bloklar arası boşluk, blok içi boşluktan belirgin şekilde büyük olsun** — gruplar gözle ayrılsın.
- Bir blokta en fazla **2 seviye** bilgi olsun (başlık + içerik). Üçüncü seviye başlıyorsa blok bölünsün veya sadeleşsin.
- **Aynı bilgiyi iki yerde gösterme.** ("Bugünkü net" ve "Sınav günü tahmini" kartları rotanın zaten gösterdiği şeyi tekrar ediyor — kaldır veya rotanın içine göm.)
- **Rota üzerindeki etiket sayısı en fazla 3 olsun.** Şu an aynı anda hedef çizgisi, tahmini net, güven aralığı, iki gelecek durak, bugün işareti ve eksen değerleri var — çok fazla. Gerisi dokunulduğunda veya detay ekranında görünsün.

Sistem panosunda boşluk merdivenini ve "blok arası / blok içi" kuralını yaz.

---

## 4. SAYI YOĞUNLUĞU VE DERİNLİĞİN ALT EKRANLARA TAŞINMASI

Ana Sayfa'da birkaç sayı olması normal — sorun sayıların varlığı değil, **hepsinin aynı ekranda ve aynı ağırlıkta olması.** Şu an kaydırmadan görünen kısımda 15'e yakın sayı var: 63, 100, 37, 299, saniyelik sayaç, 47, 58,25, +2,3, 71, hedef 72, aralık 68–74, eksen değerleri, 2/5. Ekran gösterge paneline dönüyor.

**Ana Sayfa'nın işi "bugün" ve "yön".** Geçmişe, analize ve derinleşen her şeye alt ekranlarda yer var — uygulamada bu ekranlar zaten mevcut (Analiz, Seviye, Detaylı Analiz, Net Tahmini).

### Kurallar

1. **Kahraman sayı belirgin olsun.** Ana Sayfa'da bu "63 / 100". Diğer sayılar ona göre gözle ayırt edilebilir şekilde daha küçük ve daha sessiz olsun. Eşit ağırlıkta sayı dizisi olmasın.
2. **Aynı bilgiyi iki kez gösterme.**
   - "299 gün" ile saniyelik geri sayım aynı şeyi iki hassasiyette veriyor. **Saniyelik sayaç kaldırılsın** — 299 gün uzaktaki bir olay için saniye saymak anlamsız ve gözü sürekli meşgul ediyor.
   - "Bugünkü net" ve "Sınav günü tahmini" kartları rotanın zaten gösterdiğini tekrar ediyor. Kaldırılsın.
   - Tahmini net hem Ana Sayfa'da hem Analiz'de var; bir yerde kalsın.
3. **Anlamını söyleyemediğin sayıyı ekranda tutma.** Çıplak sayı yerine ne demek olduğu yazsın: "71 net · hedefin 1 net altında" gibi.

### Yeni ekran: ROTA DETAY

Ana Sayfa'daki rota **sadeleşsin**: hat, geçmiş düğümler, bugün, projeksiyon ve tek bir hedef etiketi. Üzerindeki diğer her şey — hedef çizgisi, güven aralığı (68–74), gelecekteki duraklar, eksen değerleri, deneme deneme detaylar — **rotaya dokununca açılan bir Rota Detay ekranına** taşınsın.

Böylece zengin içerik kaybolmuyor, sadece doğru yere gidiyor: Ana Sayfa sade kalıyor, merak eden içeri giriyor.

Bu ekranı da tasarla. İçinde bulunabilecekler: tam rota (tüm etiketleriyle), hedef çizgisi ve hedefe uzaklık, güven aralığı, geçmiş denemelerin listesi, gelecekteki planlanmış duraklar, "bu tempoyla sınav günü 71 net" yorumu, tempo değişirse ne olacağı.

### Alt ekranlara taşınmaya aday diğer şeyler

Kararı sen ver, ama şunları değerlendir:
- **Haftanın durak raporu**nun detayı (7 günlük dağılım, kırılımlar) → haftalık özet ekranı; Ana Sayfa'da tek satırlık özet kalsın
- **Ders ivmesi**nin tamamı → Analiz; Ana Sayfa'da en dikkat çeken bir-iki ders kalabilir
- **Hızlı erişim** karo grubu → orta sekmedeki ekleme aksiyonu zaten bu işi görüyor; Ana Sayfa'da tekrar gerekli mi, sorgula

---

## 5. RENK KARARI VERİLDİ

**Marka rengi: parlak mercan-kırmızı.** İlk turlardaki daha sıcak, daha parlak ton — son turdaki koyu/kan kırmızısı değil. Koyu zeminde parlaklık enerji demek; koyu kırmızı zemine gömülüyor ve "tehlike" çağrışımı güçleniyor.

- Ton, **Matematik turuncusundan (`#fb923c`) net ayrışsın** — turuncuya kaymasın, kırmızı tarafında kalsın.
- Uygulama ileride açık temayı da destekleyecek. **Marka rengi her iki temada aynı kalır**, açık temada yalnızca kontrast için bir tık koyulaşır. Hue değişmez.
- Alternatif renk seçeneği sunma, karşılaştırma çizme. Karar verildi.

**Anlam haritası değişmedi:** kırmızı = marka (aksiyon, rota, vurgu) · yeşil = artış · nötr-soğuk ton = düşüş. Kırmızı hiçbir yerde "kaybettin" anlamına gelmez.

---

## 6. ZEMİN DERİNLİĞİ — HÂLÂ EKSİK

Zemin tek düzlem hissi veriyor; kartlar zeminden ayrışıyor ama fark çok ince.

- Saf siyah kullanma; hafif sıcaklık taşıyan çok koyu bir nötr.
- **3-4 kademeli derinlik merdiveni:** `bg` → `surface` → `surfaceElevated` → `border`. Kademeler arası fark **gözle net seçilebilsin.**
- Sistem panosunda kademeleri **yan yana, büyük alanlar hâlinde** göster ki fark doğrulanabilsin.

---

## 7. DÜZELTİLECEK HATALAR

1. **Moral trendi anlamını kaybetti** — farklı boyutta kırmızı kareler, açıklama yok. Ya etiketli üç kademeli net bir gösterim yap, ya tamamen kaldır.
2. **Tahmin sayısı tutarsız** — Ana Sayfa "tahmini 71 net", Analiz "sınav günü %69 net". Tek sayı, tek birim: **71 net**. Net bir yüzde değildir, "%" işareti kullanma.
3. **"Haziran · 4 deneme, +%69 net"** anlamsız — netteki değişim net cinsindendir: "+3,2 net".
4. **Haftalık barlar veriyle çelişiyor** — "412 soru" deniyor ama yalnızca bir gün dolu görünüyor. Gerçek haftalık dağılımı göster.
5. **Kullanıcı adı iki satıra kırılıyor** ("Ahmet / Yılmaz"). Tek satırda tutulmalı.
6. **Fen Bilimleri mini rotası yanlış yön gösteriyor** — değer −5,0 ama çizgi düşmüyor. Mini rotalar gerçek yönü yansıtsın.

---

## KORUNACAKLAR — DOKUNMA

- Rota'nın gerçek veriye bağlı olması: geçmiş denemeler → bugün → sınav gününe projeksiyon → tahmini net
- Hedef çizgisi ve tahminin hedefle karşılaştırılması ("hedefin 1 net altında")
- Güven aralığı fikri (tek sayı değil, aralık)
- Gelecekteki duraklar (yaklaşan deneme, tekrar günü)
- Rota'nın dört hâli: yükselen / dalgalı / düşen / az veri
- "Bugünün Durakları" kurgusu, tam görünen konu adları
- Ders ivmesinin mini rotalar olması
- Profil'de "Yol Künyesi" ve "Yılın Rotası"
- Seviye ekranı: XP dökümü ve dikey seviye yolu
- Analiz yapısı: büyük net, eksenli grafik, ders barları, İYİ/ZOR/ORTA etiketleri
- "Haftanın durak raporu"
- Boş durumda tek çağrı
- Türkçe sayı formatı: 58,25 · 1.240 · %83
- Sistem disiplini: 3 buton tipi · en fazla 2 panel tipi · en fazla 5 tipografi boyutu · en fazla 3 yarıçap değeri · tek filtre kontrolü
- Ders renkleri yalnızca ders bağlamında: Türkçe `#60a5fa` · Matematik `#fb923c` · Fizik `#22d3ee` · Kimya `#f472b6` · Biyoloji `#34d399` · Tarih `#fbbf24` · Coğrafya `#2dd4bf` · Felsefe `#c084fc` · Din Kültürü `#84cc16`
- Yasaklar: mor `#8b5cf6` · glassmorphism · arka plan glow/blob/aurora · bento grid · gereksiz emoji · ham veritabanı anahtarı

---

## HAREKET

- Rota açılışta çizilerek gelsin, geçmiş düğümler sırayla belirsin
- BUGÜN düğümü nefes alan bir nabızla canlı olsun — ekrandaki tek sürekli hareket
- Durak tamamlanınca düğüm dolsun, hat ilerlesin
- Dev sayılar sayarak artsın, barlar soldan dolsun
- Bloklar 60-80 ms aralıklarla sırayla gelsin
- Geçişler 200-350 ms; konfeti/patlama yok

---

## ÇIKTI

**Ana Sayfa** (tam yükseklik) · **Rota Detay** (yeni) · **Analiz** · **Profil** · **Seviye** · **Ana Sayfa boş durum** · **Sistem panosu**

Sistem panosunda: derinlik merdiveni (yan yana, büyük alanlar), renk anlam haritası, boşluk kuralı (blok arası / blok içi), tipografi ölçeği, buton tipleri, yarıçap değerleri, Rota anatomisi, sayı formatı, hareket dili.

Mobil oran (≈390 × 844), koyu tema.

**Özet:** Dev "63" geri gelsin, hüzme kalksın, Ana Sayfa sadeleşsin ve derinleşen içerik Rota Detay ekranına taşınsın. Veri korunsun, kalabalık gitsin.
