# Maraton · Tasarım Denetim Raporu

141 ekran, 15 akış. Ölçümler canlı DOM'dan alındı; hiçbir tasarım değiştirilmedi.

---

## A. Hemen düzeltilmesi gereken 10 kritik problem

**A1 · Premium ekranı yasaklı cümleyi hâlâ taşıyor — Kritik**
Premium (AKIŞ 13) alt başlığı: *"Çalışmayı sen kaydediyorsun. Ne zaman neyi çalışacağına Pro karar veriyor."* Bu, kullanıcıdan kontrolü alan tam olarak istenmeyen ifade. Ana başlık da aynı yönde: *"Daha az düşün, rotan kendini güncellesin."*
Çözüm: "Pro, verilerine göre daha net öneriler sunar. Rotanı sen şekillendirirsin." + başlık "Rotanı daha net gör."

**A2 · Fiyat üç farklı biçimde görünüyor — Kritik**
DOM'da ₺89/ay, ₺149/ay ve ₺89/yıl birlikte var. ₺89 hem aylık hem yıllık fiyat olarak geçiyor; kullanıcı hangisinin ne olduğunu çıkaramaz.
Çözüm: tek fiyat mimarisi — Aylık ₺149 · Yıllık ₺89/ay (12 ay tek ödeme ₺1.068). Her paywall'da aynı iki satır, aynı sırada.

**A3 · Yanlış Defteri toplamları uyuşmuyor — Kritik**
Üstte "Bekleyen · 14" ve "BUGÜN TEKRAR ZAMANI · 6" yazıyor; alttaki konu listesi 5+3+2+2+3+1 = **16** soru, bugün tekrar işaretli olanlar **10** soru.
Çözüm: sekme sayacı = liste toplamı (16), bugünkü rozet = bugün işaretli satırların toplamı (10). Bu ekran sayı güvenilirliğinin sınandığı yer.

**A4 · Rota Detay'da aynı sayı dört kez — Yüksek**
Tek ekranda: grafik etiketi "TAHMİNİ 71 NET", altında "BU TEMPOYLA SINAV GÜNÜ · 71 net · hedefin 1 net altında", sonra "Tahmin aralığı 68–74 net", sonra tempo tablosunda "Aynı tempo · 71 net".
Çözüm: 71'i bir kez büyük göster (grafik + tek cümle), aralığı onun altına küçük satır olarak bağla, tempo tablosundan "Aynı tempo" satırını kaldır — o zaten mevcut durum.

**A5 · Rota grafiğinin ekseni okunamıyor — Yüksek**
Rota Detay'daki 79 / 69 / 60 / 50 değerleri birim ve zaman ekseni olmadan duruyor; en düşük kontrastlı metinler de burada (8px, kontrast 1.49).
Çözüm: y ekseninin üstüne bir kez "net", x ekseni altına üç tarih (ilk deneme · bugün · sınav günü). Eksen yazılarını `--text4`e çek.

**A6 · Küçük metinlerde kontrast eşiğin altında — Yüksek**
444 metin düğümü 3.2:1 altında. `--text3` (#6B6870) = 3.10, `--text4` = 2.10, `--text5` = 1.49. Ana Sayfa'daki durak meta satırları ("35 soru · ~42 dk"), "7/11 durak", "+2 durak" bu grupta.
Çözüm: `--text3`ü #7D7A84 civarına açmak 4.5:1'e taşır ve hiçbir layout'u değiştirmez. `--text4`/`--text5` yalnızca dekoratif eksen/grafik etiketlerinde kalsın, bilgi taşımasın.

**A7 · Tarih yazımı beş biçimde — Yüksek**
"23 HAZ", "23 HAZİRAN", "23 Haziran", "23 Haziran 2026", "24 HAZ 2027" hepsi kullanımda.
Çözüm: üç kural — grafik/etiket "23 HAZ", satır/başlık "23 Haziran", yıl yalnızca farklı yıla atıfta "24 Haziran 2027".

**A8 · Örnek veri takvimi karışık — Yüksek**
Haziran (deneme akışı), Ağustos (Seri Takvimi, Yılın Rotası), Temmuz ve Aralık (rota grafiği) aynı kullanıcı yolculuğu gibi duruyor. Sınav yılı da iki yerde farklı: "24 HAZ 2027" ve "23 Haziran 2026".
Çözüm: tek kurgu — bugün 23 Haziran 2026, sınav 20 Haziran 2027. Seri Takvimi ve Yılın Rotası "geçmiş ay görünümü" olarak açıkça etiketlensin.

**A9 · Profil'de dört bölüm birlikte ana karakter — Yüksek**
Seviye yolu (XP), Hedef bölüm, Yol künyesi, Yılın Rotası, Premium kartı ve davet kartı aynı görsel ağırlıkta sıralanıyor.
Çözüm: emek verisi (künye + Yılın Rotası) birincil, Seviye ikincil satır, Premium ve davet en altta tek sade blok.

**A10 · Rota durum sistemi yalnızca renkle anlatılıyor — Yüksek**
Tamamlanan / aktif / planlanan üç durum var; atlanan, yeniden planlanan, kilitli ve dondurulmuş durumlar rota çizgisinde ayrı bir görsel dile sahip değil. Ayrım sadece dolgu rengi ve kesikli çizgi.
Çözüm: düğüm şekli devreye girsin — dolu daire (tamamlanan), halka (aktif), içi boş küçük daire (planlanan), kesikli halka (yeniden planlanan), çapraz çizik (atlanan), kilit ikonu (kilitli), gri donuk çizgi (dondurulmuş).

---

## B. Ekran ekran tasarım problemleri

### Ana Sayfa
- **İyi:** 112px'lik soru sayısı + rota grafiği + hero CTA üçlüsü. İlk 2 saniyede "bugün ne kadar çözdüm" ve "şimdi ne yapacağım" okunuyor. Dokunulmamalı.
- **Kaliteyi düşüren:** üst şeritte 47 GÜN, YKS 2027, 500→299 gün, 63/100, 7/11 durak, 12 sa borç aynı anda yarışıyor. Rota grafiğinin üstündeki durak adları 8,5px ve 2.10 kontrast — okunmuyor.
- **Nerede:** header rozet satırı + grafik etiketleri + "Rotanın tamamı" satırı.
- **Çözüm:** grafik üstündeki beş durak adından yalnızca bugünün adı kalsın; diğerleri düğüm olarak dursun. "47 GÜN" rozeti `--text3`e insin.
- **Öncelik:** Yüksek

### Rota Detay
- **İyi:** gerçek veri + tahmin + projeksiyon üç katmanlı grafik; "Söz ve gerçek" satırı ürünün en özgün fikri.
- **Kaliteyi düşüren:** A4 (sayı tekrarı) ve A5 (eksen). "TEMPO DEĞİŞİRSE" tablosunda üç satırın ikisi net veriyor, biri sadece davranış anlatıyor — karşılaştırma gücü düşüyor.
- **Nerede:** grafik alanı ve tempo tablosu.
- **Çözüm:** üç senaryo aynı üç alanı taşısın (haftalık soru · durak sayısı · tahmin bandı). "72 net ≈ hangi bölümler?" bloğu kaynak notuyla ayrılsın ("2025 taban puanları").
- **Öncelik:** Yüksek

### Rotanın tamamı
- **İyi:** "7/11 durak tamamlandı" + 11 parçalı ilerleme çubuğu + eklenen legend. Görünümler listesi (Yol haritası / Program / Konu borcu / Söz ve gerçek) kavram ayrımını çözüyor.
- **Kaliteyi düşüren:** BORÇ / GERİDE / SINAVA üç metriği eşit ağırlıkta; "GERİDE 2 durak" ifadesi olumsuz tonda tek yer.
- **Çözüm:** "GERİDE" → "YENİDEN PLANLANAN". Üç metrikten SINAVA'yı küçült.
- **Öncelik:** Orta

### Durak Detayı
- **İyi:** "NEDEN BU DURAK" gerekçe listesi; ders rengi + süre + soru sayısı hiyerarşisi.
- **Kaliteyi düşüren:** başlık altındaki iki metrik kutusu ile "NEDEN BU DURAK" listesi arasında görsel öncelik belirsiz.
- **Çözüm:** metrik kutuları tek satır rozet hâline gelsin, gerekçe listesi ana içerik olarak kalsın.
- **Öncelik:** Orta

### Program Hafta
- **İyi:** hafta ilerlemesi (12/18) + yedi günlük şerit + seçili günün durakları. Program'a giriş noktası artık net.
- **Kaliteyi düşüren:** "4 durak · 3 sa 20 dk" başlık satırında yapılacaklarla toplamlar aynı ağırlıkta.
- **Çözüm:** toplamları gün başlığının altına ikincil satıra indir.
- **Öncelik:** Orta

### Program Ay Görünümü
- **İyi:** yoğunluk ızgarası + üç sayaç + yaklaşan tarihler.
- **Kaliteyi düşüren:** karedeki noktaların anlamı yalnızca tek satır notta yazılı; seçili gün ile alttaki detay arasında görsel bağ yok.
- **Çözüm:** ızgaranın üstüne küçük legend (nokta = ders), seçili kareye accent halka + detay bloğuna aynı halkadan gelen ince bağlantı çizgisi.
- **Öncelik:** Yüksek

### Deneme Girme (3 adım)
- **İyi:** üç adımlık ilerleme çubuğu, ders bazlı giriş mantığı.
- **Kaliteyi düşüren:** doğru/yanlış/boş alanları aynı görsel ağırlıkta; "Karekök · ×1,12 · normalize net 78,96" teknik satırı formu domine ediyor.
- **Çözüm:** boş alanını nötr, yanlışı kehribar çerçeveli yap. Normalize bilgisini bilgi ikonuna al.
- **Öncelik:** Yüksek

### Fotoğraftan Okuma ve Onay
- **İyi:** okunan değerlerin onaya düşmesi.
- **Kaliteyi düşüren:** onay ekranı elle giriş ekranıyla aynı şablonu kullanmıyor; kullanıcı neyi kontrol ettiğini (ders/doğru/yanlış/boş) tek bakışta göremiyor.
- **Çözüm:** onay ekranı elle giriş tablosunun aynısı olsun, okunan hücreler accent çerçeveli.
- **Öncelik:** Yüksek

### Deneme Özeti
- **İyi:** "ROTA YENİDEN ÇİZİLDİ" + eklenen "önceki 55,95 → yeni 58,25" satırı + TAHMİN 73 etiketi. Matematik artık kapanıyor.
- **Kaliteyi düşüren:** 58,25 (büyük), +2,30, TAHMİN 73 ve "önce 71 idi" dört sayı hâlâ yan yana.
- **Çözüm:** grafik etiketlerinden "önce 71 idi"yi kaldır, alt cümlede zaten yazıyor.
- **Öncelik:** Orta

### Analiz · Çalışma İlerlemesi
- **İyi:** "son çalışma 11 gün önce · 2 durak geride" dili tam yerinde — korunmalı. Ad değişikliği (Konu Analizi → Çalışma İlerlemesi) konu bazlı net izlenimini kaldırdı.
- **Kaliteyi düşüren:** Ana Sayfa'daki "5 denemede 5,0 net düştü" ve "5 denemede +3,0 net" kartlarında dönem ve veri kaynağı yazılı değil.
- **Çözüm:** her analiz kartının üstüne "son 5 deneme · Şub–Haz" gibi tek kaynak satırı; her grafiğin yanına tek cümle yorum.
- **Öncelik:** Yüksek

### Yanlış Defteri / Yanlış Detayı
- **İyi:** arşiv değil tekrar motoru kurgusu; aralıklı tekrar (1/3/7 gün) açıklaması.
- **Kaliteyi düşüren:** A3 (sayı uyuşmazlığı). Durum etiketleri karışık aile: "BUGÜN TEKRAR", "2. KEZ ZORLANDI", "3 GÜN SONRA", "KAPANDI".
- **Çözüm:** dört durum, tek dil: Yeni · Tekrar zamanı · Tekrar edildi · Kapatıldı. "2. KEZ ZORLANDI" bir alt satır notu olsun, durum değil.
- **Öncelik:** Kritik (sayı), Yüksek (durum dili)

### Tekrar Bitti
- **İyi:** "defterden çıktı" + eklenen "Bugünkü emeğin kayda geçti" satırı.
- **Kaliteyi düşüren:** tamamlama kırmızı başarı vurgusuyla anlatılıyor; kırmızı zaten marka/eylem rengi.
- **Çözüm:** kapanış anını defter sayısının azalışıyla göster (14 → 8 count-down) ve yeşil "kapatıldı" işareti kullan.
- **Öncelik:** Orta

### Oturum Bitti
- **İyi:** sıralama artık doğru (mesaj → süre → rota değişimi → sıradaki durak → XP → aksiyonlar). Rota düğümü parlaması ekranın ana animasyonu.
- **Kaliteyi düşüren:** "Bugün çözülen 63 → 87" satırı üç metrik satırının en altında kalıyor, en anlamlı olan o.
- **Çözüm:** bu satırı "Bugünkü tamamlanma"nın altına al.
- **Öncelik:** Cilalama

### Seri Takvimi
- **İyi:** ay ızgarası + gün detayı.
- **Kaliteyi düşüren:** Ağustos verisi Haziran akışıyla çelişiyor (A8). "DONDURULDU" etiketi kehribar, "SERİ SÜRDÜ" gri — donduruldu bir uyarı değil.
- **Çözüm:** dondurulmuş günler nötr gri + kesikli çerçeve.
- **Öncelik:** Orta

### Profil · Yılın Rotası
- **İyi:** Yol künyesi (3.480 soru · 61 sa · 47 gün) ve Yılın Rotası ısı ızgarası emeği iyi anlatıyor.
- **Kaliteyi düşüren:** A9. XP dili ("Hırslı'ya 960 XP", "nihai hedef Maratoncu") uygulamanın sakin tonundan kopuk.
- **Çözüm:** seviye adlarını kaldır, "1.240 / 2.200 XP" tek çubuk olarak kalsın.
- **Öncelik:** Yüksek

### Sosyal ve Lig
- **İyi:** Lig'in kıyas tanımı örnek: *"Netler, tahminler ve hedefler ligde hiç görünmez — burada kıyas emek üzerinden."* Bu cümle korunmalı.
- **Kaliteyi düşüren:** Topluluk (soru-cevap) ve Lig (sıralama) iki ayrı ürün gibi duruyor; kullanıcı Sosyal'e girince neden ikisini birlikte gördüğünü anlamıyor. Kullanıcı 4. sırada ve "Zirveye 140 soru" cümlesi yukarı bakıyor — alt sıralarda bu cümle baskı üretir.
- **Çözüm:** Sosyal tek sekme, üstte iki görünüm (Topluluk / Lig). Sıralama cümlesi kullanıcının konumuna göre değişsin; alt sıralarda kendi ilerlemesini göstersin.
- **Öncelik:** Yüksek

### Premium
- **İyi:** Pro Önizleme ekranı (kendi verisi + bulanık kilitli alan) ve bağlama özel beş paywall doğru kurgu. "ÜCRETSİZDE AÇIK KALIR" listesi ücretsiz kullanıcıyı koruyor.
- **Kaliteyi düşüren:** A1 (dil), A2 (fiyat). Ana Premium ekranı hâlâ dört maddelik özellik listesi — gerçek önizleme yok. "7 gün ücretsiz" butonu ekranlar arasında farklı konumda.
- **Çözüm:** özellik satırına dokunuşta o özelliğin önizlemesi açılsın (OCR → örnek okunmuş deneme; sınırsız geçmiş → kilitli eski denemeler). Deneme butonu her paywall'da aynı yerde, aynı boyutta.
- **Öncelik:** Kritik

### Ayarlar
- **İyi:** veri saklama açıklamaları ("Rota verisi hesabında sunucuda tutulur"), hesap silmede doğru buton önceliği (silme outline/danger, vazgeç birincil).
- **Kaliteyi düşüren:** koyu tema seçiliyken "Açık temaya geç" ve tam bir açık tema ekran seti tasarım dosyasında aynı akış gibi duruyor.
- **Çözüm:** açık tema ekranları "alternatif tema" bölümü olarak ayrılsın (ayrı dosyada zaten var; koyu dosyadaki mock'lar başlıkla etiketlenmeli).
- **Öncelik:** Orta

### Onboarding
- **İyi:** dört soruda rota kurma; "DÖRT SORU · 90 SANİYE" artık akışla uyumlu, LGS kaldırıldı.
- **Kaliteyi düşüren:** adım göstergesi iki biçimde (üstte metin, altta çubuk); ilk rota kurulmadan önce hiç örnek gösterilmiyor.
- **Çözüm:** tek adım göstergesi (çubuk + "2/4"). Son adımda kurulacak rotanın küçük önizlemesi.
- **Öncelik:** Orta

### Boş / hata / yükleniyor / bağlantı yok / kilitli
- **İyi:** Boş Rota, Boş Gün, Geri Dönüş Modu ve Zor Deneme ekranlarının dili suçlayıcı değil; hepsinde tek küçük sonraki adım var.
- **Kaliteyi düşüren:** "Bağlantı kurulamadı" ekranı diğerlerinden düşük kalitede (çizgi ikon + tek cümle); yükleniyor hâli iskelet yerine boş yüzey. Kilitli durumun tek görsel dili yok — bazı yerde bulanık, bazı yerde kilit ikonu.
- **Çözüm:** üç durum aynı şablona gelsin (ikon + başlık + tek cümle + tek aksiyon). Kilitli her yerde bulanık değer + küçük kilit ikonu.
- **Öncelik:** Orta

---

## C. Kesinleşmesi gereken tasarım sistemi kararları

1. **Hero CTA istisnası.** Ana Sayfa'daki 74px'lik "Çalışmaya Başla" tek örnektir. Sistemde `hero-cta` olarak tanımlanmalı: 74px · r16 · accent gölge · başlık 18,5px + alt satır 12px. Başka ekranda kullanılmaz.
2. **Buton kademeleri.** Primary 52px/r12/700-16px · Secondary 46px/r12/1px kenarlık/600-13,5px · Text button 44px/600-13px/`--text4`. (Uygulandı, sabitlenmeli.)
3. **Radius ölçeği.** 12 (satır, kontrol, buton) · 20 (kart) · 24 (büyük kart) · 42 (telefon çerçevesi). Ara değer yok.
4. **İkon ailesi.** Tek stroke 1,7 (UI), 1,5 (10px altı mikro), 2,2+ yalnızca rota/grafik. Dolgu ikon yok.
5. **Renk anlamı.** `--accent` marka + birincil eylem · `--danger` yalnızca yıkıcı işlem · `--up` artış/tamamlanma · `--warn` kehribar, dikkat şeridi · `--down` gri, düşüş. Ders renkleri yalnızca ders bağlamında.
6. **Metin kontrastı.** Bilgi taşıyan hiçbir metin `--text4`ün altında olmaz; `--text3` 4.5:1'e açılmalı.
7. **Sekme seti.** ROTA · PROGRAM · (+) · ANALİZ · PROFİL — 22 ekranda aynı. "Yol haritası" bir ekran adı, sekme değil.
8. **Süre ve sayı formatı.** Metrikte "12 sa", "3 sa 20 dk", "24 dk"; düzyazıda uzun form. Tüm sayılar `tabular-nums`.
9. **Tarih formatı.** Etiket "23 HAZ" · satır "23 Haziran" · yıl yalnız gerektiğinde.
10. **Durum etiketleri.** Defter: Yeni · Tekrar zamanı · Tekrar edildi · Kapatıldı. Durak: Tamamlandı · Aktif · Sırada · Yeniden planlandı · Atlandı · Kilitli.

---

## D. Cilalama seviyesinde kalanlar

- Oturum Bitti'de "Bugün çözülen" satırının sırası.
- Deneme Özeti grafiğindeki "önce 71 idi" etiketi.
- Story kartlarında marka işaretinin dikey hizası.
- Segmented control (Haftalık/Aylık, Bekleyen/Çözüldü/Tümü) iç boşluğu iki ekranda 3px, birinde 4px.
- "Söz ve gerçek" satırındaki "iki durak fark" ifadesi sayıyla yazılabilir ("2 durak").
- Yılın Rotası ısı ölçeğinde "az / yoğun" etiketleri 8px.

---

## E. Değiştirilmemesi gereken güçlü bölümler

- **Ana Sayfa kompozisyonu:** büyük soru sayısı → rota grafiği → hero CTA → bugünün durakları sırası.
- **Rota çizgisi** görsel imzası: geçmiş dolu çizgi, bugün dolu düğüm, gelecek noktalı çizgi.
- **"Söz ve gerçek"** kavramı ve dili.
- **Lig'in kıyas tanımı:** netlerin ligde görünmemesi kararı.
- **"YAPMADIĞIMIZ ŞEY · Konu bazlı net tahmini yapmıyoruz"** prensip kartı.
- **Analiz'in karar dili:** "son çalışma 11 gün önce · 2 durak geride".
- **Geri Dönüş / Boş Gün / Zor Deneme** ekranlarının suçlamayan tonu ve tek küçük adım kuralı.
- **"ÜCRETSİZDE AÇIK KALIR"** bloğu.

---

## F. Tasarımı bozmadan uygulanabilecek düzeltmeler

Layout'a dokunmayan, yalnızca metin / token / etiket seviyesindekiler:

1. Premium başlık ve alt başlık metni (A1).
2. Fiyat satırlarının tek formata çekilmesi (A2).
3. Defter sayaçlarının liste toplamıyla eşitlenmesi (A3).
4. Rota Detay'da tekrar eden 71 gösterimlerinin ikisinin kaldırılması (A4).
5. `--text3` değerinin açılması (A6) — tek token, 141 ekranda etkili.
6. Tarih yazımının üç kurala indirilmesi (A7).
7. Ay/yıl kurgusunun tek takvime çekilmesi (A8).
8. "GERİDE" → "YENİDEN PLANLANAN"; defter durum etiketlerinin dört isme indirilmesi.
9. Analiz kartlarına kaynak satırı ("son 5 deneme · Şub–Haz").
10. Ana Sayfa grafiğinde bugün dışındaki durak adlarının kaldırılması.
11. Seviye adlarının ("Hırslı", "Maratoncu") kaldırılması.
12. Seri Takvimi'nde "DONDURULDU" etiketinin nötr griye alınması.

## G. Yeni ekran veya yeni durum gerektirenler

1. **Premium özellik önizlemeleri** — OCR örnek okuma, kilitli eski denemeler, tempo senaryosu önizlemesi: 3 ekran.
2. **Sosyal tek sekme, iki görünüm** — Topluluk ve Lig'i tek başlık altında birleştiren kabuk: 1 ekran.
3. **Rota durum lejantı ve altı durum** — atlanan / yeniden planlanan / kilitli / dondurulmuş düğüm dili: mevcut rota ekranlarına eklenecek varyant seti.
4. **Yükleniyor (iskelet) hâli** — Ana Sayfa, Analiz ve Program için: 2-3 ekran.
5. **Bağlantı yok** ekranının diğer boş durumlar kalitesine çıkarılması: mevcut ekranın yeniden çizimi.
6. **Deneme onay (OCR) ekranının** elle giriş şablonuna oturtulması: mevcut ekranın yeniden çizimi.
7. **375×667 küçük ekran kontrolü** — ekranlar 390px sabit çizildiği için gerçek dar ekran davranışı henüz test edilmedi; en yoğun üç ekranın (Ana Sayfa, Rota Detay, Program Hafta) 375px varyantı gerekiyor.

---

### Ölçüm notları
- Dokunma alanı: `cursor:pointer` taşıyan hiçbir öğe 40px altında değil — bu madde temiz.
- Kart içinde kart: `--elev` kenarlıklı kart içinde aynı kartı tekrarlayan yapı bulunamadı — bu madde temiz.
- Konu bazlı net iddiası: "+N net kazandırır" biçiminde tek cümle kalmadı; geçtiği tek yer prensip kartının kendisi.
- Konsol hatası yok; tüm `var(--*)` tokenları çözülüyor.
