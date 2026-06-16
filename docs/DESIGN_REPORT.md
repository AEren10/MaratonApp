# Maraton — Tasarım İnceleme & Yol Haritası (Design Report)

> Hazırlayan: AFC (Design Director) · Tarih: 2026-06-16
> Kapsam: Görsel kalite denetimi, özgünlük, premium hissi, tasarım yol haritası.
> Not: Gelir modeli/fiyat için `docs/PRODUCT_STRATEGY.md`'yi tamamlayan dokümandır, tekrar etmez.

---

## 0. Genel Kanaat

Maraton **görsel olarak da ortalamanın çok üstünde** bir iskelete sahip:
- Olgun tasarım sistemi: `tokens.js` "Lavender Glass v2" — light+dark tam set, ders kimlik renkleri, elevation merdiveni, tipografi presetleri.
- Hazır design primitive kütüphanesi (`src/components/design/`): GlassCard, BentoCard, ProgressRing, GlowBackground, AnimatedNumber, Stat…
- Reanimated 4 ile gerçek motion altyapısı, haptics, skeleton/empty state bileşenleri.

**Eksik olan estetik değil, EDİTÖRYAL DİSİPLİN.** Yani "her şeyi göster" yerine "neyi öne çıkar" kararı. App şu an güçlü ama *kalabalık*. Premium hissi = sadeleştirme + ritim + anlamlı an, daha fazla kart değil.

---

## 1. Kritik Bulgular (öncelik sıralı)

### 🔴 B1 — Home ekranında kart enflasyonu (en önemli)
`src/screens/home/HomeScreen.js:221-307`: tek ekranda sırayla
HomeHeader → MorningBriefing → GoalTrack → ExamCountdown → StatBubbles → RoundActions → PriorityCard → SR kartı → WeeklyReportCard → DailyActionCard.
Yaklaşık **9-10 yığılmış blok**, hepsi benzer ağırlıkta. Sonuç: göz nereye bakacağını bilmiyor, hiçbiri "kahraman" değil.
**Fix:** Tek bir *primary* belirle (bugünün aksiyonu = MorningBriefing/PriorityCard birleşik bir "Bugün" kartı). Diğerlerini ikincil yap: küçült, gruplandır, bir kısmını alt sayfaya/akordeona taşı. ExamCountdown'ı header'a ince bir şerit olarak göm. Hedef: ilk ekranda **maks 4 görsel blok**.

### 🟠 B2 — Görsel öncelik = renk gürültüsü
RoundActions 8 aksiyon, her biri farklı renk (amber/blue/coral/purple/green/red…). Ders kimlik renkleri *ders bağlamında* harika; ama aksiyon ikonlarında 6 renk aynı anda → "oyuncak" hissi.
**Fix:** Aksiyon ızgarasında tek nötr/accent renk + ikon; rengi sadece *ders* ve *durum* (başarı/uyarı) için sakla. Renk = anlam, dekor değil.

### 🟠 B3 — "Aha moment" görsel olarak yok
Onboarding sonrası ilk değer anı tasarlanmamış (PRODUCT_STRATEGY Faz 1 de işaret ediyor). İlk hedef/deneme girilince **anında büyük bir sıralama/net tahmini animasyonu** = uygulamanın "vay be" anı. Şu an böyle bir tek-güçlü-an yok.

### 🟡 B4 — Premium katman görsel dili yok
Paywall, kilit rozetleri, "Maraton+ ile" ipuçları, blurlu önizleme yok. Premium ekran ürünün en cilalı ekranı olmalı; şu an tasarlanmamış. (Bkz. `premium-design` skill.)

### 🟡 B5 — Boş/yükleme/hata tutarlılığı
SkeletonCard ve EmptyState var ama her ekranda uygulanıp uygulanmadığı belirsiz. Tutarsız empty state = "yarım ürün" algısı (App Store kalite bariyeri).

### 🟡 B6 — İkonografi
`Icon.js` özel set; tutarlı ama zenginliği denetlenmeli. Premium app'lerde ikon ağırlığı/grid tutarlılığı kritik. Tek stroke-weight, tek grid.

---

## 2. Özgün & Kaliteli Tasarım Nasıl Olur (yön)

Maraton'un **imza dili** zaten elinde — onu sahiplen, jenerik dashboard taklit etme:

1. **Ders-kimlik rengi = marka sistemi.** Her ekran o anki dersin rengiyle nefes alsın (wash/tint). Bu, rakiplerde olmayan tutarlı bir kimlik.
2. **Oversized gerçek veri.** Stok illüstrasyon değil; öğrencinin kendi neti/serisi dev Space Grotesk rakamlarla. Veri = ürün.
3. **Glass + glow ölçülü.** GlowBackground'ı sadece hero alanında kullan; her kartta değil. Az kullanılınca premium, çok kullanılınca ucuz.
4. **Anlamlı motion.** Giriş stagger, press scale 0.98, kazanım anlarında kutlama (badge/level/PB). Dekoratif animasyon yok.
5. **Sakin, kaygısız ton.** Hedef kitle lise; motive et, panik yaratma. Streak'i ödül olarak göster, ceza olarak değil.

**Tek cümle estetik konum:** *"Senin verinin, sana ait renkle ve nefes alan boşlukla anlatıldığı, sakin ama iddialı bir koç."*

---

## 3. Tasarım Açısından Eklenecekler

| # | Ekleme | Neden | Katman |
|---|--------|-------|--------|
| E1 | "Bugün" hero kartı (plan+SR+aksiyon birleşik) | Home'u sadeleştirir, tek odak | Free |
| E2 | Onboarding aha-moment ekranı (anlık sıralama tahmini animasyonu) | Aktivasyon + wow | Free |
| E3 | Paywall ekranı (değer odaklı, trial CTA) | Gelir | Premium giriş |
| E4 | Kilitli derinlik önizlemeleri (blurlu grafik + lock chip) | Upgrade isteği | Premium kapısı |
| E5 | Kutlama anları (PB/level/badge full-screen mikro-an) | Duygu + retention | Free |
| E6 | Paylaşım kartı (Instagram story formatı "bu hafta X net") | Viral + marka | Free |
| E7 | Tema/avatar kozmetikleri | Kişiselleştirme satışı | Premium |
| E8 | Tutarlı empty/loading/error seti (her ekran) | App Store kalitesi | Free |

---

## 4. Premium'a Ne Eklenir (tasarım perspektifi)

Çekirdek döngü (plan→çalış→deneme→yanlış→tekrar) **asla kilitlenmez**. Kilitlenen: ölçek, derinlik, kişiselleştirme, öngörü.

- **Sınırsızlık:** deneme/yanlış defteri limiti kalkar (free'de cap, görsel olarak "X/5" göstergesiyle).
- **Derinlik:** WeakAreas, trend tahmini, detaylı analiz grafikleri (free'de blurlu önizleme).
- **AI kişisel plan + haftalık AI rapor:** premium tutucu.
- **Rank simülatör "ne yaparsam" senaryoları:** sınırsız.
- **Kozmetik:** temalar, avatar çerçeveleri, özel rozetler.
- **Reklamsız** (eğer free'de ödüllü reklam olursa).

Paywall tetikleyici: 6. deneme, WeakAreas tıklama, AI plan, "sınırsız" denemesi — **arzunun zirvesinde**, açılışta değil.

---

## 5. Tasarım Yol Haritası

### 🟥 Faz D0 — Sadeleştirme (1-2 hafta) "Az, ama net"
- [ ] Home hiyerarşi revizyonu: tek hero + maks 4 blok (B1)
- [ ] Aksiyon ızgarasında renk gürültüsünü kıs (B2)
- [ ] Empty/loading/error setini her ekranda standartlaştır (B5)
- [ ] İkon weight/grid denetimi (B6)

### 🟧 Faz D1 — Wow & Aktivasyon (2-4 hafta) "İlk değeri hissettir"
- [ ] Onboarding aha-moment ekranı + animasyon (E2)
- [ ] Kutlama anları: PB/level/badge mikro-an (E5)
- [ ] "Bugün" hero kartı (E1)

### 🟨 Faz D2 — Premium Tasarım (4-7 hafta) "Ödenecek hissi"
- [ ] Paywall ekranı + plan toggle + trial CTA (E3, `premium-design` skill)
- [ ] Kilitli derinlik önizlemeleri (blur + lock chip) (E4)
- [ ] Tema/avatar kozmetik sistemi (E7)

### 🟩 Faz D3 — Viral & Cila (7-10 hafta) "Yayıl"
- [ ] Instagram story paylaşım kartı (E6)
- [ ] App Store görsel seti (loop'u anlatan 5 screenshot)
- [ ] Son cila geçişi: spacing/motion/tip ritmi tüm ekranlar

---

## 6. Kurulan Tasarım Ekibi (agent/skill)

| Rol | Tür | Dosya | Görev |
|-----|-----|-------|-------|
| Design Director | agent | `.claude/agents/design-director.md` | Yön, hiyerarşi, marka, "iyi nedir" kararı |
| UI Designer | agent | `.claude/agents/ui-designer.md` | Tokenlarla kodlama, motion, cila |
| Premium Design | skill | `.claude/skills/premium-design/SKILL.md` | Paywall, free/premium, App Store kalitesi |
| Product Manager | agent (mevcut) | `.claude/agents/product-manager.md` | Fiyat, funnel, KPI |
| Mobile Design | skill (mevcut) | `.claude/skills/mobile-design/` | Platform/touch/tip ilkeleri |

**Akış:** product-manager *ne* satılacağına, design-director *nasıl görüneceğine* karar verir → ui-designer kodlar → premium-design skill'i monetizasyon ekranlarında devreye girer.
