# Görev (Codex): Başkasının profilini görme + arkadaşlık isteği bildirimi

**Önce:** Kendi worktree'nde, yeni dalda çalış (`git worktree add ../Maraton-profile -b feat/public-profile origin/main`). main'e doğrudan push YOK; bitince haber ver, Claude inceleyip birleştirecek. Canlı DB'ye migration uygulamadan önce kullanıcıya sor.

## Bugünkü durum (main)
- Grup/sıralama satırında birinin avatarına dokununca **Arkadaş ekle / Bildir / Engelle** seçenekleri çıkıyor (`src/hooks/useUserActions.js`, `src/components/common/ReportableAvatar.js`).
- Arkadaşlık: `src/supabase/friends.js` (`sendFriendRequest`, `respondToRequest`, `listIncomingRequests`...), tablo `friendships (requester_id, addressee_id, status pending|accepted|blocked)`.
- Push: `supabase/functions/send-push` (Expo push), token `profiles.expo_push_token`. Arkadaşlık isteğinde push YOK.
- Engellenenler listelerden ayıklanıyor (`src/lib/blockedUsers.js`).

## İstenen
1. **Arkadaşlık isteği bildirimi:** A, B'ye istek gönderince B'ye push: "A seni arkadaş olarak eklemek istiyor". Dokununca İstekler ekranı (Arkadaşlar) açılır, orada **Kabul / Reddet**. Kabul edilince A'ya push: "B isteğini kabul etti". Sunucu tarafında (trigger + edge function ya da RPC) — istemciye güvenme. Engellenmiş çiftte bildirim gitmez. Günde kişi başı istek bildirimi sınırı (spam'e karşı, ör. 20).
2. **Profili gör:** Seçenek listesine en üste "Profili gör". Yeni ekran (SCREENS.PUBLIC_PROFILE, `src/screens/profile/PublicProfileScreen.js`, ≤150 satır/bileşen): ad, avatar, sınav türü, seri, bu haftanın soru/süre toplamı, **güç haritası** (`src/screens/profile/components/StrengthMap.js` mantığı, ama o kişinin verisiyle), arkadaşsa "Arkadaşsınız", değilse "Arkadaş ekle". Net/deneme sonuçları GÖSTERİLMEZ (gizlilik: "Netin görünmez" sözü var).
   - Veri: SECURITY DEFINER bir RPC (`get_public_profile(p_user)`): yalnız aynı grupta ya da arkadaş olanlar görebilir; engelli çiftte hata. Döndürdüğü alanlar sabit ve sınırlı (ad, avatar, exam_type, streak, haftalık özet, konu ilerleme yüzdeleri). `profiles.show_in_leaderboard=false` olan kullanıcıyı gösterme.
3. Ayarlar'a "Profilimi kimler görebilir" anahtarı (Herkes grupta/arkadaşlar · Yalnız arkadaşlar) — `profiles` üzerinde bir kolon.

## Kurallar
- Supabase erişimi yalnız `src/supabase/` altından. Ekran adı `src/constants/screens.js`, analitik olayı `src/constants/analytics.js`.
- Tokenlar `src/themes/tokens.js` / palet; hex yok; 11px altı metin yok; dokunma alanı ≥44.
- Migration dosyası canlıya uygulanınca dosya adı canlı sürüm numarasıyla eşleşmeli.
- `npm test`, `npm run check`, `npx expo export --platform ios` geçmeli; yeni RPC için test (geri alınan DO bloğu ile) yaz.
