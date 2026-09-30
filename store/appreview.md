# Maraton — App Review Notları

Bu dosya App Store Connect ve Google Play inceleme notları hazırlanırken kullanılacak iç kayıttır.

## Demo hesap

İnceleyici hesabını bu betik oluşturmaz. Önce uygulamadan gerçek bir demo kullanıcı hesabı açılmalı ve şifresi mağaza panelindeki inceleme notlarına manuel yazılmalıdır.

Demo kullanıcı açıldıktan sonra canlı Supabase projesine gerçekçi ama kişisel olmayan çalışma verisi eklemek için:

```bash
SUPABASE_URL="https://PROJECT_REF.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY" \
node scripts/seed-review-account.mjs reviewer@example.com
```

Windows PowerShell örneği:

```powershell
$env:SUPABASE_URL="https://PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY"
node scripts/seed-review-account.mjs reviewer@example.com
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
Remove-Item Env:\SUPABASE_URL
```

Güvenlik notları:

- `SUPABASE_SERVICE_ROLE_KEY` repoya yazılmayacak; yalnız geçici ortam değişkeni olarak kullanılacak.
- Betik kullanıcı hesabı veya şifre oluşturmaz. E-posta bulunamazsa durur.
- Betik yalnız çalışma verisi yazar; uydurma ad, okul, telefon, kimlik, fotoğraf veya gerçek kişisel veri üretmez.
- Betik iki kez çalıştırılırsa `appreview-demo:v1:*` operasyon kimlikli eski deneme, çalışma ve yanlış defteri kayıtlarını önce temizler; veri ikilenmez.

Betik şu demo verilerini oluşturur:

- Son 6 haftaya yayılan 3 TYT + 2 AYT Sayısal denemesi.
- Son 14 güne yayılan 12 çalışma kaydı; bazı kayıtlarda doğru sayısı dolu, bazıları yalnız konu çalışma seansı.
- Fotoğrafsız, notlu 6 yanlış defteri kaydı.
- TYT + AYT Sayısal profil ayarı, hedef net ve başlangıç neti.
- 10 günlük aktif seri.

Mağaza inceleme notlarında kullanılacak taslak:

```text
Demo hesap:
E-posta: [DEMO_EMAIL]
Şifre: [DEMO_PASSWORD]

Bu hesap gerçek kullanıcı değildir; App Review için örnek çalışma verisiyle hazırlanmıştır.
Uygulama ilk sürümde ücretsizdir. Premium, topluluk soru-cevap ve sosyal/lig akışları V1 inceleme kapsamına dahil değildir.

Önerilen kontrol akışı:
1. Giriş yapın.
2. Rota sekmesinde günlük çalışma planını ve seri durumunu görün.
3. Ortadaki + butonundan deneme veya çalışma kaydı ekleme akışını inceleyin.
4. Analiz sekmesinde TYT/AYT deneme grafikleri ve ders kırılımlarını görün.
5. Profil/Ayarlar üzerinden gizlilik, hesap ve destek bağlantılarını kontrol edin.
```
