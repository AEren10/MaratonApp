# Claude Design Revizyon Promptu

Bunu Claude Design'a yapıştır. İlk promptun devamı — revize et + eksikleri tamamla.

---

## PROMPT BAŞLANGIÇ

Bu ilk promptumun devamı. Önceki promptta marka kimliği, renkler, tipografi, genel yönergeleri verdim. Şimdi senden her ekranın AMACINI ve BAŞARI KRİTERİNİ veriyorum. Layout, yerleşim, UX akışını SEN tasarla. Mevcut uygulamayı kopyalama — yeniden düşün.

Aynı kurallar geçerli: Dark mode, 390x844px, gerçek Türkçe içerik, yapay zeka yapmış hissi yok.

---

## KORUNACAK GÜÇLÜ YÖNLER (Bunları bozma, geliştir)

Mevcut uygulamada bazı şeyler zaten iyi çalışıyor. Bunları koru ve üzerine koy:

1. **Deneme analiz sayfaları çok iyi.** TrialDetail, TrialSummary, SubjectDetail — ders bazlı bar'lar, net gösterimi, trend badge'ler, karşılaştırma yapısı güçlü. Bu sayfaların veri gösterim dili ve "sonuç kartı" hissini koru.

2. **Retention/recap sayfaları harika.** WeeklyReview ("bu hafta ne yaptın"), TrialSummary ("deneme çıktısı"), StudySummary — bunların "özet rapor" formatı, hero stat + destekleyici veriler yapısı çok iyi çalışıyor. Bu dili koru ve diğer ekranlara da yay.

3. **Grafik ve veri görselleştirme dili.** Trend çizgileri, ders bar'ları, progress ring — bunlar uygulamanın en premium hissettiren parçaları. Daha fazla olsun, daha az olmasın.

---

## GÖRSEL ZENGİNLİK TALEBİ

Uygulama şu anda çok "metin + kutu" ağırlıklı. Daha fazla grafik, chart, görsel element istiyorum:

- **Daha fazla mini chart/sparkline:** Sadece Analysis'te değil, Home'da da ders bazlı mini trend çizgileri olabilir. Bir dersin son 5 deneme netini gösteren küçük sparkline, düz sayıdan çok daha etkileyici.
- **Heatmap kullanımı:** Takvimde zaten var ama haftalık/aylık aktivite yoğunluğu görsel olarak daha fazla yerde kullanılabilir (ör: Profile'da "bu ayki aktiviten" heatmap'i).
- **Radar/spider chart:** Ders bazlı güçlü/zayıf yönleri göstermek için radar chart çok etkili olur (ör: Profile veya Analysis'te).
- **Progress göstergeleri:** Düz sayı yerine dairesel ring, bar, arc gibi görsel progress'ler daha fazla kullanılsın.
- **Micro-visualization:** Küçük ikonlar, badge'ler, pill'ler — bunlar metin duvarını kırar. Ders renk kodları sadece nokta değil, daha cesur kullanılsın (gradient tint, arka plan rengi vb.).
- **Comparison görsel:** İki denemeyi veya iki haftayı karşılaştırırken yan yana bar chart veya overlay line chart kullan — sadece rakam listesi değil.

Kural: Bir veri varsa, onu SÖYLEME, GÖSTER. Sayı yerine grafik, liste yerine chart, metin yerine görsel. Ama anlamlı olsun — dekorasyon için değil, insight için.

---

## YAPAY ZEKA YAPMIŞ GİBİ OLMASIN — ÖNEMLİ

Bu konuyu ciddiye al:
- Gradient'leri "her yere serp" diye kullanma. Gradient sadece anlamlı yerde (ör: sınav geri sayımı aciliyet rengi, lig zone'u).
- Glassmorphism, neon glow, blur efekt YASAK.
- Her karta shadow + border + gradient + ikon vermek "AI template" hissi yaratır.
- Renk paleti disiplinli: bir ekranda max 2-3 ana renk. Her şeye renk vermek kaos.
- Boşluk lüks hissettirir. Sıkışık layout = ucuz hissi.
- Tipografi tek başına premium yaratabilir: büyük Space Grotesk stat + küçük Inter caption = editoryal hissi.
- İlham: Bloomberg, The Athletic, Strava, Whoop — bunlar AI yapmış gibi görünmez çünkü restraint (kısıtlama) var. Her şeyi süslememek, kasıtlı olarak bazı şeyleri sade bırakmak premium'dur.

---

## EKRAN EKRAN AMAÇ VE BAŞARI KRİTERLERİ

---

### 1. HOME SCREEN (Ana Sayfa)

**Amaç:** Öğrenci her gün ilk buraya gelir. "Bugün neredeyim, ne yapmalıyım?" sorusuna cevap verir.

**Başarı kriteri:** 3 saniyede bugünkü durumunu kavramalı ve bir sonraki aksiyona geçmeli. "İyi gidiyorum" veya "hadi başlayalım" hissiyle çıkmalı.

**Göz ilk nereye gitmeli:** (1) Günlük ilerleme göstergesi — hedefe ne kadar yakın, (2) Plan kartı — "şimdi ne yapayım" aksiyonu.

**Duygu tonu:** Motivasyon + odak. Sakin enerji, baskıcı değil.

**İçermesi gereken bilgiler:**
- Günlük ilerleme: 45/80 soru çözüldü (ring, bar, yüzde — formatı sen seç)
- Streak: 23 gün ardışık çalışma (ateş ikonu, turuncu)
- Sınava kalan gün: 247 gün (kompakt, DEV kart değil)
- Bugünkü plan: 3 ders · ~2 saat · görev listesi (max 3 görünür, checkbox ile tamamla)
- Hızlı aksiyonlar: Çalış, Deneme Gir, Yanlış Ekle, Defterim, 5dk Quiz, Simülasyon, Challenge, Sıralama
- Son deneme neti: 78.5
- XP seviyesi: Altın (2450 XP)
- Selamlama: "Merhaba, Ahmet" (gün vaktine göre)
- Avatar (fotoğraf veya baş harfler)

**En büyük tehlike:** Kart enflasyonu. Şu anda 8 farklı bileşen aynı görsel ağırlıkta üst üste istiflenmiş. Her şey eşit ağırlıkta olunca hiçbiri öne çıkmıyor. İki dev blok (sınav geri sayımı + ilerleme ring'i) birbirine bağırıyor.

**Çözülmesi gereken sorunlar:**
- Sınav geri sayımı ayrı dev kart değil, kompakt yerleşim olmalı
- Hızlı aksiyonlar gömülü küçük ikon grid'inde değil, kolay erişilebilir olmalı (şu an 3 scroll + 1 tap gerekiyor)
- Primary/secondary/tertiary hiyerarşi net olmalı — her şey "kutu" olmamalı

**Modaller (bu ekranda açılabilenler):**
- Günlük hedef tamamlanınca kutlama (confetti + mesaj)
- Seviye atlama kutlaması
- Streak milestone (7, 30, 100 gün) kutlaması
- XP kazanım bildirimi (sağ üst, geçici)
- Uzun süre girmeyince "seni özledik" karşılama
- Streak'e basınca detay bottom sheet

---

### 2. DERSLER SCREEN (Dersler Tab'ı)

**Amaç:** "Hangi dersi çalışayım, nereyi tamamladım?" sorusuna cevap.

**Başarı kriteri:** En zayıf/eksik dersini 2 saniyede görmeli, tıklayınca konulara inmeli.

**Göz ilk nereye gitmeli:** En düşük yüzdeye sahip ders kartı.

**Duygu tonu:** Analitik sakinlik. "Yol haritam belli" hissi.

**İçermesi gereken bilgiler:**
- TYT dersleri: Türkçe, Matematik, Fen (Fizik/Kimya/Biyoloji), Sosyal (Tarih/Coğrafya/Felsefe)
- AYT dersleri: alan bazlı (SAY/SÖZ/EA/Dil)
- Her ders: konu tamamlama yüzdesi (ör: Matematik 12/45 konu = %27)
- Genel ilerleme: "38/120 konu tamamlandı"
- Her ders kendi kimlik renginde (Türkçe mavi, Matematik turuncu, Fen yeşil, Sosyal mor vb.)
- Günlük plan'a kısayol
- Konu kartlarına (Anki tarzı) kısayol

**En büyük tehlike:** Grid uniformluğu. Tüm dersler aynı boyut kartında olursa zayıf ders fark edilmez. Zayıf ders görsel olarak öne çıkmalı.

---

### 3. ANALYSIS SCREEN (Analiz Tab'ı)

**Amaç:** "Denemelerim nasıl gidiyor?" — trend, ders bazlı güçsüzlük, ilerleme takibi.

**Başarı kriteri:** Son deneme neti ve trendi 1 saniyede görünmeli. "Gelişiyorum" veya "şu derse odaklanmalıyım" çıkarımıyla ayrılmalı.

**Göz ilk nereye gitmeli:** (1) Trend çizgisi / son net skoru, (2) Ders bar'ları (zayıf noktalar).

**Duygu tonu:** Analiz + hafif gurur veya uyarı. Veri gösterisi değil, insight.

**İçermesi gereken bilgiler:**
- Deneme tipi filtresi: Tümü / TYT / LGS / AYT / Branş
- Son 12 denemenin trend çizgisi (line chart)
- Son deneme skoru: 78.5 net (büyük)
- Trend badge: ↑ +3.5 veya ↓ -2.0
- Ders bazlı net bar'ları (her ders kendi renginde): Türkçe 30.75, Mat 22.0, Fen 15.25, Sosyal 17.5
- Son 6 deneme geçmişi: tarih + net + trend
- Hızlı araçlar: Net Tahmini, Dönem Analizi, Yanlış Defteri, 5dk Quiz, Simülasyon
- "Deneme Gir" butonu (belirgin, her zaman erişilebilir)
- Ruh hali eğilimi (denemelerden)

**En büyük tehlike:** Dashboard sendromu. Aşırı veri yoğunluğu; her şey eşit ağırlıkta olunca hiçbir insight öne çıkmaz. Veri değil hikâye anlatmalı.

---

### 4. PROFILE SCREEN (Profil Tab'ı)

**Amaç:** "Ben kimim bu uygulamada?" — kimlik, başarı, gurur vitrini.

**Başarı kriteri:** Öğrenci profilini açınca kendini özel hissetmeli. Arkadaşına gösterebileceği bir ekran.

**Göz ilk nereye gitmeli:** (1) Avatar + isim + seviye/lig hero alanı, (2) Rozet galerisi.

**Duygu tonu:** Gurur + kimlik. "Bak ne kadar yol geldim."

**İçermesi gereken bilgiler:**
- Avatar + "Ahmet Eren"
- Sınav etiketi: "TYT + SAY" (veya "Sadece TYT" vb.)
- Seviye: Altın (gamification level) — Bronz→Gümüş→Altın→Elmas→Obsidyen
- Lig: Altın Lig (haftalık sıralama ligi)
- Streak: 23 gün
- Kariyer istatistikleri: Toplam 12.450 soru / 320 saat / 24 deneme
- Rozetler: Heksagon şeklinde, açılmış + kilitli (kilitliler ghost)
- Güçlü yönler: En iyi 6 dersin doğruluk % bar'ları (deneme yoksa promo kartı)
- Ayarlara erişim

**En büyük tehlike:** Düz liste hissi. Hero alanı yeterince vurucu olmazsa "sadece bilgi sayfası" olur. Rozetler tek satır horizontal scroll'da kaybolabilir.

---

### 5. TAB BAR + FAB (Merkez Buton)

**Amaç:** Navigasyon. FAB (merkez büyük buton) = her yerden "hemen bir şey yap" erişimi.

**Yapı:** 5 tab: Ana Sayfa | Dersler | + (FAB) | Analiz | Profil

**FAB'a basınca:** Bottom sheet açılır — hızlı eylemler:
- Çalış (en sık kullanılacak — görsel olarak daha büyük/belirgin olmalı)
- Deneme Gir
- Yanlış Ekle
- Defterim
- Diğerleri...

**En büyük tehlike:** FAB basınca açılan seçeneklerin hepsi eşit ağırlıkta olursa göz karışır. Birincil aksiyon (Çalış) öne çıkmalı.

---

### 6. STUDY TIMER SCREEN (Çalışma Timer'ı)

**Amaç:** "Şimdi çalışıyorum" — aktif çalışma seansı.

**Başarı kriteri:** Timer başlayınca dünya durmalı. Saat büyük, dikkat dağıtmayan, "odak modu" hissi.

**Göz ilk nereye gitmeli:** (1) Timer (kalan süre), (2) Başlat/Duraklat butonu.

**Duygu tonu:** Derin odak. Minimalizm. Neredeyse meditasyon uygulaması kadar sakin.

**İçermesi gereken bilgiler:**
- Mod seçimi: Serbest / 25-5 Pomodoro / 50-10 / 90dk (başlamadan önce)
- Ders seçimi (başlamadan önce): Matematik, Türkçe, Fizik vb.
- Timer: büyük dairesel veya minimal gösterim, kalan süre (25:00 formatı)
- Pomodoro'da: faz bilgisi (ODAK 1/4 · Tur 1/4)
- Başlat/Duraklat butonu (büyük, merkez)
- Çözülen soru sayacı (stepper: - / 0 / + )
- Doğru sayısı (soru > 0 ise)
- Bitir butonu

**En büyük tehlike:** Timer çalışırken ekranın kalabalık olması. Timer çalışırken sadece süre + kontrol görünmeli, soru sayısını bitişte sormak daha iyi olabilir. Ders seçilmeden Play disabled.

---

### 7. ADD STUDY SCREEN (Geçmişe Çalışma Ekleme)

**Amaç:** "Dün 2 saat matematik çalıştım ama kaydetmemiştim" — geriye dönük log.

**Başarı kriteri:** 20 saniyede tamamlanan form.

**İçermesi gereken bilgiler:**
- Kademe: TYT / AYT
- Ders seçimi (grid veya chip)
- Konu seçimi (opsiyonel, ders seçilince açılır)
- Süre: preset seçenekler (15/25/45/60/90/120dk) + custom giriş
- Soru sayısı + doğru sayısı
- Not (opsiyonel, max 140 karakter)
- Kaydet butonu

**Duygu tonu:** Hızlı işlevsellik. Engelsiz.

**En büyük tehlike:** Form uzunsa motivasyon düşer. Minimal tutulmalı.

---

### 8. STUDY SAVE SCREEN (Timer Sonrası Kaydet)

**Amaç:** Timer bittikten sonra "ne çalıştın" bilgisini kaydetme.

**Başarı kriteri:** 15 saniyede tamamlanmalı. Timer'dan ders geliyorsa önceden dolu.

**İçermesi gereken bilgiler:**
- Çalışılan süre badge'i (ör: "25 dk çalışıldı")
- Ders seçimi (timer'dan gelmişse önceden seçili)
- Konu (opsiyonel)
- Soru/doğru sayısı
- Not (opsiyonel)
- Kaydet butonu

**Duygu tonu:** "Tamam, kaydettim" rahatlığı. Kutlama henüz değil (o Summary'de).

**En büyük tehlike:** Timer sonrası öğrenci yorgun; her ekstra alan kayıp oranı artırır.

---

### 9. STUDY SUMMARY SCREEN (Çalışma Özeti)

**Amaç:** "Tebrikler! İşte ne yaptın" — çalışma sonrası mini kutlama.

**Başarı kriteri:** 3 saniye keyifle bakmalı: süre, soru, XP, streak durumu.

**Göz ilk nereye gitmeli:** (1) Dev istatistik (süre + soru), (2) XP kazanımı.

**Duygu tonu:** Kutlama + tatmin. "İyi iş çıkardım" hissi.

**İçermesi gereken bilgiler:**
- Büyük hero stat: "45 dk" veya "32 soru" (ders renginde)
- Ders + konu
- XP kazanımı
- Günlük hedefe yakınlık
- Streak durumu (devam ediyor/kırıldı)

**En büyük tehlike:** Sadece rakam listesi olursa tatmin hissi oluşmaz. Bu bir "kazanım anı" — net bir duygusal dönüş olmalı.

---

### 10. TRIAL ENTRY SCREEN (Deneme Giriş Formu)

**Amaç:** Deneme sonucu girişi — her ders için doğru/yanlış sayılarını girmek.

**Başarı kriteri:** TYT'nin 4 dersini 60 saniyede girebilmek. Akıcı, hataya yer yok.

**Göz ilk nereye gitmeli:** (1) Deneme türü seçimi (TYT/AYT/LGS/Branş), (2) Ders giriş satırları.

**Duygu tonu:** İşlevsel verimlilik. Hızlı, temiz.

**İçermesi gereken bilgiler:**
- Tarih seçimi (bugün, dün, veya takvimden)
- Deneme adı (opsiyonel, max 40 karakter)
- Deneme türü: TYT / AYT / LGS / Branş (seçince dersler değişir)
- Her ders için giriş satırı:
  - Ders adı (kimlik renginde): Türkçe, Matematik, Fen, Sosyal...
  - Doğru sayısı input
  - Yanlış sayısı input
  - Otomatik NET hesaplama (formül: doğru - yanlış×0.25)
- Toplam NET gösterimi (büyük)
- Ruh hali seçici (opsiyonel): 😊 İyi / 😐 Orta / 😔 Kötü
- Kaydet butonu

**Örnek veri (TYT):**
- Türkçe: 32D 5Y = 30.75 net
- Matematik: 24D 8Y = 22.00 net
- Fen: 16D 3Y = 15.25 net
- Sosyal: 18D 2Y = 17.50 net
- TOPLAM: 85.50 NET

**En büyük tehlike:** Çok fazla input alanı ekranı bunaltır. Ders renk kodları satırları ayırt etmeli. Scroll gerektirirse "uğraşmayı bırakırım" der öğrenci.

---

### 11. TRIAL SUMMARY SCREEN (Deneme Sonuç Kutlama)

**Amaç:** "Denemen kaydedildi, işte özet" — kutlama + hızlı analiz.

**Başarı kriteri:** Toplam net büyük görünsün, gelişme varsa kutlama hissi. "Gelişiyorum" duygusu.

**Göz ilk nereye gitmeli:** (1) Toplam net (dev rakam), (2) Öncekine göre trend.

**Duygu tonu:** Kutlama veya teşvik. Kötü gidiyorsa bile "devam et" mesajı.

**İçermesi gereken bilgiler:**
- Toplam net: 85.50 (dev stat)
- Önceki denemeye göre trend: +3.5 (yeşil ↑) veya -2.0 (kırmızı ↓)
- Deneme adı + tipi
- Doğru/Yanlış sayıları
- Ders bazlı net bar'ları
- Yanlış defterine ekleme önerisi (yanlış varsa)
- Paylaş butonu (screenshot → native share)
- Detayları Gör butonu

**En büyük tehlike:** Hem kutlama hem analiz yapmaya çalışmak. Bu ekran KUTLAMA için; detaylı analiz Detail ekranında. Çok fazla veri kutlama hissini öldürür.

---

### 12. TRIAL DETAIL SCREEN (Deneme Detay Analizi)

**Amaç:** Bir denemenin ders bazlı detaylı analizi.

**Başarı kriteri:** Hangi derste güçlü, hangi derste zayıf olduğu 3 saniyede belli olmalı.

**Göz ilk nereye gitmeli:** (1) Ders bazlı bar chart, (2) Önceki denemeyle karşılaştırma.

**Duygu tonu:** Analitik derinlik. "Nereye odaklanmalıyım" sorusuna cevap.

**İçermesi gereken bilgiler:**
- Deneme adı + tarih + tür (TYT/AYT)
- Genel skor: ring veya büyük stat (net/max)
- Trend badge (önceki denemeyle kıyaslama)
- Ders bazlı barlar: her ders kendi renginde, net/max
- Yüzdelik dilim (varsa): "Türkçe'de %72 dilimdesin"
- Son 6 deneme geçmişi (mini chart veya liste)
- Önceki denemeyle karşılaştır butonu
- Tüm denemeler analizi butonu
- Paylaş butonu

**En büyük tehlike:** Veri duvarı. Tüm dersler eşit ağırlıkta gösterilirse insight yok. En zayıf 1-2 ders görsel olarak vurgulanmalı.

---

### 13. WRONG NOTEBOOK SCREEN (Yanlış Defteri)

**Amaç:** Tüm yanlış soruları tek yerde görmek, filtrelemek, tekrar etmek.

**Başarı kriteri:** "Bugün tekrar etmem gereken X soru var" mesajı açık. Filtreleme hızlı.

**Göz ilk nereye gitmeli:** (1) Tekrar bekleyen soru sayısı, (2) Filtre + liste.

**Duygu tonu:** Düzenli çalışan öğrenci hissi. "Kontrol bende."

**İçermesi gereken bilgiler:**
- Tab: Topluluk (başkalarının paylaştığı) | Defterim
- Durum filtresi: Çözülmemiş (X adet) / Çözüldü (Y adet) / Tümü
- Ders filtresi: Tüm Dersler + her ders (sayılı chip)
- Konu filtresi (ders seçiliyse)
- Tekrar zamanı banner: "5 yanlışın tekrar zamanı geldi" + başla butonu
- Yanlış kart listesi:
  - Ders renk chip'i + konu
  - Soru fotoğrafı veya not
  - Doğru cevap badge
  - Swipe ile: çöz/sil/paylaş
- Yeni yanlış ekle (+) butonu

**En büyük tehlike:** Liste monotonluğu. 50+ kart aynı görünürse göz kaybolur. Ders rengi ve urgency (tekrar zamanı gelmiş mi?) ayırt edici olmalı.

---

### 14. SWIPE REVIEW SCREEN (Tinder Tarzı Tekrar)

**Amaç:** Yanlış soruları hızlıca tekrar — sağa = bildim, sola = bilmedim.

**Başarı kriteri:** Kart büyük, sezgisel. Gesture geri bildirimi net.

**Göz ilk nereye gitmeli:** (1) Kart (soru + ders rengi), (2) Swipe ipucu.

**Duygu tonu:** Oyunsu verimlilik. "Beyin jimnastiği" hissi.

**İçermesi gereken bilgiler:**
- İlerleme: 3/12 sayacı + progress bar
- Kart: ders renk chip + konu + soru görseli/notu + doğru cevap
- Swipe feedback: sağa kayınca yeşil tint, sola kayınca kırmızı tint
- İpucu: "← Bilmedim | Bildim →"
- Alternatif butonlar: Bilmedim (kırmızı) / Bildim (yeşil)
- Bitirme ekranı: ✓ "Tekrar Tamamlandı!" + Bildim/Bilmedim sayıları + Bitir butonu

**En büyük tehlike:** Gesture feedback yetersizliği. Kartın ne yöne gittiği ve sonucu net olmalı.

---

### 15. LEAGUE SCREEN (Lig Sıralaması)

**Amaç:** Haftalık lig sıralaması — rekabet motivasyonu.

**Başarı kriteri:** "Kaçıncı sıradayım" ve "yükselme/düşme zone'unda mıyım" hemen belli.

**Göz ilk nereye gitmeli:** (1) Kullanıcının kendi sırası (highlight), (2) Zone renkleri.

**Duygu tonu:** Rekabetçi heyecan. Duolingo lig hissi.

**İçermesi gereken bilgiler:**
- Tab: Arkadaşlar / Global / Gruplar
- Lig bilgisi: Altın Lig, haftalık XP, sıra
- Yükselme zone'u (yeşil) / düşme zone'u (kırmızı)
- Sonraki lig hint: "Elmas Lig'e 350 XP"
- Leaderboard listesi:
  - Sıra (1-3 madalya), avatar, isim
  - Alt bilgi: "245 soru · 3 deneme"
  - Haftalık XP (bold)
  - Sen: vurgulu arka plan
- Challenge butonu
- 30 saniyede bir auto-refresh

**En büyük tehlike:** Çok fazla segmentasyon (3 tab). Ana mesaj (senin sıran) kaybolmamalı.

---

### 16. CHALLENGE SCREEN (1v1 Challenge)

**Amaç:** Arkadaşla 1v1 challenge — sosyal motivasyon.

**Başarı kriteri:** Challenge oluşturmak kolay, aktif challenge durumu net.

**Duygu tonu:** Oyunsu rekabet.

**İçermesi gereken bilgiler:**
- Tab: Aktif / Geçmiş
- Challenge oluşturma wizard (3 adım): Arkadaş seç → Metrik seç (soru/dakika) → Hedef seç → Gönder
- Challenge kartı: rakip adı, metrik+hedef, progress bar, durum badge (aktif/bekliyor/tamamlandı)
- Kazanan/berabere/kaybeden görsel
- Gelen istek: Kabul Et / Reddet butonları

**En büyük tehlike:** Boş durum. Arkadaş yoksa motivasyon kırıcı. Boş state'te "arkadaşını davet et" yönlendirmesi olmalı.

---

### 17. PROFILE — ek detay yok, 4. maddede verildi.

---

### 18. CALENDAR SCREEN (Takvim)

**Amaç:** Aylık görünüm — hangi gün ne çalıştım, streak görsel.

**Başarı kriteri:** Streak günleri görsel, boş günler fark edilir, güne tıklayınca detay.

**Göz ilk nereye gitmeli:** (1) Aylık grid (renkli/boş günler), (2) Seçili günün detayı.

**Duygu tonu:** Geniş perspektif. "Bu ay nasıl gittim?"

**İçermesi gereken bilgiler:**
- Ay navigasyonu (← Haziran 2026 →)
- 7 sütun aylık grid (Pzt-Paz)
- Her hücre: tarih + aktivite yoğunluğu (renk tonu)
- Ay istatistikleri: aktif gün (18), toplam süre (4.320dk), soru (2.150), deneme (4)
- Seçili gün detayı: çalışma logları + denemeler + görevler
- Görev ekleme/tamamlama

**En büyük tehlike:** Boş günlerin "utandıracak" şekilde kırmızı olması. Dormant/nötr ton, anxiety yaratmamalı.

---

### 19. PAYWALL SCREEN (Premium Satış)

**Amaç:** Para kazanmak. Öğrenciyi premium aboneye dönüştürmek.

**Başarı kriteri:** "Bunu istiyorum" hissini 5 saniyede yaratmak.

**Göz ilk nereye gitmeli:** (1) En değerli 2-3 özellik (hero olarak), (2) CTA + "7 gün ücretsiz" mesajı.

**Duygu tonu:** Arzu + güven. "Buna değer, deneyelim."

**İçermesi gereken bilgiler:**
- Hero alanı: Maraton Pro marka görseli
- Özellik listesi: Sınırsız deneme analizi, AI konu önerileri, Gelişmiş grafikler, Sınav simülatörü, Reklamsız deneyim, Topluluk erişimi vb.
- Plan seçimi: Yıllık (indirimli) / Aylık
- CTA butonu: "Hemen Başla" veya "7 Gün Ücretsiz Dene"
- Güven: "İstediğin zaman iptal edebilirsin"
- Geri yükle butonu + yasal linkler

**En büyük tehlike:** Jenerik feature listesi. Tüm satırlar eşit ağırlıkta olursa hiçbiri etkilemez. En değerli 2-3 özellik görsel olarak hero olarak öne çıkmalı, gerisi küçük yazıda kalmalı.

---

### 20. ONBOARDING (4 Slayt)

**Amaç:** İlk izlenim. "Bu app ne, neden kullanayım?"

**Başarı kriteri:** 4 slayta değeri anlamalı. Atlama kolay olmalı.

**Göz ilk nereye gitmeli:** (1) Her slayttaki tek görsel + tek mesaj, (2) İlerleme + Başla butonu.

**Duygu tonu:** Heyecan + merak. "Bu tam bana göre."

**Slayt içerikleri:**
1. "Hedefine Odaklan" — Sınav tarihini koy, geri sayım başlasın
2. "İlerlemenei Takip Et" — Her çalışma ve denemen grafiğe dönüşsün
3. "Seride Kal" — Günlük çalışma alışkanlığı kur, streak'ini koru
4. "Birlikte Çalış" — Arkadaşlarınla yarış, birbirinizi motive edin

**En büyük tehlike:** Çok fazla metin. Her slayt tek cümle başlık + tek cümle açıklama. İllüstrasyon/animasyon jenerik olmamalı.

**Sonrası:** Sınav türü seçimi (TYT/TYT+AYT/Dil — 3 büyük kart) → Günlük hedef belirleme (slider/stepper)

---

### 21. RANK SIMULATOR SCREEN (Net Simülatörü)

**Amaç:** "Şu netleri yapsam kaçıncı olurum?" — hedef belirleme ve motivasyon.

**Başarı kriteri:** Net değiştirilince sıralama anında güncellenmeli. Hedef bölüme ne kadar kaldığı net.

**Göz ilk nereye gitmeli:** (1) Tahmini sıralama (dev rakam), (2) Hedef bölüm karşılaştırması.

**Duygu tonu:** Merak + motivasyon. "Ya 5 net daha artırsam..."

**İçermesi gereken bilgiler:**
- Tahmini sıralama: büyük rakam (ör: 12.450)
- Delta: ↑ +1.200 sıra (değişim göstergesi)
- Özet: "TYT 85.5 · AYT 72.3 net"
- Hedef bölüm kartı: program adı + üniversite + durum ("Ulaştın!" veya "95.0 net gerek")
- TYT net girişi: her ders bir satır (stepper input, ders renginde)
- AYT net girişi: alan bazlı dersler
- Sıfırla butonu (son deneme verilerine dön)
- Disclaimer notu

**En büyük tehlike:** Çok fazla input (TYT 4 + AYT 3-6 ders). Input'lar sade ve hızlı olmalı. Sıralama rakamının animated güncellenmesi şart.

---

### 22. WEEKLY REVIEW SCREEN (Haftalık Rapor)

**Amaç:** Haftalık özet — "bu hafta neler oldu" raporu.

**Başarı kriteri:** 5 saniyede haftanın özeti. Motivasyon cümlesi.

**Göz ilk nereye gitmeli:** (1) Hero stat (toplam süre), (2) Ders dağılımı.

**Duygu tonu:** "Spotify Wrapped" haftalık versiyonu. Gurur + farkındalık.

**İçermesi gereken bilgiler:**
- Hero: "12h 35dk" toplam çalışma (dev stat)
- Geçen haftayla delta: "+1.240 soru" / "+3h 20dk"
- 4 stat: Soru (1.240), Deneme (3), Aktif gün (6), Streak (23)
- Ortalama net + trend
- Günlük aktivite ısı haritası (7 gün)
- Ders bazlı breakdown (bar chart)
- Motivasyon kartı (aktiviteye göre emoji + mesaj)
- Paylaş butonu

**En büyük tehlike:** Rakam duvarı. Tek büyük hero stat + küçük destekleyiciler hiyerarşisi lazım.

---

### 23. REFERRAL SCREEN (Davet Sistemi)

**Amaç:** "Arkadaşını davet et, 7 gün Premium kazan."

**Başarı kriteri:** Davet linkini tek butonla paylaşabilmek.

**Göz ilk nereye gitmeli:** (1) Ödül vurgusu ("7 gün Premium" dev yazı), (2) Paylaş butonu.

**Duygu tonu:** Heyecan + fırsatçılık. "Bedava premium!"

**İçermesi gereken bilgiler:**
- "Birlikte Çalışın" başlığı
- Ödül açıklaması: "İkiniz de 7 gün Premium"
- Davet kodu: büyük, kopyalanabilir (ör: "AHM3T7")
- Kopyala + Paylaş butonları
- İstatistik: "3 kişiyi davet ettin" + "+21 gün kazandın"
- Arkadaşın kodu girme alanı (input + uygula butonu)
- "Nasıl Çalışır?" 3 adım açıklama

**En büyük tehlike:** Ödülün yetersiz görsel vurgusu. "7 gün" dev olmalı. Ödül açık değilse kimse paylaşmaz.

---

### 24. PLAN DETAIL SCREEN (Günlük Plan)

**Amaç:** AI tarafından oluşturulan günlük görev listesi.

**Başarı kriteri:** "Bugün ne yapacağım" net, checkbox ile tamamlama tatmin edici.

**Göz ilk nereye gitmeli:** (1) Görev listesi, (2) İlerleme özeti.

**Duygu tonu:** Düzenli çalışma. Yapılacaklar listesi temizleme keyfi.

**İçermesi gereken bilgiler:**
- İlerleme: "4/7 görev tamamlandı" + ~120 soru + ~3 saat
- Görev ekle butonu
- Görev listesi:
  - Checkbox (tamamlanınca yeşil)
  - Ders renk noktası + konu adı + soru sayısı
  - Neden bu görev önerildi bilgi butonu ("Son denemede Geometri düşük")
  - Başla butonu (→ timer'a, ders+konu ile)
- Görev tipleri: AI önerisi / acil görev / kullanıcının eklediği (renk kodlu)

**En büyük tehlike:** AI'nın neden öneri yaptığını açıklamaması. Sebep gösterilmezse güven oluşmaz.

---

## EKSİK EKRANLAR (Bunları da tasarla)

Bu ekranlar ilk turda atlandı:
1. **SubjectDetailScreen** — Tek bir dersin deneme geçmişi + konu analizi. Hero alanı o dersin rengiyle "banyo" yapmalı.
2. **AddWrongScreen** — Kamera ile yanlış soru fotoğraflama + ders/konu seçme. 15 saniyede bitmeli.
3. **WrongDetailScreen** — Tek yanlış sorunun fotoğrafı (ekranın %60'ı, pinch-to-zoom) + not + durum.
4. **ReviewSessionScreen** — Klasik spaced repetition (SwipeReview'dan farklı — bu derinlik, o hız).
5. **FriendsScreen** — Arkadaş arama + ekleme. Sonuç yoksa "referans linki gönder" yönlendirmesi.
6. **ShareCardScreen** — Başarı kartı paylaşım preview. Instagram'da paylaşılacak kalitede — organik büyüme aracı.
7. **NetForecastScreen** — Trend bazlı NET tahmini grafiği. Veri azsa "daha fazla deneme gir" mesajı.
8. **ComparativeScreen** — Dönemsel karşılaştırma. Dashboard değil hikâye: "Geçen aya göre +5.2 net arttı."
9. **TopicCardsScreen** — Anki tarzı konu kartları. Kart çevir, biliyorsan sağa.
10. **RoadmapScreen** — Konu bazlı görsel yol haritası. Düz liste DEĞİL, yol/patika metaforu.
11. **StudySummaryScreen** — Çalışma sonrası kutlama özeti.
12. **ExamSetupScreen** — Onboarding: sınav türü seç (3 büyük kart + açıklama).
13. **GoalSetupScreen** — Onboarding: günlük hedef belirle (slider/stepper).
14. **SettingsScreen** — Ayarlar menüsü. Sade, gruplu satırlar. Upsell sıkıştırma.
15. **EditProfileScreen** — Avatar, isim, email değiştirme.

---

## GENEL KRİTİK NOTLAR (Tüm ekranları kesen)

1. **Kart enflasyonu en büyük hastalık.** Home, Analysis, Profile — hepsinde 5+ kart aynı görsel dilde (borderRadius 22, tint arka plan, border). Primary element kart değil, açık alan (full-bleed) olmalı; ikincil elemanlar inline satır veya chip olabilir.

2. **Hiyerarşi eksikliği sistematik.** Her ekranda primary/secondary/tertiary ayrımı yok. Her şey eşit ağırlıkta.

3. **Kutlama anları yetersiz.** StudySummary, TrialSummary, GoalComplete — bunlar uygulamanın "dopamin" anları. "Arkadaşa gösterilecek" kalitede görsel anlar olmalı.

4. **Boş durumlarda motivasyon zayıf.** Yeni kullanıcı: streak=0, deneme=0, plan=boş. Bu "boş mağaza" hissi yaratır. Her ekranın boş state'i motivasyon verici ve aksiyona yönlendirici olmalı.

5. **Ders renk sistemi yeterince kullanılmıyor.** Türkçe mavi, Matematik turuncu, Fen yeşil, Sosyal mor — bu renkler küçük nokta yerine, ders sayfalarında cesur kullanılmalı (hero banner, sayfa tonu).

6. **Her ekranın 4 durumu tasarlanmalı:** Normal / Loading (shimmer, statik gri DEĞİL) / Boş (aksiyon önerisi ile) / Hata (retry butonu ile).

---

## ANİMASYON PRENSİPLERİ (Tasarımda belirt)

- **Giriş:** Kademeli fade-in (delay: 0, 70, 140, 210ms). Hızlı ve hafif.
- **Press:** Scale 0.96 + spring geri. Her dokunulabilir elemente.
- **Ring dolma:** Organic spring — mekanik timeline DEĞİL.
- **Tab geçişi:** CrossFade (opacity) + hafif translate.
- **Modal:** Alt kısımdan yukarı kayma + backdrop fade.
- **Kutlama:** Confetti parçacıkları + scale bounce.
- **Streak nabzı:** Sakin nefes (1→1.06x, 1200ms) — agresif DEĞİL.
- **Loading:** Soldan sağa kayan ışık şeridi (shimmer).
- **Sayılar:** Değiştiğinde yukarı kayarak geçiş (animated number).

---

## ÖRNEK VERİ (Tüm ekranlarda kullan)

- Kullanıcı: Ahmet Eren
- Streak: 23 gün
- Seviye: Altın (2450 XP)
- Lig: Altın Lig, #4 sıra
- Sınava kalan: 247 gün
- Günlük hedef: 80 soru, 45 çözülmüş
- Son deneme: TYT, 85.50 net (Türkçe 30.75, Mat 22.0, Fen 15.25, Sosyal 17.5)
- Toplam: 12.450 soru / 320 saat / 24 deneme
- Dersler: Matematik (#fb923c), Türkçe (#60a5fa), Fizik (#22d3ee), Kimya (#f472b6), Biyoloji (#34d399), Tarih (#fbbf24), Coğrafya (#2dd4bf), Felsefe (#c084fc)

---

## ÖNCELİK SIRASI

1. Home Screen (en kritik — kalabalık çöz, hiyerarşi kur)
2. Tab Bar + FAB
3. Trial Entry → Summary → Detail (tam akış)
4. Analysis Screen
5. Wrong Notebook + Swipe Review
6. Study Timer + Save + Summary
7. League + Challenge
8. Profile
9. Dersler + Calendar
10. Paywall + Onboarding (ExamSetup + GoalSetup dahil)
11. Rank Simulator + Weekly Review + Referral + Plan Detail
12. Eksik ekranlar (SubjectDetail, ShareCard, Friends, NetForecast, Comparative, TopicCards, Roadmap, Settings, EditProfile, AddWrong, WrongDetail, ReviewSession)

ŞUNU YAPMA: Mevcut uygulamayı kopyalama. Bileşen konumlarını, mevcut layout'u birebir takip etme. Amaç ve başarı kriterlerini oku, en iyi UX'i SEN tasarla.

ŞUNU YAP: Her gün açıp "aa güzel" denen, kullanmaktan keyif alınan, arkadaşına gösterilen, premium hissi veren ama gösterişli değil kasıtlı ve sakin bir app.

## PROMPT BİTİŞ
