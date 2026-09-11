# CDX çalışma notları

## 2026-09-11 — rota/export/challenge/premium/push sertleştirme

- Rota persist işlemi `persist_route_revision` RPC hattında toparlandı; `route_weeks` yazımı ayrı client upsert olarak kalmamalı. İleride rota yazımı eklenirse aynı transaction sınırı korunmalı.
- Plan task kayıt ve toggle işlemleri kullanıcı sahipliğiyle ilerliyor. Yeni plan task akışlarında `user_id` taşınmazsa offline replay ve RLS sessizce bozulabilir.
- Challenge progress artık `sync_challenge_progress` RPC ile server-resolved ve idempotent. Çalışma/deneme kaydı gibi kaynaklardan challenge'a katkı yazılırken `source` + `sourceOperationId` verilmesi kritik.
- KVKK/GDPR export kapsamına route lifecycle, product entitlement/usage ve route companionship verileri eklendi. Yeni user-scoped tablo eklenirse export kataloğu veya private export RPC de güncellenmeli.
- RevenueCat key'leri build env'den okunuyor. Production'da package yüklenmezse dev trial fallback'i açılmamalı.
- `send-push` Edge Function repo tarafında sertleştirildi; canlıya yansıması için ayrıca function deploy gerekir.
- Yeni Supabase migration dosyaları canlı DB'ye uygulanmadan uygulama tarafındaki bazı güvenlik/entegrasyon fix'leri tam etkili olmaz.

### Kalan dikkat noktaları

- Canlı Supabase baseline/migration zinciri için proje sahibi erişimiyle `supabase db push` / migration history kontrolü yapılmalı.
- Edge Function deploy'u local commit değildir; `send-push` için deploy pipeline adımı ayrıca çalışmalı.
- `design/Mobile app design.zip` dirty görünüyor; CDX kapsamında dokunulmadı.

## 2026-09-11 — RPC search_path ve hedef net sync hijyeni

- CDX'in etkilediği `SECURITY DEFINER` RPC yüzeylerinde `search_path` boş değere kilitlenmeli; yeni RPC eklenirse migration içinde `SET search_path = ''` veya `ALTER FUNCTION ... SET search_path = ''` unutulmamalı.
- `targetNetSyncPending` ve `baselineNetSyncPending` bayrakları sadece yazılmamalı, profil yüklenirken tekrar denenmeli. Aksi halde kullanıcı hedef/baslangıç netini kaydettiğini sanır ama değer yalnız cihazda kalır.
- Bekleyen yerel net değişikliği sunucudaki eski değerden daha yeni kabul edilir. Bayrak varsa yerel değer kazanmalı; bayrak yoksa sunucu değeri kazanmalı.

## 2026-09-11 — avatar upload veri kaybı sırası

- Avatar upload akışında eski uzantıdaki dosyalar yeni upload başarıyla tamamlandıktan sonra silinmeli. Önce silme yapılırsa ağ/Storage hatasında kullanıcının çalışan eski avatarı kaybolabilir.
