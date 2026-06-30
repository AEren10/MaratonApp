# Claude Design Prompt — Maraton App Redesign

Aşağıdaki promptu claude.ai'a yapıştır. Ekranları tek tek isteyebilirsin veya tamamını isteyebilirsin.

---

## PROMPT BAŞLANGIÇ

Senden bir mobil uygulama için yüksek kaliteli UI mockup'ları istiyorum. Mockup'lar telefon frame içinde, 390x844 (iPhone 14 oranı) olacak. Her ekranı ayrı bir artifact olarak ver.

UYARI: "Yapay zeka yapmış gibi" görünen generic tasarımlar istemiyorum. Gradient orgy yok, neon glow yok, glassmorphism yok, her yere serpilmiş emoji yok, rainbow renk paleti yok. Gerçek dünyada insanların para verdiği, Strava/Duolingo/Whoop/Notion kalitesinde, editoryal ve kasıtlı bir tasarım istiyorum.

---

## UYGULAMA: MARATON

**Ne:** YKS üniversite sınavına hazırlanan Türk lise öğrencileri için sınav hazırlık uygulaması.

**Kim kullanıyor:** 15-19 yaş arası Türk öğrenciler. Sınava 1-365 gün kala. Günde ortalama 4-8 saat çalışıyorlar. Motivasyon, takip ve analiz ihtiyaçları var. Hem disiplinli hem de oyunlaştırma ile motive olan bir kitle.

**Rakipler:** Duolingo (gamification), Strava (streak + sosyal), Whoop (daily ring + performans), Forest (timer), Notion (plan). Ama hiçbiri YKS'ye özel değil.

**Platform:** iOS + Android (React Native). Dark theme primary, light theme secondary.

---

## MARKA KİMLİĞİ

**İsim:** Maraton
**Felsefe:** "Ink & Volt" — Editöryal sakinlik + atletik enerji. Bir spor dergisi gibi: tipografi güçlü, layout nefes alır, renk anlamlı.

**Renkler (Dark mode — primary):**
- Background: #0C0D11 (sıcak-nötr gece siyahı)
- Surface/Card: #15171C (kömür kartı)
- Surface2: #1E2128
- Text Primary: #F4F5F7
- Text Secondary: #B0B4BD
- Text Muted: #8E929B
- Border: rgba(255,255,255,0.08)

**Brand Renkler:**
- MOR (#8b5cf6) — Primary CTA, aksiyon butonları, seçim durumu, interaktif öğeler
- TURUNCU (#ff6b35) — Enerji, streak, FAB, tamamlama aksiyonları

**Semantic:**
- Success: #34d399
- Danger: #f87171
- Warning: #fbbf24
- Info: #60a5fa

**Ders Kimlik Renkleri (her ders kendi rengi):**
- Türkçe: #60a5fa (mavi)
- Matematik: #fb923c (turuncu)
- Fen: #34d399 (yeşil)
- Sosyal: #c084fc (mor)
- Fizik: #22d3ee (cyan)
- Kimya: #f472b6 (pembe)
- Tarih: #fbbf24 (amber)
- Coğrafya: #2dd4bf (teal)

**Tipografi:**
- Heading/Stats: Space Grotesk Bold (geometrik, atletik)
- Body/Caption: Inter (okunaklı, nötr)
- Stats büyük: 46-56px, letter-spacing -1 ile -1.5
- Body: 15px
- Caption: 13px
- Micro: 11px

**Spacing:** 4, 8, 12, 16, 20, 24, 32, 48px sistemi
**Radius:** 8, 12, 16, 20, 24px (kartlar genelde 20-24px)

---

## EKRAN HARİTASI (57 Ekran)

### Tab Bar (5 tab — her zaman görünür)
| Tab | Ekran | Açıklama |
|-----|-------|----------|
| Ana Sayfa | HomeScreen | Dashboard: streak, günlük ilerleme, plan, hızlı aksiyonlar |
| Dersler | DerslerScreen | Ders kategorileri, konu listesi, ilerleme |
| + (FAB) | QuickAction | Merkezi büyük buton — hızlı eylem menüsü |
| Analiz | AnalysisScreen | Deneme sonuçları, trend grafikleri, ders analizi |
| Profil | ProfileScreen | Kullanıcı profili, badge'ler, istatistikler, ayarlar |

### Ana Akışlar

**1. Çalışma Akışı (Study Flow)**
HomeScreen → AddStudyScreen (ders+konu+soru seç) → StudyTimerScreen (pomodoro: 25/50/90dk) → StudySaveScreen (sonuçları kaydet) → StudySummaryScreen (haftalık özet)

**2. Deneme Akışı (Trial Flow)**
AnalysisScreen → TrialEntryScreen (TYT/AYT/Branş seç, ders ders doğru/yanlış/boş gir) → TrialSummaryScreen (kutlama + özet) → TrialDetailScreen (ders bazlı detay)

**3. Yanlış Defter Akışı (Wrong Notebook Flow)**
WrongNotebookScreen (tüm yanlışlar listesi + filtre) → AddWrongScreen (fotoğraf + ders + konu) → WrongDetailScreen (detay) → ReviewSessionScreen (spaced repetition) → SwipeReviewScreen (tinder-tarzı kart swipe)

**4. Plan Akışı**
HomeScreen → TodayPlanCard → PlanDetailScreen (AI tarafından oluşturulan günlük görevler) → AddTaskScreen

**5. Analiz Detay**
AnalysisScreen → SubjectDetailScreen (bir dersin tüm deneme geçmişi) → WeakAreasScreen (zayıf konular)

**6. Sosyal**
FriendsScreen → ChallengeScreen (arkadaş challenge) → LeagueScreen (haftalık lig sıralaması) → ShareCardScreen (başarı kartı paylaşımı)

**7. Simülatör**
RankSimulatorScreen (NET gir → sıralama tahmini gör) → ExamSimulatorScreen (süreli tam sınav)

**8. Ayarlar**
SettingsScreen → Appearance, EditProfile, ChangePassword, Notifications, Privacy, Terms, About

**9. Onboarding**
OnboardingScreen (4 slayt) → ExamSetupScreen (sınav türü seç) → GoalSetupScreen (günlük hedef)

**10. Premium**
PaywallScreen — Özellik karşılaştırması + plan seçimi

### Diğer Ekranlar
- CalendarScreen — Aylık takvim, günlük çalışma görünümü
- NetForecastScreen — Trend bazlı NET tahmini
- ComparativeScreen — Kişisel analitik dashboard
- RoadmapScreen — Konu bazlı visual roadmap
- TopicCardsScreen — Anki tarzı spaced repetition kartları
- WeeklyReviewScreen — Haftalık özet (Spotify Wrapped tarzı)
- ReferralScreen — Arkadaş davet sistemi

---

## OYUNLAŞTIRMA SİSTEMİ

**Streak:** Ardışık çalışma günleri. Ateş ikonu, turuncu renk. Streak freeze (kalkan) mevcut.

**XP Sistemi:**
- Çalışma = XP
- Deneme girişi = XP
- Plan tamamlama = XP
- Günlük hedef = bonus XP

**Seviyeler:** Bronz → Gümüş → Altın → Elmas → Obsidyen

**Badge'ler:** Heksagon şeklinde achievement rozetleri

**Haftalık Lig:** Kullanıcılar XP'ye göre sıralanıyor. Promotion/demotion zone'ları var.

**Kutlama Anları:**
- Hedef tamamlama → confetti + modal
- Level up → özel modal
- Streak milestone (7, 30, 100 gün) → özel modal
- Badge unlock → heksagon animasyonu

---

## MEVCUT SORUNLAR (Bunları çözmeni istiyorum)

### 1. Home ekranı kalabalık
Şu an yukarıdan aşağıya: Header → ExamCountdown (DEV gradient kart, 64pt sayı) → HomeHero (172px progress ring) → TodayPlanCard → SR Review → Nudge → RoundActions → WeeklyReport. Her şey aynı görsel ağırlıkta, göz nereye bakacağını bilmiyor. Ekranın ilk görünümünde iki dev blok (countdown + hero) üst üste ve ikisi de bağırıyor.

### 2. Özellikler gömülü
"Çalış", "Deneme", "Yanlış Defteri", "Sıralama", "Simülasyon" gibi core özellikler home'daki küçük buton grid'ine (RoundActions) gömülü. 3 scroll + 1 tap gerektiriyor. Yarısı "Tümünü Gör" arkasında gizli.

### 3. Kart enflasyonu
6 farklı kart aynı görsel dilde: bordered surface, 24px radius, benzer padding. Hepsi eşit ağırlıkta, hiçbiri öne çıkmıyor. "Her şey kutu" hissi.

### 4. Geçişler ve interaksiyonlar cansız
Tüm ekranlar aynı slide animasyonu. Tab geçişlerinde animasyon yok. Butonlarda basit spring var ama genel olarak "cansız" hissi.

### 5. "Para vereyim" hissi yok
App fonksiyonel ama premium hissettirmiyor. Strava, Duolingo, Whoop açtığında "aa güzel" hissi var. Bizde yok.

---

## TASARIM YÖNERGELERİ

### Genel Prensipler
1. **Bir ekran, bir iş.** Her ekranda tek bir net odak noktası. Geri kalan sessiz.
2. **Nefes alan boşluk.** Bileşenler arası minimum 32px, section arası 48px.
3. **Hiyerarşi.** Primary → Secondary → Tertiary. Aynı ağırlıkta iki element olmasın.
4. **Dokunma keyfi.** Her buton/karta dokunma hissini düşün. Press state, scale, feedback.
5. **Sadelik.** Bir ekranda 3-5 ana element yeterli. Fazlası alt ekrana taşınsın.

### Home Ekranı İçin Spesifik Yönergeler
- ExamCountdown'u küçült. Dev kart yerine header'a entegre kompakt chip (ör: "247 gün" pill).
- Hero ring (progress) tek ana odak olsun. Altında stat rail (streak/net/xp) minimal.
- Quick actions gömülü olmasın. Horizontal scroll strip veya üstte daha belirgin yerleşim.
- Plan kartı birincil, diğer kartlar (weekly, nudge) ikincil — inline satır, kart değil.

### Yapma Listesi (Anti-patterns)
- Gradient orgy (her karta gradient background)
- Neon glow, glassmorphism, blur efekt
- Her yere emoji serpme
- 6+ renk bir arada (max 2-3 ana renk per ekran)
- Aynı boyutta yan yana kartlar (hiyerarşi yok)
- Tiny 48px icon grid (touch target çok küçük)
- "Dashboard" hissi (veri dolu panel vs deneyim)

### İlham Kaynakları
- **Strava:** Aktivite feed, turuncu accent, performans grafikleri
- **Whoop:** Günlük ring, siyah-yeşil palette, strain/recovery
- **Duolingo:** Streak, XP, lig sistemi, kutlama anları
- **Notion:** Sadelik, tipografi, nefes alan layout
- **Spotify Wrapped:** Yıl sonu özet formatı
- **Apple Fitness:** Ring completion, haftalık trend

---

## İSTEDİĞİM ÇIKTI

Her ekran için 390x844px mobil mockup (iPhone 14 boyutu). Dark mode. Gerçek içerikle (placeholder değil — Türkçe metin, gerçek sayılar, gerçek ders isimleri kullan).

Öncelik sırası:
1. **Home Screen** — En kritik, yukarıdaki sorunlar çözülmüş hali
2. **Tab Bar** — 5 tab + merkez FAB butonu
3. **Analysis Screen** — Deneme sonuçları dashboard
4. **Trial Entry Screen** — Deneme girişi formu
5. **Wrong Notebook Screen** — Yanlış soru listesi
6. **Study Timer Screen** — Pomodoro timer
7. **League Screen** — Haftalık sıralama
8. **Profile Screen** — Kullanıcı profili + badge'ler
9. **Paywall Screen** — Premium satış ekranı
10. **Onboarding** — İlk 4 slayt

Her mockup'ta şunları belirt:
- Ekran ismi
- Ana interaction noktaları (neye dokunulur, ne olur)
- Animasyon notu (varsa — ör: "ring dolma animasyonu", "fade in")

Örnek veri:
- Kullanıcı adı: Ahmet
- Streak: 23 gün
- Günlük hedef: 80 soru, 45 çözülmüş
- Son deneme: TYT, 78.5 net
- Sınava kalan: 247 gün
- Seviye: Altın (2450 XP)
- Dersler: Matematik, Türkçe, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe

ŞUNU YAPMA: Generic, template-like, Dribbble showcase tarzı tasarım. Her şeyin bir sebebi olsun. Dekorasyon için değil, fonksiyon için tasarla.

ŞUNU YAP: Öğrencinin her gün açıp "aa güzel" dediği, kullanmaktan keyif aldığı, arkadaşına gösterdiği bir app. Premium hissi veren ama gösterişli değil, kasıtlı ve sakin.

## PROMPT BİTİŞ
