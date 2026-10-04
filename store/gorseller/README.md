# Maraton — App Store Görselleri ve Önizleme Videosu

Bu klasördeki her şey `kaynak/` altındaki HTML şablonlardan, uygulamanın kendi
token'larıyla (`src/themes/palette.js`, `design/extracted/tokens.md`) ve kendi
fontlarıyla (Archivo + Bricolage Grotesque + Unbounded logo) üretildi.
Ekranlardaki veriler **kurgusal demo verisidir** ama kendi içinde tutarlıdır
(ör. TYT: 87 D · 23 Y · 10 B → 87 − 23/4 = **81,25 net**; ders netleri toplamı 81,25).

```
store/gorseller/
├── ios-6.9/   1320 × 2868  (iPhone 6.9" — App Store Connect'te ZORUNLU tek boyut)
├── ios-6.5/   1284 × 2778  (iPhone 6.5" — isteğe bağlı, yüklersen ölçekleme yapılmaz)
├── video/     maraton-onizleme-886x1920.mp4  (29,5 sn) + poster.jpg
└── kaynak/    screens.css · screens.js · screenshots.html · video.html · render*.mjs
```

---

## 1. Altı ekran görüntüsü — sıra, metin ve gerekçe

Kullanıcıların çoğu yalnızca ilk 2–3 kareyi görür (arama sonucunda ilk 3 kare
yan yana çıkar). Bu yüzden sıralama "değer → kanıt → derinlik" mantığında.

| # | Dosya | Üst etiket | Başlık | Alt metin | Neden bu sırada |
|---|---|---|---|---|---|
| 1 | `01-rota.png` | GÜNLÜK ROTA | Bugün ne çalışacağın **hazır.** | Rotan her sabah duraklara bölünür. Sen yalnızca başla. | Uygulamanın tek cümlelik vaadi. Logo + kahraman sayı (63/100) + rota hattı + kırmızı "Çalışmaya Başla". |
| 2 | `02-net-takibi.png` | NET TAKİBİ | Netlerin nereye gidiyor, **gör.** | Her denemeyi gir; grafiğin ders ders nerede ilerlediğini gösterir. | YKS öğrencisinin 1 numaralı derdi: "netim artıyor mu?" 67,75 → 81,25 yükselen grafik + hedef çizgisi. |
| 3 | `03-deneme-analizi.png` | DENEME ANALİZİ | Ders ders, **net net.** | Doğru, yanlış, boş — ve en çok nerede net kaybettiğin. | Derinlik kanıtı: D/Y/B kırılımı + "En çok kayıp: Matematik · Fonksiyonlar". |
| 4 | `04-yanlis-defteri.png` | YANLIŞ DEFTERİ | Aynı soruda **iki kez** yanılma. | Yanlışını fotoğrafla, notunu düş. Tekrar gününü Maraton hatırlatır. | Rakiplerden ayrışan alışkanlık özelliği; fotoğraflı soru kartları + tekrar durumu. |
| 5 | `05-haftalik-program.png` | HAFTALIK PROGRAM | Haftanı tek bakışta **kur.** | Hangi gün, hangi ders, kaç dakika — hepsi tek ekranda. | Planlama: 19/22 durak, gün şeridi, saatli durak listesi. |
| 6 | `06-hedef-seri.png` | HEDEF VE SERİ | Hedefine kaç net **kaldığını** bil. | Başlangıcın, bugünün ve hedefin aynı hatta. Seri seni masada tutar. | Kapanış/motivasyon: 258 gün sayacı, 62 → 81,25 → 95 hattı, 47 günlük seri ısı takvimi. |

Tasarım kuralları (AGENTS.md ile uyumlu): derinlik gölgeyle değil yüzey tonu +
1px kenarlıkla; kırmızı yalnız marka/CTA; düşüş kırmızı değil; ders renkleri yalnız
ders bağlamında; 11px altı metin yok; konfeti/rozet yok. `store/listing-tr.md`'deki
kural gereği **lig, sosyal, premium veya yapay zekâ iddiası yok.**

### Teknik uygunluk (Apple, Ekim 2026 itibarıyla doğrulandı)
- 6.9" kabul edilen boyutlar: 1260×2736 / **1290×2796** / **1320×2868** — biz 1320×2868 verdik.
- 6.5": 1242×2688 / **1284×2778** — biz 1284×2778 verdik.
- PNG, **alfa kanalı yok** (rgb24'e çevrildi — Apple şeffaflığı reddeder).
- 1–10 adet kabul edilir; 6 adet ideal.
- `ios.supportsTablet: false` olduğu için iPad görseli gerekmez.

---

## 2. Önizleme videosu (App Preview)

`video/maraton-onizleme-886x1920.mp4` — 886×1920, 30 fps, H.264 High@4.0,
29,5 sn, stereo AAC 256 kbps 48 kHz (sessiz iz; Apple ses izi bekliyor).

| Zaman | Sahne | Hareket |
|---|---|---|
| 0,0–2,8 | Logo · MARATON · "HER GÜN BİR ADIM DAHA" | Yukarı süzülme |
| 2,6–7,6 | Günlük rota | Telefon yükselir, rota hattı çizilir, duraklar sırayla oturur |
| 7,4–11,8 | Net takibi | Net hattı eski halden yeni hale çizilir |
| 11,6–15,8 | Deneme analizi | Ders çubukları soldan dolar |
| 15,6–19,8 | Yanlış defteri | Soru kartları sırayla yükselir |
| 19,6–23,4 | Haftalık program | İlerleme çubuğu dolar |
| 23,2–27,2 | Hedef ve seri | Hedef hattı çizilir, seri takvimi dolar |
| 27,0–29,5 | Logo · "YKS'YE KADAR YANINDA" · "Rotanı bugün başlat." | Yukarı süzülme |

Poster kare: `video/poster.jpg` (5,5. sn). App Store Connect'te poster karesini
5–6. sn civarından seç.

> ⚠️ **Önemli — App Store kuralı:** Apple, App Preview'larda *uygulamanın kendi
> ekran kaydının* kullanılmasını ister (Guideline 2.3.4). Bu video, uygulamanın
> tasarımından birebir yeniden çizilmiş bir hareketli tanıtımdır. Instagram/TikTok,
> web sitesi, Google Play promo videosu (YouTube) için doğrudan kullanılabilir.
> App Store'a yüklemeden önce en güvenli yol: aşağıdaki **Bölüm 5.3'teki çekim
> senaryosu** ile demo hesapta gerçek ekran kaydı al ve aynı kurguyu uygula.

---

## 3. Mağaza metinleri (App Store Connect'e kopyala)

**Ad (30):** `Maraton: YKS Çalışma Takibi` (27)

**Alt başlık (30):** `Deneme analizi ve günlük rota` (29)

**Anahtar kelimeler (100):** Addaki kelimeleri (yks, çalışma, takip) tekrar etme — Apple zaten indeksliyor.
```
tyt,ayt,deneme,net hesaplama,sıralama,yanlış defteri,ders programı,sınav,hazırlık,soru,üniversite
```
(97 karakter)

**Promosyon metni (170):**
```
Netini, rotanı ve yanlışlarını tek yerde tut. Her sabah durakların hazır; sen yalnızca başla. YKS 2027 için bugün ilk adımı at.
```

**Açıklama:**
```
YKS'ye hazırlanırken en zor soru çoğu zaman "Bugün ne çalışayım?" sorusudur. Maraton bu soruyu senin yerine cevaplar.

BUGÜNÜN ROTASI HAZIR
• Her sabah çalışacağın konular duraklara bölünür.
• Kaç soru, kaç dakika — hepsi belli. Sen yalnızca "Çalışmaya Başla"ya bas.
• Rota hattında nereden geldiğini ve bu tempoyla sınav günü nereye varacağını gör.

NETLERİN NEREYE GİDİYOR?
• TYT ve AYT denemelerini gir; net grafiğin hedef çizgisiyle birlikte büyüsün.
• Türkçe, Matematik, Fen, Sosyal — her dersin kendi trendi.

DERS DERS, NET NET
• Her denemenin doğru, yanlış, boş ve net kırılımı.
• En çok net kaybettiğin konu tek bakışta önünde.

YANLIŞ DEFTERİ
• Yanlış sorunun fotoğrafını çek, neden yanıldığını not al.
• Tekrar günü geldiğinde Maraton hatırlatır; aynı soruda iki kez yanılma.

HAFTALIK PROGRAM
• Haftanı gün gün, saat saat kur.
• Kaç durak tamamladın, kaç saat çalıştın — hepsi tek ekranda.

HEDEF VE SERİ
• Başlangıç netin, bugünkü netin ve hedefin aynı hatta.
• Sınava kalan gün sayacı ve her gün masaya oturmanı sağlayan seri takvimi.

Maraton — her gün bir adım daha.

Destek: destek@maratonapp.com
Gizlilik: https://maratonapp.com/privacy
Kullanım koşulları: https://maratonapp.com/terms
```

> ⚠️ `store/listing-tr.md` şu an **"Tamamen ücretsiz"** diyor, ama kodda paywall,
> abonelik ve 8. gün kilidi var (`src/screens/premium/`, `src/lib/purchases.js`).
> Bu çelişki App Review'da ret sebebidir (Guideline 2.3.1 / 3.1.2). Yukarıdaki
> metinlerde fiyat iddiası yok. Abonelik yayına girecekse açıklamaya fiyat,
> süre, otomatik yenileme ve EULA/Gizlilik bağlantıları eklenmeli.

**Bu sürümde yenilikler (1.0.0):** `Maraton yayında. Rotan hazır — ilk durağın seni bekliyor.`

---

## 4. Yeniden üretme

```bash
cd store/gorseller/kaynak
node render.mjs            # ios-6.9 ve ios-6.5 PNG'leri
node render.mjs ios-6.9    # yalnız bir boyut
node render-video.mjs      # video + poster (~4–5 dk)
```
Gereken: Node 18+, Playwright (yerel ya da global), ffmpeg.
Metni değiştirmek için `screenshots.html` içindeki `SLIDES`, ekranı değiştirmek
için `screens.js` içindeki `scr*` fonksiyonları, video zamanlaması için
`video.html` içindeki `SCENES`.

---

## 5. Dev prompt — başka bir araçla (ya da tasarımcıyla) yeniden üretmek için

### 5.1 Ana görsel prompt'u (Midjourney / GPT-Image / Gemini / Figma AI / tasarımcıya brif)

```
ROLE: You are a senior App Store creative director and product designer. Produce a set of 6 portrait
App Store screenshots for "Maraton", a Turkish YKS (university entrance exam) study companion app for
iPhone. The set must read as ONE system: same background, same type scale, same phone position.

CANVAS: 1320 x 2868 px (iPhone 6.9"), RGB, no transparency, no rounded canvas corners.

BRAND
- Name: MARATON (logo wordmark in Unbounded SemiBold, uppercase, letter-spacing +6%).
- Logo mark: two soft overlapping arches like an "M" — left arch ivory-to-grey gradient, right arch
  crimson #E5343F, ending in a small red dot (a runner's finish point). Tagline: "HER GÜN BİR ADIM DAHA".
- Personality: calm, serious, editorial, confident. Like a premium running app crossed with a
  financial dashboard. NOT childish, NOT gamey, NO emoji, NO confetti, NO badges, NO mascots,
  NO 3D clay, NO stock photos of students.

COLOR (dark theme, exact hex)
- Background #1C1C23; card surface #28282F; raised surface #35353B; inset well #212129;
  progress track #30303B; divider #3A3A42.
- Text #ECE8E4; secondary #B0ADB5; tertiary/meta #A3A0AB; chart-axis only #827F88.
- Brand crimson #E5343F (route line, primary button fill #CF2833, active tab). Red text #FF6A72.
- Increase only: green #34D399. Decrease: muted grey #9A97A0 (never red). Warning: brass #E0A93F.
- Subject colors (only for subject identity, never for status): Türkçe #74A9E8, Matematik #E0A570,
  Fizik #56C6D6, Kimya #E8A0C4, Biyoloji #7FCB7A, Tarih #D6C25A, Coğrafya #A27BF8, Felsefe #A78BFA.
- Depth is built with surface tone + 1px borders, NOT drop shadows inside the UI.
- Canvas background: #1C1C23 with a soft crimson radial glow (30% opacity) bleeding from the top-left
  corner and a faint second glow on the right edge at 70% height; ultra-subtle 4px dot grain.

TYPOGRAPHY
- Headlines and hero numbers: Bricolage Grotesque Regular (400), tight tracking (-3.5% to -4%).
- UI and body: Archivo (400/500/600/700). Section labels: Archivo 600, UPPERCASE, +16% tracking.
- Tabular numerals everywhere. Turkish characters must render perfectly: ç ğ ı İ ö ş ü.

LAYOUT (identical on every frame)
- Top 30% = copy block, left aligned, 96 px side margin:
  1) kicker: a 66 px crimson rule + UPPERCASE label in #FF6A72, ~39 px, +18% tracking;
  2) headline: Bricolage ~132 px, 2 lines max, line-height 1.04, one key word in #FF6A72;
  3) subline: Archivo ~50 px, #B0ADB5, max 2 lines.
- Bottom 70% = a modern iPhone (Dynamic Island, thin black bezel, 1.5 px graphite outline), centered,
  ~1060 px wide, straight-on (no tilt, no perspective), cropped by the bottom canvas edge so the
  bottom ~10% of the phone bleeds off. No hand, no desk, no reflections.
- Status bar inside the phone: "9:41", signal, wifi, full battery. Hide the tab bar.

FRAME 1 — kicker "GÜNLÜK ROTA" / headline "Bugün ne çalışacağın hazır." (red: "hazır.") /
  sub "Rotan her sabah duraklara bölünür. Sen yalnızca başla." Place the MARATON logo above the kicker.
  Screen: header with "AY" avatar square, "İYİ SABAHLAR / Ahmet Yılmaz", pill "orange flame
  icon + 47 GÜN". Label "BUGÜN ÇÖZÜLEN", giant hero number "63" with small "/100", "hedefe 37 soru kaldı";
  top-right "YKS 2027 / 258 gün". A route chart: solid crimson line with hollow node circles climbing
  left-to-right through labels "Fonksiyonlar", "Limit", ending at a filled glowing node labelled "BUGÜN",
  then a dotted lighter-red projection rising to a hollow ring "TAHMİN 88". Axis "4 AĞU · 4 EKİ · HAZ 2027".
  Line "Bu tempoyla sınav günü 88 net · hedefinin 2 net üstünde". Full-width crimson card
  "Çalışmaya Başla / Matematik · Türev · 32 dk" with a round arrow. Section "BUGÜNÜN DURAKLARI 2/4"
  with segmented progress; list cards: ✓ Matematik "Limit ve Süreklilik", ✓ Türkçe "Paragrafta Yapı",
  active (amber-tinted) Matematik "Türev Alma Kuralları" with a small "Başla" button, Fizik "Dalgalar".

FRAME 2 — "NET TAKİBİ" / "Netlerin nereye gidiyor, gör." (red: "gör.") /
  "Her denemeyi gir; grafiğin ders ders nerede ilerlediğini gösterir."
  Screen: title "Analiz" + segmented TYT|AYT (TYT on). Card: "SON DENEME · 2 EKİM", "6 DENEME",
  huge "81,25" + green "↑ 13,5 net", meta "İlk denemene göre · 6 Temmuz'dan bu yana". Line chart
  60–90 grid, dashed crimson target line labelled "HEDEF 90", crimson line with area fade through
  67,75 · 70,5 · 69,25 · 74 · 77,5 · 81,25, last point filled with a "81,25" tooltip; x-axis
  "6 Tem · 27 Tem · 17 Ağu · 7 Eyl · 21 Eyl · 2 Eki". Below "DERS BAZINDA": rows with subject dot,
  name, green delta, sparkline in subject color, big net: Türkçe 31,5 (+4,25) · Matematik 24,75 (+6,0)
  · Fen Bilimleri 13,0 (+2,5) · Sosyal Bilimler 12,0 (+0,75).

FRAME 3 — "DENEME ANALİZİ" / "Ders ders, net net." (red: "net net.") /
  "Doğru, yanlış, boş — ve en çok nerede net kaybettiğin."
  Screen: back chevron, centered label "DENEME DETAYI", red label "TYT · GENEL DENEME 6",
  meta "2 Ekim Cuma · 165 dakika", giant "81,25 net". Four mini stat tiles: 87 doğru · 23 yanlış ·
  10 boş · +3,75 önceki (green). "DERS DERS" cards with subject strip, "D · Y · B / total", big net and a
  stacked bar (correct in subject color, wrong in dark grey, blank empty): Türkçe 33·6·1/40 → 31,5;
  Matematik 27·9·4/40 → 24,75; Fen 14·4·2/20 → 13,0; Sosyal 13·4·3/20 → 12,0. Brass-tinted insight
  card "EN ÇOK KAYIP · Matematik · Fonksiyonlar · 4 yanlış · 2,25 net kaybı" + outlined "Deftere ekle".

FRAME 4 — "YANLIŞ DEFTERİ" / "Aynı soruda iki kez yanılma." (red: "iki kez") /
  "Yanlışını fotoğrafla, notunu düş. Tekrar gününü Maraton hatırlatır."
  Screen: title "Yanlış Defteri" + crimson camera button; "16 çözülmemiş soru · 5'i bugün tekrar
  bekliyor"; filter chips (Tümü · 16 active in tinted red, Matematik, Fizik, Türkçe, Kimya); a
  "BU HAFTA 11 yanlış yeniden çözüldü" card with 7 tiny bars (one crimson). Question cards: left a
  slightly rotated cream paper photo thumbnail of a hand-written problem (parabola x²−4x+3=0; a sine
  wave "λ = ? m"; a paragraph with A) B) C) D); "2H₂ + O₂ → 2H₂O"), right: colored subject label,
  topic in Bricolage, a quoted personal note, and a status pill ("Tekrar bugün" brass,
  "Tekrar yarın" grey, "2. tekrar ✓" green, "Tekrar 3 gün sonra" grey).

FRAME 5 — "HAFTALIK PROGRAM" / "Haftanı tek bakışta kur." (red: "kur.") /
  "Hangi gün, hangi ders, kaç dakika — hepsi tek ekranda."
  Screen: back chevron + "Programım" + calendar icon. Card "BU HAFTA · 28 Eylül – 4 Ekim", hero
  "19 / 22 durak tamamlandı", crimson progress at 86%, "14 sa 20 dk çalışıldı · 16 sa planlı".
  Segmented Haftalık|Aylık. Day strip PZT 28 … CMT 3 filled crimson, PAZ 4 outlined (today).
  "PAZAR · 4 EKİM · 5 durak · 2 sa 47 dk" list: 09:30 Türkçe · Sözcükte Anlam (struck, green BİTTİ),
  11:00 Matematik · Limit ve Süreklilik (BİTTİ), 14:00 (red, current) Matematik · Türev Alma Kuralları
  32 dk, 16:30 Fizik · Dalgalar 25 dk, 20:00 Kimya · Mol Kavramı 30 dk.

FRAME 6 — "HEDEF VE SERİ" / "Hedefine kaç net kaldığını bil." (red: "kaldığını") /
  "Başlangıcın, bugünün ve hedefin aynı hatta. Seri seni masada tutar."
  Screen: "Hedefim" + chip "TYT + AYT Sayısal". Card with crimson corner glow: "YKS 2027'YE",
  giant "258 gün", "Her gün bir adım daha." Card "TYT NET HEDEFİ · 13,75 net kaldı": horizontal
  route — hollow node BAŞLANGIÇ 62, solid line to glowing node ŞİMDİ 81,25, dotted to hollow node
  HEDEF 95; divider; "AYT Sayısal 48,5 → hedef 65 ↑ 9,25". Card "flame icon + 47 günlük seri · son 15 hafta":
  GitHub-style heat calendar 15×7 in 5 crimson intensities, last 47 days all filled, today outlined.

QUALITY BAR: pixel-crisp UI text (no gibberish letters), perfect Turkish spelling, consistent 22 pt
inner screen margins, generous whitespace, no lorem ipsum, no English UI strings, no pricing,
no "free", no "#1", no ranking/AI/social/league claims, no Apple device names in copy.
```

### 5.2 Video prompt'u (Sora / Veo / Runway / After Effects brifi)

```
Create a 29-second vertical (886 x 1920, 30 fps) product motion video for "Maraton", a dark-themed
Turkish YKS exam study app. Visual system: background #1C1C23 with a soft crimson (#E5343F) glow from
the top-left, Bricolage Grotesque headlines, Archivo UI text, an iPhone with Dynamic Island shown
straight-on, cropped by the bottom edge. Motion language: calm and precise, 0.5–0.9 s ease-out moves,
max two motion types per scene (upward float + line drawing / bar filling). No camera shake, no 3D
spins, no confetti, no particle bursts, no whooshy transitions; scenes cross-fade in 0.5 s.

0.0–2.8  Logo mark floats up, then "MARATON" (Unbounded, uppercase), then "HER GÜN BİR ADIM DAHA".
2.6–7.6  Kicker "GÜNLÜK ROTA", headline "Bugün ne çalışacağın hazır." Phone rises 60 px into place;
         the crimson route line draws left→right to a glowing "BUGÜN" node, dotted projection fades in
         to "TAHMİN 88"; study-stop cards settle in one by one; screen slowly scrolls up 60 px.
7.4–11.8 "NET TAKİBİ" — "Netlerin nereye gidiyor, gör." Net line chart draws from 67,75 to 81,25
         under a dashed "HEDEF 90" line.
11.6–15.8 "DENEME ANALİZİ" — "Ders ders, net net." Per-subject stacked bars fill from the left.
15.6–19.8 "YANLIŞ DEFTERİ" — "Aynı soruda iki kez yanılma." Photo question cards rise in sequence.
19.6–23.4 "HAFTALIK PROGRAM" — "Haftanı tek bakışta kur." Weekly progress bar fills to 86%.
23.2–27.2 "HEDEF VE SERİ" — "Hedefine kaç net kaldığını bil." Target route draws 62 → 81,25;
         47-day streak heat calendar fills cell by cell.
27.0–29.5 Logo + "YKS'YE KADAR YANINDA" + "Rotanı bugün başlat." (word "bugün" in #FF6A72).
Audio: optional soft, minimal piano/ambient pulse at ~90 BPM, no voice-over, no sound effects.
```

### 5.3 App Store'a yüklenecek GERÇEK ekran kaydı için çekim senaryosu

1. Demo hesabı `store/store-yapilacaklar.md` §5'teki gibi doldur (3 TYT + 2 AYT deneme, 14 günlük
   çalışma kaydı, 5+ yanlış, aktif seri). Saat 9:41, pil dolu, bildirimler kapalı (Odak modu).
2. iPhone 15/16 Pro Max'te Denetim Merkezi → Ekran Kaydı (ya da Mac'te QuickTime → Yeni Film Kaydı
   → iPhone kaynağı). Kayıt 1290×2796 gelir.
3. Sırayla çek: Rota ekranı (aşağı kaydır, "Çalışmaya Başla"ya bas) → Analiz (TYT grafiği) → bir
   denemenin detayı → Yanlış Defteri (bir karta dokun) → Programım → Profil/Hedef. Her ekranda
   3–4 sn, parmak hareketleri yavaş.
4. Kurgu: bu videodaki zaman çizelgesini kullan; ekran kaydını telefon çerçevesinin içine yerleştir,
   üst metinleri aynı şekilde ekle. Dışa aktar: 886×1920, 30 fps, H.264, stereo AAC, 15–30 sn.
   `ffmpeg -i kayit.mov -vf "scale=886:1920:force_original_aspect_ratio=decrease,pad=886:1920:(ow-iw)/2:(oh-ih)/2:color=0x1C1C23,fps=30" -c:v libx264 -profile:v high -level 4.0 -b:v 11M -c:a aac -b:a 256k -ac 2 cikti.mp4`
