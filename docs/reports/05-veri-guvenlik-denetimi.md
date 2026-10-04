# 05 · Veri, Güvenlik ve Gizlilik Denetimi (yayın öncesi)

Tarih: 2026-10-04 · Dal: `claude/alo-x7w6ho` · Kapsam: hesap silme, auth, RLS/depolama,
KVKK/gizlilik, bildirimler, veri bütünlüğü. Salt okunur inceleme: kod ve migration
dosyaları okundu, canlı veritabanına bağlanılamadı (Supabase MCP bağlanamadı).
"Canlıda doğrula" notu olan bulgular migration zincirinden çıkarıldı; zincirin
canlıyla birebir olmadığı `supabase/MIGRATIONS.md`'de zaten yazıyor.

Önceki raporlarda (01–04) düzeltildi olarak geçenler ve bu dalda düzeltilenler
(pomodoro saati, kuyruk tekilleştirme, premium-kapalı kapılar, Press export
çökmesi, `replace()` sekme silme, deep link `initialRoute`) tekrar edilmedi.

Güven: **Yüksek** = kod/SQL satırıyla kanıtlı · **Orta** = canlı ayara ya da
kütüphane davranışına bağlı, doğrulanmalı.

---

## Özet tablo

| # | Öncelik | Alan | Bulgu | Güven |
|---|---|---|---|---|
| 1 | **P1** | Güvenlik / UGC | Engelleme sessizce başarısız oluyor ve engellenen kişi engeli kaldırabiliyor | Yüksek |
| 2 | **P1** | Güvenlik | İstemci, karşı tarafın onayı olmadan `status:'accepted'` arkadaşlık ekleyebiliyor | Yüksek |
| 3 | **P1** | Gizlilik | Her oturum açmış kullanıcı TÜM profillerin ad + fotoğrafını çekebiliyor; "liderlikte görünme" kapalı olsa da | Yüksek |
| 4 | **P1** | Gizlilik | `avatars` kovası anonim olarak listelenebiliyor; kaldırılan uygunsuz fotoğraf dosyası da açık kalıyor | Orta |
| 5 | **P1** | Mağaza 5.1.1(v) | Hesap silinirken Sign in with Apple token iptali yok (03'te açık olarak listelenmişti, hâlâ açık) | Yüksek |
| 6 | **P1** | KVKK | Uygulama içi gizlilik metni webdekiyle çelişiyor; aydınlatma metni, yurt dışı aktarım ve açık rıza yok | Yüksek |
| 7 | **P1** | Auth / veri | Apple girişinde ad hiç alınmıyor; "e-postayı gizle" kullanıcısı rastgele relay adıyla selamlanıyor, ligde adı boş | Yüksek |
| 8 | P2 | Hesap silme | Grup sahibi hesabını silince grup tüm üyeler için CASCADE ile siliniyor, uyarı yok | Yüksek |
| 9 | P2 | Hesap silme / KVKK | Silmeden sonra cihazda kullanıcıya ait yerel veri kalıyor (kuyruk, analitik tamponu, sınav sonucu, ders programı…) | Yüksek |
| 10 | P2 | Ortak cihaz | Çevrimdışı kuyruk / gönderilemeyenler ekranı önceki kullanıcının kayıtlarını gösteriyor ve silebiliyor | Yüksek |
| 11 | P2 | Ortak cihaz | Kronometre kurtarma kaydı kullanıcıya ayrışmıyor; B, A'nın süresini kendi hesabına kaydedebilir | Yüksek |
| 12 | P2 | Bildirim | Push token sunucuda tekilleştirilmiyor; çevrimdışı çıkışta A'nın push'ları cihaza gitmeye devam ediyor | Yüksek |
| 13 | P2 | Bildirim | `send-push`: 1000 satır sınırı, yerel bildirimlerle çift gönderim, sessiz saat yok, ölü token temizliği yok | Orta |
| 14 | P2 | Performans/DoS | Her kullanıcı `refresh_percentiles()` ile tüm materialized view'ı yenileyebiliyor | Yüksek |
| 15 | P2 | Güvenlik | `profiles.avatar_url` istemciden serbest metin; dış URL ile moderasyon atlanıyor, izleme pikseli | Yüksek |
| 16 | P2 | Güvenlik | Kurtarma linki (access/refresh token) AsyncStorage'a düz metin yazılıyor | Orta |
| 17 | P2 | Auth | Profil adı değişikliği `user_metadata`'ya yazılmıyor; ana ekran eski adı gösteriyor | Yüksek |
| 18 | P2 | Auth | Apple hata mesajı ham İngilizce; nonce `Math.random` ile üretiliyor | Yüksek |
| 19 | P2 | Auth | RN için `AppState` ile `startAutoRefresh/stopAutoRefresh` yok (Supabase RN rehberi) | Orta |
| 20 | P2 | Auth | `signUp` / `updateEmail` `emailRedirectTo` vermiyor; e-posta doğrulaması kapalı | Yüksek |
| 21 | P2 | Gizlilik | Fotoğraflarda EXIF/GPS temizliği yok; avatar kovası herkese açık | Orta |
| 22 | P2 | Gizlilik | Sentry'de `beforeBreadcrumb`/`beforeSend` temizliği yok (arama metni URL'de) | Orta |
| 23 | P2 | Veri bütünlüğü | Kaydet butonlarında yalnız `useState` kilidi; hızlı çift dokunuş iki kayıt üretebilir | Orta |
| 24 | P2 | İş kuralı | Davet kodu ve seri ödülü sahte hesap/geriye tarihli kayıtla çiftlenebiliyor | Orta |
| 25 | P2 | Gizlilik | Askıya alınan topluluk tablolarında (`shared_questions`, `question_answers`) `USING (true)` SELECT duruyor | Orta |

**P0 bulunmadı.** Hesap silme zinciri (istemci → depolama → `delete_own_account` →
`auth.users` CASCADE) uçtan uca doğru kurulmuş. Bütün kullanıcı tablolarında RLS
açık. Repoda gizli anahtar yok (`.env.example` boş, `service_role` yalnız
Edge Function env'inde ve seed betiğinde env'den okunuyor).

---

## 1. Hesap silme (Apple 5.1.1(v))

### Doğrulanan zincir (iyi)
- `AccountDeleteScreen.js` "SİL" yazdırıyor, `deleting` kilidi var → `useSettingsActions.deleteAccountNow` → `AuthContext.deleteAccount` (`loggingOut` kilidi) → `sessionLifecycle.deleteUserAccount` → `supabase/auth.js:164 deleteAccount`.
- `auth.js:175-185`: önce `deleteUserStorage` (avatars, wrong-questions, community-answers; sayfalı, hata varsa `StorageCleanupFailedError` ile hesap silinmez).
- `auth.js:187`: `rpc("delete_own_account")` → `private.delete_own_account()` (`20260902000454_private_rpc_surface.sql:179-194`, `auth.uid()` kontrollü, `DELETE FROM auth.users`).
- FK'lar: `profiles.id … ON DELETE CASCADE`; son NO ACTION engelleri `20260930125121_clde_account_delete_fk_cascade.sql` ile kapandı. Sonradan eklenen tablolar (`analytics_events`, `retention_events`, `avatar_reports`, `route_*`, `exam_results`, `weekly_class_schedule`, `notifications`, `route_prefs`, `user_entitlements`…) hepsi `ON DELETE CASCADE`. Live migration'larda ON DELETE'siz kullanıcı FK'sı kalmadı.
- Depolama politikaları: üç kovada da sahibin kendi klasörünü SELECT/DELETE etme izni var (`20260930115421…:19-25`, arşivdeki `20260911231806_cdx_harden_storage_policies.sql`), yani listeleme+silme çalışır.

### 1.1 · P1 · Apple token iptali yok (Güven: Yüksek)
- **Nerede:** `src/hooks/useSocialAuth.js:36-44` (`credential.authorizationCode` atılıyor), `src/supabase/auth.js:164-193` (revoke yok). 03 raporu (§ "Sign in with Apple token iptali") açık olarak yazmıştı; hâlâ düzeltilmedi.
- **Etki:** Apple'ın hesap silme rehberi SIWA hesaplarında `appleid.apple.com/auth/revoke` çağrısını istiyor. Ret sebebi olarak görülüyor; ayrıca kullanıcının Apple ID ayarlarında "Apple ile giriş kullanan uygulamalar" listesinde Maraton kalıyor.
- **Düzeltme:** Girişte `authorizationCode`'u Edge Function'a gönderip refresh token'ı sunucuda sakla; silmede revoke et.
```js
// useSocialAuth.js – signInWithApple içinde, signInWithAppleToken'dan sonra
if (credential.authorizationCode) {
  supabase.functions.invoke("apple-token", { body: { code: credential.authorizationCode } }).catch(() => {});
}
```
```ts
// supabase/functions/apple-revoke/index.ts (silmeden ÖNCE çağrılır)
// client_secret = ES256 JWT (team id, key id, .p8 — Edge secret olarak)
await fetch("https://appleid.apple.com/auth/revoke", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_id: BUNDLE_ID, client_secret, token: refreshToken, token_type_hint: "refresh_token" }),
});
```
`deleteAccount()` içinde `deleteUserStorage`'dan sonra, RPC'den önce `functions.invoke("apple-revoke")` çağrılmalı (hata silmeyi engellememeli, Sentry'ye düşmeli).

### 1.2 · P2 · Grup sahibi silinince grup herkes için gidiyor (Güven: Yüksek)
- **Nerede:** `supabase/migrations/20260919120000_cdx_group_data_layer.sql:9` (`groups.created_by … ON DELETE CASCADE`; `owner_id` da arşivdeki `015_groups.sql:7`'de CASCADE). `AccountDeleteScreen.js` grup uyarısı göstermiyor.
- **Etki:** Bir öğrencinin hesabını silmesi, gruptaki diğer öğrencilerin grubunu, sıralamasını ve grup serisini sessizce siliyor (başkasının veri kaybı).
- **Düzeltme:** Silmeden önce yöneticiliği en eski üyeye devret; üye yoksa grubu sil.
```sql
-- private.delete_own_account() içinde DELETE FROM auth.users'tan önce
UPDATE public.groups g
   SET created_by = nxt.user_id, owner_id = nxt.user_id
  FROM LATERAL (
    SELECT gm.user_id FROM public.group_members gm
     WHERE gm.group_id = g.id AND gm.user_id <> uid
     ORDER BY gm.joined_at LIMIT 1) nxt
 WHERE g.created_by = uid;
```
Ve silme ekranında "N grubun yöneticisisin; yöneticilik X'e geçecek" satırı.

### 1.3 · P2 · Silmeden sonra cihazda kişisel veri kalıyor (Güven: Yüksek)
- **Nerede:** `src/contexts/AuthContext.js:136` silmede de `resetLocalSession()` çağrılıyor; bu yalnız `src/lib/storage/userScopedStorage.js:11-41` listesini siliyor. Bilinçli olarak dışarıda bırakılanlar (çıkış için doğru, silme için yanlış): `@maraton:offlineQueue`, `@maraton:dead_letter_queue`, `@maraton:analyticsBuffer`, `@maraton:analyticsPending`, `@maraton:retentionBuffer`, `@maraton:pending_streak`, `…:examResult:<uid>`, `…:examDayPlan:<uid>`, `…:examRehearsal:<uid>`, `…:class_schedule:<uid>`, `…:completion_shown:<uid>`, `…:pro_preview_seen:<uid>`, `@plan_rewarded_*`, `@user_task_rewarded_*`, `@maraton:activeTimerSession`.
- **Etki:** Gizlilik metni "Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir" diyor (`legalDocs.js:35`, `web/privacy.html` §5). Silinmiş kullanıcının deneme adları, sınav sonucu, ders programı cihazda kalıyor; kuyruk ögeleri asla gönderilmeyecek.
- **Düzeltme:** Silme yolunda kullanıcı kimliğiyle tam temizlik.
```js
// userScopedStorage.js
export async function purgeUserData(userId) {
  const all = await AsyncStorage.getAllKeys();
  const mine = all.filter((k) => k.endsWith(`:${userId}`) || k.includes(`_${userId}`));
  await AsyncStorage.multiRemove([...mine, STORAGE_KEYS.ACTIVE_TIMER_SESSION]);
  // userId taşıyan JSON tamponları süz
  for (const key of [STORAGE_KEYS.OFFLINE_QUEUE, STORAGE_KEYS.OFFLINE_DEAD_LETTER, STORAGE_KEYS.PENDING_STREAK]) {
    const list = JSON.parse((await AsyncStorage.getItem(key)) || "[]");
    if (Array.isArray(list)) await AsyncStorage.setItem(key, JSON.stringify(list.filter(
      (i) => (i?.payload?.user_id || i?.payload?.trial?.user_id || i?.userId) !== userId)));
  }
}
// AuthContext.deleteAccount: const uid = user?.id; ... await resetLocalSession(); await purgeUserData(uid);
// analytics: dropAnalyticsUser(uid) ile byUser[uid] partition'ı silinmeli.
```

---

## 2. Auth

### 2.1 · P1 · Apple girişinde ad alınmıyor (Güven: Yüksek)
- **Nerede:** `src/hooks/useSocialAuth.js:36-44` `FULL_NAME` isteniyor ama `credential.fullName` hiç kullanılmıyor. `signInWithIdToken` Apple'dan ad almaz (ad id_token'da yok, yalnız ilk yetkilendirmede istemciye gelir). Profil `handle_new_user` ile `name = ''` kuruluyor (arşiv `20260610_initial_schema.sql:205-213`). `src/lib/displayName.js:7` → `user_metadata.name || email.split("@")[0]`.
- **Etki:** "E-postayı gizle" seçen kullanıcı ana ekranda "Hoş geldin 8xk2p9qrst" gibi bir relay önekiyle selamlanıyor; Genel Lig, grup ve arkadaş listelerinde adı **boş**. App Review hesabı Apple ile girerse ilk ekranda görünür. Ad yalnız ilk girişte geldiği için sonradan kurtarılamaz.
- **Düzeltme:**
```js
const data = await signInWithAppleToken({ idToken: credential.identityToken, nonce: rawNonce });
const n = credential.fullName;
const name = [n?.givenName, n?.familyName].filter(Boolean).join(" ").trim();
if (name && !data?.user?.user_metadata?.name) {
  await supabase.auth.updateUser({ data: { name } }).catch(() => {});
  await updateProfile(data.user.id, { name }).catch(() => {});
}
return data;
```
Ad yoksa ve e-posta `@privaterelay.appleid.com` ise `displayNameOf` "Öğrenci" dönmeli ve kurulumda isteğe bağlı ad alanı gösterilmeli.

### 2.2 · P2 · Profil adı iki yerde, yalnız biri güncelleniyor (Güven: Yüksek)
- **Nerede:** `src/hooks/useEditProfileForm.js:55-58` yalnız `profiles.name` yazıyor; `displayNameOf` (`displayName.js:7`), `useProfileViewModel.js:18`, `TrialSummaryScreen.js:44`, `TrialDetailScreen.js:59` `user_metadata.name` okuyor.
- **Etki:** Kullanıcı adını değiştirir, ligde yeni ad, ana ekran/profil/paylaşım kartında eski ad.
- **Düzeltme:** Kaydetmede `await supabase.auth.updateUser({ data: { name: data.name } })` (src/supabase/auth.js'e `updateDisplayName` olarak), tek kaynak olarak `displayNameOf` kullan.

### 2.3 · P2 · Apple hatası İngilizce, nonce zayıf (Güven: Yüksek)
- `src/screens/auth/components/SocialAuthButtons.js:41,52`: `err.message` doğrudan gösteriliyor ("The operation couldn't be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)"). → `authErrorMessage(err)` kullan; Apple `ERR_REQUEST_UNKNOWN` için "Apple ile giriş şu an yapılamadı. Tekrar dene." ekle.
- `useSocialAuth.js:31`: nonce `Math.random()`. → `Crypto.randomUUID()` (expo-crypto zaten bağımlı).
- `FriendCodeCard.js:58`, `ChallengeScreen.js:84`, `groupExitHandler.js:17,29,46`, `useEditProfileForm.js:63` da ham `e.message` gösteriyor; `e._safeMessage || "…"` deseni kullanılmalı.

### 2.4 · P2 · AppState'e bağlı token yenileme yok (Güven: Orta)
- **Nerede:** `src/supabase/client.js:80-87`; repoda `startAutoRefresh` yok.
- **Etki:** Supabase'in RN rehberi arka plandayken yenileme döngüsünün durdurulmasını istiyor. Aksi halde arka plandan dönüşte süresi dolmuş JWT ile giden ilk istek 401 → `handleError.js:75` → `emitAuthError` → `logout()` zinciri tetiklenebilir (zorla çıkış + yerel sıfırlama). Ayrıca `client.js:31,54,67` üretimde `console.error` (AGENTS.md kuralı).
- **Düzeltme:**
```js
// client.js sonu
import { AppState } from "react-native";
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (s) => (s === "active" ? _client.auth.startAutoRefresh() : _client.auth.stopAutoRefresh()));
}
```
Ek olarak `onAuthError` yolunda çıkıştan önce bir kez `supabase.auth.refreshSession()` denenmeli; yalnız o da `refresh_token_not_found` / `invalid_grant` verirse çıkış yapılmalı.

### 2.5 · P2 · E-posta doğrulaması kapalı, redirect yok (Güven: Yüksek)
- `src/supabase/auth.js:6-14` `signUp` ve `:59-62` `updateEmail` `emailRedirectTo` vermiyor. `signUpOutcome.js:3` canlıda doğrulamanın kapalı olduğunu söylüyor; `store/appreview.md:118` "leaked password protection kapalı".
- **Etki:** Başkasının e-postasıyla hesap açılabiliyor (reşit olmayan bir öğrencinin adresine şifre sıfırlama gidebilir). Doğrulama açılırsa link `site_url`'e gider, uygulamaya dönmez. E-posta değişikliği linki de aynı.
- **Düzeltme:** `options: { data: { name }, emailRedirectTo: "maraton://giris" }`; `updateUser({ email }, { emailRedirectTo: "maraton://ayarlar" })`; Supabase Auth'ta "Confirm email" ve "Leaked password protection" açılmalı.

### 2.6 · Çıkış temizliği (doğrulandı, iyi + iki açık)
- İyi: `AuthContext.logout` → analitik flush → `signOutUser` (yerel bildirim iptali + push token silme + `signOut` ağ hatasında `_removeSession`) → `resetLocalSession` (RESET_STORE, modül sıfırlamaları, widget, bildirim, kullanıcı anahtarları). Hesap değişimi (`createUserTracker`) de sıfırlıyor. Kuyruk ögeleri `user_id` ile süzülerek gönderiliyor (`offlineQueue.js:378-383`).
- Açık: aşağıdaki §6.2 (kuyruk görünümü) ve §6.3 (kronometre).
- `AuthContext.js:102-116`: `logout` gövdesi `try/finally` değil; `resetLocalSession` beklenmedik şekilde fırlatırsa `loggingOut.current` `true` kalır ve hesap silme kalıcı olarak `session_ending` hatası verir. → `try { … } finally { loggingOut.current = false; }`.

---

## 3. Güvenlik (RLS, depolama, RPC)

### 3.1 · P1 · Engelleme çalışmıyor ve geri alınabiliyor (Güven: Yüksek)
- **Nerede:** `src/supabase/friends.js:165-187` (`blockUser`). Canlı UPDATE politikası yalnız `"Addressee can accept/decline"` (`20260901140141_optimize_rls_auth_uid_policies.sql:30-32`: `USING (auth.uid() = addressee_id)`); geniş politika `20260909100000_product_access_companionship.sql:442`'de düşürüldü. DELETE politikası her iki tarafa açık (`…:37-38`).
- **Etki:**
  1. Engelleyen kişi satırın **requester**'ıysa (istek göndermişse ya da arkadaşlığı o başlatmışsa) `update({status:'blocked'})` RLS'te 0 satıra dokunur; PostgREST hata dönmez, uygulama "engellendi" der, kişi engellenmemiştir.
  2. Engellenen kişi `DELETE /friendships?id=eq.<id>` ile engel satırını silebilir (kendisi taraf), ardından yeniden istek ya da (3.2) doğrudan "accepted" satır ekleyebilir.
  Genç kullanıcılı, lig/grup/arkadaş açık bir uygulamada Guideline 1.2 "kötüye kullanan kullanıcıyı engelleme" mekanizması fiilen yok.
- **Düzeltme:** Engeli ayrı tabloya ve definer RPC'ye taşı.
```sql
CREATE TABLE public.user_blocks (
  blocker_id uuid REFERENCES auth.users ON DELETE CASCADE,
  blocked_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id));
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY ub_own ON public.user_blocks FOR ALL TO authenticated
  USING (blocker_id = (select auth.uid())) WITH CHECK (blocker_id = (select auth.uid()));

CREATE FUNCTION public.block_user(p_target uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR p_target = auth.uid() THEN RAISE EXCEPTION 'invalid'; END IF;
  INSERT INTO user_blocks VALUES (auth.uid(), p_target) ON CONFLICT DO NOTHING;
  DELETE FROM friendships WHERE (requester_id, addressee_id) IN ((auth.uid(), p_target), (p_target, auth.uid()));
  UPDATE route_companionships SET status = 'ended', ended_at = now()
   WHERE user_low_id = least(auth.uid(), p_target) AND user_high_id = greatest(auth.uid(), p_target);
END $$;
```
`friendships` INSERT, `create_challenge`, `request_route_companion`, `join_group_by_code` sonrası üye listesi ve lig sorguları `NOT EXISTS (SELECT 1 FROM user_blocks …)` ile süzülmeli.

### 3.2 · P1 · Tek taraflı "accepted" arkadaşlık (Güven: Yüksek)
- **Nerede:** `20260901140141_optimize_rls_auth_uid_policies.sql:34-35` INSERT politikası yalnız `WITH CHECK (auth.uid() = requester_id)`; `status` sütunu istemciye açık (`friends.js:42` aynı tabloya insert ediyor, grant var).
- **Etki:** Herhangi bir kullanıcı `POST /friendships {requester_id: ben, addressee_id: X, status: 'accepted'}` ile X'in onayı olmadan arkadaşı olur: X'in arkadaş listesine düşer, `create_challenge` (`20260913215823…:28-33` yalnız "accepted" arıyor) ile X'e meydan okuma açar, `request_route_companion` yolu açılır. 3.3 ile birleşince yabancı bir yetişkin, tüm kullanıcıları listeleyip her birine "arkadaş" olarak bağlanabilir.
- **Düzeltme:**
```sql
ALTER POLICY "Users create requests" ON public.friendships
  WITH CHECK ((select auth.uid()) = requester_id AND status = 'pending');
-- Addressee yalnız status/responded_at değiştirebilsin:
REVOKE UPDATE ON public.friendships FROM authenticated;
GRANT UPDATE (status, responded_at) ON public.friendships TO authenticated;
ALTER POLICY "Addressee can accept/decline" ON public.friendships
  USING ((select auth.uid()) = addressee_id AND status = 'pending')
  WITH CHECK ((select auth.uid()) = addressee_id AND status IN ('accepted','declined'));
```

### 3.3 · P1 · Tüm profillerin adı ve fotoğrafı okunabiliyor (Güven: Yüksek)
- **Nerede:** `20260908120000_profiles_column_level_select.sql:18-24` → `GRANT SELECT (id, name, avatar_url, show_in_leaderboard)` + `20260901140141…:70-72` `"Profiles are viewable by authenticated users" USING (true)`.
- **Etki:** Uygulamadaki anon anahtarla kayıt olan herkes `GET /rest/v1/profiles?select=id,name,avatar_url` ile bütün kullanıcıların (çoğu 14-18 yaş) adını, fotoğrafını ve UUID'sini sayfa sayfa indirebilir. `show_in_leaderboard=false` seçen kullanıcı da listede (yalnız lig görünümü süzülüyor: `leaderboard_rpc…:222`). KVKK açısından reşit olmayanların ad+fotoğrafının "gerekli olmayan" kişilere açılması; gizlilik metni bunu söylemiyor.
- **Düzeltme:** Satırı kapat, sosyal okumaları ilişki üzerinden yap.
```sql
ALTER POLICY "Profiles are viewable by authenticated users" ON public.profiles
  USING (
    id = (select auth.uid())
    OR COALESCE(show_in_leaderboard, true)
    OR EXISTS (SELECT 1 FROM friendships f WHERE f.status = 'accepted'
               AND ((f.requester_id = (select auth.uid()) AND f.addressee_id = profiles.id)
                 OR (f.addressee_id = (select auth.uid()) AND f.requester_id = profiles.id)))
    OR EXISTS (SELECT 1 FROM group_members a JOIN group_members b USING (group_id)
               WHERE a.user_id = (select auth.uid()) AND b.user_id = profiles.id)
    OR EXISTS (SELECT 1 FROM friendships f WHERE f.status = 'pending'
               AND f.addressee_id = (select auth.uid()) AND f.requester_id = profiles.id)
  );
```
Daha sağlamı: `show_in_leaderboard` varsayılanını reşit olmayanlar için `false` yapmak ve Genel Lig'e katılımı açık rızaya bağlamak (bkz. §4).

### 3.4 · P1 · `avatars` kovası anonim listelenebiliyor; kaldırılan fotoğraf açık kalıyor (Güven: Orta – canlıda doğrula)
- **Nerede:** arşiv `003_fix_wrong_questions_and_avatars.sql:21-35`: kova `public = true` + `"Anyone can view avatars" FOR SELECT USING (bucket_id = 'avatars')` (rol sınırı yok, sonraki hiçbir migration düşürmüyor). `20261001150903_clde_avatar_reports.sql:41-46` `report_avatar` yalnız `profiles.avatar_url`'i null'lıyor, dosyayı silmiyor.
- **Etki:** Public kova URL ile indirme için zaten RLS istemez; bu SELECT politikası ek olarak `POST /storage/v1/object/list/avatars` ile **anon** anahtarla tüm kullanıcı klasörlerinin (= UUID'lerin) listelenmesine izin verir → tüm reşit olmayan kullanıcıların yüz fotoğrafları toplu indirilebilir. İki bildirimle "kaldırılan" uygunsuz fotoğraf `<uid>/avatar.jpg` adresinde herkese açık kalır. (Supabase Security Advisor bunu "public bucket allows listing" olarak işaretler.)
- **Düzeltme:**
```sql
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Owner lists own avatar" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1]);
```
`report_avatar` 'removed' döndüğünde dosyayı da silmek için `storage.objects`'e SQL yetmez; `avatar_reports` üzerinde bir Database Webhook → Edge Function (`service_role` ile `storage.from('avatars').remove([...])`) kur.

### 3.5 · P2 · `avatar_url` serbest metin (Güven: Yüksek)
- **Nerede:** `20260901220937_protect_profile_write_surface.sql:8-29` `avatar_url` istemciye UPDATE açık; `src/supabase/storage.js:80-85` `http` ile başlayan değeri olduğu gibi döndürüyor.
- **Etki:** `PATCH /profiles {avatar_url:"https://kotu.site/x.png"}` → ligi açan herkesin cihazı dış sunucudan görsel çeker (IP/zaman izleme, depolama kotası ve moderasyon dışı içerik). Ayrıca başkasının avatar yolunu kendi profiline yazabilir.
- **Düzeltme:**
```sql
ALTER TABLE public.profiles ADD CONSTRAINT avatar_url_own_path
  CHECK (avatar_url IS NULL OR avatar_url ~ ('^' || id::text || '/avatar\.(jpg|png|webp)$')) NOT VALID;
```
`getAvatarUrl` içinde `startsWith("http")` dalı kaldırılmalı (ya da yalnız kendi Supabase origin'ine izin verilmeli).

### 3.6 · P2 · `refresh_percentiles()` herkese açık (Güven: Yüksek)
- **Nerede:** `20260902000454_private_rpc_surface.sql:289-307,431,452`; istemci `src/supabase/percentile.js:22-33` her deneme kaydından sonra (`trials.js:85`) çağırıyor; bekleme süresi süreç içi değişken, uygulama her açılışta sıfırlanıyor.
- **Etki:** Pazar deneme sonrası binlerce kullanıcı aynı anda `REFRESH MATERIALIZED VIEW CONCURRENTLY` (tablo tam tarama) tetikler; refresh'ler birbirini kilitler, bağlantı havuzu dolar. Kötü niyetli tek kullanıcı döngüyle DB'yi meşgul edebilir.
- **Düzeltme:** `REVOKE EXECUTE ON FUNCTION public.refresh_percentiles(), private.refresh_percentiles() FROM authenticated;` + `pg_cron` ile 15 dakikada bir `SELECT private.refresh_percentiles();`; istemci çağrısı kaldırılır.

### 3.7 · P2 · Askıdaki topluluk tabloları herkese okunur (Güven: Orta)
- **Nerede:** arşiv `020_community_sharing.sql:29,33` `USING (true)` (rol sınırı yok); `20260930115421…` yalnız INSERT'i kapattı.
- **Etki:** V1'de yayında olmayan özelliğin eski soru metinleri ve `user_id`'leri, tablo grant'ı varsa anon dahil okunabilir.
- **Düzeltme:** `REVOKE SELECT ON public.shared_questions, public.question_answers FROM anon, authenticated;` (ya da politikayı `TO authenticated USING (user_id = auth.uid())`).

### 3.8 · Gizli anahtar taraması (temiz)
- `git ls-files` içinde `.env*` yalnız `.env.example` (boş değerler). `service_role` yalnız `supabase/functions/send-push/index.ts:96` (`Deno.env`) ve `scripts/seed-review-account.mjs` (env'den) içinde. JWT/`sk_live`/özel anahtar deseni bulunmadı. `store/appreview.md:213` demo şifresi yer tutucu (`[DEMO_PASSWORD]`).
- `send-push` `Authorization: Bearer <service_role>` ile korunuyor (`index.ts:95-105`). Uygun.
- Tüm `public` SECURITY DEFINER fonksiyonları `auth.uid()` kontrolü yapıyor; kimlik kontrolsüz definer'lar yalnız `private` şemasında (PostgREST'e açık değil) ve tetikleyici fonksiyonları.

---

## 4. Gizlilik / KVKK

### 4.1 · P1 · Gizlilik metinleri çelişiyor, KVKK unsurları eksik (Güven: Yüksek)
- **Nerede:** `src/constants/legalDocs.js:15-48` (uygulama içi, "18 Haziran 2026") ile `web/privacy.html` ("2 Ekim 2026") farklı:
  - Uygulama içi: "Verileriniz üçüncü taraflarla paylaşılmaz" (`:23`) ve yalnız "ad, e-posta, çalışma verileri" (`:19`). Gerçekte: ürün analitiği (`analytics_events`, `retention_events`), profil/yanlış soru fotoğrafları, push token (Expo'ya gidiyor), Apple ile giriş, Sentry, RevenueCat SDK'sı (`src/lib/purchases.js`) var. Ad ve fotoğraf diğer kullanıcılara açık (lig, grup, arkadaş).
  - Web metni analitik ve fotoğrafı söylüyor ama RevenueCat'i, diğer kullanıcılara görünürlüğü ve `[HUKUKİ İNCELEME GEREKLİ]` notunu içeriyor.
  - `legalDocs.js:7-9` kendisi söylüyor: **KVKK aydınlatma metni yok.** Veri sorumlusunun kimliği/adresi, işleme amaçları ve hukuki sebepleri, **yurt dışına aktarım** (Supabase, Sentry, Expo ABD/AB sunucuları; KVKK md. 9, 2024 değişikliği: standart sözleşme + Kurul'a bildirim) ve başvuru yolu yok.
  - Kayıt ekranında tek kutu (`RegisterScreen.js:44-46,131`) Şartlar + Gizlilik'i birlikte onaylatıyor; KVKK açık rızası hizmet sözleşmesine bağlanamaz.
  - 13 yaş sınırı (`legalDocs.js:39`) var ama reşit olmayanlar (13-17) için veli bilgilendirmesi ya da varsayılan gizlilik yok; `show_in_leaderboard` varsayılanı `true` (`useEditProfileForm.js:18`, `leaderboard_rpc…:57`).
- **Etki:** KVKK aydınlatma yükümlülüğü ihlali; App Store "Privacy Policy" metni ile uygulama içi metin çelişkisi Guideline 5.1.1(i) incelemesinde sorun olabilir. Mağaza gizlilik etiketleri (`store/privacy-labels.md`) web metnine göre doldurulduysa uygulama içi metin yanlış beyan olur.
- **Düzeltme:**
  1. `legalDocs.js` → web metniyle tek kaynak (ya da uygulama içinde `https://maratonapp.com/privacy` WebView). "Üçüncü taraflarla paylaşılmaz" cümlesi silinir; RevenueCat, Expo Push, Apple eklenir; "Adın ve profil fotoğrafın lig, grup ve arkadaş ekranlarında diğer kullanıcılara görünür" satırı eklenir.
  2. Hukukçu onaylı ayrı **KVKK Aydınlatma Metni** (veri sorumlusu, amaç, hukuki sebep, aktarım, md. 11 hakları) + yurt dışı aktarım için ayrı, isteğe bağlı açık rıza kutusu.
  3. Reşit olmayanlarda Genel Lig'e görünürlük varsayılan kapalı; kurulumda açıkça sorulur.

### 4.2 · P2 · Fotoğraflarda konum verisi (Güven: Orta)
- **Nerede:** `src/hooks/useAvatarUpload.js:66-81`, `src/hooks/useAddWrong.js:18,79` → `storage.js:23-36` dosyayı olduğu gibi yüklüyor. `expo-image-manipulator` bağımlılık değil.
- **Etki:** expo-image-picker Android'de sıkıştırılmış/kırpılmış çıktıya EXIF'i kopyalayabiliyor; GPS içeren bir galeri fotoğrafı herkese açık `avatars` kovasına (3.4) konum bilgisiyle gider. Cihazda doğrulanmalı (`exiftool` ile yüklenen dosya).
- **Düzeltme:** `expo-image-manipulator` ile `manipulateAsync(uri, [{ resize: { width: 512 } }], { compress: 0.7, format: SaveFormat.JPEG })` — yeniden kodlama EXIF'i atar; yanlış soru fotoğrafı için `width: 1600`.

### 4.3 · P2 · Sentry veri süzgeci yok (Güven: Orta)
- **Nerede:** `src/lib/errorReporting.js:17-28`. `sendDefaultPii: false` doğru, `setUser` yalnız `id` (`:56`). Ama otomatik HTTP breadcrumb'ları tam URL taşır: arkadaş araması `profiles?name=ilike.*<arama>*`, `friendships?or=(requester_id.eq.<uuid>…)`.
- **Düzeltme:**
```js
beforeBreadcrumb(b) {
  if (b.category === "fetch" || b.category === "xhr") {
    if (b.data?.url) b.data.url = String(b.data.url).split("?")[0];
  }
  return b;
},
beforeSend(e) { if (e.request?.url) e.request.url = e.request.url.split(/[?#]/)[0]; return e; },
```
Sentry proje ayarında "Prevent Storing of IP Addresses" açılmalı.

### 4.4 · Analitik (temiz)
`track` çağrıları (40+ yer tarandı) yalnız sayaç, tür, kaynak gibi alanlar taşıyor; `createAnalyticsEnvelope` → `sanitizeAnalyticsProperties`. E-posta, ad, serbest metin gönderilmiyor. Olaylar birinci taraf `analytics_events`'e gidiyor, RLS sahibine kısıtlı, hesapla CASCADE siliniyor.

---

## 5. Bildirimler

### Doğrulanan (iyi)
- Android kanalı `"default"` modül yüklenirken izin isteğinden önce kuruluyor (`src/lib/notifications.js:36-43`); sunucu push'u da `channelId: "default"` gönderiyor.
- Yerel plan (`src/domain/notify/notificationPlan.js`): sessiz saat 08:00–21:45 (`:25-27`), günde en çok 2 dilim (`capPerDay`), 3/7/14 gün merdiveni; tüm kurma işlemleri tek sırada (`serial`) ve oturum sahibi kontrolü (`isActiveOwner`). Çift kurulum yolu kapalı.
- Dokunma yönlendirmesi (`src/navigation/linking.js:36-73`) soğuk/sıcak açılış ve yanıt temizliği doğru.

### 5.1 · P2 · Push token sunucuda tekil değil (Güven: Yüksek)
- **Nerede:** `src/supabase/profiles.js:132-156` (düz `update`), `src/lib/session/sessionLifecycle.js:33-37` (çıkışta token silme hatası yutuluyor), hesap değişiminde (`createUserTracker`) A'nın token'ı hiç silinmiyor.
- **Etki:** Çevrimdışı ya da 401 sonrası zorunlu çıkışta A'nın profilinde token kalır; B aynı cihazda girince aynı token iki profilde durur → cihaz A'nın "seri riski / seni bekliyor" push'larını da alır (ortak aile tableti senaryosu).
- **Düzeltme:**
```sql
CREATE FUNCTION public.register_push_token(p_token text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp AS $$
  UPDATE profiles SET expo_push_token = NULL WHERE expo_push_token = p_token AND id <> auth.uid();
  UPDATE profiles SET expo_push_token = p_token WHERE id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.register_push_token(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.register_push_token(text) TO authenticated;
```
`expo_push_token` sütununun istemci UPDATE yetkisi kaldırılır; çıkış için `register_push_token(NULL)` benzeri `clear_push_token()`.

### 5.2 · P2 · `send-push` sorunları (Güven: Orta – cron'un canlıda olup olmadığına bağlı)
- **Nerede:** `supabase/functions/send-push/index.ts`
  - `:119-139` sayfalama yok; PostgREST varsayılan `max_rows = 1000` → ilk 1000 kullanıcıdan sonrası push almaz.
  - `:126-137` `inactive_3d` her çalıştırmada 3 günden uzun süredir pasif HERKESE gider, üst sınır yok (yerel plan 14. günde susuyor; sunucu sonsuza kadar gönderir). `streak_risk` aynı akşam yerel `streak_risk` (21:00) ile **çift** bildirim üretir.
  - Sessiz saat/zaman kontrolü yok; cron saati yanlış kurulursa gece 02:00'de genç kullanıcıya push gider.
  - Expo push alındılarında `DeviceNotRegistered` işlenmiyor; ölü token'lar temizlenmiyor.
  - `notificationAllowed` (`:61-67`) `custom` ve bilinmeyen tiplerde tercihe bakmadan `true`.
- **Düzeltme:** `.range(from, from+999)` döngüsü; `last_push_at` sütunu + `inactive_3d` için en çok 3 gönderim; `streak_risk` yalnız `user_ids` ile hedefli ve yerel bildirim kuran (izinli) cihazlarda kapalı; gönderimden önce `const h = Number(new Date().toLocaleString("en-US",{timeZone:"Europe/Istanbul",hour:"numeric",hour12:false})); if (h < 8 || h >= 22) return 204`; yanıt `data[i].details.error === "DeviceNotRegistered"` ise token null.

---

## 6. Veri bütünlüğü

### Doğrulanan (iyi)
- Gün sınırı: `src/lib/dateUtils.js:21-29` `todayTR()` (`Europe/Istanbul`), çalışma kayıtları `study_date: todayTR()` (`useStudySaveController.js:150,177`), sunucu serisi `now() at time zone 'Europe/Istanbul'` (`20261001151302…:15,114`). `toISOString().slice(0,10)` kalan yerler (`streakWeek.js:12`, `summary/dateKeys.js:12`) zaten UTC takvim aritmetiği; doğru.
- Gece yarısı çevrimdışı kayıt: tetikleyici yalnız bugünü işler, kuyruk boşaltılınca `touchStreak(userId, studyDate)` (`offlineQueue.js:201-206`) dünkü tarihle çağrılıyor; seri doğru.
- Redux hidrasyonu kullanıcı kimliğine bağlı (`src/store/hydrate.js:21-28`), hesap değişiminde önce `RESET_STORE`.

### 6.1 · P2 · Çift dokunuşta çift kayıt (Güven: Orta)
- **Nerede:** `useStudySaveController.js:142` (`if (saving …) return`), `useAddStudyController.js:46`, `trialEntrySubmit.js:120`, `useAddWrong.js:94`. Kilit `useState`; yeni `onPress` kapanışı bir sonraki render'a kadar eski `saving=false`'u görür. `Press.js`'te debounce yok. Her kayıt yeni `client_operation_id` aldığı için sunucu tekilleştirmez.
- **Düzeltme:** `const busy = useRef(false); if (busy.current) return; busy.current = true; try { … } finally { busy.current = false; }` ya da operation id'yi form açılışında üretip kaydetmede yeniden kullan.

### 6.2 · P2 · Kuyruk ekranı başka kullanıcının kayıtlarını gösteriyor (Güven: Yüksek)
- **Nerede:** `src/lib/offlineQueueView.js:81-109` (`readDeadLetterRows`, `readQueueRows`) ve `offlineQueue.js:584-660` (`getDeadLetterItems`, `retryDeadLetter`, `clearDeadLetter`) `user_id` süzmüyor.
- **Etki:** Ortak cihazda B, A'nın deneme adlarını, konu/süre bilgisini görür; "Vazgeç" A'nın gönderilmemiş verisini kalıcı siler.
- **Düzeltme:** Görünüm fonksiyonlarına `userId` parametresi; `list.filter((i) => (i?.payload?.user_id || i?.payload?.trial?.user_id) === userId)`; `clearDeadLetter(userId)` yalnız o kullanıcının ögelerini silsin.

### 6.3 · P2 · Kronometre kurtarma kaydı kullanıcıya ayrışmıyor (Güven: Yüksek)
- **Nerede:** `src/domain/study/timerSession.js:18,36-41` sabit `@maraton:activeTimerSession`; `USER_SCOPED_KEYS`'te yok.
- **Etki:** A çalışırken çıkış yapar, 6 saat içinde B girer → B'ye "kurtarılabilir oturum" sorulur; kabul ederse A'nın süresi B'nin hesabına yazılır.
- **Düzeltme:** `saveTimerSession({...snapshot, userId})`, `loadTimerSession(userId)` içinde `s.userId !== userId` ise temizle; ya da anahtarı `USER_SCOPED_KEYS`'e ekle.

### 6.4 · P2 · Kurtarma linki AsyncStorage'a düz yazılıyor (Güven: Orta)
- **Nerede:** `src/navigation/linking.js:16-26` `freshInitialUrl` açılış URL'sini (`{url, at}`) `@maraton:handled_initial_url`'e yazıyor. `client.js` `flowType` belirtmediği için supabase-js varsayılanı (implicit) kullanılıyorsa sıfırlama linki `#access_token=…&refresh_token=…` taşır.
- **Etki:** Oturum token'ları SecureStore dışına, şifresiz depoya düşer (AGENTS.md: "SecureStore: auth tokens ONLY"); Android yedeğine girebilir.
- **Düzeltme:** `isRecoveryUrl(url)` ise kaydetme, ya da yalnız `url.split(/[?#]/)[0]` sakla. `createClient(..., { auth: { flowType: "pkce", … } })` ile linkte token yerine tek kullanımlık `code` gelir (`establishRecoverySession` zaten destekliyor).

### 6.5 · P2 · Ödül çiftleme (Güven: Orta)
- `private.apply_referral_code` (`20260902000454…:9-93`) davet edene her yeni hesapta +7 gün premium veriyor, üst sınır yok; e-posta doğrulaması kapalı (§2.5) olduğu için sahte hesapla sınırsız premium. `claim_streak_milestone` (`:107-168`) seriye göre premium gün veriyor; `touch_streak(p_study_date)` geçmiş tarihli `study_logs` satırıyla sırayla çağrılabildiği için seri inşa edilebilir.
- **Düzeltme:** Davet ödülünü davet edilen kullanıcı ilk 3 gün çalışma kaydı girince ver ve aylık 5 ile sınırla; `study_logs` INSERT politikasına `study_date >= (now() at time zone 'Europe/Istanbul')::date - 2` ekle. (Premium kapalıyken etkisi yok; açılmadan önce yapılmalı.)

---

## P0/P1 tek satır özet

| Bulgu | Dosya:satır | Düzeltme |
|---|---|---|
| P1 Engelleme sessizce başarısız / geri alınabilir | `src/supabase/friends.js:165-187`; `supabase/migrations/20260901140141_optimize_rls_auth_uid_policies.sql:30-38` | `user_blocks` tablosu + SECURITY DEFINER `block_user()`; arkadaşlık/challenge/companion/lig sorgularını engelle süz |
| P1 Onaysız "accepted" arkadaşlık | `20260901140141_optimize_rls_auth_uid_policies.sql:34-35` | INSERT `WITH CHECK (requester_id = auth.uid() AND status = 'pending')`; UPDATE yalnız `(status, responded_at)` ve `pending → accepted/declined` |
| P1 Tüm profillerin ad+foto'su okunabilir, opt-out etkisiz | `20260908120000_profiles_column_level_select.sql:18-24`; `20260901140141…:70-72` | SELECT politikasını kendisi/opt-in/arkadaş/grup üyesi ile sınırla; reşit olmayanlarda lig görünürlüğü varsayılan kapalı |
| P1 `avatars` anonim listelenebilir, kaldırılan foto açık | arşiv `003_fix_wrong_questions_and_avatars.sql:33-35`; `20261001150903_clde_avatar_reports.sql:41-46` | "Anyone can view avatars" düşür, SELECT'i sahibin klasörüne kısıtla; kaldırmada Edge Function ile dosyayı sil |
| P1 Apple token iptali yok | `src/hooks/useSocialAuth.js:36-44`; `src/supabase/auth.js:164-193` | `authorizationCode` → Edge Function'da refresh token sakla; silmede `appleid.apple.com/auth/revoke` |
| P1 Gizlilik metni çelişkili, KVKK aydınlatma/aktarım/rıza yok | `src/constants/legalDocs.js:7-48`; `web/privacy.html`; `src/screens/auth/RegisterScreen.js:44-46` | Tek kaynak metin, "paylaşılmaz" cümlesini sil, RevenueCat/Expo Push/görünürlük ekle; hukukçu onaylı KVKK aydınlatma + ayrı yurt dışı aktarım rızası |
| P1 Apple girişinde ad kaybı | `src/hooks/useSocialAuth.js:36-44`; `src/lib/displayName.js:7` | `credential.fullName`'i ilk girişte `auth.updateUser({data:{name}})` + `profiles.name`'e yaz; relay e-postada "Öğrenci" göster |
