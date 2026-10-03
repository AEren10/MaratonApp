# Hareket denetimi + beğenmediğim sayfalar

Tarih: 3 Ekim 2026 · Dal: `claude/alo-x7w6ho`

## 1. Hareket: ne var, ne yapıldı

Uygulamanın hareket dili zaten disiplinli: `scripts/check-motion.js` bütçeyi
koruyor (900 ms tavanı, `FadeInDown` yasak, basma geri bildirimi 130 ms),
AGENTS.md'nin üç imza anı kodlanmış:

| İmza anı | Nerede |
|---|---|
| Durak tamamlandı (hat çizilir, düğüm oturur) | `components/charts/components/DrawnPath.js`, `components/streak/StreakDots.js`, `ProgressSegment` |
| Deneme kaydedildi (hat eski halden yeniye) | `screens/trial/components/TrialSummaryRouteLine.js`, `lib/summaryRoutePath.js` |
| Düğüm bir kez parlar | `components/common/completion/CompletionNodeLine.js` |

Bu dalda eklenenler — hepsi aynı iki hareket türünde (çiz/büyü + kay):

- **Açılış filmi** (onboarding): rota çizilir → durak tiklenir, hat uzar →
  haftanın çubukları dolar. Video değil, kod: tema uyumlu, 0 KB, azaltılmış
  hareket ayarına uyuyor.
- **Kurulum hattı** (`SetupRouteSteps`): Hesap → Sınav → Hedef → Seviye → Rota;
  her ekranda hat bir durak uzar.
- **Tabbar**: aktif sekmenin arkasında kayan hap.
- **Grup segmenti**: tabbar'la aynı kayan hap.
- **GrowBar**: ilerleme çizgileri ekrana girince soldan dolar (grup kartı,
  grup odası). Ana sayfadaki durak parçalarıyla aynı hareket.

## 2. Bilerek EKLEMEDİKLERİM

- Liste satırlarına giriş animasyonu: 25 Eylül kararı (bütçe yanlış yere
  harcanıyordu) hâlâ doğru. Günde onlarca kez görülen ekranlar sakin kalmalı.
- Sayı sayma (count-up) her yerde: bir ekranda üçüncü hareket türü olur.
  Yalnız Rota Hazır ekranındaki gün sayısında kalsın.
- Konfeti, rozet, ses: AGENTS.md yasağı.

## 3. Sırada ne var (öneri, yapılmadı)

1. **Ana sayfa "durak tamamlandı" anı**: satır tiklenince yalnız halka doluyor
   (160 ms). Satırların solundan geçen ince bir hat ve tiklenince bir sonraki
   satıra doğru çizilen parça, filmdeki sahnenin aynısı olur. Kullanıcı
   filmde gördüğünü ilk gün uygulamada da görür. Dosya:
   `src/screens/home/components/HomeTodayStops.js`.
2. **Sekme geçişinde içerik**: şu an `animation: "none"`. Kısa (180 ms)
   opaklık geçişi düşünülebilir; ama `freezeOnBlur` ile birlikte cihazda
   denenmeden açılmamalı.
3. **Analiz ilk gün**: dört boş kart yerine tek boş durum + "ilk denemeni gir"
   (PM raporu P1-2). Hareket değil, ama ilk izlenimin en zayıf yeri.

## 4. Beğenmediğim sayfalar (öncelik sırasıyla)

| # | Sayfa | Neden | Durum |
|---|---|---|---|
| 1 | Gruplar / grup odası (`screens/league`) | "Sosyal Hub", dolu kırmızı sekme, kırmızı "DÜŞME BÖLGESİ", 421 satır, eski token'lar | **Yeniden yapıldı** |
| 2 | Karşılama + kayıt + kurulum | Yanlış vaat ("hesap sonra"), tutarsız ilerleme çubukları, kayıt ekranı **çöküyordu** | **Yeniden yapıldı** |
| 3 | Arkadaşlar (`social/FriendsScreen.js`, 307 satır) | Eski tasarım dili, tek dosyada arama + istek + liste + engelleme | Sırada: Gruplar'ın diline taşınmalı |
| 4 | Meydan okuma (`social/ChallengeScreen.js`, 315 satır) | "Challenge" terimi, eski token'lar; v1 için gizlenebilir | Öneri: v1'de `FEATURES` ile gizle |
| 5 | Davet (`social/ReferralScreen.js`, 307 satır) | Davetin karşılığında ödül yok; ekran ödül vaat eder gibi | Öneri: sadeleştir ya da gizle |
| 6 | Analiz ilk gün (`analysis/AnalysisScreen.js`) | 4 boş kart + 3 sn sonra açılan popup | Sırada |
| 7 | Bildirimler (`notifications`, 310 satır) | Uzun tek dosya, boş durumu zayıf | Sırada |
| 8 | Seviye / XP (`profile/LevelScreen.js`) | Sahte "412 soru" kartı kaldırıldı; kalan XP dili rota metaforuyla çelişiyor | Kısmen düzeltildi |
| 9 | Kart ödeme ekranları (`premium/Payment*.js`) | Premium kapalıyken görünmüyor ama Apple 3.1.1'e aykırı; premium açılmadan silinmeli | Premium öncesi |
