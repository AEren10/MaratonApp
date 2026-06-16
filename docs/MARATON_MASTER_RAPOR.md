# MARATON — Master Ürün, Gelir & Büyüme Raporu

> Hazırlayan: AFC (Product Lead)
> Tarih: 2026-06-16
> Amaç: App Store / Play Store yayını + sürdürülebilir gelir + organik büyüme
> Kapsam: Konumlandırma → Gelir modeli → Büyüme motorları → Orijinal/viral fikirler → Yol haritası → Metrikler

---

## İÇİNDEKİLER
1. Yönetici Özeti
2. Pazar & Ayrışma Stratejisi
3. Ürün Durumu (Audit)
4. Gelir Modeli & Fiyatlandırma
5. Free vs Premium Matrisi
6. Büyüme Motorları (Nasıl Büyürüz)
7. Orijinal & Viral Fikirler (Reklamı Kendini Yapan)
8. Sezonsal Oyun Planı
9. Yol Haritası (Fazlar)
10. Metrikler & Hedefler (KPI)
11. Ekonomi & Projeksiyon
12. Riskler & Azaltma
13. Önceliklendirme — Ne Önce Yapılmalı

---

## 1. YÖNETİCİ ÖZETİ (TL;DR)

Maraton, YKS (TYT/AYT) hazırlık pazarına yönelik **olgun ve teknik olarak ~%85 yayına hazır**
bir mobil uygulama (Expo SDK 54 + Supabase). Tam çalışma döngüsü, gamification, lig, deneme
analizi, yanlış defteri, spaced repetition ve sosyal mekanikler hazır.

**Tek kritik eksik: gelir katmanı ve büyüme döngüsü sıfır.**

Stratejinin özü üç cümle:
1. **İçerikle yarışma** (Tonguç, Benim Hocam, Kunduz orada güçlü) — **disiplin + ölçüm + sıralama
   tahmini** sat. Maraton'un Strava'sı ol.
2. **Freemium + abonelik:** Aylık ₺120, ama asıl **yıllık ₺690'ı sat** + 3 gün ücretsiz deneme.
3. **Reklamla değil döngüyle büyü:** Paylaşım kartları + grup daveti + TikTok organik.

Sıra disiplini: **Aktivasyon → Retention → Monetizasyon → Büyüme.** Bu sırayı bozarsan delik
kovaya su doldurursun.

---

## 2. PAZAR & AYRIŞMA STRATEJİSİ

### Acı gerçek
Rakipler "içerik satıyor" (video/soru/konu anlatımı). İçerik üretmek pahalı ve sen bu yarışı
kaybedersin. **O yüzden o oyunu hiç oynama.**

### Ayrışma ekseni
| Rakipler genelde | Maraton |
|---|---|
| İçerik / video satar | Disiplin + performans takibi satar |
| Pasif izleme | Aktif döngü: plan → çalış → deneme → yanlış → tekrar |
| "Şu kadar net yaptın" der | **"Bu netle ~X. sıradasın, hedefe Y net uzaktasın" der** |
| Sosyal yok / zayıf | Lig + grup + streak + challenge derinlemesine |
| Ağır, reklam dolu, eski UI | Temiz, modern, hızlı (dark, glass, Reanimated) |

### Tek cümlelik konumlandırma
> "Maraton içerik satmaz. Maraton seni her gün çalıştırır, ilerlemeni ölçer ve sıralamanı tahmin
> eder. Senin kişisel YKS koçun."

**Analoji:** Strava'nın koşucuya yaptığını YKS adayına yap. Strava video satmıyor — performans
takibi + sosyal disiplin satıyor ve dev oldu.

### İmza özellik (reklamın kalbi)
**Sıralama tahmini.** Bir öğrencinin en çok merak ettiği şey ve kimse net olarak vaat etmiyor.
Bütün pazarlama mesajını bunun etrafına kur.

---

## 3. ÜRÜN DURUMU (AUDIT)

### Güçlü yönler ✅
- Tam çalışma döngüsü kurulu (Plan, Çalışma kaydı, Deneme, Analiz, Yanlış defteri, SR tekrar).
- Gamification olgun: 20 seviye, XP motoru, rozetler, 5 kademeli haftalık lig.
- Veri altyapısı sağlam: 20+ migration, RLS, percentile views, offline queue, Sentry.
- Tutarlı tasarım sistemi (tokens, dark/light, Reanimated 4).
- Yayın altyapısı hazır: EAS config, release dokümanı, store checklist.

### Boşluklar / Riskler ⚠️
| Alan | Durum | Etki |
|---|---|---|
| Monetizasyon / paywall | Yok | 🔴 Gelir = 0 |
| Onboarding aktivasyonu ("aha moment") | Zayıf | 🟠 Retention riski |
| Push retention döngüsü | Kısmi | 🟠 |
| Analytics funnel ölçümü | Event sabitleri var, strateji yok | 🟠 Körlük |
| Referral / davet döngüsü | Yok | 🟠 Yavaş büyüme |
| ASO / store listing | Hazırlanmamış | 🟠 Keşfedilebilirlik |
| Paylaşım kartı viral mekaniği | Altyapı var, ürünleşmemiş | 🟡 Fırsat |

---

## 4. GELİR MODELİ & FİYATLANDIRMA

### Model: Freemium + Maraton+ aboneliği (RevenueCat ile)
YKS hazırlığı 1 yıllık süreç → abonelik LTV'yi maksimize eder. Yıllık satış sezon ölümünü absorbe
eder.

### Fiyat tablosu
| Plan | Fiyat | Rol |
|---|---|---|
| Aylık | **₺120/ay** | Esnek giriş, psikolojik çapa |
| **Yıllık** | **₺690/yıl** (≈₺57/ay) | **Asıl satılacak plan** — "en çok tercih edilen" |
| Sınav paketi | Eyl–Haz (10 ay) ₺590 | YKS takvimine kilitli alternatif |

Kurallar:
- **3 gün ücretsiz deneme** zorunlu → dönüşümü ~2x artırır.
- Yıllığı varsayılan/öne çıkan seç. Aylık ₺120 yanında yıllık "bedava gibi" görünür (anchoring).
- Sınav öncesi (Şub–Haz) kampanya: yıllık %40 indirim.

### İkincil gelir (sonra)
- Ödüllü reklam (free kullanıcıya): reklam izle → streak freeze kazan.
- İleride: koçluk / soru paketi (yüksek fiyat, düşük hacim).

### Paywall stratejisi (en kritik nokta)
- **Çekirdek döngüyü ASLA kilitleme** (çalışma kaydı, deneme girişi, temel takip). Free sürüm tek
  başına işe yaramalı — yoksa kimse kalmaz, kimse önermez.
- Paywall'ı **değerin hissedildiği anda** göster: 6. deneme girişi, zayıf alan raporu tıklaması,
  sıralama senaryosu denemesi, AI plan talebi.
- Soğuk paywall (açılışta) = ölüm. Önce değer ver, sonra iste.

---

## 5. FREE vs PREMIUM MATRİSİ

| Özellik | Ücretsiz | Maraton+ |
|---|---|---|
| Çalışma kaydı / timer / streak | ✅ | ✅ |
| Deneme girişi | Son 5 deneme | ♾️ Sınırsız geçmiş |
| Analiz | Temel grafik | **Trend + sıralama tahmini + "ne yaparsam" senaryoları** |
| Yanlış defteri | 50 yanlış | ♾️ Sınırsız + akıllı tekrar (SR) |
| Günlük plan | Basit otomatik | **Kişisel akıllı plan + roadmap** |
| Zayıf alan analizi (WeakAreas) | 🔒 | ✅ |
| Haftalık koç raporu | 🔒 | ✅ |
| Hayalet Sınav (yanlışlardan deneme) | 🔒 | ✅ |
| Maraton Wrapped (yıl sonu) | Özet | Tam + tüm kartlar |
| Reklamsız + tüm temalar/avatarlar | — | ✅ |

**İlke:** Free = değerli demo değil, gerçekten kullanışlı. Premium = sınırsızlık + zeka +
kişiselleştirme + güç kullanıcı.

---

## 6. BÜYÜME MOTORLARI (NASIL BÜYÜRÜZ)

Tek geliştirici + performans reklamı bütçesi yok → büyüme **organik + viral** olmak zorunda.
Üç motor:

### Motor 1 — Paylaşım Döngüsü (ücretsiz dağıtım)
Öğrenciler başarılarını paylaşmaya bayılır. Ürünün içine göm:
- Story kartları: "Bu hafta 1.240 soru çözdüm 🔥", "Bugün 6 saat", "Yeni rekor: 92 net".
  Instagram/TikTok story formatı, marka filigranlı. (Altyapı `ShareCard` mevcut.)
- Her paylaşım = bedava reklam. Hedef: aktif kullanıcı başına ayda 1+ paylaşım.
- Kayıp bile viral: "47 günlük serim bitti 💔" → arkadaşlar yorum yapar, indirir.

### Motor 2 — Davet / Referral Döngüsü
- "Arkadaşını davet et → ikinize 1 hafta Maraton+ / 1 streak freeze."
- Lig + grup zaten sosyal → "arkadaşını lige davet et, birlikte yarışın." Öğrenci tek başına değil
  **grup halinde** çalışır. En güçlü viral kanal bu.
- Hedef viral katsayı: K ≥ 0.3.

### Motor 3 — İçerik Pazarlaması (TikTok / Instagram)
YKS adayı TikTok'ta yaşıyor. Reklam alma, organik üret:
- "Çalışma rutini", "deneme analizi nasıl yapılır", "net hesaplama" kısa videolar → bio'da link.
- Mikro-influencer (5–50K studygram/study-tok) ile barter: ücretsiz premium karşılığı story.
- Reddit / Ekşi / YKS Discord sunucularında organik varlık.

---

## 7. ORİJİNAL & VİRAL FİKİRLER (Reklamı Kendini Yapan)

### Big-Idea (kampanya taşıyıcı)
1. **Sıralama Yıldönümü / Canlı Tahmin:** Hedefe göre canlı sıralama tahmini, her denemede oynar.
   Slogan: "Sıralamanı sınavdan önce gör."
2. **"Ne Yaparsam?" Simülatörü:** "Mat netimi 5 artırırsam" → sıralama anında zıplar. Çok paylaşılır.
   Slogan: "Hayalindeki bölüme kaç net uzaktasın? Kaydır, gör."
3. **Rakip Mod (anonim eşleşme):** Aynı hedefe çalışan eşit seviye anonim rakiple haftalık düello.
   Slogan: "Senin hedefine çalışan biri daha var. Onu geçebilir misin?"

### Viral içerik / paylaşım
4. **Maraton Wrapped (Spotify Wrapped'in YKS hali):** Yıl sonu kişisel animasyonlu özet
   ("14.320 soru, 840 saat, en uzun seri 63 gün"). Her Haziran kendiliğinden patlayan edinim dalgası.
5. **Çalışma Karnesi:** GitHub ısı haritası tarzı haftalık paylaşılabilir kart. Studygram kültürü.
6. **Streak Mezar Taşı:** "R.I.P. 🪦 47 günlük serin." Acı + mizah = paylaşım.

### "Kimse yapmadı" türü ürün
7. **Hayalet Sınav:** Kullanıcının kendi yanlışlarından üretilmiş kişisel deneme. En yüksek öğrenme
   getirisi. Slogan: "Senin yanlışlarından kurulu deneme."
8. **Sabah Brifingi:** Veriye dayalı tek emir push'u ("Bugünün tek kritik işi: Türev tekrarı").
   Generic hatırlatma değil → retention'ı uçurur.
9. **Veli Modu (gizli B2B2C silahı):** Öğrenci izin verirse veliye "çalıştı/çalışmadı + moral"
   özeti (not/sıralama değil). **Ödemeyi veli yapar** → dönüşümü ikiye katlar.
10. **Geri Sayım Widget'ı:** Ana ekran widget — kalan gün + bugünkü tek hedef + seri ateşi.
    Günde 100 kere görülen bedava reklam + dürtü.

### Kampanya sloganları
- "Çalışıyorsun. Ama ilerliyor musun? Maraton söyler."
- "Hayalindeki sıralama kaç net uzakta? Öğren."
- "Dershane sana ne kadar çalıştığını sormaz. Maraton sorar."
- "YKS yalnız koşulmaz."

---

## 8. SEZONSAL OYUN PLANI

YKS uygulaması mevsimseldir. Buna göre oyna:
- **Eylül–Ekim (okul açılışı):** En büyük edinim penceresi → lansmanı buraya denk getir.
- **Şubat–Haziran (sınav paniği):** Para kazanma altın çağı → deneme sıklığı ve ödeme isteği zirvede,
  kampanya zamanı.
- **Temmuz–Ağustos (ölü sezon):** Yıllık abonelik taşır + yeni yıl adaylarına "erken kayıt".
- Genişleme valfi: **LGS / KPSS** — aynı motor, farklı sezon, geliri dengeler.

---

## 9. YOL HARİTASI (FAZLAR)

### 🟥 Faz 0 — Yayına Çıkış (0–3 hafta) "Ship it"
- DEV_BYPASS=false, console.log temizliği, PlaceholderScreen sil.
- Tüm migration'lar prod Supabase'de + RLS testi + storage bucket'lar.
- App icon, splash, 3+ screenshot, store açıklaması (TR/EN), privacy policy URL.
- EAS production build → TestFlight / Internal track.
- Sentry prod DSN + temel analytics event'leri canlı.

### 🟧 Faz 1 — Aktivasyon & Retention (3–6 hafta) "Make them stay"
- Onboarding'de aha moment: ilk hedef/deneme → anında sıralama tahmini.
- Push retention: günlük plan hatırlatma, streak risk uyarısı (smartNudge → bildirim), haftalık rapor.
- Empty state → ilk aksiyon yönlendirmeleri.
- D1/D7/D30 retention + funnel ölçümü (PostHog / Amplitude ücretsiz tier).
- Sabah Brifingi (#8) prototipi.

### 🟨 Faz 2 — Monetizasyon (6–10 hafta) "Turn on revenue"
- RevenueCat + IAP ürünleri (aylık/yıllık + 3 gün trial).
- usePremium() + feature gating util + değer odaklı paywall ekranı.
- Paywall tetikleyicileri (6. deneme, WeakAreas, AI plan, sınırsız yanlış).
- Supabase subscriptions tablosu + entitlement webhook.
- Soft paywall → A/B test → fiyat testi (₺120 vs ₺99 aylık).

### 🟩 Faz 3 — Büyüme (10–16 hafta) "Grow the loop"
- Referral sistemi (davet → karşılıklı premium/streak freeze).
- Paylaşım kartları ürünleşmesi (story formatı) + Maraton Wrapped.
- Grup/lig viral davet döngüsü.
- ASO (yks, tyt, ayt, deneme takip, sıralama hesaplama).
- TikTok/Instagram organik içerik + mikro-influencer barter.

### 🟦 Faz 4 — Ölçeklenme (16+ hafta)
- "Ne Yaparsam" simülatörü + Rakip Mod.
- Veli Modu (B2B2C).
- AI koç (LLM destekli plan + motivasyon).
- LGS/KPSS'ye genişleme.

---

## 10. METRİKLER & HEDEFLER (KPI)

**North Star Metric:** Haftalık aktif çalışan kullanıcı (haftada ≥1 çalışma + ≥1 deneme).

| Faz | Birincil KPI | Hedef |
|---|---|---|
| 0 | İndirme (90 gün) | 1.000 |
| 1 | Aktivasyon (ilk deneme girişi) | %50+ |
| 1 | D7 retention | %30+ |
| 2 | Free → Premium dönüşüm | %3–5 |
| 2 | Trial → Paid | %25+ |
| 3 | Viral katsayı (K) | 0.3+ |
| Tüm | MRR (ilk hedef) | ₺20–25K/ay |

İndirme sayısı yalan söyler; North Star metrik söylemez.

---

## 11. EKONOMİ & PROJEKSİYON (kaba)

- 10.000 aktif kullanıcı × %4 dönüşüm = 400 premium × ~₺60/ay (yıllık ort.) ≈ **₺24K/ay MRR**.
- 50.000 kullanıcıda ≈ **₺120K/ay MRR** — asıl hedef ölçek.
- Tek geliştirici + organik büyüme ile 12–18 ayda 50K ulaşılabilir — **eğer retention ve viral
  döngü çalışırsa.**

---

## 12. RİSKLER & AZALTMA

| Risk | Olasılık | Azaltma |
|---|---|---|
| Düşük retention → para kazanılamaz | Yüksek | Faz 1'i atlamadan monetizasyona geçme |
| Sezon ölümü (YKS sonrası) | Yüksek | Yıllık abonelik + LGS/KPSS genişleme |
| App Store reddi (IAP/privacy) | Orta | Release checklist + test hesabı + privacy form |
| İçerik yok → ilk değer düşük | Orta | Onboarding aktivasyonu + "kendi verini gör" değeri |
| Tek geliştirici hızı | Orta | Faz bazlı küçük sürümler + OTA update |
| Viral döngü çalışmazsa büyüme durur | Orta | Paylaşım kartlarını erken test et, ölç |

---

## 13. ÖNCELİKLENDİRME — NE ÖNCE YAPILMALI

Hepsini yapma. Bu sırayla git:

1. **Faz 0'ı bitir** → mağazada ol (mevcut işin %90'ı zaten hazır).
2. **Aktivasyon: sıralama tahmini onboarding'e** → ilk açılışta aha moment.
3. **Retention: Sabah Brifingi + streak risk push'u** → kullanıcı kalsın.
4. **Maraton Wrapped + Paylaşım kartları** → bedava viral dağıtım (düşük efor, yüksek getiri).
5. **Sonra Monetizasyon (RevenueCat + paywall)** → retention oturduğunda.
6. **Sonra Büyüme döngüsü (referral + Veli Modu)** → para akarken ölçekle.

> Altın kural: **Aktivasyon → Retention → Monetizasyon → Büyüme.** Bu sırayı bozma.

---

### Seçilmiş ilk 3 bahis (eğer sadece 3 şey yapacaksan)
1. **Sıralama + "Ne Yaparsam" simülatörü** — imza özellik, reklamın kalbi, altyapın yarı hazır.
2. **Maraton Wrapped** — yılda bir garantili viral dalga, düşük efor.
3. **Veli Modu** — dönüşümü/geliri ikiye katlayan sessiz silah, kimse iyi yapmıyor.
