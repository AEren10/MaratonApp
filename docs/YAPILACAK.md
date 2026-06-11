# MARATON - Yapilacaklar Listesi

## A. EKSIK EKRANLAR

| # | Ekran | Durum | Oncelik |
|---|-------|-------|---------|
| 1 | ForgotPassword | Tasarlanacak + kodlanacak | Yuksek |
| 2 | TopicStudy | Konu detay sayfasi (konu basliklari, istatistikler) | Orta |
| 3 | StudyLog | Gecmis calisma kayitlari listesi + Supabase | Yuksek |
| 4 | SubjectDetail | Ders bazli detay (tum konular, basari grafigi) | Orta |
| 5 | WeakAreas | Zayif alanlar analizi | Orta |
| 6 | Appearance | Gorunum ayarlari (dark only bilgi) | Dusuk |
| 7 | NotificationsSettings | Bildirim tercihleri detay | Dusuk |
| 8 | Privacy | Gizlilik politikasi metni | Dusuk |
| 9 | About | Uygulama hakkinda bilgi | Dusuk |

## B. CALISMAYAN BUTONLAR / AKISLAR

### Kritik
- [ ] TrialEntry "Kaydet" -> Redux + Supabase'e yazilacak
- [ ] AddStudy "Kaydet" -> Redux + Supabase'e yazilacak
- [ ] WrongDetail "Cozuldu Isaretle" -> Supabase update
- [ ] Settings "Cikis Yap" -> AuthContext.signOut
- [ ] Profile logout -> AuthContext.signOut

### Orta
- [ ] Settings satirlari -> Yeni ekranlara navigate
- [ ] Analysis > HistoryList -> TrialDetail'e navigate
- [ ] Home > LeagueCard -> Lig ekranina veya alert
- [ ] Home > LiveCard -> Canli oda ekranina veya alert

## C. AKIS / UX SORUNLARI

- [ ] Onboarding: ExamContext olustur, sinav bilgisini kaydet, ilk acilista goster
- [ ] Veri akisi: Mock data yerine Supabase + Redux baglantisi
- [ ] Pull-to-refresh: Tum ScrollView/FlatList'lere ekle
- [ ] Loading/Skeleton: Veri yuklenirken shimmer/skeleton goster
- [ ] Empty states: Bos listeler icin empty component
- [ ] Tab bar orta buton: Bottom sheet ile secenek sun (Kaydet/Deneme/Yanlis)

## D. TEKNIK SORUNLAR

- [ ] DEV_BYPASS = false yap (shipping oncesi)
- [ ] PlaceholderScreen.js sil
- [ ] ScreenErrorBoundary ekle
- [ ] Analytics event'leri bagla
- [ ] Offline queue sistemi

## E. TASARIM IYILESTIRMELERI

- [ ] Kart press animasyonlari (scale: 0.98)
- [ ] Flashcard flip animasyonu (Reanimated)
- [ ] Timer bitis bildirimi + ses
- [ ] Timer'a ders/konu context'i
- [ ] Arama (search) fonksiyonu
- [ ] Avatar foto yukleme
- [ ] Sinav geri sayimi Home'da da goster
