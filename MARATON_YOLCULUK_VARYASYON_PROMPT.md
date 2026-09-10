> **ARSIV — ESKI TASARIM DONEMI. TALIMAT OLARAK OKUNMAZ.**
> Bu belge tasarimciya gonderilmis tarihsel bir brief. Icindeki renk, font ve
> bilesen kurallari (mor #8b5cf6, Inter, Space Grotesk, glassmorphism) ARTIK
> GECERSIZ. Guncel tasarim sistemi: `AGENTS.md` > Styling Rules ve
> `design/extracted2/tokens.md`.

# Maraton — Yolculuk: Gerçek Varyasyonlar (Tur 4)

## ÖNCE: GERİ BİLDİRİM

Son turda üç varyasyon istedim ama **üçü de aynı tasarımın renk değişmiş hâli oldu.** Düzen, yerleşim, blokların biçimi, bilginin sunuluş şekli — hepsi birebir aynı kaldı; sadece imza rengi ve buton yarıçapı değişti.

Bu benim hatam: brief'te "iskelet üçünde de aynı kalacak, değişecek olan renk ve buton dili" yazmıştım. Sen dediğimi yaptın. Şimdi ne istediğimi düzeltiyorum.

### Doğru talep

**Kilitli olan tek şey ROTA.** Onun dışındaki her şey varyasyonlar arasında gerçekten farklılaşmalı.

**ROTA nedir:** Ana Sayfa'daki, sınav gününe doğru yükselen eğri; geçmişi dolu, geleceği kesikli; üzerinde geçmiş olayları gösteren düğümler ve vurgulu bir "BUGÜN" düğümü; ucunda bir hedef. Bu bileşen bu tasarımın kalbi ve imzası — **formu, eğim hissi, düğüm mantığı ve dolu/kesikli ayrımı üç varyasyonda da korunacak.**

**Rota dışında kalan her şey serbest ve değişmeli:**
- Ekranın kompozisyonu — Rota nerede duruyor, ne kadar yer kaplıyor, ekranın üstünde mi ortasında mı, tam genişlik mi kırpılmış mı
- Bilgilerin gruplanması ve sırası
- Bugünün planının sunuluş biçimi
- İstatistiklerin sunuluş biçimi
- Kart mı, kartsız mı; çerçeveli mi, çizgiyle ayrılmış mı
- Başlık ve kimlik alanının kurgusu
- Analiz ve Profil ekranlarının tamamen farklı düzenleri
- Tipografi karakteri, renk, buton dili (bunlar da değişsin ama **tek başına** yeterli değil)

### Testler

Üç varyasyonu teslim etmeden önce ikisini de uygula:

1. **Gri tonlama testi:** Üçünü de siyah-beyaza çevir ve yan yana koy. Hâlâ birbirinden ayırt edilebiliyor olmalılar. Ayırt edilemiyorsa varyasyon üretmemişsin, tema üretmişsin.
2. **Üst üste bindirme testi:** Üç Ana Sayfa'yı üst üste koysan blokların kenarları çakışıyor mu? Çakışıyorsa düzen değişmemiş demektir.

---

## KORUNACAKLAR (üç varyasyonda da)

1. **Rota** — yukarıda tanımlandı. Dokunma.
2. **Ölçek cesareti** — dev sayılar (63, 1.240, 299 gün, 58.25), cömert boşluk, ekran başına az blok. Ekranın sade durmasının sebebi bu ve korunmalı.
3. **Sistem disiplini** — buton en fazla 3 tip, panel en fazla 2 tip, tipografi en fazla 5 boyut, yarıçap en fazla 3 değer, tek boşluk merdiveni, filtre kontrolü tek tip.
4. **Alt navigasyon** — 4 sekme + ortada ekleme aksiyonu. (Görünümü varyasyona göre değişebilir, yapısı değişmez.)
5. **Ham veritabanı anahtarı ekranda görünmez.** "Türkçe", "YKS" — `tyt_turkce`, `tyt_ayt` değil.

## YASAKLAR

Mor `#8b5cf6` ve türevleri · mor-pembe/mor-mavi degradeler · glassmorphism · arka plan glow/blob/aurora · bento grid · gereksiz emoji · her aksiyona farklı renk vermek · gri-beyaz tamamen sessiz minimalizm.

## DERS RENKLERİ (üçünde de aynı)

Türkçe `#60a5fa` · Matematik `#fb923c` · Fizik `#22d3ee` · Kimya `#f472b6` · Biyoloji `#34d399` · Tarih `#fbbf24` · Coğrafya `#2dd4bf` · Felsefe `#c084fc` · Din Kültürü `#84cc16`

Ders renkleri **görünür olmalı** ama yalnızca ders bağlamında (ders satırı, ders grafiği, ders rozeti) — butonda ve dekorasyonda değil.

---

## ÜÇ VARYASYON

Her varyasyonun **farklı bir organize edici fikri** var. Renk ve buton bunun sonucu; başlangıcı değil.

### VARYASYON 1 — "Rota merkezde"
**Fikir:** Rota ekranın kahramanı. Büyük, geniş, ekranın üst yarısını rahatça kaplıyor; diğer her şey onun etrafında ve altında konumlanıyor, ona hizmet ediyor.
**Bunun getirdikleri:** Bilgiler Rota'nın üzerine ve yakınına yerleşebilir — bugünün planı rotanın devamı olarak duraklara dönüşebilir, istatistikler hattın üzerindeki işaretler olabilir. Kart neredeyse yok; ekran tek bir sürekli yüzey.
**Renk yönü:** koyu nötr zemin + elektrik yeşili/limon gibi canlı, teknik bir imza rengi. Kırmızı değil.
**Buton:** düşük yarıçap, keskin, kompakt.

### VARYASYON 2 — "Rota bir bölüm"
**Fikir:** Rota ekranın bölümlerinden biri; kahraman değil, güçlü bir açılış. Ekran net bölümlere ayrılıyor ve her bölümün kendi kimliği var. Editöryal bir sayfa düzeni — başlıklar, ayraçlar, ritim.
**Bunun getirdikleri:** Bugünün planı gerçek bir liste olarak güçlü şekilde tasarlanabilir, ders ivmesi kendi bölümünü hak eder, haftalık özet ayrı bir blok olur. Rota üstte oturur ama ekranı yönetmez.
**Renk yönü:** sıcak koyu zemin (kahve/kömür) + amber/altın imza rengi. Davetkâr, insancıl.
**Buton:** yüksek yarıçap (pill), cömert yükseklik.

### VARYASYON 3 — "Rota arka planda"
**Fikir:** Rota ekranın zemini/dokusu hâline geliyor — içeriğin arkasından geçen, ekranın tamamına yayılan bir hat. Bilgiler onun üzerinde yüzüyor. Rota bir grafik olmaktan çıkıp mekân oluyor.
**Bunun getirdikleri:** Katmanlı bir kompozisyon — arkada hat, önde içerik. İçerik blokları hattın farklı noktalarına denk gelebilir; kaydırdıkça hat boyunca ilerliyormuş hissi doğar. En cesur ve en riskli varyasyon; okunabilirliği koruman şart.
**Renk yönü:** nötr koyu zemin + imza rengi olarak **ders paletinin kendisi** — hat ilerledikçe ders renklerini taşıyor. Butonlar için ayrı tek bir nötr-canlı ton (ders renkleriyle çakışmasın).
**Buton:** orta yarıçap, dolgulu birincil, şeffaf ikincil.

**Not:** Yukarıdaki renk/buton önerileri bağlayıcı değil — organize edici fikre uyuyorsa değiştirebilirsin. Bağlayıcı olan **üç ayrı kompozisyon mantığı** üretmen.

---

## DÜZELTİLMESİ GEREKEN: ANA SAYFANIN ALT YARISI

Önceki turlarda ekranın üst yarısı bir yolculuktu, aşağı kaydırınca sıradan bir uygulamaya dönüşüyordu: düz plan listesi, yatay kaydırmalı jenerik ders kartları, yarım kesilmiş haftalık blok. **Metafor yarıda kesiliyor.**

Her varyasyonda bunu kendi mantığına göre çöz. Ana Sayfa'yı **tam yüksekliğiyle** göster (kaydırma sonrası kısım dahil) ki alt yarı bir daha yarım kalmasın.

---

## HAREKET

Her varyasyon için hareket dilini tanımla ve görselleştir (ara kare, iz çizgisi, ok ya da küçük hareket panosu ile).

- Rota ekran açılınca **çizilerek** gelsin (~600-800 ms), geçmiş düğümler sırayla belirsin.
- **BUGÜN düğümü canlı olsun** — yavaş nefes alan bir nabız. Ekrandaki tek sürekli hareket bu.
- Görev tamamlanınca düğüm dolsun, hat bir adım ilerlesin.
- Dev sayılar yerinde **sayarak** artsın.
- Barlar ve ilerleme çubukları soldan **dolarak** gelsin.
- Bloklar açılışta 60-80 ms aralıklarla sırayla gelsin.
- Geri sayım canlı aksın.
- Dokunma geri bildirimi anında.
- Geçişler 200-350 ms, yumuşak yavaşlama.

**Sınır:** Ekranı kaplayan konfeti/patlama yok. Kutlama, rotanın ilerlemesiyle anlatılsın.

Hareket dili de varyasyonlar arasında farklılaşabilir — biri keskin ve hızlı, biri yumuşak ve akışkan olabilir.

---

## EKRANLARDAKİ BİLGİLER

Düzen, gruplama, hiyerarşi, neyin öne çıkacağı ve neyin alt ekrana taşınacağı **senin kararın** — ve varyasyondan varyasyona farklı olmalı. Aşağıdakiler sadece ekranda bulunan bilgiler. Veriler gerçek, aynen kullan.

### ANA SAYFA
*İşi: "bugün ne yapmalıyım ve nerede duruyorum" + tek dokunuşla başlamak. Birincil aksiyon: çalışmaya başlamak.*

- Ahmet Yılmaz, avatar, "İyi akşamlar"
- Seri: 47 gün
- YKS 2027'ye 299 gün + canlı sayaç (18:59:06)
- Bugün: 63 / 100 soru (hedefe 37 kaldı)
- Son deneme neti: 58.3 (+2.3) · Toplam XP: 1240
- Koç uyarısı: *"Sosyal Bilimler'de 10.8 net düştün"*
- Bugünün planı — 3/5:
  - Tarih · İlk Çağ Uygarlıkları — 35 soru · ~42 dk
  - Coğrafya · İklim ve Bitki Örtüsü — 30 soru · ~36 dk
  - Felsefe · Bilgi Felsefesi — 20 soru · ~24 dk
  - Matematik · Permütasyon - Kombinasyon — 24 soru · ~29 dk
  - Türkçe · Paragraf (Ana Düşünce) — 28 soru · ~34 dk
- Ders ivmesi (son 5 deneme): Türkçe 26.0 (+2.5) · Matematik 16.8 (+3.0) · Fen Bilimleri 7.5 (−5.0) · Sosyal Bilimler 10.5 (+3.8)
- Bu hafta: 412 soru, geçen haftaya göre +%18
- Hızlı erişimler: Deneme Gir · Yanlış Ekle · Defterim · Takvim

### PROFİL
*İşi: "şu ana kadar ne biriktirdim" — emeğin kanıtı. Şu an bu ekranın baskın bir öğesi yok; bir kahramanı olmalı.*

- Ahmet Yılmaz · TYT + SAY · 47 gün seri · avatar (değiştirilebilir)
- Seviye 7 · Odaklı · 1.240 / 2200 XP · Hırslı'ya 960 XP · nihai hedef 15. seviye Maratoncu
- 3.480 soru · 61 saat · 47 gün en uzun seri
- Haftalık lig: GÜMÜŞ, üst lige 160 XP
- Ağustos 2026 aktivite: 18 aktif gün
- Güç haritası: Tarih %83 · Türkçe %78 · Biyoloji %71 · Matematik %64 · Fizik %52 · Kimya %46
- Ayarlar girişi

### ANALİZ
*İşi: "yükseliyor muyum, hangi derste kanıyorum". Tek yazma aksiyonu: Deneme Gir — her zaman erişilebilir ama içeriğin üstüne binmesin.*

- Filtre: Tümü / TYT / AYT / Branş
- Net trendi: 22 Haz → 5 Tem → 19 Tem, eksenler okunabilir (56 / 63 / 70 / 77)
- Ders bazlı son deneme: Türkçe 26.0/40 · Matematik 16.8/40 · Fen Bilimleri 7.5/20 · Sosyal Bilimler 10.5/20
- Geçmiş denemeler: TYT 58.25 (+2.3, 23 Haziran 2026, "iyi") · AYT SAY 55.95 (−1.4, 16 Haziran 2026, "zor") · TYT 57.3 (+3.1, 9 Haziran 2026, "iyi")
- Moral trendi
- Alt ekran girişleri: Detaylı Analiz · Net Tahmini · Dönem Analizi
- Pratik: Yanlış Defteri · 5dk Quiz · Simülasyon
- Aksiyon: Deneme Gir

### ANA SAYFA — BOŞ DURUM
Hiç veri yok. Önceki turdaki "299 günlük yol buradan başlıyor" yaklaşımı iyiydi, o ruhu koru. Rota boş ama vaat dolu görünsün.

---

## ÇIKTI

Her varyasyon için:
1. **Ana Sayfa** — tam yükseklik (kaydırma sonrası kısım dahil)
2. **Profil**
3. **Analiz**
4. **Sistem panosu** — renk rolleri (isim + hex), tipografi ölçeği, buton tipleri ve ölçüleri, yarıçap değerleri, boşluk merdiveni, **Rota'nın bu varyasyondaki rolü ve karakteri**, hareket dili notu, ve **"bu varyasyonun organize edici fikri ne, düzeni diğerlerinden nasıl ayrılıyor"** (3-5 cümle)
5. En az bir varyasyonda **Ana Sayfa boş durumu**

Mobil oran (≈390 × 844), koyu tema.

**Son hatırlatma:** Rota kalsın, gerisi gerçekten değişsin. Gri tonlamada bile üçünü ayırt edebilmeliyiz.
