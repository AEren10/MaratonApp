# Maraton — Story Paylaşım Özelliği

## AMAÇ

Öğrenci, çalışma istatistiklerini **kendi Instagram story'sinin üstüne** yapıştırabilsin.

Senaryo: Çocuk masasının/defterinin fotoğrafını çekiyor, story'ye koyuyor, üstüne "248 soru · 3s 12dk" yazan şeffaf bir Maraton etiketi yapıştırıyor. Etiketi gören arkadaşları uygulamayı öğreniyor.

Bu bir pazarlama özelliği. Amaç güzel bir kart üretmek değil, **öğrencinin zaten paylaştığı içeriğe markamızı taşımak.**

Referans: Strava'nın "Stats Stickers" özelliği.

---

## 1. NEDEN BU YAKLAŞIM

Öğrenciyi ayrı bir "Maraton kartı" paylaşmaya ikna etmek zor — reklam gibi hissettiriyor. Ama **zaten paylaştığı** masa/defter/ders fotoğrafına bir etiket eklemek doğal. Sürtünme düşük, sıklık yüksek.

Bu yüzden ürettiğimiz şey **tam ekran kart değil, şeffaf etiket**.

---

## 2. TEKNİK YOL — önemli karar

**Instagram'ın resmî paylaşım API'sini KULLANMIYORUZ.**

Sebep: `instagram-stories://share` ile sticker gönderdiğinde Instagram onu **düz renkli bir zemine** yerleştiriyor. Kullanıcı altına kendi fotoğrafını koyamıyor — yani tam istediğimiz şeyi yapamıyor. Ayrıca Ocak 2023'ten beri Facebook App ID kaydı gerektiriyor.

**Bunun yerine: pano (clipboard) yolu.**

```
Şeffaf PNG üret  →  panoya kopyala  →  Instagram'ı aç
                                        ↓
                     kullanıcı kendi fotoğrafını seçer
                                        ↓
                     basılı tutar → "Yapıştır" → etiket gelir
                                        ↓
                     istediği yere sürükler, boyutlandırır
```

### Platform farkı

- **iOS:** `expo-clipboard` → `setImageAsync(base64)`. Instagram story editöründe basılı tutunca "Yapıştır" çıkıyor. Sorunsuz çalışıyor.
- **Android:** Pano üzerinden görsel yapıştırma Instagram'da güvenilir değil. Yedek akış: `expo-media-library` ile **galeriye kaydet**, sonra kullanıcı Instagram'da story'sini açıp **fotoğraf sticker'ı** ile galeriden ekliyor.

İki platformda da metin farklı olmalı (bkz. bölüm 5).

### Kütüphaneler

- `react-native-view-shot` — ekran dışı bileşeni PNG'ye çevir (`result: "base64"`, `format: "png"`, şeffaf zemin için `backgroundColor: "transparent"`)
- `expo-clipboard` — iOS pano
- `expo-media-library` — Android galeri (izin gerekir)
- `expo-linking` — Instagram'ı aç (`instagram://story-camera`, kurulu değilse mağaza)

Not: `expo-sharing` / sistem paylaşım sayfası **yedek** olarak kalsın (Instagram kurulu değilse, ya da kullanıcı WhatsApp'a atmak isterse).

---

## 3. EKRAN: Paylaşım Hazırlama

Yeni ekran. Nereden açılır:

- Çalışma oturumu bittiğinde (özet ekranından)
- Deneme kaydedildiğinde (özet ekranından)
- Seri kilometre taşlarında (7 / 30 / 50 / 100 gün)
- Profil ekranından, istediği zaman

### Ekran yapısı

**Üstte: canlı önizleme.** Etiketin gerçek görünümü, temsili bir fotoğraf zemini üzerinde. Kullanıcı aşağıda bir şey değiştirdiğinde önizleme anında güncellenir.

**Ortada: veri seçici.** (bölüm 4)

**Altta: iki buton.**
- Birincil: `Kopyala ve Instagram'ı aç`
- İkincil: `Galeriye kaydet`

---

## 4. VERİ SEÇİCİ — özelliğin kalbi

Kullanıcı **hangi verilerin görüneceğini kendisi seçer.** Kimisi süresini göstermek ister, soru sayısını değil. Kimisi serisiyle övünür.

### Seçilebilir veriler

| Anahtar | Etiket | Örnek | Nereden |
|---|---|---|---|
| `questions` | Soru | `248` | günlük/haftalık toplam |
| `duration` | Süre | `3s 12dk` | çalışma süresi |
| `accuracy` | İsabet | `%78` | doğru/toplam |
| `streak` | Seri | `118 gün` | streak |
| `stops` | Durak | `4` | tamamlanan plan görevi |
| `net` | Net | `58,25` | yalnızca deneme bağlamında |
| `netChange` | Net değişimi | `+2,30` | yalnızca deneme bağlamında |
| `countdown` | Sınava kalan | `47 gün` | sınav tarihinden |

### Kurallar

- **En az 1, en fazla 4** veri seçilebilir. 4'ten fazlası etikette okunmaz.
- Seçili veri sayısı **düzeni değiştirir**:
  - 1 veri → tek dev sayı
  - 2 veri → biri kahraman, biri altta küçük
  - 3-4 veri → biri kahraman, kalanlar alt şeritte yan yana
- İlk seçilen veri **kahraman** olur. Kullanıcı sürükleyerek sırayı değiştirebilir (v2, ilk sürümde şart değil).
- Bağlama uygun **varsayılan** gelir: çalışma sonrası `soru + süre + seri`, deneme sonrası `net + netChange + countdown`.
- Seçim **hatırlanır** (AsyncStorage). Kullanıcı her seferinde baştan seçmesin.
- Bağlamda olmayan veri **gösterilmez** (deneme kartında "durak" yok).

### Etkileşim

Basit toggle çipleri. Seçili olan dolu, olmayan çerçeveli. Dokununca önizleme anında güncellenir. Sınıra ulaşınca ("4 seçildi") kalanlar soluklaşır.

---

## 5. ETİKETİN İÇERİĞİ

**Her zaman, kaldırılamaz:**
- Maraton ikonu + `maraton` yazısı
- Küçük bir grafik (ilerleme hattı)

**Seçime bağlı:** 1-4 veri.

**Olmayacaklar:**
- QR kod — story'yi telefonuyla izleyen kişi okutamaz, ikinci cihaz gerekir
- Ders renkleri — küçük boyutta gürültü oluyor, anlamı okunmuyor
- Tarih, kullanıcı adı, avatar — mahremiyet ve sadelik

**Renk:** Beyaz metin, koyu yarı saydam zemin, tek vurgu rengi (bugün noktası). Etiket her fotoğrafın üstünde okunabilir olmalı — açık, koyu, kalabalık fark etmeksizin. Bu yüzden zeminsiz varyant riskli.

**Boyut:** ~1000 px genişlik, yükseklik içeriğe göre. Instagram sticker önerisi 640×480 ama pano yolunda bu kısıt geçerli değil; net görünmesi için 2x çöz.

---

## 6. UYGULAMA AKIŞI — kullanıcı ne görecek

1. Çalışma biter → özet ekranında **"Story'ye at"** butonu
2. Paylaşım ekranı açılır, varsayılan verilerle önizleme hazır
3. Kullanıcı isterse veri değiştirir
4. `Kopyala ve Instagram'ı aç` → 
   - PNG üretilir, panoya kopyalanır
   - **Yönlendirme mesajı** gösterilir: *"Kopyalandı. Instagram'da fotoğrafını seç, ekrana basılı tutup Yapıştır'a dokun."*
   - Instagram açılır
5. Android'de aynı buton **"Galeriye kaydet ve Instagram'ı aç"** olur, mesaj: *"Kaydedildi. Instagram'da story'ni aç, sticker menüsünden fotoğraf ekle."*

**Yönlendirme mesajı kritik.** Bu akış kullanıcıya sezgisel gelmiyor; Strava'da da insanların takıldığı yer burası. Mesaj olmadan özellik kullanılmaz.

İlk kullanımda mesaj daha uzun ve açıklayıcı olabilir; sonrakilerde kısa toast yeter.

---

## 7. SINIR DURUMLARI

- **Instagram kurulu değil** → sistem paylaşım sayfasına düş, mesajı ona göre değiştir
- **Veri yok / yeni kullanıcı** → seri 0, soru 0 ise paylaşım butonu gösterilmesin. Boş övünme kartı kötü his verir
- **Galeri izni reddedildi (Android)** → sistem paylaşım sayfasına düş
- **Görsel üretimi başarısız** → hata yut ma, kullanıcıya söyle ve tekrar dene seçeneği ver
- **Çok uzun değer** → `1.284 soru` gibi binlik ayraçlı değerler taşmamalı, tabular-nums kullan

---

## 8. ÖLÇÜM

Bu bir büyüme özelliği; ölçülmezse geliştirilemez. Şu olaylar gerekli:

- `share_sheet_opened` — kaynak parametresiyle (study / trial / streak / profile)
- `share_metrics_changed` — hangi veriler seçildi (hangi kombinasyonlar popüler?)
- `share_copied` — platform + seçili veriler
- `share_saved_to_gallery`
- `share_fallback_used` — Instagram yoksa

İki hafta sonra bakılacak soru: **hangi veri kombinasyonu en çok paylaşılıyor?** Ona göre varsayılanı değiştir.

---

## 9. KAPSAM DIŞI (şimdilik)

- Uygulama içinde fotoğraf seçme/düzenleme — gereksiz, Instagram zaten yapıyor
- Instagram resmî paylaşım API'si — Facebook App ID gerektiriyor ve istediğimiz akışı vermiyor
- Video/animasyonlu etiket
- TikTok entegrasyonu (aynı PNG oraya da yapıştırılabilir, ayrı iş gerekmiyor)
- Etiket teması/rengi seçimi — v2

---

## 10. BAŞARI ÖLÇÜTÜ

- Çalışma kaydeden kullanıcıların **%5'i** en az bir kez paylaşım ekranını açıyor
- Paylaşım ekranını açanların **%40'ı** kopyalama/kaydetme adımını tamamlıyor
- İlk ay: en az 3 farklı veri kombinasyonu anlamlı oranda kullanılıyor (yani seçici gerçekten işe yarıyor)

İkinci maddenin düşük çıkması, yönlendirme mesajının yetersiz olduğu anlamına gelir — orayı düzelt.
