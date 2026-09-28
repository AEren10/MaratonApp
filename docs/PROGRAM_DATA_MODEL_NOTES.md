# Program veri modeli notu

Program ekranında benzer görünen üç veri tipi aynı otoriteden gelmez:

- Rota durağı: `route_stops`. Sunucu otoritesidir. Rota oluşturma, durak geçişleri ve rota tamamlama bu kayıtlar üzerinden okunur.
- Ek görev: `user_tasks`. Kullanıcının sonradan eklediği bağımsız görevdir. Belirli gün/konu bağlamı burada tutulur.
- Günlük snapshot: `daily_plans` / `plan_tasks`. Günün program görünümünü üretir; rota otoritesi değildir.
- Tamamlanma yerel durumu: `PLAN_DONE_PREFIX`. UI'nin hızlı/çevrimdışı tamamlandı hissi için yerel dayanıklılık katmanıdır; sunucu kayıtlarının yerine geçmez.

UI dilinde de bu ayrım korunmalı: rota kaynaklı işlere "durak", kullanıcı eklediklerine "ek görev", gün görünümü kayıtlarına "günlük plan" denmeli.
