# Maraton Uygulama.dc.html · Düzenleme Turu

Dosyanın tamamı (166 ekran) ölçüldü. Aşağıdaki maddeler kompozisyona dokunmadan, token ve değer seviyesinde düzeltilecek. Sıra önem sırasıdır.

## KORUNACAK — hiçbir maddede bunlara dokunma

- Ana Sayfa kompozisyon sırası: büyük soru sayısı → rota grafiği → hero CTA
- Rota çizgisinin görsel imzası ve 7 durum dili (dolu düğüm / halka / kesikli halka / çapraz / kilit / donuk)
- "Söz ve gerçek" kavramı ve dili
- Onboarding sırası ve "Hesap sonra. Önce rotanı görüyorsun." kararı
- İlk 7 Gün akışının paywall-kapalı kuralı
- Zor Deneme, Tahmin Şaştı, Boş Gün, Seri Sıfır, Geri Döndün ekranlarının suçlamayan tonu ve "tek küçük adım" kuralı
- Neye Göre Öneriyoruz ekranındaki "YAPMADIĞIMIZ ŞEY" bloğu
- Lig'in "netler ligde görünmez" kararı ve sıraya göre değişen cümle
- Story kartlarındaki "KÖTÜ HAFTA" modu
- Fiyat mimarisi: Yıllık ₺89/ay (₺1.068 tek ödeme) · Aylık ₺149/ay

---

## 1 · TİPOGRAFİ TABANI — en yüksek etkili madde

Dosyada 4.280 font bildiriminin **1.392'si (%33) 11px altında.** Bunların 239'u 9px veya altında. Telefonda okunmuyor.

**Kural: hiçbir metin 11px altına inmeyecek.** Yeni ölçek:

    8.5px  → 11px
    9px    → 11px
    9.5px  → 11px
    10px   → 11.5px
    10.5px → 11.5px   (617 adet — en kalabalık grup)

letter-spacing taşıyan büyük harf etiketlerde (`letter-spacing:.2em` gibi) 11px + .16em yeterli; harf aralığını .2em'den .16em'e indirerek satır genişliğini koru, böylece hiçbir etiket satırı taşmaz.

En yoğun ekranlar (önce bunlar):
Neye Göre Öneriyoruz (55) · Çevrimdışı Kuyruk (50) · Günün Özeti (31) · Ayın Özeti Tipografik (30) · Ayın Özeti (28) · Haftalık Özet (27) · Takvim ve Seri (27) · Ana Sayfa (22) · Rota Detay (21) · Program Hub (19) · Aylık Plan (19) · Analiz (17) · Profil (17) · Önizleme · Tempo (15)

9px ve altının en yoğun olduğu yerler ayrıca elden geçirilsin:
Neye Göre Öneriyoruz (20) · Takvim ve Seri (11) · Önizleme · Tempo (10) · Günün Özeti (9) · Haftalık Özet (9) · Tarih Seçici (8)

---

## 2 · RENK TOKENLARI — kontrast

Ölçülen değerler (zemin #1C1C23):

    --text2  #A3A0A8 → 6.57  OK
    --text3  #8C8996 → 4.95  zeminde OK / 3.81 --elev kart üstünde DÜŞÜK
    --text4  #6B6870 → 3.10  DÜŞÜK  (640 kullanım, 368'i 11px altında)
    --text5  #3B3941 → 1.49  DÜŞÜK  (63 kullanım)
    --accent #E5343F → 3.95  DÜŞÜK  metin rengi olarak 212 kullanım

Yapılacaklar:

**2a.** `--text3` değerini **#9794A0** yap. Kart yüzeylerinde (`--surface`, `--elev`) da 4.5:1'i geçer, zeminde 5.6 olur. Tek token, 1.059 kullanımı birden düzeltir.

**2b.** `--text4` bilgi taşıyan hiçbir yerde kullanılmayacak. 640 kullanımın tamamını tara; metin ise `--text3`e çek, yalnızca grafik ekseni / ızgara çizgisi / dekoratif ayraç ise kalsın. Öncelik: 9px'te kullanıldığı 186 yer.

**2c.** `--text5` yalnızca dev hayalet rakamlarda (56px, 96px) kalsın. 11px altındaki 43 kullanımı `--text3`e taşı.

**2d.** `--accent` metin rengi olarak kullanılmasın. 212 kullanımın 133'ü 10.5px ve altında. Hepsini **`--accent-bright` #FF4D57** yap (5.2:1 — zaten tanımlı, kullanılmıyor). Marka kırmızısı dolgu, çizgi ve grafik olarak kalmaya devam etsin; sadece yazı olduğunda parlak varyant.

**2e.** `--danger` root'ta #F0555F olarak doğru tanımlı ama üç ekranda `--danger:#E5343F` ile eziliyor: **Ana Sayfa · Günün Özeti · Çevrimdışı Kuyruk.** Bu üç ezmeyi sil. Yıkıcı işlem rengi marka renginden ayrı kalmalı.

---

## 3 · DOKUNMA ALANLARI — 96 öğe 44px altında

`cursor:pointer` taşıyan 96 öğe 44px'in altında. Hepsi 44px'e çıkacak; görsel yükseklik korunacaksa şeffaf padding ile hedef alanı büyütülsün.

Ekran ekran döküm:

    Yanlış Ekle            18  (3×36, 15×38)   ← en kötüsü, önce bu
    Deneme Gir 1/3          7  (7×38)
    Deneme Kayıtları        6  (2×34, 4×36)
    Analiz                  5  (4×36, 1×40)
    Arama Sonuç Yok         5  (1×16, 4×34)
    Arama                   4  (1×16, 3×34)
    Açık Tema Defter        4  (3×38, 1×40)
    Tercih Listesi          4  (1×32, 3×40)
    Soru Detayı             3  ·  Takvim 3 (1×32)  ·  Paylaşım Kartı 3 (34)
    Kart Modları            3  (42)  ·  Deneme Kayıtları Boş 3 (36)
    Aylık Plan 2 · Oturumu Etiketle 2 (34) · Kilit Ekranı 2 (42)
    Çalışma Geçmişi Boş 2 · Topluluk Boş 2 · Lig Boş 2 · Form Hatası 2

**Arama ve Arama Sonuç Yok ekranlarındaki 16px'lik öğe** (arama kutusundaki temizle "×" düğmesi) kritik — 44×44 dokunma alanı verilmeli.

---

## 4 · TAKVİM KURGUSU — tek kronoloji

Şu an "bugün" ekranlar arasında tutarsız. Tek kurgu sabitlensin:

    BUGÜN = 23 Haziran 2026
    SINAV = 20 Haziran 2027  (362 gün)

Düzeltilecekler:

- **Günün Özeti** → "24 MAYIS · PAZARTESİ" yazıyor. **23 Haziran** olacak. Bugünün özeti bugünle aynı gün olmalı.
- **Ayın Özeti** ve **Ayın Özeti Tipografik** → "1–31 MAYIS" kapanışı. Ya "1–31 Mayıs · geçen ayın kapanışı" diye açıkça etiketlensin, ya da 1–30 Haziran'a taşınsın. Şu an bugünle çelişiyor.
- **Haftalık Özet** → "16–22 HAZİRAN" doğru (geçen hafta). Başlığa "geçen hafta" ibaresi eklensin.
- **Takvim ve Seri** → içinde 7 Mayıs, 13 Mayıs, 26 Haziran, 30 Haziran, 4 Temmuz birlikte var. Tek aya (Haziran 2026) çekilsin.
- **Rota Donduruldu** → "sınava 488 gün var" yazıyor. Diğer 20 ekranda 362. **362**'ye getir.
- **Rota Tamamlandı** → 336 gün. Kronolojiye oturt.

Ayrıca tarih yazımı üç kurala insin: grafik/etiket "23 HAZ" · satır/başlık "23 Haziran" · yıl yalnızca farklı yıla atıfta "20 Haziran 2027".

---

## 5 · ANA SAYFA YOĞUNLUĞU

Ana Sayfa şu an 11 bilgi bloğu taşıyor: 47 GÜN serisi · 362 gün · BUGÜN ÇÖZÜLEN 63/100 · TYT+AYT · 71 net tahmini · rota grafiği · hero CTA · BUGÜNÜN DURAKLARI · KONU BORCU · DİKKAT ÇEKEN İKİ DERS · HAFTANIN DURAK RAPORU · defter rozeti.

Onboarding ve İlk 7 Gün akışı yeni kullanıcıyı doğru karşılıyor, sorun orada değil — sorun iki ay sonraki olgun kullanıcının gördüğü ekran.

**KONU BORCU** ve **HAFTANIN DURAK RAPORU** modülleri Ana Sayfa'dan kaldırılsın. İkisi de zaten ayrı ekran olarak var (Konu Borcu = AKIŞ 7, Haftanın raporu = Haftalık Özet). Yerlerine tek satırlık nötr giriş bağlantısı: "Konu borcu · 12 sa ›" ve "Bu haftanın raporu ›".

Kalan sıra: hero (sayı + rota + CTA) → BUGÜNÜN DURAKLARI → DİKKAT ÇEKEN İKİ DERS → iki nötr bağlantı satırı → defter rozeti.

---

## 6 · 375×667 VARYANTLARI

221 telefon çerçevesinin 219'u 390px sabit. Küçük ekran kontrolü yalnızca Seviye Testi'nde yapılmış — ve oradaki karar doğru: "buton alt şeride sabitlenmiş, içerik altından kayıyor."

Aynı kontrol, yoğunluğu en yüksek üç ekran için de yapılsın: **Ana Sayfa · Rota Detay · Program Hafta** — 375×667 varyantı olarak. Beklenen: hero bloğu ve tabbar aynı anda görünür kalır, grafik alanı kısalır, modüller sıkışmaz.

---

## 7 · XP SİSTEMİ KARARI

Seviye adları ("Hırslı", "Maratoncu") kaldırılmış, iyi. Ama XP hâlâ her tamamlama ekranında duruyor: Oturum Bitti (+XP), Günün Özeti (+160 XP; 4 durak +80 / 118 soru +60 / seri +20), Ayın Özeti (4.180 XP, Seviye 12 → 13'e 1.520 XP), Profil, Seviye, Kilometre Taşı.

Ürünün kendi cümlesi: *"Kutlama cümlesi yok, sayılar var... XP alt satırda sessiz duruyor — ödül rotanın kendisi."* Bu ikisi bir arada duramıyor.

**Karar ver ve tek yönde uygula:**

- **(A)** XP kalacaksa: Profil ve Seviye ekranlarına hapset, tamamlama ekranlarından (Oturum Bitti, Günün Özeti, Ayın Özeti) tamamen çıkar.
- **(B)** XP çıkacaksa: Seviye ve Kilometre Taşı ekranlarını "Yol künyesi" (soru · saat · gün · durak) üzerine kur, XP dilini tamamen sil.

Önerim (A) — mevcut ekran sayısını korur, tonu düzeltir.

---

## 8 · KÜÇÜK TUTARSIZLIKLAR

- **Deneme Gir 3/3** ile **Deneme Detayı** aynı denemeyi ("Karekök TYT 12") farklı sayılarla gösteriyor: 3/3'te ham 70,50 · ×1,12 · normalize 78,96; Detay'da ham 58,25 · ×1,04 · normalize 60,58. Tek sete indir.
- **Senaryolar** ekranında "Şimdiki tempo · SEÇİLİ · 68 net" yazıyor, ama Ana Sayfa ve Rota Detay "bu tempoyla sınav günü 71 net" diyor. Üçünü de **71**'e getir.
- **Ayın Özeti** ve **Ayın Özeti Tipografik** aynı ekranın iki varyantı. Hangisi kanon, üstüne "KANON" / "ALTERNATİF" etiketi konsun; koda alınırken hangisinin gideceği belirsiz kalmasın.

---

## ÇIKTI BEKLENTİSİ

Her madde uygulandıktan sonra kısa bir özet: hangi ekranlarda kaç değer değişti. Kompozisyon, metin içeriği ve akış sırası değişmeyecek — yalnızca boyut, renk tokeni, dokunma alanı, tarih değerleri ve 5. maddedeki iki modül taşıması.
