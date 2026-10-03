# Maraton — Codex Tasarım ve Ürün Kalitesi Raporu

**Tarih:** 26 Eylül 2026  
**Kapsam:** Güncel ekran görüntüleri, mevcut React Native kaynak kodu, navigasyon ve tasarım sistemi, güncel mobil ürün benchmark'ları  
**Amaç:** Maraton'un neden çekici ve yüksek kaliteli hissettirmediğini teşhis etmek; özgün, sıcak, güvenilir ve pazarlanabilir bir ürün yönü belirlemek.

---

## 1. Yönetici özeti

Maraton kötü tasarlanmış bir uygulama değildir. Teknik altyapısı, veri modeli, çevrimdışı dayanıklılığı, tema sistemi, tipografi seçimi ve rota metaforu birçok erken aşama üründen daha olgundur. Sorun emek veya özellik eksikliği değildir.

Sorun şudur:

> **Maraton'un bir tasarım sistemi var, fakat tek ve hatırlanabilir bir sanat yönü ile ürün önceliği yok.**

Bugünkü uygulama öğrenciye yol gösteren sıcak bir koçtan çok, öğrencinin hareketlerini ölçen koyu renkli bir yönetim paneli gibi davranıyor. Aynı anda rota, program, müfredat, kayıt, analiz, profil, seri, lig, sosyal alan ve gamification görünür olmaya çalışıyor. Kullanıcı uygulamayı açtığında çalışmaya başlamadan önce sistemi anlamak ve yönetmek zorunda kalıyor.

Kaliteli mobil ürünler genellikle üç şeyi seçer:

1. Tek bir ana nesne.
2. Tek bir ana davranış.
3. Tek bir ana duygu.

Maraton için bunlar şöyle olmalıdır:

| Boyut | Karar |
|---|---|
| Ana nesne | Kullanıcı çalıştıkça oluşan **yaşayan rota** |
| Ana davranış | Bugünün sıradaki durağına **başlamak** |
| Ana duygu | Baskı değil **sakin ivme** |

Önerilen görsel ve ürün yönünün adı:

> ## **Kırmızı İplik / Rota Defteri**

Kullanıcı çalıştıkça arayüzde ince bir kızıl iz bırakır. Bu iz zamanla onun rotasına dönüşür. Kızıl renk ekranı kaplayan dekor değil, kullanıcının şimdi bulunduğu noktayı ve verdiği emeği gösteren anlamlı bir işarettir.

Maraton yeniden yazılmamalıdır. Güçlü altyapı korunmalı; ürün yüzeyi, bilgi mimarisi ve görsel kompozisyon sistemli biçimde budanmalıdır.

---

## 2. Araştırma yöntemi ve kanıt sınırı

Bu rapor şu kaynaklardan üretildi:

- Kullanıcının gönderdiği beş güncel cihaz ekran görüntüsü.
- `src/screens`, `src/navigation`, `src/components/design`, `src/themes` ve ilgili hook/domain dosyalarının statik incelemesi.
- Mevcut tasarım, ürün, akış ve ekran envanteri raporları.
- Apple Human Interface Guidelines ve Apple Design Awards içerikleri.
- Structured, Things, Forest, Finch, Duolingo, Strava, Gentler Streak, Stoic, Opal ve Vocabulary ürünlerinin resmî anlatımları.

### Önemli kanıt notu: cihaz build'i kaynak koddan geride

Gönderilen ekranların bazı kusurları güncel kaynakta düzeltilmiş görünüyor:

- Ekran görüntüsünde `\${nextAction.minutes}` ifadesi kullanıcıya literal olarak sızıyor. Güncel `src/screens/trial/components/QuickAddNowCard.js` doğru string interpolation kullanıyor.
- Ekran görüntüsünde tamamlanan program günleri tamamen kızıl dolgu. Güncel `src/screens/dersler/components/WeekDayStrip.js` tamamlanmayı nötr yüzey ve yeşil durum işaretiyle ele alıyor.

Bu nedenle iki farklı problem birbirine karıştırılmamalıdır:

1. **Dağıtım problemi:** Cihazdaki build'i güncel kaynakla eşitlemek.
2. **Tasarım problemi:** Güncel kaynakta da devam eden ürün, hiyerarşi ve sanat yönü sorunlarını çözmek.

Kaynakta çözülmüş bir kusuru tekrar tasarlamak zaman kaybettirir. Buna karşılık build farkını bahane edip yapısal sorunları yok saymak da yanlış olur.

---

## 3. Acımasız ama doğru teşhis

En kısa yorum:

> **Şu an Maraton, çok emek verilmiş bir öğrenci takip dashboard'u gibi; para verip her gün açılacak kişisel koç gibi değil.**

Bu hissin dört adı vardır:

### 3.1 Dashboardification

Neredeyse her ekran aynı formülü kullanıyor:

> koyu zemin + gri yüzey + 1 px çerçeve + büyük sayı + geniş harf aralıklı bölüm etiketi + kızıl vurgu

Bu tutarlılık ilk bakışta profesyonel görünür. Fakat her ekran aynı kompozisyonla kurulunca ürün bir deneyim olmaktan çıkar, component kataloğuna dönüşür. Profil, program, analiz ve yol haritası farklı kullanıcı ihtiyaçlarıdır; aynı ekran şablonunun varyasyonları olmamalıdır.

### 3.2 Eşit ağırlık problemi

Kart, grafik, segment, CTA, büyük sayı ve bölüm etiketi aynı anda dikkat ister. Kullanıcının gözüne doğal bir rota çizilmez. Bir ekran içinde büyük sayı, grafik ve ana CTA aynı anda kahraman olamaz.

Kaliteli ürünlerde ana eylem tartışmasızdır. Maraton'da büyük merkez `+`, ekran içindeki CTA, aktif tab ve kızıl grafik birbirleriyle yarışır.

### 3.3 Anlamsal renk çökmesi

Kızıl aynı anda şunları anlatıyor:

- Marka
- Ana CTA
- Aktif sekme
- Seçili gün
- Tamamlanma
- Grafik
- Rota
- Vurgu

Bir renk sekiz anlama geliyorsa artık hiçbir anlam taşımaz. Ekranın tamamı sürekli alarm hâlinde görünür.

Apple da aynı rengin farklı anlamlarda kullanılmamasını ve rengin durum, etkileşim ve hiyerarşi için tutarlı kullanılmasını öneriyor. Maraton'un kendi `palette.js` semantiği doğru yöne işaret etse de ürün yüzeyinde bu ayrım yeterince korunmuyor.

### 3.4 Veri olgunluğu problemi

Yeni veya az verili kullanıcıya olgun kullanıcı dashboard'u gösteriliyor:

- `2 soru`
- `0 saat`
- `0 gün`
- `0/178 konu`
- `%56 güç`

Profilde toplam soru gamification istatistiğinden, güç haritası ise son denemelerin ders verisinden hesaplanıyor. Teknik kapsamlar farklı olduğu için iki soru çözmüş görünen bir kullanıcıya `%56 Türkçe gücü` gösterilebiliyor. Matematiksel olarak açıklanabilir olsa bile kullanıcı açısından güven kırıcıdır.

Yeterli kanıt yoksa ürün susmayı bilmelidir.

---

## 4. Repo kanıtları

Statik denetimde görülen ölçek:

- `src/screens` altında yaklaşık **104 ayrı `*Screen.js`** dosyası.
- `src/constants/screens.js` içinde yaklaşık **110 ekran sabiti**.
- `screenRegistry.js` içinde yaklaşık **116 kayıt**.
- Dört ana sekme stack'inde toplam **104 üyelik**, ancak yalnızca **64 benzersiz hedef**.
- Rota stack'i 31, Program stack'i 23 ekran taşıyor.
- Rota ve Program **19 ekranı ortak kullanıyor**.
- Program stack'inin yaklaşık **%83'ü Rota ile aynı**.
- Yaklaşık 297 yerel `fontSize` bildirimi ve 46 farklı değer.
- Yaklaşık 282 yerel radius bildirimi ve 33 farklı değer.
- Yaklaşık 286 bölüm etiketi/label kullanımı.
- Yaklaşık 602 accent/brand rengi referansı.
- Yaklaşık 743 `text3` referansı.
- 150 ekran dosyasında yüzey + border kalıbı.

Bu rakamlar tek başına hata değildir. Fakat kullanıcı ekranlarında görülen küçük gri metin, çok sayıda çerçeveli yüzey, uppercase etiket ve kızıl vurgu yoğunluğunu açıklıyor.

### İki tasarım dönemi birlikte yaşıyor

Yeni sistem güçlüdür:

- `STEP/GUTTER/SHAPE`
- Üç tohumdan türetilen palet
- Ders renkleri için ayrı semantik
- Archivo + Bricolage rol ayrımı
- 44 px dokunma tabanı

Fakat eski sistem de yaşamaya devam ediyor:

- `SPACING/RADIUS`
- Yerel sabit font ve radius değerleri
- Birden fazla `Screen`, header, segment ve empty-state yaklaşımı

Örneğin ortak `Screen` bileşenindeki 16 px yatay boşluk, yeni tasarımın 22 px `GUTTER` kararıyla çelişiyor. Ayrıca biri sakin/editoryal, diğeri yüzen illüstrasyon ve renkli gölge kullanan iki ayrı `EmptyState` ailesi var.

Bu durum uygulamanın bazı alanlarını ciddi, bazı alanlarını eski gamified app gibi hissettiriyor.

---

## 5. Güncel ekranların ayrıntılı teşhisi

### 5.1 Hızlı işlem sheet'i

Sorunlar:

- “Ne kaydediyorsun?” başlığı ile “Şimdi başla” eylemi iki farklı zihinsel modeli aynı panelde birleştiriyor.
- Dört büyük satır karar yükünü artırıyor.
- Sheet neredeyse tam ekran; hızlı işlem olmaktan çıkıyor.
- Görüntüdeki literal template ifadesi ürün güvenini anında düşürüyor.

Karar:

- Ana sayfadaki sıradaki çalışmaya **ana sayfadan başlanır**.
- Sheet yalnızca kayıt eylemleri içindir: çalışma kaydet, deneme gir, yanlış ekle.
- “Durak ekle” Program bağlamında gösterilir.
- Kalıcı merkez FAB kaldırılırsa sheet'e olan ihtiyaç da azalır.

### 5.2 Profil

Sorunlar:

- Kimlik ekranından çok analytics dashboard'u.
- “Kariyer özeti” öğrenci için kurumsal ve mesafeli bir ton.
- Az veri döneminde sıfırlar kahramanlaştırılıyor.
- Yılın rotası tek aktif gün varken anlamsız ve sıkışık.
- Güç yüzdelerinin veri güven seviyesi açıklanmıyor.
- Baş harf avatarı placeholder hissini artırıyor.

Yeni görev:

Profil öğrencinin “kim olduğu” ve “nasıl ilerlediği” ile başlamalıdır.

Örnek:

> **Ahmet'in yolu**  
> Eylülde rotana 7 gün dokundun.  
> Bu hafta en çok Türkçeyi ilerlettin.

Veri azsa:

> İlk çalışma gününü tamamladığında yol günlüğün burada başlayacak.

### 5.3 Program

Sorunlar:

- Haftalık özet az bilgi için fazla büyük.
- Segment kontrolü özet kartının içinde bilgi mimarisini ağırlaştırıyor.
- Gün hücreleri görsel olarak fazla güçlü.
- Tamamlanan satırda üstü çizili metin ve `BİTTİ` aynı bilgiyi tekrar ediyor.
- Büyük merkez FAB ile “Bugüne durak ekle” CTA'sı birbirine rakip.
- Gün tamamlandığında ekran sonraki anlamlı eylemi göstermiyor.

Yeni görev:

Program bir istatistik kartı değil, günün yaşayan zaman çizgisi olmalıdır.

Örnek:

> **Bugün**  
> Son durağın tamamlandı.  
> Yarın 09.30 — Paragraf · Ana düşünce

Kaçırılan işler için kırmızı başarısızlık yerine:

> **Günü yeniden düzenle**

### 5.4 Analiz

Sorunlar:

- Kullanıcı içgörü görmeden iki katman filtre yönetiyor.
- Boş “Bu hafta ne okuyoruz” kartı asıl verinin önünde.
- İki veri noktasına büyük, yumuşatılmış eğri gereğinden fazla kesinlik hissi veriyor.
- Düşüşün kızıl çizilmesi cezalandırıcı.
- Asıl güçlü unsur olan `42,75` net, yorumdan kopuk.

Yeni sıra:

1. Koç yorumu
2. Yorumun kanıtı
3. İlgili eylem
4. İstenirse filtre ve derin analiz

Örnek:

> **Türkçe toparlandı. Matematik rotanı yavaşlatıyor.**  
> Son denemede toplam 3,3 net geriledin; kaybın büyük kısmı Matematikten geldi.  
> **Bugünkü plana 20 dk problem ekle**

Grafik bu cümleyi kanıtlar; ekranın kendisi olmaz.

### 5.5 Yol haritası / Müfredat

Sorunlar:

- `0`, `0/178` ve `178 kaldı` aynı olumsuz bilgiyi üç kez söylüyor.
- Başlangıçtaki kullanıcıya dev bir dağ gösteriliyor.
- Eğri, düşük veride bilgi değil dekor.
- “Müfredat / Programım” segmenti alt navigasyondaki Program ile çakışıyor.
- Ders listesi büyük ve homojen slab'lardan oluşuyor.

Yeni görev:

Tam müfredat değil, sıradaki anlamlı etap kahraman olmalıdır.

Örnek:

> **Buradasın**  
> İlk etap: Türkçe · Sözcükte anlam  
> Bu hafta üç konu ile yolu açıyoruz.

Tam 178 konu, arama ve ders listesi talep edildiğinde açılır.

---

## 6. Kaliteli uygulamalar neyi farklı yapıyor?

### 6.1 Structured — tek uzamsal model

Structured; görev, rutin, takvim, Pomodoro ve yeniden planlama sunmasına rağmen ürünü tek bir görsel modelde topluyor: günün zaman çizgisi. Kullanıcı farklı özellikler arasında gezinmek yerine gün içinde nerede olduğunu görüyor.

Maraton'a ders:

- Bugün, Program ve Rota üç ayrı zihinsel model olmamalı.
- Günün çalışmaları tek bir dikey akışta görünmeli.
- Kaçırılan plan “başarısızlık” değil yeniden düzenlenecek bir durum olmalı.

Alınmaması gereken:

- Pastel ADHD planlayıcı estetiğini kopyalamak.
- Maraton'u genel takvim uygulamasına çevirmek.

Kaynak: [Structured — App Store](https://apps.apple.com/us/app/structured-daily-planner-todo/id1499198946)

### 6.2 Things — ayrıntıyı gerektiğinde açmak

Things'in premium hissi özellik azlığından değil, aynı anda az şey istemesinden gelir. Bugün gerekli olan öndedir; tarih, etiket, checklist ve ileri ayrıntılar ihtiyaç duyulduğunda açılır.

Maraton'a ders:

- Kalite, düşük eşzamanlı farkındalık yüküdür.
- Kullanıcı bugün bir konu çalışırken 178 konuyu taşımamalıdır.
- Kart olmadan da boşluk, ayraç ve tipografiyle hiyerarşi kurulabilir.

Alınmaması gereken:

- Planlamayı tamamen kullanıcıya bırakmak.
- Ürünü genel görev yöneticisine çevirmek.

Kaynak: [Things özellikleri](https://culturedcode.com/things/features/)

### 6.3 Forest — metafor davranışın kendisidir

Forest'ta kullanıcı odakta kaldıkça ağaç büyür; geçmiş çalışma bir tablo yerine ormana dönüşür. Metafor yalnızca adlandırma veya dekor değildir, ürün davranışıdır.

Maraton'a ders:

- Rota çalıştıkça fiziksel olarak oluşmalı.
- Oturum sonunda yol uzamalı ve düğüm yerine oturmalıdır.
- Geçmiş emek önce “kat edilen yol”, sonra sayı olarak okunmalıdır.

Alınmaması gereken:

- Coin ekonomisi, koleksiyon veya cezalandırıcı kayıp mekaniği.
- Çocukça ağaç/karakter taklidi.

Kaynak: [Forest — App Store](https://apps.apple.com/us/app/forest-focus-for-productivity/id866450515)

### 6.4 Finch — şefkatli düşük-veri deneyimi

Finch'in başarısı yalnızca sevimli karakter değildir. Zor bir işi küçük, güvenli ve ödüllendirici günlük adımlara dönüştürür.

Maraton'a ders:

- Boş durum başarısızlık raporu değil başlangıç daveti olmalı.
- Kötü gün için “minimum başarılı gün” seçeneği bulunmalı.
- Dil kısa, insanî ve yargısız olmalı.

Alınmaması gereken:

- Sanal evcil hayvan, kostüm ve çocuklaştırıcı ton.

Kaynak: [Finch — App Store](https://apps.apple.com/gb/app/finch-self-care-pet/id1528595748)

### 6.5 Duolingo — sıradaki kısa adım

Duolingo'nun ana ekranı kullanıcıyı ders yapmaya iter. Seri, XP ve ligler ana davranışın ardından değer kazanır. Tasarım ekibi seri kilometre taşlarını kullanıcı araştırmasıyla yeniden ele almış ve özel anları sınırlı kutlamalarla görünür kılmıştır.

Maraton'a ders:

- Ana CTA `+` değil **Başla/Devam et** olmalı.
- Büyük sınav hedefi küçük bir sonraki adıma çevrilmeli.
- Seri ve XP gerçek çalışma eyleminden sonra gelmeli.
- Yalnızca üç imza anı hareketle vurgulanmalı.

Alınmaması gereken:

- Gürültülü maskot, agresif bildirim, enerji ekonomisi ve sürekli konfeti.

Kaynaklar: [Apple Design Awards 2023 — Duolingo](https://developer.apple.com/design/awards/2023/), [Duolingo streak tasarımı](https://blog.duolingo.com/streak-milestone-design-animation/)

### 6.6 Strava — veri kimliğe dönüşür

Strava'nın ana nesnesi tamamlanan aktivitedir. Veri, eylemden sonra kullanıcının aktif hayatının kaydına dönüşür. Uygulamanın resmî anlatımı da “kaydet, ilerlemeyi anla, paylaş” döngüsünü öne çıkarır.

Maraton'a ders:

- Profil KPI mezarlığı değil öğrencinin çalışma kimliği olmalı.
- Kullanıcı öncelikle kendi yakın geçmişiyle karşılaştırılmalı.
- Analiz önce yorum, sonra kanıt vermeli.
- Veri yetersizken güç yüzdesi ve trend sunulmamalı.

Alınmaması gereken:

- Sosyal feed'i ve rekabeti ürünün merkezine taşımak.
- Öğrenciyi sürekli kişisel rekor baskısına sokmak.

Kaynak: [Strava — App Store](https://apps.apple.com/us/app/strava-run-bike-walk/id426826309)

### 6.7 Gentler Streak — veriye insanlık katmak

Gentler Streak en güçlü duygusal benchmark'tır. Apple'ın tasarım incelemesinde ekip, sayıların yorum olmadan anlamsız olduğunu ve kullanıcının bulunduğu yerden yönlendirilmesi gerektiğini vurguluyor. Ürün performansı sürekli yükseltmek yerine sürdürülebilir ilerlemeyi anlatıyor.

Maraton'a ders:

- Öğrencinin bugünkü kapasitesine göre öneri ver.
- Veriyi raporlama; yorumla.
- “Daha fazla” yerine “bugün için yeterli ve doğru olan”ı söyle.
- Tatlılık maskottan değil, uygulamanın kullanıcıya davranışından gelsin.

Kaynak: [Apple — Gentler Streak tasarım incelemesi](https://developer.apple.com/news/?id=3m0ht22s)

### 6.8 Vocabulary, CapWords ve Opal — tek fikir ve hatırlanabilir detay

Apple, Vocabulary uygulamasını tutarlı illüstrasyonları, dengeli tipografi/ikonografisi ve haptikleri nedeniyle “ince bir mükemmellik örneği” olarak öne çıkarıyor. CapWords ise tek bir basit davranışı — fotoğraf çekip çevredeki nesnelerden kelime öğrenmeyi — eğlenceli animasyon ve sesle unutulmaz kılıyor. Opal, odaklanmayı az sayıda anlamlı ödül ve haptikle destekliyor.

Maraton'a ders:

- Hatırlanabilirlik özellik sayısından değil, tek bir özel davranıştan gelir.
- Maraton'un özel davranışı “çalışma tamamlanınca yolun fiziksel olarak ilerlemesi” olmalıdır.
- Haptic ve hareket yalnızca nedensel, anlamlı anlarda kullanılmalıdır.

Kaynaklar: [Apple Design Awards 2025](https://developer.apple.com/design/awards/2025/), [Vocabulary — App Store](https://apps.apple.com/us/app/vocabulary-learn-words-daily/id1084540807), [Opal — App Store](https://apps.apple.com/us/app/opal-screen-time-control/id1497465230)

---

## 7. Seçilen sanat yönü: Kırmızı İplik / Rota Defteri

### 7.1 Duygusal hedef

Ürün şu dört hissi üretmelidir:

- **Yön:** Şimdi ne yapacağım belli.
- **Hafiflik:** Bütün sınav yükünü aynı anda taşımıyorum.
- **Güven:** Gösterilen veri yeterli kanıta dayanıyor.
- **İlerleme:** Küçük eylemim yol üzerinde görünür bir iz bırakıyor.

“Tatlılık” sticker, maskot veya konfeti değildir. Tatlılık; uygulamanın kullanıcıyı utandırmaması, doğru anda sıcak bir cümle kurması ve emeğine küçük ama kaliteli bir karşılık vermesidir.

### 7.2 Görsel fikir

İnce kızıl iplik:

- Geçmişte kesintisiz.
- Gelecekte seyrek/kesikli.
- Bugünkü noktada dolgun ve canlı.
- Çalışma tamamlandığında fiziksel olarak uzar.
- Analizde iki dönem kıyaslanacaksa eski ve yeni rota olarak davranır.
- Profilde yılın emeğini soyut bir yol günlüğüne dönüştürür.

Rota çizgisi her ekrana yapıştırılmaz. Yalnızca üç imza bağlamında kullanılır:

1. Bugünün rotası
2. Durak tamamlama
3. Kilometre taşı / dönem özeti

### 7.3 Light-first, dark-supported

Önerilen ana kimlik sıcak açık temadır:

- Zemin: `#F4EFEC`
- İkincil kanvas: `#E7DFDA`
- Metin: `#171110`
- Marka kızılı: `#DE2E39`
- Gerçek yüzey: beyaz
- Ders renkleri: yalnızca ders kimliği

Dağılım hedefi:

- %75 sıcak nötr
- %18 koyu metin/yüzey
- %7 kızıl

Koyu tema korunur; fakat ana sanat yönü değil gece varyantıdır. Kömür zemin, kemik rengi metin ve kontrollü kızıl kullanır. Mevcut “performans terminali” hissi azaltılır.

### 7.4 Tipografi

Archivo + Bricolage korunmalıdır.

- **Bricolage:** ana ekran cümlesi, konu adı, tek anlamlı sayı, kilometre taşı.
- **Archivo:** gövde, açıklama, kontrol ve tablo.
- Büyük harfli geniş tracking yalnızca nadir bölüm işaretlerinde.
- Bir ekranda en fazla bir kahraman sayı.
- 11 px altı metin sıfırlanır.
- İkincil metin kontrastı yükseltilir; bilgi soluklaştırılarak hiyerarşi kurulmaz.

### 7.5 Yüzey sistemi

Yalnızca üç yüzey türü:

1. **Sayfa:** kesintisiz ana zemin.
2. **Not alanı:** tek önemli eylem veya yorum için hafif yükseltilmiş yüzey.
3. **Satır:** listeler için düz düzen ve ince ayraç.

Kural:

> Bir öğe bağımsız, dokunulabilir bir nesne değilse karta dönüşmez.

Premium his gölgeden değil oran, boşluk, tipografi, hizalama ve hassas ayraçlardan gelir.

### 7.6 İkonografi

Mevcut özel ikon temeli korunabilir; fakat küçük bir “yol işaretleri” alt ailesi gerekir:

- Durak düğümü
- Tamamlanmış düğüm
- Sapma / yeniden planlama
- Etap işareti
- İki rotanın kıyası

Renkli ikon kutuları varsayılan olmamalıdır. Çoğu ikon metnin yanında tek renkte yaşar.

### 7.7 Motion ve haptic

Hareketin görevi süs değil neden-sonuç anlatmaktır.

- Durak tamamlanınca iplik 500–700 ms'de bir sonraki düğüme çizilir.
- Düğüm otururken tek hafif haptic.
- Deneme girilince grafik sıfırdan açılmaz; eski rota mevcut değerinden yeni değerine şekil değiştirir.
- Sheet parmağa 1:1 bağlı, kesilebilir ve geri çevrilebilir olmalıdır.
- Her ekran toplu fade-up yapmaz.
- Konfeti, sürekli glow, rozet yağmuru ve bounce yoktur.
- Reduced Motion'da çizim kısa cross-fade veya doğrudan son hâl olur.

Apple'ın güncel yaklaşımı da marka kimliğini içerik katmanında ifade etmeyi, navigasyon ve kontrollerde tanıdık platform davranışlarını korumayı öneriyor. Maraton'un özgünlüğü custom tab bar karmaşasından değil, yaşayan rotanın içerik deneyiminden gelmelidir.

Kaynak: [Apple — iOS'ta marka kimliği](https://developer.apple.com/videos/play/wwdc2026/251/)

---

## 8. Yeni bilgi mimarisi

Önerilen üst seviye:

| Sekme | Kullanıcı sorusu | İçerik |
|---|---|---|
| **Bugün** | Şimdi ne yapmalıyım? | Sıradaki durak, bugünün akışı, minimum gün seçeneği |
| **Yol** | Nasıl ilerliyorum? | Program, rota, analiz, denemeler, müfredat, yanlış defteri |
| **Sen** | Hedefim ve çalışma kimliğim ne? | Profil, hedefler, geçmiş, ayarlar, premium |

Alternatif isim `Gelişim` olabilir; fakat `Yol`, marka metaforunu daha güçlü taşır. Kullanıcı testinde “Yol”un içeriği anlaşılmıyorsa etiket `İlerleme` olarak seçilmelidir.

### Büyük merkez `+`

Kaldırılmalıdır.

Neden:

- Görsel merkeze sürekli el koyuyor.
- Ana ürün eylemini “çalışmak”tan “veri kaydetmek”e çeviriyor.
- Her ekrandaki yerel CTA ile yarışıyor.
- Rota/Program ayrımını daha da sıkıştırıyor.

Bağlamsal eylemler:

- Bugün: **Çalışmaya başla**
- Denemeler: **Deneme gir**
- Yanlış defteri: **Yanlış ekle**
- Program: **Durak ekle**
- Oturum sonu: **Çalışmayı kaydet**

---

## 9. Data maturity modeli

Uygulamanın kaliteli hissetmesi için veri miktarına göre davranması gerekir.

| Evre | Koşul | Gösterilecek |
|---|---|---|
| Başlangıç | Hiç çalışma yok | İlk durak + tek CTA |
| İlk iz | 1 tamamlanan oturum | İlk yol parçası + sakin kutlama |
| İlk sinyal | 1 deneme veya az çalışma | Kesin yüzde değil, açıklamalı gözlem |
| Eğilim | En az 2–3 karşılaştırılabilir deneme | Yön + örneklem notu |
| Haftalık örüntü | Yeterli aktif gün | Haftalık yorum ve karşılaştırma |
| Olgun rota | Düzenli geçmiş | Tahmin, güç haritası, dönem trendleri |

Kurallar:

- Yetersiz veride dev sıfır yok.
- Yetersiz veride “güç yüzdesi” yok.
- İki noktaya karmaşık eğri yok.
- Tahmin her zaman güven/örneklem bağlamıyla sunulur.
- Aynı ekrandaki metriklerin kapsamı kullanıcıya tutarlı görünmelidir.

---

## 10. Dört ekran için yeni kompozisyon

### 10.1 Bugün

İlk viewport:

1. Kısa kişisel cümle
2. Tek ana çalışma yüzeyi
3. Günün yaşayan rotası

Örnek:

> **Günaydın Ahmet.**  
> Bugünü 42 dakikada kapatıyoruz.

> **Bilgi Felsefesi**  
> 24 dk · 30 soru  
> **Başla**

Altından kızıl iplik çıkar ve kalan iki durağa bağlanır. Bitmiş duraklar büyük kart değil, çizgi üzerindeki dolu düğümlerdir.

### 10.2 Program

İstatistik kartı yerine zaman çizgisi:

- Şimdi
- Sırada
- Daha sonra
- Tamamlananlar daraltılabilir bölüm

Haftalık/aylık özet, ekranın başındaki dev karta değil, başlık yanındaki küçük geçişe veya ayrı özet sayfasına taşınır.

### 10.3 Analiz

İlk viewport:

1. Tek yorum
2. Küçük kanıt grafiği
3. Tek önerilen eylem

Filtreler başlangıçta görünmez. “Tüm denemeleri gör” veya başlıktaki bir filtre kontrolüyle açılır.

### 10.4 Profil

Profil “kariyer özeti” değil yol günlüğüdür:

> **Ahmet'in yolu**  
> Eylülde 7 aktif gün · 412 soru · 6 saat 40 dakika

Ardından:

- Şu anki hedef
- Son anlamlı kazanım
- Yılın rotası, yalnız yeterli veri varsa
- Ders gücü, yalnız veri olgunsa
- Ayarlar ve hesap daha aşağıda

---

## 11. UX writing sistemi

Maraton'un sesi:

- Sakin
- Somut
- Yargısız
- Kısa
- Öğrencinin kontrolünü koruyan

| Mevcut/kaçınılacak | Önerilen |
|---|---|
| Konu borcu: 12 saat | Bu hafta geri kazanabileceğin 3 konu var |
| 178 konu kaldı | İlk üç konun hazır |
| Okunacak bir şey birikmedi | Birkaç kayıt sonra ilk haftalık yorumun burada oluşacak |
| Rotan hedef olmadan çizilemiyor | Hedefini seçtiğinde ilk haftanı birlikte hazırlayacağız |
| Dikkat çeken iki ders | Bu hafta ne değişti? |
| 0 gün seri | İlk çalışma günün bugün olabilir |

Koç dili kontrolü kullanıcıdan almamalıdır. “Sistem karar verir” yerine “verilerine göre önerir; rotayı sen şekillendirirsin” yaklaşımı korunmalıdır.

---

## 12. Kaliteyi bozan alışkanlıklar — yasak liste

- Her ekrana büyük sayı koymak.
- Her bölümü karta almak.
- Her karta border vermek.
- Her ekranı grafikle doldurmak.
- Rengi dekor için kullanmak.
- Veri yetersizken yüzde/trend göstermek.
- Aynı bilgiyi başlık, hero ve footer'da tekrar etmek.
- İki segment kontrolünü üst üste koymak.
- Bir ekranda iki ana CTA göstermek.
- Merkez FAB ile her ekrana görsel olarak el koymak.
- Başarılı durumu kırmızıyla boyamak.
- Empty state'i dev sıfırla anlatmak.
- Tatlılığı sticker, maskot veya konfeti sanmak.
- Premium hissi glow, blur ve gölge miktarıyla ölçmek.
- Bütün 104 ekranı aynı anda yeniden tasarlamak.

---

## 13. Uygulama planı

### P0 — Güven kaybını durdur

- Cihaz build'ini güncel kaynakla eşitle.
- Template/string sızıntılarını otomatik tara.
- Kesilen başlık ve içerikleri düzelt.
- Çelişen veri kapsamlarını kaldır.
- Yetersiz veride yüzde/trend/kariyer metriğini gizle.
- `0`, `0/178`, `178 kaldı` tekrarlarını kaldır.

### P1 — Tasarım omurgasını kanıtla

Önce yalnız dört ekran:

1. Bugün
2. Program
3. Analiz
4. Profil

Bu ekranlar için yüksek kaliteli statik yön + tıklanabilir prototip hazırlanır. Tasarım sistemi bütün ürüne yayılmadan önce gerçek cihazda denenir.

### P2 — Çekirdek yolculuğu kusursuzlaştır

> onboarding → ilk durak → başla → oturum bitti → rota ilerledi → yarının ilk durağı

Marketing öncesi ana kalite kapısı budur.

### P3 — Navigasyonu sadeleştir

- Bugün / Yol / Sen
- Büyük FAB kaldırılır.
- Rota ve Program aynı bilgi mimarisinde birleşir.
- Kayıt eylemleri bağlama taşınır.
- Derin ekranların sahipliği netleştirilir.

### P4 — Tasarım sistemini gerçekten tekleştir

- Legacy spacing/radius kapatılır.
- Tek `Screen`, tek header, tek empty-state ailesi.
- Segment, pill ve switch rolleri ayrıştırılır.
- 46 font ölçüsü rol bazlı ölçeğe düşürülür.
- 33 radius değeri az sayıda semantik role indirilir.
- `accent` ve `text3` kullanımına otomatik denetim eklenir.

### P5 — Kademeli yayılım

Yeni kalite omurgası doğrulandıktan sonra ekranlar kullanıcı trafiği ve iş değeri sırasıyla taşınır. Her ekran yeniden tasarlanmaz; bir kısmı birleştirilir, saklanır veya kaldırılır.

---

## 14. Doğrulama planı

Tasarım yalnızca ekip beğenisiyle onaylanmamalıdır.

### Beş saniye testi

Kullanıcı beş saniye sonra şu üç soruyu cevaplayabilmeli:

1. Şu anda neredeyim?
2. Şimdi ne yapmalıyım?
3. Bunu yaparsam ne değişecek?

### İlk oturum testi

Ölçülecekler:

- Onboarding tamamlama oranı
- İlk durağa ulaşma süresi
- İlk çalışmayı aynı oturumda başlatma oranı
- İlk çalışmayı tamamlama oranı
- Kullanıcının rota metaforunu doğru açıklayabilmesi

### Nitel görüşme soruları

- Bu uygulama sana nasıl davranıyor?
- Hangi ekran seni çalışmaya yaklaştırdı, hangisi uzaklaştırdı?
- Rota ile Program arasındaki farkı nasıl açıklarsın?
- Ana ekranda en önemli şey neydi?
- Hangi sayı veya grafik sana güven verdi/vermedi?
- Bu uygulamayı üç kelimeyle nasıl tarif edersin?

Hedef üçlü:

> **Sakin · Akıllı · Güvenilir**

“Karmaşık”, “karanlık”, “tablo”, “çok özellikli” ve “oyun gibi” sık geliyorsa yön başarısızdır.

---

## 15. Tasarım kabul kriterleri

- Her ekranda tek kahraman mesaj ve tek birincil eylem.
- İlk viewport'ta en fazla üç içerik bölgesi.
- Bir bilgi yalnızca bir kez vurgulanır.
- Ana eylem beş saniye içinde anlaşılır.
- Kızıl aynı viewport'ta en fazla bir ana rol üstlenir.
- Kart yalnızca bağımsız/dokunulabilir nesne olduğunda kullanılır.
- Grafik kendinden önce gelen yorumu kanıtlar.
- Yetersiz veride sayı yerine sonraki eylem gösterilir.
- Yeni kullanıcı kurulum sonrası tek dokunuşla gerçek değere ulaşır.
- Profil başarısızlık özeti değil ilerleme hikâyesidir.
- iOS ve Android platform davranışları korunur; marka içerik katmanında yaşar.
- Tüm dokunma hedefleri en az 44/48 px'dir.
- Dynamic Type, VoiceOver/TalkBack ve Reduced Motion doğrulanır.
- Hareket yalnızca transform/opacity ve Reanimated ile performanslıdır.

---

## 16. Nihai karar

Maraton'un eksik olanı yeni font, daha parlak gradient veya daha çok animasyon değildir. Eksik olan şey **cesur bir editoryal karar**dır:

> Kullanıcının görmemesi gerekenleri saklamak ve her anda yalnızca doğru sonraki adımı göstermek.

Korunacak çekirdek:

- Rota/durak metaforu
- Veri ve offline altyapısı
- Archivo/Bricolage
- Türetilmiş tema sistemi
- Ders renkleri
- Haptics ve Reanimated temeli
- İlk durağa başlayan gerçek çalışma döngüsü

Değişecek yüzey:

- Dört yerine üç ana sekme
- Merkez FAB'ın kaldırılması
- Dashboard kompozisyonunun bırakılması
- Veri olgunluğu olmadan metrik göstermeme
- Kart sayısının radikal azaltılması
- Kızılın anlamının geri kazanılması
- Koç yorumunun grafikten önce gelmesi
- Light-first sıcak kimlik
- Yaşayan kızıl rotanın imza öğesine dönüşmesi

Maraton'un yeni ürün cümlesi:

> ## **Bugün ne çalışacağını bil. Yolun çalıştıkça şekillensin.**

Bu yön doğru uygulanırsa Maraton “özellikleri bol bir YKS uygulaması” değil, öğrencinin her gün geri dönmek istediği sakin ve ayırt edilebilir bir çalışma nesnesi olabilir.

---

## 17. Kaynaklar

- [Apple Human Interface Guidelines — Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [Apple Human Interface Guidelines — Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple Human Interface Guidelines — Typography](https://developer.apple.com/design/human-interface-guidelines/typography)
- [Apple — Communicate your brand identity on iOS](https://developer.apple.com/videos/play/wwdc2026/251/)
- [Apple Design Awards 2025](https://developer.apple.com/design/awards/2025/)
- [Apple — Behind the Design: Gentler Streak](https://developer.apple.com/news/?id=3m0ht22s)
- [Structured — App Store](https://apps.apple.com/us/app/structured-daily-planner-todo/id1499198946)
- [Things — Features](https://culturedcode.com/things/features/)
- [Forest — App Store](https://apps.apple.com/us/app/forest-focus-for-productivity/id866450515)
- [Finch — App Store](https://apps.apple.com/gb/app/finch-self-care-pet/id1528595748)
- [Duolingo — Streak milestone design](https://blog.duolingo.com/streak-milestone-design-animation/)
- [Strava — App Store](https://apps.apple.com/us/app/strava-run-bike-walk/id426826309)
- [Stoic — App Store](https://apps.apple.com/us/app/stoic-journal-mental-health/id1312926037)
- [Opal — App Store](https://apps.apple.com/us/app/opal-screen-time-control/id1497465230)
- [Vocabulary — App Store](https://apps.apple.com/us/app/vocabulary-learn-words-daily/id1084540807)

