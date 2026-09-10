# FAZ 1.5 · Ekran Envanteri

Kaynak: `Maraton Uygulama.dc.html` (170 artboard, 2026-09-10 export) + dosyanın kendi
AKIŞ HARİTASI bloğu. Sınıflandırma tasarımın kendi gruplamasından türetildi.

**Karar (2026-09-10):** AKIŞ 10 · SOSYAL tamamen v1 dışı. Düşen 10 artboard:
Topluluk, Lig, Davet, Yol Arkadaşın, Arama, Soru Sor, Cevap Yaz + Topluluk Boş,
Lig Boş, Arama Sonuç Yok. FAZ 2.6 (yol arkadaşı veri modeli) iptal.
Sonuç: **170 → 160 artboard.**

## Sonuç sayıları

| | Adet |
|---|---|
| Gerçek navigation hedefi | **95** |
| Bileşen modu / varyant / durum | 61 |
| Bizim ekranımız olmayan (OS, widget) | 2 |
| v1 dışı (sosyal) | 10 |

Yol haritası ~120 hedef bekliyordu; 94 çıktı. 66 artboard ekran değil, bileşen durumu.

---

## Navigation hedefleri (94)

### AKIŞ 1 · Günlük döngü — 7
Ana Sayfa · Çalışma Oturumu · Oturum Bitti · Sırada Ne Var · Günün Özeti ·
Haftalık Özet · Ayın Özeti

### AKIŞ 2 · Rota derinliği — 7
Rota Detay · Rotanın tamamı · Durak Detayı · Ara Verme · Senaryolar ·
Bölüm Eşiği · Rotayı Yeniden Çiz

### AKIŞ 3 · Veri girişi — 3
Hızlı Ekle · Deneme Gir (3 adımlı tek sihirbaz) · Deneme Detayı

### AKIŞ 4 · Deneme kayıt varyantları — 4
Fotoğraftan Oku · Okuma Onayı · Kaydı Düzenle · Deneme Özeti

### AKIŞ 5 · Analiz ve defter — 6
Analiz · Deneme Kayıtları · Konu İlerlemesi · Yanlış Defteri ·
Öncelikli Konular · Deneme Karşılaştırma

### AKIŞ 6 · Yanlış defteri akışı — 5
Yanlış Ekle · Yanlış Detayı · Soru Detayı · Tekrar · Tekrar Bitti

### AKIŞ 7 · Plan ve duraklar — 14
Yol Haritası · Program Hub · Takvim ve Seri · Gün Detayı · Program ·
Ders Programı · Takvim · Durak Ekle · Konu Detayı · Ders Konuları ·
Konu Borcu · Plan vs Gerçek · Boşluğu Kapatma Planı · Aylık Plan

### AKIŞ 8 · Oturum detayları — 2
Oturumu Etiketle · Çalışma Geçmişi

### AKIŞ 9 · Profil — 5
Profil · Seviye · Kilometre Taşı · Paylaşım Kartı · Neye Göre Öneriyoruz

### AKIŞ 11 · Ayarlar — 10
Ayarlar · Profil Düzenle · Bildirimler · Görünüm · Gizlilik · Belge ·
Veri İndir · Hesap Silme · Hedef Düzenle · Tarih Seçici

### AKIŞ 12 · Hesap ve ilk kurulum — 11
Karşılama · Giriş · Kayıt · Şifre Sıfırla · Hedef Seç · Bölümler ·
Tercih Listesi · Seviye Testi · Rota Hazır · Bildirim İzni · İlk Gün

### AKIŞ 13 · Premium — 3
Premium · Abonelik · Abonelik İptali

### AKIŞ 13A · İlk 7 gün — 5
İlk 7 Gün · İlk Rotan Hazır · Çalışman İşlendi · Bir Hafta · 8. Gün

### AKIŞ 13B · Premium anları — 1
Pro Önizleme

### AKIŞ 14 · Zamana bağlı durumlar — 6
Geri Döndün · Geri Dönüş · Sınav Günü Planı · Sınav Sonucu ·
Tahmin Doğruluğu · Deneme Provası

### AKIŞ 15 · Ödeme — 2
Ödeme · Kart · Deneme Bitti

### AKIŞ 16 · Tamamlama anları — 3
Gün Tamamlandı · Hafta Tamamlandı · Rota Tamamlandı  *(hepsi modal)*

---

## Bileşen modu / varyant / durum (63) — ekran YAZILMAZ

### Tek bileşen, çok mod
| Bileşen | Mod sayısı | Artboardlar |
|---|---|---|
| `StoryCard` | 8 | Story · ÇALIŞMA GÜNÜ / SORU / DURAK / HAFTALIK ROTA / GERİ DÖNÜŞ / RİTİM / SIRADAKİ DURAK / ROTA HAREKETİ + Kart Modları |
| `Paywall` | 6 | Paywall Anı · Karşılaştırma · Senaryolar · OCR · Geçmiş · Rapor |
| `EmptyState` | 6 | Deneme Kayıtları Boş · Analiz Veri Yetersiz · Öncelikli Konular Boş · Çalışma Geçmişi Boş · Bildirimler Boş · Seri Sıfır |
| `ErrorState` | 4 | Oturum Kaydedilemedi · Bildirim İzni Reddedildi · Sunucu Hatası · OCR Okunamadı |
| `ProPreview` | 3 | Önizleme · OCR / Geçmiş / Tempo |
| `Dialog` | 2 | Onay · Uyarı |
| `NotificationPreview` | 1 | Bildirim Halleri |

### Ekran varyantı (aynı ekranın farklı veri/gating hali)
- **Ana Sayfa:** Boş Durumlar · Ücretsiz Ana Sayfa
- **Ayın Özeti:** Ayın Özeti Tipografik
- **Rota Detay:** Rota Donduruldu · Boş Rota
- **Gün Detayı:** Boş Gün
- **Kaydı Düzenle:** Kayıt · Ölçülmüş / Kayıt · Elle
- **Deneme Detayı:** Zor Deneme · Fotoğrafa Dön
- **Konu Borcu:** Borç Dağıtıldı
- **Tahmin Doğruluğu:** Tahmin Şaştı
- **Şifre Sıfırla:** Bağlantı Gönderildi
- **Karşılama:** Kurulum Yarım
- **Oturumu Etiketle:** Oturum Kurtarıldı
- **Ödeme · Kart:** Ödeme İşleniyor · Ödeme Başarılı · Ödeme Başarısız
- **Deneme Gir:** Deneme Kotası Doldu

### Tema varyantı — ekran değil, `ThemeContext` çıktısı
Açık Tema Ana Sayfa · Açık Tema Defter

### Uygulama geneli durum
Yükleniyor (`Skeleton`) · Bağlantı Yok (`OfflineBanner`) · Boş Durum (jenerik) ·
Küçük Ekran (375×667 responsive kontrolü)

### Zaman tabanlı global mod — ekran değil, `ExamContext` bayrağı
Son Hafta · Sınav Günü · Son Hafta Geride · Geri Dönüş Modu

---

## Bizim ekranımız olmayan (2)
- **Sistem İzni** — OS bildirim izni diyaloğu, çizilemez/kodlanmaz
- **Kilit Ekranı** — lock screen widget / Live Activity, navigation hedefi değil

---

## FAZ 1.6'ya not
`src/constants/screens.js` bu 94 hedefe göre yazılacak. Sekmeler:
**BUGÜN · ROTA · PROGRAM · ANALİZ · PROFİL** (5 sekme).
Sekme kökleri: Ana Sayfa · Rota Detay · Program Hub · Analiz · Profil.

---

## Düzeltme · 2026-09-10 (artboard'lar satır satır okundu)

İlk sınıflandırmada AKIŞ 18'in altı artboard'ının hepsini `ErrorState` modu saymıştım.
Gerçek içerik okununca üçü öyle değil:

- **Form Hatası** → durum ekranı DEĞİL. "Deneme gir · 2/3" formunun içinde canlı
  doğrulama: *"Toplam 48, soru sayısı 40 · Yanlışı 8 düzelt"*. Hata alanın yanında
  değil hesabın kendisinde gösteriliyor. Bu bir **doğrulama deseni**, `TrialEntry`
  formunun parçası. Zod şeması + inline hata satırı olarak yazılacak.
- **Çevrimdışı Kuyruk** → gerçek bir **navigation hedefi**. Kuyruktaki kayıtları
  listeliyor (oturum, defter kaydı, durak · her biri BEKLİYOR etiketli). `ErrorState`
  değil, kendi ekranı. **94 → 95 hedef.**
- **OCR Okunamadı** → `ErrorState` preset'i olarak kalıyor ama fotoğraf önizlemesi +
  "İYİ SONUÇ İÇİN" ipucu kartı gerektiriyor; `hint` alanı bu yüzden var.

Ayrıca **Analiz Veri Yetersiz** ve **Seri Sıfır** düz `EmptyState` değil — ikisi de
kahraman sayı içeriyor (55,95 net · 0 gün), o yüzden `EmptyState` bir `children`
yuvası taşıyor.

Metinler `src/constants/stateCopy.js`'e tasarımdan birebir alındı — uydurulmadı.
