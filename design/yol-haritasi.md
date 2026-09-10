> **DURUM (2026-09-10): BU BELGE KISMEN BAYAT.**
> Guncel gercek su uc dosyada:
> - `design/ekran-envanteri.md` — 166 artboard -> 95 nav hedefi
> - `design/akis-denetimi.md` — 22 dogrulanmis akis hatasi + 10 fazli kodlama sirasi
> - `.claude/.../memory/project_tasarim-aktarimi.md` — kararlar ve faz durumu
>
> Bu belgedeki DOGRULANMIS hatalar:
> - **FAZ 0 bitti.** Round-2 dondu, olculdu: 11px alti metin 1392 -> 0.
> - **FAZ 1.3 / 1.4 bitti** (tokenlar + Archivo/Bricolage fontlari).
> - **FAZ 2'nin tamami fiilen bitti** (2.1 durak durumlari, 2.2 zorluk katsayisi,
>   2.3 tempoScenario, 2.4 kota, 2.7 testler 55/55). Kalan: LOCKED durumu (2.5'e bagli).
> - **FAZ 2.6 (yol arkadasi) IPTAL** — sosyal v1 disi.
> - **FAZ 3.1 sirasi YANLIS.** "Once olu bilesenleri sil" diyor; GlassCard 23
>   dosyada, simdi silmek 23 ekrani kirar. Silme ekran gocunden SONRA.
> - **5 sekme varsayimi YANLIS.** Tasarim 4 sekme + orta FAB
>   (ROTA · PROGRAM · [+] · ANALIZ · PROFIL). Mevcut kod zaten boyle.
> - **Fiyatlar** kodda duzeltildi: aylik ₺149, yillik ₺1.068 (₺89/ay).

# Maraton · Tasarımdan Çıkışa Yol Haritası

Bu belge "ne yapacağım" sorusunun tam cevabı. Sıra önemli — üstteki bitmeden alttakine başlamak geri dönüş yaratır.

---

## FAZ 0 · Tasarımı kapat

Kod yazmadan önce tasarımın donması gerekiyor. Yoksa yazdığın ekran bir hafta sonra değişir.

- [ ] **0.1** 1. tur prompt dönüşünü ölç. Dosyayı indir, aynı ölçümleri çalıştır: 11px altı metin sayısı, `--text4`/`--text5` kullanımı, 44px altı dokunma alanı, takvim tutarlılığı. Kapandı mı, sayıyla doğrula.
- [ ] **0.2** **C5 kararını ver:** Sosyal (Topluluk, Lig, Arama, Soru Sor, Cevap Yaz) ve XP v1'de var mı? Bu karar 6–11 ekranı ve Profil'in yapısını doğrudan belirliyor.
- [ ] **0.3** 2. tur prompt'u gönder (ürün + çekicilik). 4 yeni ekran + 4 yeniden yazım.
- [ ] **0.4** 2. tur dönüşünü ölç.
- [ ] **0.5** **Tasarımı dondur.** "v1 kanon" olarak etiketle. Bundan sonraki tasarım değişiklikleri v1.1 kuyruğuna gider.

---

## FAZ 1 · Zemin

Tek satır ekran kodu yazmadan önce bitmesi gerekenler.

- [ ] **1.1** **Canlı Supabase'den şema çıkar.** Migration dosyalarına güvenme — 64 dosya var ve canlı DB ile senkron olmadığı daha önce doğrulandı. Gerçek tabloları, kolonları ve RLS politikalarını canlıdan al.
- [ ] **1.2** **Şema farkını çıkar.** Yeni tasarımın gerektirdiği ve canlıda olmayanlar: durak durumu alanı, yayın zorluk katsayısı, aylık deneme kotası sayacı, yol arkadaşı ilişkisi, premium gating alanları.
- [ ] **1.3** **`src/themes/tokens.js`'i yeniden yaz.** Tasarımdaki `:root` bloğu kaynak: accent `#E5343F`, bg `#1C1C23`, surface `#26262F`, elev `#30303B`, border `#3E3E4B`, text1–5, ders renkleri, radius ölçeği (12/20/24/42), buton kademeleri (52/46/44). Mevcut mor palet (`#8b5cf6`) tamamen gidiyor.
- [ ] **1.4** **Fontları değiştir.** Inter + Space Grotesk → **Archivo + Bricolage Grotesque**. `app.json` ve font yükleme katmanı.
- [ ] **1.5** **Ekran envanteri çıkar.** 166 tasarım ekranından kaçı gerçek navigation hedefi, kaçı bileşen durumu (9 boş liste durumu, 6 hata, 8 story kartı, 5 paywall varyantı, 3 önizleme, sistem durumları → bunlar ekran değil, bileşen modu). Beklenen: ~120 gerçek hedef.
- [ ] **1.6** **`src/constants/screens.js`'i yeni envantere göre yaz.** Navigasyon yapısı buradan çıkacak.

---

## FAZ 2 · Motor eksikleri

Mevcut motor (`src/domain/` + `src/lib/routeEngine.js` + `netForecast.js`) büyük ölçüde tasarıma uygun. Eksik altı madde:

- [ ] **2.1** **Durak durumları.** 7 durum sabiti tanımla (tamamlandı / aktif / sırada / yeniden planlandı / atlandı / kilitli / donduruldu) ve `buildRoute` çıktısına ekle. Rota görselinin tamamı buna bağlı — önce bu.
- [ ] **2.2** **Yayın zorluk katsayısı.** `trialModel.js`'e normalize net ekle: ×0,94 / ×1,00 / ×1,12 / ×1,22. Rota hesabı ham net değil normalize net kullanacak.
- [ ] **2.3** **`simulateScenario` yeniden yaz.** Şu an "haftada X soru → kaç hafta" döndürüyor; tasarım "haftada %10 fazla → 73 net (+5), band şu" istiyor. `forecastNet` ile birleştir.
- [ ] **2.4** **Aylık deneme kotası sayacı.** Ücretsizde ayda 4. Ay dönümünde sıfırlanır.
- [ ] **2.5** **`paywallGate.js`'i genişlet.** Şu an sadece "ilk 7 gün paywall açılmaz" kuralını biliyor. Yeni free/pro tablosu eklenecek: rota, tahmin bandı, senaryolar, konu ilerlemesi, karşılaştırma, OCR, bölüm eşiği, aylık rapor → Pro.
- [ ] **2.6** **Yol arkadaşı veri modeli.** Davet kabul → karşılıklı bağ → iki rotanın yan yana gösterimi.
- [ ] **2.7** Bu altı maddenin testleri.

---

## FAZ 3 · Bileşen kitaplığı

Ekran yazmadan önce bileşenler. Yoksa her ekranda yeniden icat edilir.

- [ ] **3.1** **Ölü bileşenleri sil:** `GlassCard`, `GlowBackground`, `SparkBurst`, `Spot` — glassmorphism dönemi, yeni tasarımda karşılığı yok.
- [ ] **3.2** **Temel bileşenler:** Button (3 kademe: 52/46/44), Card (r20/r24), SectionLabel, StatBlock, EmptyState, **LockedValue** (bulanık değer + kilit ikonu — free/pro için her yerde lazım), Skeleton, ErrorState.
- [ ] **3.3** **Rota grafiği bileşeni.** Projenin en zor tek bileşeni: geçmiş dolu çizgi, bugün dolu düğüm, gelecek noktalı çizgi, tahmin bandı, projeksiyon, 7 durum için ayrı düğüm şekli. Buna tek başına zaman ayır.
- [ ] **3.4** **Story kartı bileşeni** — 8 mod, 9:16.
- [ ] **3.5** **Paywall bileşeni** — 5 bağlam + Pro Önizleme.

---

## FAZ 4 · Ekranlar

Akış akış. Bu sıra "her adımda çalışan bir uygulama" ilkesine göre kurulu.

- [ ] **4.1** **AKIŞ 12 · Hesap ve ilk kurulum** (14 ekran). Önce bu — olmadan hiçbir şey test edilemez.
- [ ] **4.2** **AKIŞ 1 · Günlük döngü** (9 ekran) + **AKIŞ 13A · İlk 7 Gün** (5 ekran). Çekirdek deneyim. Buraya kadar geldiğinde elinde test edilebilir bir uygulama var.
- [ ] **4.3** **AKIŞ 3 + 4 · Veri girişi ve deneme kayıt varyantları** (13 ekran).
- [ ] **4.4** **AKIŞ 2 · Rota derinliği** (8 ekran). 3.3'teki grafik bileşenine bağlı.
- [ ] **4.5** **AKIŞ 5 + 6 · Analiz ve yanlış defteri** (11 ekran).
- [ ] **4.6** **AKIŞ 7 · Plan ve duraklar** (16 ekran). En kalabalık akış.
- [ ] **4.7** **AKIŞ 13 + 13B + 15 · Premium, premium anları, ödeme** (18 ekran). Gelir buradan geliyor, atlanmaz.
- [ ] **4.8** **AKIŞ 8 + 9 + 11 · Oturum detayları, profil, ayarlar** (22 ekran).
- [ ] **4.9** **AKIŞ 14 + 16 + 17 + 18 · Zamana bağlı durumlar, tamamlama, boş listeler, hatalar** (36 ekran). Çoğu bileşen varyantı, hızlı gider.
- [ ] **4.10** **AKIŞ 10 · Sosyal** (6 ekran) — 0.2'deki karara bağlı. v1 dışıysa atla.
- [ ] **4.11** **AKIŞ 12B · Story kartları** (8 mod) — 3.4'e bağlı.

---

## FAZ 5 · Çıkış öncesi

- [ ] **5.1** **Erişilebilirlik doğrulaması.** Tasarımda ölçtüğümüz her şeyi kodda tekrar ölç: kontrast, metin boyutu, dokunma alanı. Ayrıca tasarımda yapılamayan iki şey: **Dynamic Type** (sistem yazı boyutu büyütülünce layout bozuluyor mu) ve **screen reader etiketleri**.
- [ ] **5.2** **375×667 gerçek cihaz kontrolü.** Ana Sayfa, Rota Detay, Program Hafta öncelikli.
- [ ] **5.3** **Düşük profil cihaz testi.** Liste performansı (FlatList + memo + keyExtractor), animasyonların 60fps'te kalması, soğuk açılış süresi.
- [ ] **5.4** **Offline ve hata senaryoları.** Çevrimdışı kuyruk, oturum kurtarma, sunucu hatası, OCR başarısızlığı — tasarımda hepsi çizili, kodda çalıştığını doğrula.
- [ ] **5.5** **Abonelik altyapısı.** App Store / Play Store ürünleri, satın alma doğrulama, geri yükleme, iptal senkronizasyonu. Fiyat: Yıllık ₺1.068 (₺89/ay) · Aylık ₺149.
- [ ] **5.6** **KVKK ve veri.** Gizlilik metni, veri indirme, hesap silme (30 gün) — kodda var, uçtan uca doğrula. 18 yaş altı kullanıcı durumu netleşsin.
- [ ] **5.7** **Analytics olayları.** `src/constants/analytics.js` yeni akışlara göre güncellensin. En az: onboarding hunisi, ilk 7 gün adımları, paywall gösterim/dönüşüm, kota duvarı, deneme kaydı, oturum tamamlama.
- [ ] **5.8** **ASO / mağaza vitrini.** Başlık, alt başlık, anahtar kelimeler, açıklama, 5–6 ekran görüntüsü. Vitrin adayları: Ana Sayfa, Rota Detay, Günün Özeti, Ayın Özeti, Story kartı.
- [ ] **5.9** **TestFlight beta.** Gerçek YKS öğrencisiyle, en az 2 hafta, en az 20 kişi. Özellikle 8. gün kilit anının tepkisini ölç.

---

## Paralel yürüyebilecekler

- FAZ 0 (tasarım) ile FAZ 1.1–1.2 (şema çıkarımı) aynı anda gidebilir.
- FAZ 2 (motor) ile FAZ 3 (bileşenler) aynı anda gidebilir — biri veri, diğeri görsel.
- FAZ 5.5 (abonelik altyapısı) FAZ 4.7'den önce başlatılabilir, mağaza onayları zaman alır.

## Kritik bağımlılıklar

- **3.3 (rota grafiği) → 4.2, 4.4** — grafik bileşeni olmadan çekirdek ekranlar yazılamaz.
- **2.1 (durak durumları) → 3.3** — grafik 7 durumu bilmeden çizilemez.
- **2.5 (gating) → 4.2** — Ücretsiz Ana Sayfa varyantı gating olmadan yazılamaz.
- **1.3 (tokens) → tüm FAZ 3 ve 4** — token dosyası bitmeden hiçbir ekran yazılmasın.
- **0.2 (C5 kararı) → 1.5, 1.6, 4.10** — kaç ekran kodlanacağı buna bağlı.

## Tek cümlelik kural

**Tasarım donmadan kod, token bitmeden ekran, grafik bileşeni bitmeden rota ekranı yazılmaz.**
