# Maraton — Ürün Stratejisi & Yol Haritası (PM Raporu)

> Hazırlayan: AFC (Product Lead) · Tarih: 2026-06-16
> Kapsam: App Store/Play Store yayını + gelir modeli + büyüme

---

## 0. Yönetici Özeti (TL;DR)

Maraton, YKS (TYT/AYT) hazırlık pazarına yönelik **olgun, feature-rich** bir mobil uygulama.
Teknik altyapı (Expo SDK 54, Supabase, RLS, gamification, lig, deneme analizi, yanlış defteri,
spaced repetition, roadmap, sosyal/grup) zaten kurulu ve yayına yakın.

**Eksik olan tek kritik katman: gelir modeli (monetizasyon) ve büyüme döngüsü.**

- Ürün durumu: ~%85 yayına hazır (özellik), ~%0 monetizasyon, ~%10 büyüme mekanikleri.
- Önerilen model: **Freemium + Premium abonelik (Maraton+)** — RevenueCat ile.
- İlk 90 gün hedefi: Soft launch → 1.000 organik kullanıcı → %3-5 premium dönüşüm.

---

## 1. Ürün Konumlandırma (Positioning)

**Kategori:** Education / Sınav Hazırlık
**Pazar:** Türkiye, YKS adayları (~3 milyon/yıl aday, ~2.4M aktif çalışan)
**Mevcut rakipler:** Benim Hocam, Tonguç, Kunduz, Konu Anlatımı uygulamaları, Anki.

**Maraton'un farkı / kazanma açısı:**
| Rakipler genelde | Maraton |
|---|---|
| Video/içerik satıyor | **Kişisel performans takibi + disiplin** satıyor |
| Pasif izleme | Aktif çalışma döngüsü (plan → çalış → deneme → yanlış → tekrar) |
| Gamification yüzeysel | Lig + XP + seri + rozet **derin entegre** |
| Sosyal yok | Arkadaş/grup/challenge mekanikleri var |

**Tek cümlelik konumlandırma:**
> "Maraton, YKS yolunda seni her gün çalıştıran, ilerlemeni ölçen ve seni yalnız bırakmayan kişisel koçun."

---

## 2. Mevcut Durum Değerlendirmesi (Audit)

### Güçlü yönler ✅
- Tam çalışma döngüsü: Plan → Çalışma kaydı → Deneme girişi → Analiz → Yanlış defteri → SR tekrar.
- Gamification olgun: 20 seviye, XP motoru, rozetler, 5 kademeli haftalık lig.
- Veri altyapısı sağlam: 20+ migration, RLS, percentile views, offline queue, Sentry.
- Tasarım sistemi tutarlı (tokens, dark/light, Reanimated 4).
- Yayın altyapısı hazır: EAS config, release dokümanı, store checklist.

### Boşluklar / Riskler ⚠️
| Alan | Durum | Etki |
|---|---|---|
| **Monetizasyon** | Yok | 🔴 Gelir = 0 |
| **Paywall / Premium katman** | Yok | 🔴 |
| **Onboarding'de değer aktivasyonu** | Zayıf | 🟠 Retention riski |
| **Push/bildirim retention döngüsü** | Kısmi (notifications var, strateji yok) | 🟠 |
| **Analytics funnel** | Event sabitleri var, ölçüm stratejisi yok | 🟠 Karar veremezsin |
| **Referral / davet döngüsü** | Yok | 🟠 Büyüme yavaş |
| **App Store ASO** | Hazırlanmamış | 🟠 Keşfedilebilirlik |
| **İçerik (soru bankası)** | Kullanıcı kendi verisini giriyor | 🟡 İçerik üretmiyoruz = düşük maliyet ama düşük "ilk değer" |

---

## 3. Gelir Modeli (Monetization)

### Önerilen: Freemium + Maraton+ aboneliği

**Neden abonelik (tek seferlik değil):** YKS hazırlığı 1 yıllık bir süreç → aylık/yıllık abonelik
LTV'yi maksimize eder. Sınav döngüsüne bağlı doğal "yıllık" satış fırsatı var.

**Fiyatlandırma (TR pazarı, psikolojik eşikler):**
- Aylık: **₺149/ay**
- Yıllık: **₺899/yıl** (≈₺75/ay — "%50 indirim" çapası)
- 3 günlük ücretsiz deneme (free trial) → dönüşümü ~2x artırır.
- Sınav öncesi (Mart-Haziran) kampanya: yıllık %40 indirim.

### Free vs Premium ayrımı (paywall stratejisi)

| Özellik | Free | Maraton+ |
|---|---|---|
| Çalışma kaydı / timer | ✅ | ✅ |
| Deneme girişi | Son **5 deneme** | ♾️ Sınırsız |
| Analiz grafikleri | Temel | **Detaylı + trend + tahmin** |
| Yanlış defteri | ✅ (sınırlı: 50 yanlış) | ♾️ Sınırsız + SR |
| Günlük plan | Otomatik basit | **AI kişisel plan + roadmap** |
| Sıralama tahmini (RankSimulator) | 1/hafta | Sınırsız + "ne yaparsam" senaryoları |
| Lig & sosyal | ✅ | ✅ + özel rozetler |
| Zayıf alan analizi (WeakAreas) | Kilitli | ✅ |
| Haftalık AI raporu | Kilitli | ✅ |
| Reklamsız | — | ✅ |
| Tema/avatar kozmetikleri | Sınırlı | Tümü |

**Kural:** Free deneyim TEK BAŞINA değerli olmalı (kötü bir demo değil). Premium = "güç kullanıcı"
ve "kişiselleştirme/sınırsızlık" satar. Çekirdek disiplin döngüsünü asla kilitleme.

### İkincil gelir (opsiyonel, sonra)
- Reklam (free kullanıcıya, ödüllü video → streak freeze kazan).
- Sınav paketi / koçluk (yüksek fiyat, düşük hacim, ileride).

### Teknik kurulum
- **RevenueCat** (`react-native-purchases`) → App Store + Play Store IAP tek API.
- Supabase'de `subscriptions` tablosu + entitlement webhook.
- Paywall ekranı + `usePremium()` hook + feature gate util.

---

## 4. Yol Haritası (Roadmap)

### 🟥 Faz 0 — Yayına Çıkış (0-3 hafta) "Ship it"
Amaç: Mağazada olmak, ilk kullanıcıyı almak. Para sonra.
- [ ] `DEV_BYPASS = false`, console.log temizliği, PlaceholderScreen sil
- [ ] Tüm migration'lar prod Supabase'de + RLS testi
- [ ] App icon, splash, 3+ screenshot, store açıklaması (TR/EN), privacy policy URL
- [ ] EAS production build + TestFlight/Internal track
- [ ] Sentry prod DSN, temel analytics event'leri canlı
- [ ] **Onboarding aktivasyon iyileştirmesi** (bkz. Faz 1 — kısmen öne çek)

### 🟧 Faz 1 — Aktivasyon & Retention (3-6 hafta) "Make them stay"
Para kazanmadan önce kullanıcı kalmalı. Retention < %30 (D7) ise paywall anlamsız.
- [ ] **Onboarding'de "aha moment"**: ilk denemeyi/hedefi gir → anında sıralama tahmini göster
- [ ] **Push retention döngüsü**: günlük plan hatırlatma, streak risk uyarısı (smartNudge'ı bildirimle bağla)
- [ ] **Boş durum (empty state) → ilk aksiyon** yönlendirmeleri
- [ ] **D1/D7/D30 retention + funnel ölçümü** (PostHog veya Amplitude ücretsiz tier)
- [ ] Haftalık özet bildirimi (weeklyReport zaten var → push ile teslim)

### 🟨 Faz 2 — Monetizasyon (6-10 hafta) "Turn on revenue"
- [ ] RevenueCat entegrasyonu + IAP ürünleri (aylık/yıllık + trial)
- [ ] `usePremium()` + feature gating util + paywall ekranı (tasarım: değer odaklı)
- [ ] Paywall tetikleyicileri: 6. deneme, WeakAreas tıklama, AI plan, sınırsız yanlış
- [ ] Supabase subscriptions tablosu + webhook + entitlement sync
- [ ] Soft paywall (kapatılabilir) → A/B test → hard paywall noktaları
- [ ] Fiyat A/B testi (₺149 vs ₺99 aylık)

### 🟩 Faz 3 — Büyüme (10-16 hafta) "Grow the loop"
- [ ] **Referral**: arkadaşını davet et → ikinize 1 hafta premium / streak freeze
- [ ] **Paylaşım kartları** (ShareCard zaten var → Instagram story formatı, "bu hafta X net")
- [ ] Lig & grup viral döngüsü: arkadaşını lige davet
- [ ] ASO optimizasyonu: keyword (yks, tyt, ayt, deneme takip, sıralama hesaplama)
- [ ] TikTok/Instagram organik içerik (öğrenci kitlesi burada)

### 🟦 Faz 4 — Ölçeklenme (16+ hafta)
- [ ] AI koç (çalışma planı + motivasyon, LLM destekli) — premium tutucu
- [ ] Soru bankası / içerik ortaklığı (içerik = en güçlü retention ama maliyetli)
- [ ] Veli paneli / koç paneli (B2B2C fırsatı)

---

## 5. Başarı Metrikleri (KPI / North Star)

**North Star Metric:** Haftalık aktif çalışan kullanıcı (en az 1 çalışma kaydı + 1 deneme/hafta).

| Faz | Birincil KPI | Hedef |
|---|---|---|
| 0 | İndirme | 1.000 (90 gün) |
| 1 | D7 retention | %30+ |
| 1 | Aktivasyon (ilk deneme girişi) | %50+ |
| 2 | Free→Premium dönüşüm | %3-5 |
| 2 | Trial→Paid | %25+ |
| 3 | Viral katsayı (K) | 0.3+ |
| Tüm | MRR | İlk hedef ₺15-25K/ay |

**Unit economics (kaba):** 1.000 indirme × %4 dönüşüm = 40 premium × ₺75/ay ≈ ₺3.000 MRR.
10.000 kullanıcıda ≈ ₺30K MRR. Hedef ölçek: 50-100K kullanıcı.

---

## 6. Hemen Yapılacaklar (Bu Hafta)

1. **Karar:** Gelir modeli onayı (freemium + abonelik) → fiyat eşikleri.
2. **RevenueCat hesabı** aç + App Store Connect / Play Console IAP ürünleri tanımla.
3. **Analytics aracı** seç (PostHog öner — ücretsiz, self-host opsiyonu) + funnel kur.
4. **Faz 0 checklist'i** bitir → TestFlight'a ilk build.
5. **Onboarding aktivasyon** akışını tasarla (aha moment).

---

## 7. Riskler & Azaltma

| Risk | Olasılık | Azaltma |
|---|---|---|
| Düşük retention → para kazanılamaz | Yüksek | Faz 1'i atlamadan para katmanına geçme |
| App Store reddi (IAP/privacy) | Orta | Release checklist + test hesabı + privacy form |
| İçerik yok → ilk değer düşük | Orta | Onboarding aktivasyonu + "kendi verini gör" değeri |
| Sezonsallık (YKS sonrası ölü dönem) | Yüksek | Yıllık abonelik + LGS/KPSS'ye genişleme planı |
| Tek geliştirici hızı | Orta | Faz bazlı, küçük sürümler, OTA update |
