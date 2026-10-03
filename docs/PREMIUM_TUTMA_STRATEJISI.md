# Premium Tutma Stratejisi — "Neden ödemeye devam etsin?"

Tarih: 2026-10-03 · Hazırlayan: PM (AFC) · Durum: öneri, karar bekliyor
Kapsam: Premium'a geçiş + premiumda kalma. Kod durumu 2026-10-03 itibarıyla okunarak doğrulandı.

---

## TL;DR (karar önerileri)

1. **Premium'un satacağı şey "kilit açma" değil, her hafta yeniden üretilen bir yorum.** Ücretsiz sürüm "ne yaptın"ı tutar (kayıt, duraklar, seri, defter, kısa haftalık özet). Pro "bu veriden ne çıkıyor, gelecek hafta ne değişiyor"u her pazar ve her denemeden sonra yeniden üretir: tahmin bandı, rotanın denemeye göre yeniden çizilmesi ve nedeni, aylık kapanış, bölüm eşiği.
2. **Rota ve günlük duraklar ücretsiz kalmalı.** Kodda çelişki var: `proPitch.js` "Rota · bugünün durakları"nı Pro sayıyor ve sunucuda `route` anahtarı `first_week OR pro` kuralına bağlı (premium.js yorumu). `accessEnded.js` ise "Rota ve duraklar ücretsizde açık kalır" diyor. Premium açılınca bu haliyle çekirdek döngü kilitlenir. **Premium açılmadan önce çözülmesi gereken 1 numaralı konu bu.**
3. **YKS'de aylık yenilenen abonelik doğal olarak sızdırır.** Yıllık otomatik yenilenen plan da sınavdan sonra (Haziran) değersizleşip ertesi Ekim'de istenmeyen yenilemeye döner. Ana teklif **"YKS 2027'ye kadar" tek ödeme** olmalı. Bitiş tarihi tercih dönemi sonu (Ağustos ortası) olsun, fiyat kalan aya göre düşsün. Aylık plan esnek giriş kapısı olarak kalsın.
4. **İlk 7 günlük tam erişim (kodda `first_week`) zaten bir "ters deneme" (reverse trial).** 7. gün ekranı gerçek veriyle "bu hafta Pro'nun senin için ürettikleri"ni göstermeli. Satış en çok burada belirlenir.
5. **Raporlar şu an verinin yarısını gösteriyor.** Haftalık özette `buildWeekSummary`'nin hesapladığı başlık cümlesi, en verimli gün ve "plana göre / gerçekte" satırı ekrana çizilmiyor. Haftalıkta deneme/net yok, gelecek hafta yok. Üç butonun üçü de aynı paylaş işlevini çağırıyor. Aylık bildirim aylık rapora değil Karşılaştırma ekranına gidiyor. Bunlar düşük eforlu, yüksek getirili düzeltmeler.
6. **Monetizasyon altyapısı yok.** `package.json`'da RevenueCat ya da herhangi bir IAP kütüphanesi bulunmuyor. Premium'u açmak 1,5-2 haftalık entegrasyon ister. Faz disiplinine göre ilk 2 hafta ölçüm ve rapor (retention), 3-6. haftalar IAP ve teklif.

---

## 0. Kodda doğrulanan mevcut durum

| Alan | Bulgu | Dosya |
|---|---|---|
| Premium bayrağı | `PREMIUM_ENABLED = false`. Her şey açık, paywall gösterilmiyor | `src/constants/premium.js` |
| Fiyat (yedek gösterim) | Aylık ₺149, yıllık ₺1.068 (₺89/ay), 7 gün mağaza denemesi | `src/constants/premium.js` |
| Strateji dokümanındaki fiyat | Yıllık ₺899, 3 gün deneme. **Kodla çelişiyor** | `docs/PRODUCT_STRATEGY.md` §3 |
| İlk hafta | Paywall 7 gün açılmıyor, sunucu `isFirstWeek` ile Pro alanlarını açıyor (ters deneme) | `src/domain/premium/paywallGate.js`, `PremiumContext.js` |
| İlk hafta verisi | `buildFirstWeekMomentData`: dakika, soru, aktif gün, deneme, durak sayısı hazır | `src/domain/premium/firstWeekMoments.js` |
| Kota | Ücretsizde ayda 4 deneme, yanlış defteri sınırsız | `FREE_LIMITS` |
| Pro anahtarları | route, routeForecast, routeScenarios, routePriorities, trialCompare, ocr, monthlyReport, topicProgress, departmentThreshold | `PRODUCT_FEATURES` |
| İptal / Deneme Bitti ekranları | `SUBSCRIPTION_CANCEL` ve `ACCESS_ENDED` şu an `LegacyHomeRedirectScreen`'e gidiyor (kapalı) | `src/navigation/screenRegistry.js:241,244` |
| IAP | RevenueCat ya da IAP paketi yok | `package.json` |
| Sınav günü | Sınav fazında paywall bastırılıyor (doğru) | `paywallGate.js` → `examPhaseBehavior` |

### Haftalık rapor (SCREENS.SUMMARY, period=week). Ücretsiz.
- **Ekranda olan:** büyük sayı olarak toplam süre ve geçen haftaya göre fark (yeşil/gri). Tek cümle (`weekStory`): "Geçen haftadan X fazla. En çok Matematik çalıştın." Günlük çalışma çubuk grafiği. Şerit: soru, durak x/y, aktif gün x/7, seri.
- **Hesaplanıp çizilmeyen:** `headline` ("Bu hafta rotanın en verimli haftası oldu.", yalnız doğruysa), `bestLine` (haftanın en verimli günü), `promise` ("Plana göre N durak, gerçekte M"), `questionsDeltaPct`. Kaynak: `src/domain/summary/weekSummary.js`, çizim: `WeekSummaryBody.js`.
- **Hiç olmayan:** haftanın denemeleri ve net değişimi, rotadaki ilerleme yüzdesi, tahmin bandındaki değişim, gelecek haftanın ilk durağı.
- **Aksiyonlar:** "Kartı gör", "Paylaş", "İndir" üçü de `onShare` (`SummaryActions.js`). "Gelecek haftaya bak" gibi ileri bakan bir çağrı yok.
- **Paralel hesap:** `useWeeklyReport.js` (hikâye kartı için) aynı şeyleri ayrı bir mantıkla hesaplıyor. İki kaynak ileride çelişebilir.

### Aylık rapor (period=month). Pro (`advanced_reports`).
- **İçerik iyi kurgulanmış:** "AY KAPATILDI", net ortalaması ya da soru büyük sayı olarak. Yalnız ilk kez bir eşik geçildiğinde "Net ortalaman ilk kez X'i geçti." cümlesi çıkıyor (uydurma yok, iyi). Ayın en verimli haftası, hafta hafta soru ve % değişim, net aralığı, ders netleri, aktif seri, girilen denemeler, defter (durak/soru/saat), "Kasım planına bak" çağrısı.
- **Sorunlar:** (a) Aylık bildirim `comparative` ekranına gidiyor, aylık rapora değil (`notificationPlan.js:97`, `notifications.js:170`). Rapora tek giriş Program ay görünümündeki buton. (b) `SHARE_IDS`'te `month` yok, ay kartı paylaşımı genel karta düşüyor. (c) Bildirim yalnız 2+ deneme girenlere gidiyor, deneme girmeyen ama 30 saat çalışan kullanıcı ay kapanışını hiç görmüyor.

### Bildirim planı
- Günde en fazla 2 dilim (ana + akşam), 22:00 sonrası sessiz, öncelik sırası iyi kurulmuş.
- **Doğruluk riski:** Pazar 20:00 bildirimindeki "Bu hafta X soru, Y sa", planın kurulduğu andaki (son uygulama açılışı) `weeklyVars` ile yazılıyor (`notificationPlan.js:82`). Kullanıcı Perşembe açıp Pazar'a kadar açmazsa bildirim haftayı eksik söyler. "Uydurma veri yok" ilkesine aykırı (eksik sayı da yanlış sayıdır).

---

## 1. Premium'un "devam etme" sebebi

### 1.1 İlke: Pro her hafta yeni bir şey üretmeli
Strava ve Duolingo'nun ödeyen kullanıcıyı tutması "bir kez açılan özellik" değil, **tekrar eden kişisel çıktı** üzerine kurulu. Duolingo'nun haftalık ilerleme e-postası, Strava'nın aylık istatistik kartları ve yıllık özeti bunun örnekleri. Kullanıcı her hafta "bu hafta bana ne söyledi"yi bekler. Maraton'un rakiplerinde (Sınav Çatısı: reklamsız + ek içerik; Kunduz: soru çözümü ve canlı ders) bu kişisel yeniden çizim yok. Fark burada.

**Maraton'da her hafta yeniden üretilebilen 6 değer (koddaki altyapıyla):**

| # | Değer | Ne zaman yenilenir | Altyapı | Ücretsiz / Pro |
|---|---|---|---|---|
| 1 | Rotanın denemeye göre yeniden çizilmesi + **nedeni** ("Fizik netin 2 düştü, 3 durak öne alındı") | Her deneme sonrası | `routeRevisionSummary.js` (değişiklik listesi, başlık, sonraki adım hazır) | Yeniden çizim herkese, **neden + revizyon geçmişi Pro** |
| 2 | Sınav günü net tahmini ve tahmin bandı (daralması) | Her deneme | `routeForecast` | Pro (ücretsizde yalnız tek sayı ya da "3 denemeden sonra açılır") |
| 3 | Pazar raporunun Pro katmanı: plan / gerçek farkı, gelecek haftanın değişen durakları, band değişimi | Her pazar | `weekSummary.promise`, `routeRevisionSummary` | Kısa özet ücretsiz, katman Pro |
| 4 | Aylık kapanış + bölüm eşiğine mesafe | Her ay | `monthSummary`, `departmentThreshold` | Pro |
| 5 | Tempo senaryoları ("haftada 1 durak fazla → tahmin ne olur") | Haftalık yük değiştikçe | `routeScenarios` | Pro |
| 6 | Konu ilerlemesi tam liste ve öncelikler | Her durak/deneme | `topicProgress` | İlk 3 ücretsiz, tamamı Pro (mevcut) |

**Kritik gözlem:** Pro'nun değeri kullanıcının **veri girmesine** bağlı. Deneme girmeyen Pro kullanıcısı tahmin bandı, revizyon nedeni ve aylık net göremez. Değer görmeyince 1. ay sonunda iptal eder. Bu yüzden:
- Deneme **girişi** sınırlanmamalı (veri akışını keser). Kısıt **derinlikte** olmalı (karşılaştırma, trend, tüm geçmiş, OCR).
- Pro'nun en az bir değeri **yalnız çalışma kaydıyla** üretilmeli (plan/gerçek farkı, rota ilerleme hızı, "bu tempoyla müfredat ne zaman biter").

### 1.2 Ücretsiz / Pro sınırı önerisi (mevcut özelliklere göre)

| Özellik | Şu an (kod) | Öneri | Gerekçe |
|---|---|---|---|
| Rota + bugünün durakları | Pro'da listeleniyor, sunucuda `route` = first_week OR pro | **Ücretsiz** | Çekirdek döngü. Kilitlenirse D30 retention çöker |
| Rotanın çalışmaya göre yeniden dağıtılması (kaçan durak, tempo) | Belirsiz | **Ücretsiz** | "Borç sayma" sözünün ürün karşılığı |
| Rotanın **denemeye göre** önceliklendirilmesi + "neden" | Pro (`routePriorities`) | **Pro** | Haftalık yeniden üretilen değer #1 |
| Sayaç, çalışma kaydı, seri, joker, widget | Ücretsiz | Ücretsiz | Alışkanlık katmanı |
| Yanlış defteri + aralıklı tekrar | Ücretsiz, sınırsız | Ücretsiz | Kayıt ücretsiz, yorum Pro ilkesi |
| Deneme girişi | Ayda 4 | **Sınırsız elle giriş** | Veri, Pro değerinin yakıtı. Bahar aylarında 4 sınırı kullanıcıyı kayıt dışına iter |
| Deneme detay analizi (tek deneme) | Ücretsiz | Ücretsiz | Aha anı, kilitlenmemeli |
| Deneme karşılaştırma, tüm geçmiş trendi | Pro | Pro | Derinlik |
| Fotoğraftan okuma (OCR) | Pro, ilk 2 ücretsiz | Pro, ilk 2 ücretsiz | Kolaylık, yüksek algılanan değer |
| Net tahmini + tahmin bandı | Pro | Pro. Ücretsizde "bandın hazır, 3. denemeden sonra daralıyor" önizlemesi | Merak boşluğu, uydurma değil |
| Haftalık özet (kısa) | Ücretsiz | Ücretsiz + paylaşım kartı | Retention + organik büyüme |
| Haftalık özet Pro katmanı | Yok | **Pro (yeni)** | Her pazar tekrar eden değer |
| Aylık rapor | Pro | Pro. Ama ay kapanış **kartı** (3 sayı) ücretsiz paylaşılabilir | Strava dersi: özetin tamamını kilitlemek tepki çekti |
| Bölüm eşiği / hedef bölüm mesafesi | Pro | Pro, "yaklaşık" etiketiyle | Sınav sonrası tercih dönemine kadar değer taşır |
| Tempo senaryoları | Pro | Pro | Güç kullanıcı |
| Sezon özeti ("YKS yolculuğun") | Yok | **Ücretsiz** (paylaşım = gelecek yılın edinimi) | Strava 2025'te Year in Sport'u paywall'a aldı, ciddi tepki aldı |

**Uyum işi:** `proPitch.js` `PRO_FEATURES[0]` ("Rota · bugünün durakları"), `PRO_PITCH.lead` ("Ne çalışacağını Maraton söylesin") ve sunucudaki `route` kuralı bu tabloya göre güncellenmeli. Yeni Pro vaadi önerisi: **"Ne çalıştığını ücretsiz kaydet. Bunun sınav gününe ne yaptığını Pro her hafta yeniden hesaplasın."**

---

## 2. Churn noktaları ve önlemler

### 2.1 YKS takvimine göre risk haritası (2026-2027 sezonu)
YKS 2027 için ÖSYM takvimi henüz açıklanmadı. Geçmiş yıllara göre tahmin: TYT 19 Haziran, AYT 20 Haziran 2027, sonuçlar Temmuz sonu, tercih Temmuz sonu-Ağustos.

| Dönem | Kullanıcı hali | Churn riski | Önlem |
|---|---|---|---|
| Kayıt + 7 gün (ters deneme) | Merak, ilk deneme | Değer görmeden çıkış | 7 günlük görev listesi (`firstWeekMoments` 7 adım) + 7. gün gerçek veriyle Pro ekranı |
| 1. ay sonu (aylık yenileme) | Heves düşer | **En yüksek gönüllü iptal** | İlk yenilemeden 3 gün önce "ilk ayın" kartı (gerçek sayılar). Yenilemeden önce "sınava kadar"a geçiş teklifi |
| Kasım (okul yazılıları) | Rota geride kalır, utanç | Sessiz bırakma | Rota "borç saymadan" yeniden dağıtır, bildirim suçlamaz. Google Play'de duraklatma |
| Ocak-Şubat (yarıyıl, ÖSYM başvurusu) | Yeniden başlama isteği | Fırsat | "Yarıyıl rotası" + başvuru haftası anı. Fiyat düşmeden kampanya yok, sınava kadar paket zaten ucuzluyor |
| Mart-Mayıs | Panik, deneme yoğun | Düşük (değer zirvede) | Pro değeri en görünür: band, karşılaştırma, OCR |
| Son 30 gün | Yeni konu yok, tekrar | "Artık rotaya gerek yok" | Rota tekrar fazına geçer (`milestoneCopy` 30 gün mevcut). Yanlış defteri tekrar planı öne çıkar |
| Sınav günü ve sonrası | Bitti | **Doğal ve kaçınılmaz churn** | Kavga etme. Sezon özeti kartı (ücretsiz), sonuç/tercih dönemi için bölüm eşiği |
| Temmuz-Ağustos (tercih) | Puan, tercih | Pro'yu Ağustos'a taşıyan tek değer | "Sınava kadar" paketin bitişi tercih sonu, böylece değer ödediği süreyi doldurur |
| Eylül (tekrar adayı) | "Bir yıl daha" | Kazanım fırsatı | Win-back: "Geçen yıl buradaydın: ilk deneme 48, son 66 net. Rotan bu yıl 66'dan başlıyor." |

### 2.2 Paket ve fiyat önerisi

| Paket | Fiyat (öneri) | Tip | Rol |
|---|---|---|---|
| Aylık | ₺149 | Otomatik yenilenen | Esnek giriş, Sınav Çatısı ile aynı seviye (₺149,99) |
| **YKS 2027'ye kadar** | Ekim-Kasım ₺899 · Aralık-Ocak ₺749 · Şubat-Mart ₺549 · Nisan-Mayıs ₺349 | iOS: non-renewing subscription · Play: prepaid plan / tek seferlik ürün | **Ana teklif.** Bitiş: tercih dönemi sonu. Kalan ay başına ≈ ₺90-115 |
| Yıllık (otomatik) | ₺1.068 | Otomatik yenilenen | Yalnız sınav tarihi seçmeyen / 9-11. sınıf kullanıcıya. YKS adayına gösterme |

Gerekçe:
- RevenueCat 2025: yıllık abonelikler 12. ayda %50-60 tutuluyor, aylıklar %20-40. Ama yıllık iptallerin %35'i ilk ayda geliyor. YKS'de "yıllık" kavramı sınav döngüsüyle örtüşmüyor: Haziran'da biten ihtiyaç Ekim'de yenilenen ödemeye dönüşür, iade talebi ve 1 yıldız doğurur.
- "Sınava kadar" paket **churn'ü tanımı gereği sıfırlar** (yenileme yok, iptal anı yok) ve öğrencinin zihnindeki birimle (sınav) eşleşir. Rakip benzeri: Sınav Çatısı'nda "Yıllık YKS Hazırlık Paketi" ₺999,99 (indirimli ₺699,99), Kunduz'da sezonluk 12 aylık paketler var.
- Düşen fiyat Mart-Mayıs panik dönemindeki yüksek talebi yakalar. Kalan ay başına fiyat sabit kaldığı için adil görünür.
- **Teknik not:** iOS'ta non-renewing subscription'da mağaza intro deneme sunulmaz ve bitişi uygulama yönetir. Bizde bitiş zaten sunucu snapshot'ında (`get_product_access_snapshot`). Deneme ihtiyacını ilk 7 günlük ters deneme karşılıyor.
- **Ödeyen kişi:** YKS adayının büyük kısmı ve LGS adayının tamamı reşit değil, ödeme ebeveynden geçer (Aile Paylaşımı / "Satın Almak İçin Sor"). Hipotez: "Veliyle paylaşılabilir aylık kart" dönüşümü artırır. Önce ölç (paylaşım hedefi analitiği), sonra yatırım yap.

**Mağaza denemesi:** Kodda 7 gün mağaza denemesi + 7 gün ters deneme üst üste biniyor (fiilen 14 gün). RevenueCat verisinde 17-32 günlük denemeler en yüksek dönüşümü veriyor (%45,7). Eğitim kategorisi ise D35 dönüşümünde en zayıflardan. Öneri: ters denemeyi koru, mağaza denemesini yalnız aylık plana koy, 2 kohortla ölç.

### 2.3 İptal anında ne gösterilmeli
iOS'ta iptal uygulama dışında (Ayarlar > Abonelikler) yapılıyor, araya girilemez. Ama uygulamadaki "Aboneliği yönet" ekranı (`SUBSCRIPTION_CANCEL`, şu an kapalı) mağazaya yönlendirmeden önce bir kez gösterilebilir. Kural: **korkutma yok, gerçek veri var, ücretsizde ne kaldığı önce.** Bu, mevcut `paywallContexts` "ücretsizde açık kalır" dürüstlüğüyle uyumlu.

İçerik şablonu (her satır yalnız veri varsa çıkar):

```
ABONELİĞİN · 14 KASIM'A KADAR AÇIK

Pro seninle 6 haftadır:
  Rotan 4 kez denemelerine göre yeniden çizildi.
  Tahmin bandın 57–70'ten 61–68 nete daraldı.
  Son 4 denemede ortalaman 54,2 → 59,5.

ÜCRETSİZDE AÇIK KALIR
  Rota, duraklar, seri, yanlış defteri, kısa haftalık özet.
  Tüm kayıtların silinmez.

KAPANACAK OLANLAR
  Tahmin bandı, denemeye göre önceliklendirme, aylık rapor, karşılaştırma.

[ Sınava kadar pakete geç · ₺549 ]   (aylıktan pahalıysa gösterme)
[ Aboneliği yönet ]                   (mağazaya gider)
  Neden ayrılıyorsun? (tek dokunuş, isteğe bağlı)
  Pahalı · Yeterince kullanmadım · Sınav bitti · Başka uygulama · Diğer
```

Ek araçlar:
- **Google Play duraklatma** (1 hafta-3 ay, varsayılan açık): "Yazılı haftası / tatil" için mantıklı. Açık kalmalı.
- **Apple win-back teklifleri** (iOS 18+, StoreKit 2): iptal edenlere mağaza içinde indirimli dönüş. Ortalama dönüşüm %5-15. Hedef kitle: Eylül'de dönen tekrar adayları.
- **Gerekçe anketi** analitiğe yazılır ("Sınav bitti" payı ayrı izlenir, o churn kayıp sayılmaz).

---

## 3. Haftalık ve aylık rapor: "harika" olması için

### 3.1 İlkeler
1. **Uydurma veri yok.** Her cümlenin bir koşulu var, koşul tutmazsa cümle yok. (Mevcut `isBestRouteWeek` ve aylık `milestone` deseni doğru, bu deseni yay.)
2. **Büyük sayı + tek cümle + sade grafik + kutusuz şeritler.** (Kullanıcının sevdiği Ders Analizi deseni.)
3. **Geriye değil ileriye bitir.** Her rapor "gelecek hafta / gelecek ay ilk adım" ile kapanır.
4. **Kötü haftada da açılabilir olmalı.** Düşüş gri (`down`), kırmızı değil. Cümle yeniden başlamayı kolaylaştırır.
5. **Paylaşım kartı yalnız iyi haftada öne çıkar** (mevcut 120 dk eşiğiyle aynı).

### 3.2 Haftalık rapor: önerilen dizilim

| Sıra | Öğe | Veri kaynağı | Durum |
|---|---|---|---|
| 1 | Eyebrow: "12. HAFTA · 22–28 EYLÜL" | `routeWeek.weekNo` | Var, kullanılıyor |
| 2 | Büyük sayı: süre + geçen haftaya fark | `totals.minutes`, `previous` | Var |
| 3 | **Tek cümle**: aşağıdaki öncelik listesinden ilk doğru olan | weekSummary + trials | `headline` hesaplanıyor, çizilmiyor |
| 4 | Rota şeridi: "Rotanın %38'i bitti · bu hafta +9 durak" (hat çizilir) | route totals | Yeni (veri var) |
| 5 | Plan / gerçek: "Plana göre 12 durak, gerçekte 10. Kalan 2'si gelecek haftaya geçti." | `promise` | Hesaplanıyor, çizilmiyor |
| 6 | Günlük grafik + "En verimli gün: Perşembe · 120 soru" | `bars`, `bestLine` | bestLine çizilmiyor |
| 7 | Deneme bloğu (varsa): "2 deneme · ortalama 61,5 net (+3,0)" + en çok büyüyen ders | trials | Yeni (`useWeeklyReport`'ta netDelta var) |
| 8 | **Pro katmanı**: "Tahmin bandın 61–68 (geçen hafta 59–68)" · "Gelecek hafta rotası: Fizik'e 2 durak eklendi, çünkü son denemede 3 net düştü" | routeForecast, routeRevisionSummary | Yeni. Ücretsizde tek satır önizleme |
| 9 | Gelecek hafta: "Pazartesi ilk durak: Türev · 35 dk" → **"Haftaya başla"** birincil buton | `nextRouteAction` | Yeni (SummaryScreen'de hook zaten var) |
| 10 | Paylaş (iyi haftada birincil, değilse ikincil) | share card | "Kartı gör / Paylaş / İndir" tekrarını teke indir |

**Tek cümle öncelik listesi (ilk doğru olan yazılır):**
1. `isBestRouteWeek` → "Rotanın en verimli haftası."
2. Durakların tamamı kapandı → "Planladığın 12 durağın hepsini kapattın."
3. Deneme ortalaması ≥ +2 net → "Deneme ortalaman 3 net yükseldi; farkın çoğu Matematik'ten."
4. Aktif gün ≥ geçen hafta + 2 → "Geçen haftadan 2 gün fazla masaya oturdun."
5. Süre ≥ +15 dk → mevcut `weekStory`.
6. Düşüş haftası → "Bu hafta 2 gün çalıştın. Rota gelecek haftayı buna göre hafifletti."
7. Boş hafta → empty state (mevcut `StreakZeroEmpty`).

### 3.3 Aylık rapor (Pro) eklemeleri
Mevcut iskelet güçlü. Eklenecekler:
- **Rota ilerlemesi:** ay başı → ay sonu ("%22 → %36"). Rotanın kendi bitiş tahmini varsa "Bu tempoyla son tekrar haftasına 18 Mayıs'ta giriyorsun." (Yalnız motor bu tarihi üretiyorsa. Üretmiyorsa yazma.)
- **Kişisel rekorlar:** `comparativeAnalytics.personalBests` zaten var ("En yüksek net", "En uzun seri", "En uzun gün").
- **Hedef bölüme mesafe:** `departmentThreshold`, mutlaka "yaklaşık" etiketiyle (puan hesabı yaklaşık).
- **Deneme girmeyen kullanıcıya da aylık kapanış:** net yoksa kahraman sayı soru/saat (kanon zaten destekliyor). Bildirim koşulunu `trials.count >= 2`'den "ayda ≥3 aktif gün"e genişlet.
- **Bildirim yönlendirmesi:** `monthly_summary` → `SUMMARY {period:"month"}` (şu an Karşılaştırma).
- **Ay paylaşım kartı:** `SHARE_IDS.month` + ücretsiz kullanıcıya da 3 sayılık kart (durak · soru · gün). Kartın tamamı değil, kapanış ücretsiz.

### 3.4 Sezon özeti: "YKS yolculuğun" (sınav ertesi günü, ücretsiz)
Spotify Wrapped 2025 ilk 24 saatte 200 milyon kullanıcıya ulaştı, paylaşım yıllık %41 artarak ~500 milyona çıktı. Strava ise aynı yıl Year in Sport'u abonelik arkasına alınca tepki gördü. Ders: **özet paylaşımı edinim kanalıdır, kilitlenmez.**
İçerik (hepsi gerçek veri): toplam saat, soru, kapanan durak, deneme sayısı, ilk deneme neti → son deneme neti, en uzun seri, en çok çalışılan ders, en verimli ay. Tek cümle: "248 gün önce 48 netle başladın." Ayrıca **100 gün kala bir ara özet** (mevcut 100 gün bildirimine bağlanır).

---

## 4. Bildirim metinleri (30 örnek)

Ton: `notificationCopy.js` ile aynı. Sıcak, kısa, somut, suçlamaz. Emoji, XP, ünlem yok. Her metin tek bir şey ister ve gideceği yeri söyler. `{}` içindekiler gerçek veridir; veri yoksa o metin seçilmez.

**Kullanılmayacaklar:** "Seni özledik", "Hadi!", "Unutma!", "Son şans", "Rakiplerin çalışıyor", "Serin yanmak üzere", başkasıyla kıyas, "tembellik", ünlem işareti.

### Günlük (alışkanlık saati)
| # | Başlık | Gövde |
|---|---|---|
| 1 | Bugün 2 durak: {Paragraf} ve {Üslü sayılar} | İlki {25} dakika. Gerisini başlayınca düşünürsün. |
| 2 | Dünkü yerden devam | {Türev}'in ikinci yarısı kaldı. Sayaç seni bekliyor. |
| 3 | Tekrar sırası geldi | Yanlış defterinde bugün {6} soru tekrar bekliyor. On dakikalık iş. |
| 4 | Kısa gün mü? | 15 dakikalık durak da rotada sayılır. Bugünün en kısası: {Noktalama}. |
| 5 | Sınava {241} gün | Bugün {3} durak var. Biri bile günü saydırır. |

### Akşam (gün bitmedi)
| # | Başlık | Gövde |
|---|---|---|
| 6 | Son durak {20} dakika | Bugün {1 sa 20 dk} çalıştın. Kalan tek durak: {Hücre bölünmesi}. |
| 7 | Gün kapanmadan bir test | Bugün henüz başlamadın. Bir paragraf testi de günü saydırır. |
| 8 | Bugünkü {2} durak yarına geçebilir | Yetişmeyecekse sorun değil, rota yarını ona göre kurar. Yetişecekse ilki {Olasılık}. |

### Seri
| # | Başlık | Gövde |
|---|---|---|
| 9 | {14} gündür masadasın | Bu akşam bir durak seriyi {15}'e taşır. |
| 10 | Jokerin hazır | Bugün çalışamazsan serin korunur. Çalışabilirsen kısa bir durak yeter. |
| 11 | {30} gün oldu | Bir aydır her gün en az bir durak. {Ekim}'in ritmi bu. |

### Geri dönüş (3 / 7 / 14. gün)
| # | Başlık | Gövde |
|---|---|---|
| 12 | Rota bekledi | {3} gün ara verdin, durakları sonraki günlere yaydık. Dönüş durağı {15} dakika. |
| 13 | Kaçan duraklar yeni haftalara yayıldı | {9} durak borç değil, yeni bir sıra. Pazartesi yeniden başlamak kolay. |
| 14 | Kaldığın yer: {Türev} | Sınava {198} gün var. Verilerin duruyor, rota seni bugünden alır. |

### Haftalık (Pazar 20:00)
| # | Başlık | Gövde |
|---|---|---|
| 15 | Haftanın karnesi: {7 sa 10 dk} | Geçen haftadan {1 sa 25 dk} fazla. En çok {Matematik}'e oturdun. |
| 16 | {12} durağın {10}'u kapandı | Kalan 2'si gelecek haftaya geçti. Pazartesinin ilk durağı hazır. |
| 17 | Bu hafta {2} gün çalıştın | Rota gelecek haftayı hafifletti. İlk durak {20} dakika. |
| 18 | Rotanın en verimli haftası | {9 sa}, {340} soru. Kartın hazır, istersen paylaş. |
| 19 | Gelecek haftanın rotası değişti | Son denemede {Fizik} {3} net düştü, {2} durak öne alındı. Nedenini gör. (Pro) |

### Aylık (ayın 1'i)
| # | Başlık | Gövde |
|---|---|---|
| 20 | {Ekim} kapandı: {31} saat | {Eylül}'den {6} saat fazla. Ayın kapanışına bak. |
| 21 | {Ekim}'de ortalama {58,5} net | {Eylül}'de {54,0}'tü. Farkın hangi dersten geldiğini gör. |
| 22 | Rotanın %{36}'sı bitti | Bu ay {41} durak kapandı. {Kasım} planı hazır. |

### Deneme sonrası
| # | Başlık | Gövde |
|---|---|---|
| 23 | Rotanı güncelledik | {Paragraf} netin {3} düştü, {2} Türkçe durağı bu haftaya alındı. |
| 24 | Tahmin bandın daraldı | {4} denemeden sonra sınav günü tahminin {61–68} net. Önceki: {57–70}. (Pro) |
| 25 | Yeni en yüksek: {72,25} net | Önceki en iyin {68,5}'ti. Farkın çoğu {Matematik}'ten. |
| 26 | Düşük deneme rotayı bozmaz | Dünkü denemeden {3} konu rotaya eklendi. Bugünkü ilki {20} dakika. |
| 27 | Son denemen {12} gün önceydi | Yeni bir deneme hem rotayı hem tahminini günceller. Hafta sonu için iyi bir iş. |

### Takvim / sezon
| # | Başlık | Gövde |
|---|---|---|
| 28 | Sınava 100 gün | 100 günün özeti hazır: {212} saat, {4.900} soru. Bundan sonrası da rotada. |
| 29 | {248} gün, {412} saat | YKS yolculuğunun kartı hazır. Sonuç gününde de buradayız. |
| 30 | Sonuçlar açıklandı | Puanınla hedef bölümlerine mesafe hazır. Tercih dönemi boyunca açık. |

**Teknik düzeltme (metinden önce):** Haftalık bildirimde sayı yalnız plan Pazar günü kurulduysa kullanılmalı. Değilse sayısız metin ("Haftanın karnesi hazır") gitmeli. Mevcut `weeklyCopy` sayısız dalı zaten var.

**Sıklık:** Çalışmalara göre haftada 2-5 bildirim alanların %46'sı bildirimi kapatabiliyor, en sık kapatma nedeni "çok sık". Günde en fazla 2 kuralı korunmalı. Haftalık toplam için de bir tavan önerilir (ör. aktif olmayan kullanıcıya haftada en fazla 4).

---

## 5. Önceliklendirilmiş yapılacaklar (ilk sürümden sonraki 6 hafta)

RICE: Reach = 4 haftada etkilenen aktif kullanıcı %'si, Impact 0.5-3, Confidence 0-1, Effort = kişi-hafta.

| # | İş | R | I | C | E | RICE | Hafta | KPI | Sahip |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Haftalık bildirimde bayat sayı düzeltmesi | 70 | 1 | 0.9 | 0.1 | **630** | 1 | Bildirim doğruluğu, açılma oranı | Codex (veri) |
| 2 | Ücretsiz/Pro sınırını netleştir: rota ücretsiz (sunucu `route` kuralı), deneme girişi sınırsız, `proPitch` metin uyumu | 100 | 2 | 0.8 | 0.4 | **400** | 1-2 | D30 retention, Pro değer algısı | Codex + Claude |
| 3 | Haftalık rapora hesaplanmış ama çizilmeyen verileri bağla (tek cümle, plan/gerçek, en verimli gün) + deneme bloğu + "Haftaya başla" | 60 | 2 | 0.8 | 0.6 | **160** | 1-2 | Rapor açılma ≥%35 WAU, rapordan durak başlatma | Antigravity (ekran) |
| 4 | 7. gün (ters deneme bitişi) ekranı gerçek veriyle (`firstWeekMoments`) | 50 | 2 | 0.6 | 0.4 | **150** | 3 | 7. gün → ödeme dönüşümü | Claude + Antigravity |
| 5 | Deneme sonrası "Rotanı güncelledik" + nedeni (`routeRevisionSummary` → TrialSummary) | 40 | 3 | 0.7 | 0.6 | **140** | 2-3 | Deneme girenlerin D30'u, 2. deneme oranı | Claude |
| 6 | IAP altyapısı (RevenueCat): aylık + "sınava kadar" (iOS non-renewing, Play prepaid) | 100 | 3 | 0.9 | 2 | **135** | 3-5 | Gelir; deneme → ödeme | Codex |
| 7 | Aylık: bildirim → aylık rapor, ay paylaşım kartı, deneme girmeyene de kapanış | 30 | 1 | 0.8 | 0.2 | **120** | 2 | Aylık rapor açılma, paylaşım | Codex + Claude |
| 8 | Analitik huni: aha olayları (ilk deneme, ilk revizyon, rapor açıldı/paylaşıldı, Pro alanı görüntülendi) | 100 | 1 | 0.9 | 1 | **90** | 1 (ön koşul) | Karar verebilmek | Codex |
| 9 | Bildirim metin havuzunu genişlet (bölüm 4), rotasyon | 70 | 1 | 0.6 | 0.4 | **105** | 4 | Bildirim CTR, kapatma oranı | Claude |
| 10 | Abonelik yönetim ekranı (gerçek veri + "sınava kadar"a geçiş + gerekçe anketi), Play duraklatma, iOS win-back | 10 | 2 | 0.5 | 0.8 | **12** | 5-6 | 1. ay yenileme oranı, win-back dönüşümü | Claude + Codex |
| — | Sezon özeti ("YKS yolculuğun", 100 gün ara özeti) | 100 | 2 | 0.7 | 1 | 140 | **Mart 2027** (zamanlı) | Paylaşım, organik kurulum | — |

**Sıralama mantığı (faz disiplini):**
- **Hafta 1-2: Retention + ölçüm.** #8, #1, #2, #3, #7. Premium kapalıyken de değer üretirler.
- **Hafta 3-5: Monetizasyon altyapısı.** #6, #4, #5. Premium yalnız yeni kayıt kohortunda açılır, eski kullanıcıya "erken kullanıcı" jesti düşünülür (karar kurucuda).
- **Hafta 5-6: Tutma.** #10, #9.

**Başarı ölçütleri (premium açıldıktan sonraki ilk 8 hafta):**

| KPI | Hedef (ilk tahmin, veriyle güncellenecek) |
|---|---|
| D7 / D30 retention | ≥ %35 / ≥ %18 |
| Haftalık rapor açılma (WAU içinde) | ≥ %35 |
| Ters deneme → ödeme | ≥ %4 |
| Ödemelerde "sınava kadar" payı | ≥ %50 |
| Aylık planda 1. yenileme | ≥ %60 |
| İade oranı | < %3 |
| Ödeyenlerde haftada ≥1 deneme girişi | ≥ %60 (Pro değerinin yakıtı) |

---

## Açık kararlar (kurucu)
1. Rota ücretsiz mi? (Öneri: evet. Sunucu kuralı değişir.)
2. Deneme giriş kotası kaldırılsın mı? (Öneri: evet, derinlik Pro.)
3. "Sınava kadar" paket ana teklif mi, yıllık otomatik mi? (Öneri: sınava kadar.)
4. Mağaza denemesi + ters deneme birlikte mi? (Öneri: ters deneme kalsın, mağaza denemesi yalnız aylıkta, A/B.)
5. `PRODUCT_STRATEGY.md` §3 fiyatları (₺899 / 3 gün) bu dokümanla senkronlansın mı?

---

## Kaynaklar
- [RevenueCat — State of Subscription Apps 2025](https://www.revenuecat.com/state-of-subscription-apps-2025)
- [RocketShip HQ — RevenueCat 2025 özet: deneme, paywall, churn ölçütleri](https://www.rocketshiphq.com/revenuecat-state-of-subscription-apps-2025-summary/)
- [RevenueCat — Deneme süresi verisi (17.000+ uygulama)](https://www.revenuecat.com/blog/growth/free-trial-length)
- [Singular — RevenueCat raporundan 17 çıkarım](https://www.singular.net/blog/subscription-apps/)
- [Lenny's Newsletter — Behind the product: Duolingo Streaks](https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks)
- [Trophy — Duolingo tarzı ilerleme raporları](https://trophy.so/blog/how-to-create-duolingo-style-progress-reports-for-your-app)
- [UX Magazine — Utandırmadan seri tasarımı](https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame)
- [Duolingo Q3 2025 hissedar mektubu (SEC)](https://www.sec.gov/Archives/edgar/data/1562088/000162828025049514/q3fy25duolingo9-30x25share.htm)
- [Strava destek — Year in Sport](https://support.strava.com/en-us/articles/15401959-your-year-in-sport)
- [Slashdot — Strava Year in Sport paywall arkasında](https://news.slashdot.org/story/25/12/19/2158235/strava-puts-popular-year-in-sport-recap-behind-an-80-paywall)
- [TechCrunch — Spotify Wrapped 2025 ilk günde 200M kullanıcı](https://techcrunch.com/2025/12/04/spotify-says-wrapped-2025-is-its-biggest-yet-with-200m-users-in-its-first-day)
- [Music Business Worldwide — Wrapped 2025, paylaşım artışı](https://www.musicbusinessworldwide.com/spotify-wrapped-campaign-hit-200m-engaged-users-in-24-hours-a-19-yoy-increase/)
- [RevenueCat — Apple win-back teklifleri rehberi](https://www.revenuecat.com/blog/growth/guide-to-apple-win-back-offers)
- [Apple — Supporting win-back offers](https://developer.apple.com/documentation/storekit/supporting-win-back-offers-in-your-app)
- [Android Developers Blog — Pause, account hold, restore](https://android-developers.googleblog.com/2020/06/new-features-to-acquire-and-retain-subscribers.html)
- [Play Console — Abonelik oluşturma ve yönetme](https://support.google.com/googleplay/android-developer/answer/140504?hl=en)
- [Apple Developer Forums — 3.1.2 abonelik kuralları](https://developer.apple.com/forums/thread/768364)
- [AppClearance — 3.1.2 rehberi (non-renewing ve auto-renewable)](https://appclearance.com/guides/3-1-2-subscriptions)
- [Noom iptal akışı (indirim / duraklatma teklifleri)](https://www.lowermysubs.com/blog/lower-noom-costs)
- [Headway fiyat ve planlar](https://makeheadway.com/blog/how-much-does-the-headway-app-cost/)
- [Brilliant iptal (ilerleme korunur, duraklatma)](https://www.lowermysubs.com/cancel/brilliant)
- [MobiLoud — Push bildirim istatistikleri 2025](https://www.mobiloud.com/blog/push-notification-statistics/)
- [Pushwoosh — Push ölçütleri 2025](https://www.pushwoosh.com/blog/push-notification-benchmarks/)
- [App Store — Sınav Çatısı YKS (uygulama içi fiyatlar)](https://apps.apple.com/tr/app/s%C4%B1nav-%C3%A7at%C4%B1s%C4%B1-yks-tyt-ayt-2027/id6461726612?l=tr)
- [Kunduz YKS 2026 paketleri](https://kunduz.com/tr/paketler/yks-2026-soru-cozum/)
- [Kunduz 2026-2027 paket fiyatları (üçüncü taraf derleme)](https://www.alisanci.com/kunduz-paket-fiyatlari.html)
- [Hangi Bölüm — YKS 2027 takvimi (tahmini)](https://hangibolum.org/takvim)

Not: Hocalara Geldik ve Robot Hoca için güncel dijital abonelik fiyatına ulaşılamadı (Hocalara Geldik ağırlıkla basılı yayın satıyor). YKS 2027 tarihleri ÖSYM açıklayana kadar tahminidir.
