# Maraton UX Akış Raporu

Tarih: 2026-06-17

---

## Tab Bar (5 tab)

| Tab | Ekran | FAB (+) |
|-----|-------|---------|
| Ana Sayfa | Home | Çalışma Kaydet / Deneme Gir / Yanlış Ekle / Yanlış Defteri |
| Dersler | DailyPlan | — |
| + (FAB) | QuickActionSheet | — |
| Analiz | Analysis | — |
| Profil | Profile | — |

---

## KRİTİK — Orphan Ekranlar (Hiçbir yerden ulaşılamıyor)

| Ekran | Durum |
|-------|-------|
| **StudyLogScreen** (Çalışma Geçmişi) | Hiçbir ekrandan `navigate(STUDY_LOG)` çağrılmıyor. Kullanıcı geçmiş çalışmalarını göremez. |
| **TopicCardsScreen** + **CardDetailScreen** | Navigator'da kayıtlı ama hiçbir buton buraya yönlendirmiyor. Flashcard özelliği tamamen gizli. |
| **WeakAreasScreen** (Zayıf Alanlar) | SubjectDetail'den buraya link yok. Ekran var ama erişilemiyor. |
| **RankSimulatorScreen** | Home'daki "Simülasyon" ExamSimulator'a gidiyor. RankSimulator'a giden buton yok. |

---

## YÜKSEK — Akış Sorunları

### 1. SwipeReview/ReviewSession gizli
Sadece WrongNotebook'taki `DueBanner`'dan erişilebiliyor. Kullanıcı status filtresini "çözüldü" yaparsa banner kaybolur ve her iki review modu da ulaşılamaz hale gelir. Kalıcı bir buton yok.

### 2. DayDetails (Takvim) tamamen pasif
Takvimde bir güne tıklayınca çalışma logları ve deneme sonuçları gösteriliyor ama hiçbiri tıklanabilir değil. Deneme detayına gidemez, çalışma kaydını düzenleyemez.

### 3. ChallengeCard dead tap
Press animasyonu var ama `onPress` handler'ı yok. Kullanıcı kartı basar, animasyon oynar, hiçbir şey olmaz.

### 4. QuickPractice'te çıkış yok
Quiz başlayınca X/kapat/geri butonu yok. Tüm soruları cevaplamadan çıkamaz (sadece sistem gesture'ı ile).

### 5. Dersler tab'ında Plan'a erişim yok
"DailyPlan" tab'ı sadece ders/konu listesi gösteriyor ama PlanDetail'e link yok. Günlük plan sadece Home'dan erişilebilir.

---

## ORTA — Navigasyon Karışıklıkları

### 6. Hero ring → AddStudy kafa karıştırıcı
Ekranın en büyük görsel elemanı (ilerleme halkası) tıklanınca çalışma kaydet formuna gidiyor. Kullanıcı bir ilerleme/stats ekranı bekler.

### 7. ExamCountdown → Goals beklenmedik
Sınav geri sayım kartı Goals (hedef ayarları) ekranına gidiyor. Kullanıcı sınav bilgisi/detay bekler.

### 8. Streak pill → Profile
Seri göstergesi Profile'a gidiyor. Kullanıcı bir seri detay/takvim ekranı bekler.

### 9. Filter state senkron değil
AnalysisScreen'de AYT filtresi seçip "Detaylı Analiz"e basınca TrialInsights "ALL" filtresiyle açılıyor. Seçim aktarılmıyor.

### 10. TrialSummary'de dismiss yok
`gestureEnabled: false`, geri butonu yok. Tek çıkış "Detayları Gör". Paylaşım istemiyorsa bile tıklamak zorunda.

### 11. WrongNotebook tab toggle çok silik
Defterim/Topluluk geçişi sadece küçük text — ikon yok, vurgu yok. Topluluk tab'ını keşfetmek zor.

---

## DÜŞÜK — İyileştirme Fırsatları

| # | Sorun | Ekran |
|---|-------|-------|
| 12 | PlanDetail'e 6 farklı yerden ulaşılıyor — fazla ama zararsız | Home |
| 13 | StudySummary `goBack()` sonrası tahmin edilemez ekrana düşüyor | StudySummary |
| 14 | TrialCompare otomatik eşleşiyor, kullanıcı seçemiyor | TrialCompare |
| 15 | SubjectDetail'deki satırlar (geçmiş, konular) tıklanabilir değil | SubjectDetail |
| 16 | ShareCard'da paylaş butonu yok, sadece screenshot bekleniyor | ShareCard |
| 17 | StudyLogScreen'de hardcoded `"AddStudy"` string, `SCREENS.ADD_STUDY` olmalı | StudyLogScreen |
| 18 | Home'dan Settings/Roadmap/RankSimulator'a direkt yol yok | Home |
| 19 | MotivCard ve PlanCard import ediliyor ama HomeScreen'de render edilmiyor | Home |
