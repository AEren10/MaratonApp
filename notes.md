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
