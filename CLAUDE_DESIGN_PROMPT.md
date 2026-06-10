# Maraton — YKS Study Control Panel

## What is this app?

Maraton is a mobile study control panel for Turkish high school students preparing for the YKS university entrance exam (TYT/AYT). It is NOT a tutoring platform, NOT a video course app. It's a focused tool where students open the app, see their daily plan, log study sessions, track progress per subject and topic, analyze mock exams, and get motivated through visual progress everywhere. Think "mission control for studying" meets a modern Z-gen dashboard.

**Social & Competitive layer:** Students are NOT alone. The app has a community Portal (Q&A rooms), a League system (weekly competitive leaderboards), Live Study Rooms (virtual library — see others studying in real-time), Achievement Badges (public milestones), and a lightweight Friends system. The goal: accountability, motivation, and healthy competition.

## Design System & Visual Identity

### Theme: Dark Mode Only
- Background: #0A0A0F (near-black with subtle blue undertone)
- Surface/Cards: #1A1A23 (dark elevated cards)
- Card hover/active: #22222E
- Borders: #2A2A36

### Colors
- Primary Accent: #F5A623 (warm amber — energy, motivation, CTAs)
- Success/Growth: #34D399 (green — positive stats, improvements)
- Warning: #FBBF24 (yellow — alerts, streak risk)
- Danger: #EF4444 (red — net drops, weak areas)
- Subject Colors (ALWAYS consistent):
  - Türkçe: #60A5FA (blue)
  - Matematik: #F5A623 (amber)
  - Fen Bilimleri: #34D399 (green)
  - Sosyal Bilimler: #A78BFA (purple)
- Teal: #2DD4BF (secondary accent for progress rings)
- Text Primary: #FFFFFF
- Text Secondary: #A0A0B0
- Text Muted: #6B6B7B

### Typography
- Headings & Stats: Space Grotesk Bold (large numbers should feel impactful)
- Body & UI: Inter (Regular 400, Medium 500, SemiBold 600)
- Stats/Numbers: Space Grotesk Bold, oversized (32-48px for hero stats)

### Component Style
- Cards: rounded-2xl (24px), subtle border #2A2A36, soft dark shadows
- Buttons: rounded-xl (20px), primary = amber with subtle glow
- Spacing: generous — 16px min padding, 12px gaps
- Icons: simple line icons (Lucide style), 20-24px
- Progress elements: circular rings with rounded stroke caps, glowing accent
- Chips/Badges: rounded-full pills with translucent colored backgrounds (e.g. subject color at 20% opacity)

### Interaction Feel
- Cards feel tappable — subtle scale on press
- Numbers are HERO elements — oversized, bold, prominent
- Every screen motivates — show progress, streaks, improvements, never just raw data

---

## SCREENS TO DESIGN (All at 390x844 iPhone 14 size, pixel-perfect)

---

### SCREEN 1: Onboarding — Exam Setup
**Purpose:** First-time setup. Student picks exam type and target date.

**Layout:**
- Top: Large icon (graduation cap or rocket)
- Title: "Hedefini Seç" (bold, centered)
- 3 selectable cards stacked:
  - "Sadece TYT" — subtitle: "Türkçe, Matematik, Fen, Sosyal"
  - "TYT + AYT (Sayısal)" — subtitle: "TYT + Matematik, Fizik, Kimya, Biyoloji"
  - "TYT + AYT (Eşit Ağırlık)" — subtitle: "TYT + Matematik, Edebiyat, Tarih, Coğrafya"
- Selected card: amber border + subtle glow, radio indicator
- Date picker row: "Sınav Tarihi: 15 Haziran 2027" with calendar icon
- Bottom: Amber CTA "Devam Et →"
- Below: muted "Daha sonra değiştirebilirsin"

---

### SCREEN 2: Home (Main Dashboard) — BENTO GRID LAYOUT
**Purpose:** The daily hub. NOT a generic dashboard. Uses a modern Bento Grid layout — different-sized cards arranged in an asymmetric grid that feels dynamic and alive.

**Layout (scrollable):**

**Section 1 — Header (sticky)**
- Left: "Selam," (small muted) + "Eren 👋" (large heading)
- Right: Streak flame badge — "🔥 14" in amber chip

**Section 2 — Bento Grid (2-column asymmetric grid)**

**Card A — "Bugünün Planı" (full width, hero card)**
- Subtle warm gradient background
- "⚡ GÜNLÜK PLAN" amber chip
- Large "45" (48px) + "soru seni bekliyor"
- Mini progress ring: 18/45 completed
- "3 ders · ~2 saat"
- Amber "Çalışmaya Başla →" button

**Card B — "Son Deneme" (left column, medium)**
- "72.5" net (amber, large)
- "↑ +4.5" green trend
- 4 tiny subject bars at bottom

**Card C — "Seri" (right column, small)**
- Flame icon + large "14"
- "gün üst üste"
- "En iyi: 23 🏆" small text

**Card D — "Canlı Çalışma" (right column, small) — NEW**
- Pulsing green dot "CANLI"
- "🟢 847 öğrenci çalışıyor"
- 3-4 tiny avatar circles overlapping
- Tap → enters Live Study Room

**Card E — "Lig Sıralaman" (left column, medium) — NEW**
- League badge icon (e.g. Gold shield)
- "Altın Lig" title
- "#12 / 50" your rank
- Tiny leaderboard preview: top 3 names
- "Hafta sonu bitiyor" muted text

**Card F — "Zayıf Alan Uyarısı" (full width, compact)**
- Warning card with subtle red tint
- "⚠️ Matematik'te 3 denemedir düşüş var"
- "Analiz Et →" text button

**Card G — "Motivasyon" (full width, compact)**
- Rotating motivational stat: "🎯 Bu ay 1,240 soru çözdün — geçen aydan %23 fazla!"
- Green success tint

**Section 3 — Quick Actions (horizontal scroll)**
- Circular buttons: "📝 Kaydet", "📊 Deneme Gir", "📸 Yanlış Ekle", "🎯 Portal"

**Bento Grid design notes:**
- Cards have DIFFERENT heights — not uniform
- Some span 1 column, some 2 (full width)
- 12px gaps, each card has unique personality
- Feels like a personalized cockpit, not a spreadsheet

---

### SCREEN 3: Dersler (Subjects & Topics)
**Purpose:** Complete subject/topic browser. See ALL subjects, drill into topics, per-topic progress, check off completed topics, access solved/wrong questions and topic cards. The student FEELS their progress like a skill tree.

**Layout:**

**Header:** "Derslerim"

**Subject Cards (vertical, expandable):**

**Collapsed state:**
- Left: Large colored circle with icon (📘 Türkçe, 📐 Matematik, 🔬 Fen, 📜 Sosyal)
- Subject name in subject color
- Right: progress ring (e.g. 68%)
- "28 / 40 konu tamamlandı · Son: 2 gün önce"

**Expanded state (Matematik example):**
Topics listed inside:

**Topic Row:**
- Left: Checkbox (empty / half / full amber ✓ mastered)
- "Üslü Sayılar"
- "42 soru · %76 doğruluk · Son: 3 gün önce"
- Right: mini progress bar (subject color)
- Red badge if wrong questions: "3 yanlış"
- Gold badge if mastered: "🏆 Güçlü"
- Amber warning if neglected: "⏰ 7 gündür çalışılmadı"
- Green badge if improving: "📈 Yükselişte!"

**Topic Detail (sub-screen on tap):**
- Header: topic name + subject color accent
- Stats: "42 soru · %76 · 3 yanlış · Son: 3 gün önce"
- Sections: İlerleme (chart), Çözülen Sorular (log entries), Yanlış Sorular (photo thumbnails), Konu Kartı (formulas), "Plana Ekle" amber button

---

### SCREEN 4: Daily Plan
**Purpose:** Today's auto-generated study plan.

**Layout:**
- Header: "Bugünün Planı" + "10 Haziran 2026"
- "Düzenle" text button
- Progress bar: 2/4 tamamlandı (amber fill)
- "45 soru · ~2 saat · 4 ders"

**Task Cards:**
- Subject color dot + "Matematik" bold
- "Üslü Sayılar · 15 soru"
- Circular checkbox (empty/filled amber ✓)
- Reason chip: "Zayıf alanın" (red) / "12 gündür çalışmadın" (amber) / "Düzenli tekrar" (gray)
- Completed: dimmed + strikethrough

**Example:**
1. 🔵 Türkçe — Paragraf · 12 soru — ✅
2. 🟠 Matematik — Üslü Sayılar · 15 soru — ☐
3. 🟢 Fen — Kimya Bağları · 10 soru — ☐
4. 🟣 Sosyal — İnkılap Tarihi · 8 soru — ☐

Bottom: Floating amber "Çalışmayı Kaydet ✓"

---

### SCREEN 5: Study Log Entry
**Purpose:** Quick study logging form.

**Layout:**
- Header: "Çalışma Kaydet" + X close
- **Ders:** Horizontal chips (colored, selected = filled)
- **Konu:** Dropdown for selected subject
- **Soru Sayısı:** Stepper +/- with large center number
- **Doğru Sayısı:** Same stepper
- **Süre:** Quick chips "30dk", "45dk", "60dk", "90dk", "120dk"
- **Not:** Optional text input
- Bottom: Amber "Kaydet"

Each form group in its own card section.

---

### SCREEN 6: Trial (Deneme) Analysis
**Purpose:** Mock exam results and trends.

**Layout:**
- Header: "Deneme Analizi" + "+" amber button
- Tabs: "Özet" | "Grafik" | "Karşılaştır"

**Özet:** Latest trial hero card ("72.5 Net" huge amber) + 4 subject bars + history list (date, net, trend arrow)

**Grafik:** Line chart, X=dates Y=nets, toggle per subject, legend

**Karşılaştır:** Two dropdowns, side-by-side bars, +/- difference (green/red)

---

### SCREEN 7: Wrong Question Notebook
**Purpose:** Photo-based wrong question tracker.

**Layout:**
- Header: "Yanlış Defteri" + filter icon
- Filter chips: "Tümü", "Türkçe", "Matematik", "Fen", "Sosyal"
- "47 yanlış soru"

**2-column masonry grid:**
- Photo thumbnail + subject chip + topic + date
- "Çözüldü ✓" green if resolved

**FAB:** Amber "+" → add sheet (camera, subject, topic, note, save)

---

### SCREEN 8: Portal (Community Q&A)
**Purpose:** Subject-based Q&A rooms. Students post questions they're stuck on, others answer.

**Header:** "Portal" + notification bell

**Subject Rooms (horizontal scroll):**
- 📐 "Matematik Odası" (amber tint, "124 soru")
- 📘 "Türkçe Odası" (blue tint, "89 soru")
- 🔬 "Fen Odası" (green tint, "67 soru")
- 📜 "Sosyal Odası" (purple tint, "45 soru")
- Colored gradient, glowing border on selected

**Feed (selected room):**
Question cards:
- Avatar + username + "2 saat önce"
- Question photo (full-width, rounded, zoomable)
- Topic chip (subject color)
- Description: "Bu sorunun son şıkkını anlayamadım?"
- Actions: "💬 3 cevap" · "👍 12" · "🔖 Kaydet"

**Answer thread (on tap):**
- Full question + answers below
- Each answer: avatar + text/photo + upvotes
- "✓ En İyi Cevap" green badge

**FAB:** Amber "Soru Sor" → photo picker + topic + description + "Gönder"

**Design: Minimal Q&A, not social media. No profiles, no followers. Focus = question + answer.**

---

### SCREEN 9: Canlı Çalışma (Live Study Rooms) — NEW
**Purpose:** Virtual library. Students enter a room, start their timer, and see others studying in real-time. Creates accountability — "I'm not alone, everyone is grinding." Like a study-with-me room but with data.

**Layout:**

**Header:** "Canlı Çalışma" + pulsing green dot "CANLI" badge + "847 öğrenci çalışıyor"

**Room Selection (top, horizontal scroll):**
- "Genel Çalışma" — 🌙 (default room, everyone)
- "Matematik Odası" — 📐 (amber, only math studiers)
- "Sessiz Oda" — 🤫 (no chat, pure focus)
- "Gece Kuşları" — 🦉 (late night studiers, 22:00-04:00)
- Each room card: icon, name, live count ("234 kişi"), subtle colored tint

**Main Room View (after entering):**

**Top Section — Your Timer (hero)**
- Large circular timer ring (amber glow, just like Study Timer screen)
- Center: "32:15" your time
- Below: "Matematik — Üslü Sayılar"
- Pause/Stop buttons

**Middle Section — Live Feed**
- Scrollable list of other students currently studying:
  - Each row: Avatar + Name + Subject chip (colored) + Timer running ("47:12") + Question count
  - Example rows:
    - 👤 Ayşe K. · 🔵 Türkçe · ⏱ 47:12 · 23 soru
    - 👤 Mehmet A. · 🟠 Matematik · ⏱ 32:05 · 18 soru
    - 👤 Zeynep D. · 🟢 Fen · ⏱ 1:12:30 · 41 soru
  - Sorted by duration (longest at top = most dedicated)
  - New entries animate in with a subtle slide

**Bottom Section — Room Stats Bar**
- Compact bar: "Bu odada: 234 kişi · Toplam: 1,847 soru · Ortalama: 42 dk"
- Motivational: "Sen ilk %15'tesin! 🔥" if student is above average

**Ambient feel:**
- The screen should feel calm but energizing
- Subtle pulsing dots or gentle animations showing activity
- NOT a chat room — no messaging, no distractions
- Just presence: you SEE others working, that's the motivation
- Maybe a very subtle "ding" or particle effect when someone reaches a milestone (100 questions, 1 hour etc.)

**Room-specific badges:**
- "🦉 Gece Kuşu" — studied past midnight
- "⏰ Erken Kalkan" — studied before 7am
- "🏃 Maraton" — 3+ hours in one session

---

### SCREEN 10: Lig (League System) — NEW
**Purpose:** Weekly competitive leaderboard. Duolingo-style leagues that reset every Monday. Students compete based on total questions solved that week. Promotes/relegates between tiers.

**Layout:**

**Header:** "Lig" + current league badge (large, centered, with glow)

**League Tiers (visual, top):**
- Horizontal display of all tiers:
  - 🥉 Bronz → 🥈 Gümüş → 🥇 Altın → 💎 Elmas → 🖤 Obsidyen
- Current tier highlighted with glow, others dimmed
- "Altın Lig — Hafta 3" title below

**Countdown:** "Hafta bitimine: 2 gün 14 saat" amber countdown timer

**Leaderboard (main content):**
- Your position highlighted card at top:
  - "#12" rank + your avatar + name + "687 soru" + league badge
  - Highlighted with amber border/glow — always visible even if scrolled

**Full ranking list below:**
- Each row: Rank # + avatar + name + question count + trend (↑↓)
- Top 3: Gold/Silver/Bronze medal icons, slightly larger
- Top 10: Green zone (promotion zone) — subtle green left border
  - "Üst lige yükselecek" label on the divider
- Bottom 5: Red zone (relegation zone) — subtle red left border
  - "Alt lige düşecek" label
- Middle: Safe zone — normal style

**Example rows:**
1. 🥇 Ayşe K. — 1,247 soru — ↑ (was #3)
2. 🥈 Mehmet A. — 1,189 soru — ↑
3. 🥉 Zeynep D. — 1,102 soru — ↓
...
12. ⭐ **Sen** — 687 soru — ↑ (highlighted)
...
46. Emre T. — 89 soru — ↓ (red zone)

**Bottom Section — Your Stats This Week:**
- "Bu hafta: 687 soru · 28 saat · 4 deneme"
- "Üst lige 313 soru kaldı" — progress bar showing how close to promotion zone
- "Geçen hafta: #8 — Gümüş'ten yükseldin! 🎉" (past result)

**League rewards:**
- Tier badges displayed on profile and in Portal
- "💎 Elmas Lig" badge next to name everywhere in the app

---

### SCREEN 11: Başarımlar & Rozetler (Achievements) — NEW
**Purpose:** Achievement/badge collection screen. Students unlock badges for milestones. Badges are shown on profile and next to name in Portal/League. Motivates through collection and public display.

**Layout:**

**Header:** "Başarımlar" + "12 / 48 rozet" count

**Badge Grid (main content, 3-column grid):**
Each badge is a card:
- Large icon/illustration (centered)
- Badge name below
- Unlocked: full color, glowing
- Locked: grayscale, slightly transparent, "?" or silhouette

**Badge Categories (horizontal tabs):**
- "Tümü" | "Çalışma" | "Deneme" | "Sosyal" | "Özel"

**Example Badges:**

**Çalışma (Study):**
- 🔥 "İlk Adım" — İlk çalışmanı kaydet (unlocked, bronze)
- 🔥 "7 Gün Seri" — 7 gün üst üste çalış (unlocked, silver)
- 🔥 "30 Gün Seri" — 30 gün üst üste (locked)
- 🔥 "100 Gün Seri" — 100 gün üst üste (locked, gold glow)
- 📚 "500 Soru" — 500 soru çöz (unlocked)
- 📚 "1000 Soru" — 1000 soru çöz (unlocked)
- 📚 "5000 Soru" — 5000 soru çöz (locked)
- ⏱ "Maraton" — Tek seansta 3+ saat çalış
- 🌙 "Gece Kuşu" — Gece 00:00'dan sonra çalış
- ☀️ "Erken Kalkan" — Sabah 6'dan önce çalış

**Deneme (Trial):**
- 📊 "İlk Deneme" — İlk denemeni gir
- 📈 "Yükseliş" — 3 deneme üst üste artış
- 🎯 "80+ Net" — Bir denemede 80+ net yap
- 💯 "Tam İsabet" — Bir derste sıfır yanlış

**Sosyal (Social):**
- 💬 "Yardımsever" — Portal'da 10 soruya cevap ver
- ⭐ "En İyi Cevap" — 5 kez en iyi cevap seçil
- 👥 "Sosyal Kelebek" — 10 arkadaş ekle
- 🏆 "Altın Lig" — Altın Lig'e yüksel
- 💎 "Elmas Lig" — Elmas Lig'e yüksel

**Özel (Special):**
- 🎄 "Yılbaşı Çalışkanı" — 31 Aralık'ta çalış
- 📅 "365" — 1 yıl boyunca her gün çalış

**Badge detail (on tap):**
- Enlarged badge icon
- Name + description
- Progress bar if partially done (e.g. "342 / 500 soru")
- Date unlocked if completed
- "Profilinde göster" toggle

**Unlocked badge animation:** When a badge is newly earned, show a celebratory animation — badge slides up with glow effect, confetti particles, haptic feedback.

---

### SCREEN 12: Profile & Stats
**Purpose:** Personal profile with stats, achievements showcase, and friends.

**Layout:**
- Avatar + "Eren" + exam badge "TYT + AYT Sayısal"
- Countdown: "Sınava 372 gün" amber chip
- League badge displayed: "💎 Elmas Lig" next to name
- **Rozet vitrin:** Top 3-4 selected badges displayed under name (student picks which to show)

**Stats Grid (2x2):**
- "4,280" toplam soru
- "186 saat" çalışma
- "12" deneme
- "23 gün" en uzun seri

**Subject Strength Chart:**
- Horizontal bars per subject (colored) with percentage

**Arkadaşlar Section — NEW:**
- "Arkadaşların (8)" section title
- Horizontal scroll of friend avatars
- Tap → see friend's public stats (total questions, streak, league, badges)
- "Arkadaş Ekle" button (share code or search)

**Haftalık Rapor + Kişisel Rekorlar** cards below

---

### SCREEN 13: Study Timer
**Purpose:** Pomodoro/free timer for focused sessions.

- Large circular timer ring (amber glow)
- "32:15" huge center
- "Matematik — Üslü Sayılar" below
- Pause/Resume (amber circle) + Stop (outlined)
- "Bu seansta: 45 dk · 22 soru" + "+5 soru" stepper

Minimal. Timer dominates. Dark + glowing amber.

---

### SCREEN 14: Bottom Tab Bar
**Design:**
- 5 tabs: Ana Sayfa (house), Dersler (book/grid), Kaydet (plus), Analiz (chart), Profil (user)
- Dark surface #141419, thin top border
- Active: amber icon + label
- Inactive: muted gray
- Center "Kaydet": elevated amber circle — primary action
- Active indicator: small amber dot above icon
- Height: ~65px + safe area

**Navigation note:** Portal, Canlı Çalışma, Lig, and Başarımlar are accessed from Home bento cards, Profile, or dedicated entry points — not separate tabs (5 tabs is the max, keep it clean).

---

## Important Design Notes

1. **DARK app.** Every screen. No white backgrounds.
2. **Numbers are HERO elements.** Oversized Space Grotesk Bold everywhere.
3. **Subject colors are SACRED.** Türkçe=blue, Matematik=amber, Fen=green, Sosyal=purple.
4. **Cards, not flat lists.** Everything in rounded cards.
5. **Amber is the action color.** Every CTA = #F5A623.
6. **MOTIVATE EVERYWHERE.** Progress bars, badges, streaks, improvements, "you're doing great" moments on EVERY screen.
7. **Home = Bento Grid.** Asymmetric, dynamic, each card different.
8. **Dersler = Skill Tree.** Expanding subjects into topics with progress = leveling up feeling.
9. **Canlı Çalışma = Virtual Library.** See others studying = accountability. No chat, no distraction. Just presence.
10. **Lig = Healthy Competition.** Weekly reset, promotion/relegation, visible everywhere via badges.
11. **Rozetler = Collection Dopamine.** Locked badges create curiosity, unlocked create pride.
12. **Portal = Minimal Q&A.** Not social media. No profiles/followers. Question + answer only.
13. **Mobile-first 390x844.** iPhone 14.
14. **Turkish language.** All text in Turkish.
15. **Z-gen appeal.** Duolingo meets trading dashboard meets gaming achievement system. Clean, bold, addictive.
16. **Feels FAST.** No clutter. Quick glance = full understanding.
