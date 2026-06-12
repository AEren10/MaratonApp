# CHANGES — Katman 1 (Hızlı Kazanım)

Kullanıcı isteği: 14 maddenin tamamı sırayla. Bu dosya Katman 1 (6 madde) ilerlemesini takip eder.
Commit yapılmıyor — kullanıcı manuel inceleyecek.

## Katman 1 — TAMAMLANDI (6/6)

### 1. Bugün kaç soru mikro-hedef halkası (Home) ✅
- Migration: `008_daily_question_goal.sql` → `profiles.daily_question_goal`.
- Hedef kaynağı: mevcut `goalsSlice.dailyQuestions` kullanıldı (yeni paralel kaynak açılmadı).
- Yeni: `src/screens/home/components/DailyGoalCard.js` (mevcut `ProgressRing` ile).
- HomeScreen: kart en üstte; hedef aşılınca günde 1 kez `daily_goal_complete` XP + XPToast.
- GoalsScreen: 50/100/150/200 hızlı chip seti eklendi.
- XP: `gamification.js` + `xpEngine.js` → `daily_goal_complete` (40 XP).

### 2. Yanlış soru "kayıp net" rozeti ✅
- Yeni: `src/lib/topicDifficulty.js` (konu adı → zorluk → ort. doğruluk + net kaybı).
- WrongCard: çözülmemiş sorularda "100'de ~X doğru · -1.25 net" rozeti.

### 3. Streak freeze (joker gün) ✅
- Migration: `009_streak_freeze.sql` → `freeze_count`, `last_freeze_at`, `freeze_reset_at`.
- Yeni: `src/lib/streakFreeze.js` (merkezi streak+joker hesabı, pazartesi 04:00 reset).
- AddStudyScreen: inline streak mantığı bu lib'e taşındı; joker kullanılınca uyarı.
- studyLogSlice: `freezeCount` state + selector; useDataSync dispatch ediyor.
- StreakCard (Home): "🛡 N joker" rozeti.

### 4. Deneme sonrası mood (3 sn emoji) ✅
- Migration: `010_trial_mood.sql` → `trials.mood` (good/okay/bad, opsiyonel).
- TrialEntryScreen: emoji seçici (😄😐😞), atlanabilir; payload'a `mood`.
- useDataSync: trial mapping'e `mood` eklendi.
- Yeni: `src/screens/analysis/components/MoodTrend.js` → AnalysisScreen'de moral şeridi.
- Not: WeeklyReport'a mood trendi eklenmedi (trial-analysis şeridi çekirdek teslimat; istenirse eklenir).

### 5. Konu mastery rozeti ✅
- Yeni: `src/lib/mastery.js` (gri/sarı/yeşil eşikleri + `masteryPercent`).
- TopicRow (dersler): mastery renkli noktası.
- SubjectCard: "%X ustalaşıldı" rozeti.
- TopicStudyScreen: ring altında mastery etiketi.

### 6. Paylaşılabilir deneme karnesi ✅
- Bağımlılık: `react-native-view-shot` + `expo-sharing` (expo install, SDK 54 uyumlu).
- Yeni: `src/screens/trial/components/TrialReportCard.js` (watermark'lı karne).
- TrialDetailScreen: "Paylaş" butonu → captureRef (PNG) → Sharing.shareAsync.

## Doğrulama
- 22 değişen/yeni dosya babel-preset-expo ile parse edildi: 22/22 OK.
- Not: Yeni dosyalara sızan `</content>` artığı temizlendi.

## Migration Uygulama Hatırlatması
008/009/010 migration'ları Supabase'e uygulanmadan; günlük hedef halkası çalışır
(goalsSlice AsyncStorage), ama joker (009) ve mood (010) sunucu kayıtları için
migration gerekir. `updateStreak` freeze kolonları olmadan hata verirse 009 uygulanmalı.

---

---

# DÜZELTMELER — Teşhis Sorunları (A / B / C)

## A) LEAGUE — gerçek veri + tek metrik + canlıya yakın refresh
- Migration `011_league_view.sql`: `leaderboard_weekly` view (haftalık soru + 5×deneme = weekly_xp), `profiles.show_in_leaderboard` flag, public GRANT.
- Yeni `src/constants/league.js`: tier eşikleri haftalık XP'ye göre (tek para birimi).
- Yeni `src/supabase/league.js`: `fetchGlobalTop`, `fetchFriendsLeague` → `{list, myRank, myScore}`.
- `LeagueScreen.js` baştan yazıldı: botlar+sahte setTimeout SİLİNDİ. İki sekme (Arkadaşlar/Global Top 50), arkadaş yoksa "Arkadaş ekle" empty state, hata → "yüklenemedi" (bot YOK). useFocusEffect + 30sn polling + pull-to-refresh.

## B) WRONG QUESTION — curriculum konu dropdown
- Migration `012_wrong_topic_source.sql`: `wrong_questions.topic_source` ('curriculum'/'custom').
- Yeni `TopicPicker.js`: curriculum'dan modal seçici + "elle yaz" (custom). 
- AddWrongScreen: TextInput → picker; ders değişince konu sıfırlanır; payload'a topic_source.
- WrongNotebookScreen: ders seçilince konu filtre çubuğu (yanlış sayısına göre).
- SubjectDetailScreen: "En çok yanlış yapılan 5 konu" mini listesi (wrong_questions'tan).

## C) HOMESCREEN PLAN — kişiselleştirme + smartNudge döngüsü
- Yeni `src/lib/buildPlanContext.js`: `weightedWeakAreas` (son 3 deneme 0.5/0.3/0.2), `buildRecentStudy` (7 gün), `buildTopicWeakness` (topic_progress).
- Yeni `src/hooks/usePlanContext.js`: iki ekran ortak bağlam (DRY) — 7 günlük log + topic_progress fetch + nudge→priorityReasons.
- `planEngine.js`: topicWeakness (konu seviyesi görev: "Matematik · Köklü Sayılar"), priorityReasons (net-düşüş boost + gerekçe), rkind çıktısı.
- HomeScreen: `generateDailyPlan` artık tam bağlamla beslenir; PlanCard altına "Öncelik: ... — gerekçe" satırı; NudgeModal "Plana Ekle" gerçek enjeksiyon.
- Yeni `src/store/slices/planSlice.js` (+store kaydı): `addAdHocTask` ile smartNudge görevi plana girer (günlük, dedup).
- PlanDetailScreen: usePlanContext'e geçti, ad-hoc görevler listeye karışır, konu seviyesi etiket, görev gerekçeleri PlanTaskItem chip'inde.
- Yeni `TaskReasonSheet.js`: göreve tıklayınca gerekçe + bu dersin 7 günlük net trendi (TrendChart) bottom-sheet.

## Doğrulama
- 17 değişen/yeni dosya babel-preset-expo ile parse: 17/17 OK. Stray `</content>` artıkları temizlendi.

## Kullanıcının Manuel Uygulaması Gereken Adımlar (Supabase)
1. Migration `011_league_view.sql` çalıştır (view + show_in_leaderboard kolon + GRANT). **Lig bu olmadan "yüklenemedi" gösterir (bot değil).**
2. Migration `012_wrong_topic_source.sql` çalıştır (topic_source kolon). Olmadan yeni yanlış kaydı topic_source ile hata verebilir.
3. (Önceki Katman 1) 008/009/010 hâlâ uygulanmadıysa onlar da gerekli.
4. Not: weekly_xp gerçek XP değil (XP Supabase'de yok) — soru+5×deneme proxy'si. İleride XP olay tablosu eklenirse view güncellenebilir.

---

---

# KATMAN 2 + KATMAN 3 (uygulanabilir) — D / E / F / G / H / I

Migration numaraları: 013–016. Yeni rotalar: RankSimulator, ReviewSession, Roadmap.

## D) Net Hedef Simülatörü
- Migration `013_profile_target_program.sql`: `profiles.target_program_id`.
- Yeni `data/rankingTable.js` (net→sıralama, **yaklaşık 2024 tahmin**, kaynak notlu), `data/programs.js` (~22 bölüm, yaklaşık başarı sırası).
- Yeni `screens/simulator/RankSimulatorScreen.js`: son deneme default, TYT/AYT net stepper, anlık tahmini sıralama (78k→61k), hedef bölüm seçimi+kayıt, disclaimer.
- HomeScreen QuickActions'a "Net Simülatörü" + "Yol Haritası".

## E) Anonim Akran Percentile
- Migration `014_percentile_views.sql`: materialized view `subject_percentile` + SECURITY DEFINER `my_percentiles()` (sadece kendi satırın — ID sızmaz). Günlük REFRESH notu.
- Yeni `supabase/percentile.js`. TrialDetailScreen branş satırlarına "%X öğrenciden iyisin" rozeti.

## F) Grup Ligi
- Migration `015_groups.sql`: `groups`, `group_members`, recursion'sız `is_group_member()`, `join_group_by_code()` (SECURITY DEFINER), RLS.
- Yeni `supabase/groups.js` (create/join/list/leave/leaderboard). Yeni `screens/league/GroupsTab.js`.
- LeagueScreen'e 3. sekme "Gruplarım": grup chip'leri, grup içi haftalık leaderboard, oluştur/koda-gir modal, 6 haneli kod + paylaş.

## G) Spaced Repetition Yanlış Defteri
- Migration `016_wrong_sr.sql`: `next_review_at`, `interval_days`, `ease`, `last_reviewed_at` + due index.
- Yeni `lib/spacedRepetition.js` (SM-2 sade), `supabase/wrongQuestions.js`'e `getDueWrongQuestions`+`reviewWrongQuestion`.
- AddWrong yeni kayıt SR'a girer (yarın tekrar). Yeni `screens/wrong-notebook/ReviewSessionScreen.js` (cevabı göster → hatırlamıyorum/zorlandım/biliyorum → interval güncelle).
- WrongNotebook'a "Bugün tekrar (N)" banner. HomeScreen'e SR mini kartı. usePlanContext `srDue` sağlar.

## H) AI Tek Aksiyon
- Yeni `screens/home/components/DailyActionCard.js`: tek belirgin "Bugün için" kartı, "Plana Ekle" (addAdHocTask + plana git), "Anladım" (bugünlük kapat, AsyncStorage), "Daha sonra" (oturumluk kapat).
- HomeScreen'de AISuggestionsCard → DailyActionCard ile değişti.

## I) Yol Haritası 2.0 (adaptif müfredat)
- Yeni `lib/roadmapEngine.js`: ustalaşılmamış konuları zayıflık önceliğiyle kalan haftalara dağıtır (max 12 hafta). Her açılışta yeniden hesaplanır (mastered düşer).
- Yeni `screens/roadmap/RoadmapScreen.js`: özet (hafta/konu/ustalaşma %) + hafta hafta timeline, "Bu hafta" vurgulu.

## Doğrulama
- 20 değişen/yeni JS dosyası babel-preset-expo ile parse: **20/20 OK**. Tüm stray `</content>` artıkları temizlendi.

## Kullanıcının Manuel Uygulaması (Supabase — sırayla)
1. `013` → target_program_id kolon.
2. `014` → percentile matview + my_percentiles(). **Günde 1 kez `REFRESH MATERIALIZED VIEW CONCURRENTLY public.subject_percentile;`** (pg_cron veya manuel). İlk REFRESH'ten önce percentile boş döner (rozet görünmez, hata vermez).
3. `015` → groups/group_members + fonksiyonlar.
4. `016` → wrong_questions SR kolonları. Olmadan AddWrong `next_review_at` ile hata verebilir.
5. Önceki 008–012 hâlâ uygulanmadıysa onlar da gerekli.

## KATMAN 3'ten UYGULANMAYANLAR (sebep)
- **OCR + LLM etiketleme:** edge function + Anthropic API key bütçe kararı kullanıcıdan gelmeli. Yapılmadı.
- **Koç paneli:** ayrı web app/rol + KVKK detayı; ürün kararı gerekiyor.
- **Topluluk soru bankası (UGC):** moderasyon + telif riski; ayrı sprint.
- **RevenueCat/IAP:** önce değer sağlamlaştırma kararıyla askıda.

---

# EK DÜZELTMELER — Gerçek XP + Konu Notları

## Gerçek weekly_xp (proxy kaldırıldı)
- Migration `017_xp_events.sql`: `xp_events` defteri (RLS) + `leaderboard_weekly` yeniden tanımlandı → weekly_xp artık **gerçek kazanılan XP toplamı** (xp_events, haftalık). questions/trials sütunları gösterim için kaldı.
- Yeni `supabase/xp.js` `logXP`. `useGamification.reward` her XP'de deftere yazıyor (fire-and-forget, dev hariç).

## Konu Notları
- Migration `018_topic_notes.sql`: `topic_notes (user_id, subject_key, topic_name, content)` + RLS.
- Yeni `supabase/topicNotes.js` (get/upsert). Yeni `screens/dersler/components/TopicNoteCard.js`.
- TopicStudyScreen'e "Konu Notum" editörü (TopicRow'a subject.key eklendi).

## Manuel Supabase (ek)
6. `017` → xp_events + view (011'den SONRA çalışmalı; numara sırası bunu sağlar). Çalıştıktan sonra weekly_xp gerçek XP'den gelir; geçmiş XP yok, bu haftadan itibaren dolar.
7. `018` → topic_notes.

## Hâlâ açık (dürüst)
- Net→sıralama + bölüm tabloları YAKLAŞIK kalıyor: YÖK Atlas dinamik sorgu, otomatik çekilemiyor. Gerçek veri için kullanıcı tabloyu paylaşırsa programs.js/rankingTable.js'e işlenir.
- Percentile matview REFRESH'i pg_cron ile otomatize edilmeli.
