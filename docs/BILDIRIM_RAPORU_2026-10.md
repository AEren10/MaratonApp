# Bildirim, popup, seri ve kullanıcı içeriği raporu (1 Ekim 2026)

Kaynak: `src/lib/notifications.js`, `notificationTemplates.js`, `reminderContent.js`,
`smartNudge.js`, `useNudgePopup.js`, `supabase/functions/send-push`, canlı veritabanı.

---

## 1. Bugün ne gidiyor? (gerçek durum)

### Telefonda kurulan (yerel) bildirimler

| Tip | Ne zaman | Metin | Not |
|---|---|---|---|
| Günlük hatırlatma | Önümüzdeki 7 gün, 19:00 civarı (çalışma saatine kayar) | "Bugün 2 durak var · Sıradaki: Paragraf · ~70 dk" | İyi: gün bitince gitmiyor. **7 gün sonra tamamen susuyor.** |
| Seri riski | Tek sefer, 22:00 civarı | "{N} günlük seri donmak üzere" | İyi: o gün çalıştıysa yarına atılıyor. |
| Haftalık özet | Pazar 20:00, 4 hafta | "312 soru · 6 sa 20 dk. Raporuna göz at." | Yalnız ilk Pazar sayılı, sonrakiler genel. |
| Görev hatırlatma | Kendi eklediğin durak açıksa: 2,5 saat sonra + **her gün 20:00** | "Bugünkü hedeflerine ulaşmadın" | **Hata:** her gün tekrarlayan tetik; uygulamayı bırakan kullanıcıya aylarca her akşam gider. Dili de suçlayıcı. |
| Deneme hatırlatma | Her Perşembe 18:00 | "Bu hafta henüz deneme girmedin" | Varsayılan kapalı. Açılırsa deneme girmiş olsan da gider (sabit haftalık tetik). |
| Sınav arifesi / prova | Tek sefer | Sınav günü planından | İyi. |

### Sunucudan gönderilen (push) bildirimler

`send-push` fonksiyonu canlıda kurulu ama **onu çalıştıran hiçbir zamanlayıcı yok**:
veritabanında `pg_cron` ve `pg_net` eklentileri yok, dışarıda da bir cron tanımlı değil.
Yani "3 gündür girmedin" ve sunucu tarafı seri uyarısı **hiç gönderilmedi**.
Canlıda 12 profilin 3'ünde push token var.

### Uygulama içi popup'lar (`smartNudge` → `NudgePopup`)

Yalnız dört tip popup olarak çıkıyor, her biri günde bir kez:
- net düşüşü ("Matematik son denemede 3,5 net geride")
- net artışı
- seri ("12 günlük serin sürüyor. Bugün tek durak yeter.")
- kişisel rekor: listede var ama hiç üretilmiyor (ölü kod)

"Daha derine" özelliklerine (Net & Sıralama Tahmini, Dönem karşılaştırması,
Zayıf dersler, Senaryolar, Simülasyon) yönlendiren **hiçbir tetik yok**.
Kullanıcı bunları ancak Analiz'in en altına inerse buluyor.

### Özet sorun

Bildirim "takvim" mantığıyla çalışıyor, "olay" mantığıyla değil:
- Kullanıcı ne yaparsa yapsın aynı saatlerde aynı tipler gidiyor.
- Bırakan kullanıcıya iyi bildirimler 7. günde susuyor, kötü olanlar (her akşam
  20:00 görev uyarısı) sonsuza dek sürüyor. Yani ters çalışıyor.
- Aynı akşam 19:00 + 20:00 + 22:00 + "2,5 saat sonra" üst üste binebiliyor; günlük üst sınır yok.

---

## 2. Önerilen bildirim motoru

### Kurallar
1. **Günde en fazla 1 bildirim.** Tek istisna: seri ≥ 3 iken akşam seri uyarısı.
2. **Sessiz saat:** 22:30–08:00 arası hiçbir şey gitmez.
3. **Her bildirimin somut bir sebebi ve tek bir hedef ekranı vardır.** "Haftanın ritmi açık" gibi soyut metin yok.
4. **Yanlış pozitif sıfır:** gönderilmeden hemen önce koşul yeniden kontrol edilir.
5. **Geri çekilme:** üst üste 3 bildirim açılmadıysa sıklık yarıya iner.
6. Dil suçlamaz, emoji yok, XP yok (XP gizlendi).

### A) Olay sonrası (bir şeyden sonra bir şey)

Uygulama içinde popup ya da ertesi gün tek bildirim olarak gider. Her keşif popup'ı **ömürde bir kez** çıkar.

| Olay | Ne çıkar | Gittiği yer |
|---|---|---|
| Aynı türde 2. deneme girildi | Popup: "İki deneme oldu. Netlerin nereden değişti, karşılaştır." | Dönem karşılaştırması |
| 3. deneme girildi (tahmin açıldı) | Popup: "Tahminin açıldı: bu tempoyla sınav günü ~68 net." | Net & Sıralama Tahmini |
| Bir derste net 2+ düştü | Popup (var olan), metne buton eklenir | Zayıf dersler / ders analizi |
| Bir dersin %50 konusu bitti | Popup: "Kimya'nın yarısı bitti. Kalan 4 konu, ~3 hafta." | Müfredat > ders |
| Hafta bitti (Pazar) | Bildirim: gerçek sayılarla haftalık özet | Özet |
| Ay döndü (ayın 1'i) | Bildirim: "Eylül bitti: ortalaman 59 → 64. Dönemini gör." (yalnız ≥ 2 deneme varsa) | Dönem karşılaştırması |
| Rota evresi değişti (150 / 60 gün kala, `examPhase`) | Bildirim: "Sınava 150 gün: rota AYT ağırlığını artırdı." | Rota |
| Hedef netin üstüne çıktı | Popup: "Hedefini geçtin. Hedefi yükseltmek ister misin?" | Hedef net |
| Senaryo kurulumu (ilk hafta 3 gün eksik kaldı) | Popup: "Bu tempo yetmiyor olabilir. 3 tempoyu yan yana gör." | Senaryolar |

### B) Kullanmadığı günler: geri dönüş merdiveni

| Gün | Kaynak | Metin |
|---|---|---|
| 0 (çalışmadı, seri ≥ 3) | Yerel, alışkanlık saati + 2 sa (en geç 22:00) | "{N} günlük seri. Tek durak yeter: Paragraf · 12 dk" |
| 1 | Yerel | Somut sıradaki durak (bugünkü günlük hatırlatma) |
| 3 | **Sunucu** | "Rota geride kalan 4 durağı bu haftaya yeniden dağıttı." |
| 7 | **Sunucu** | "Bir hafta oldu. Rotan seni bekliyor, ilk durak 15 dk." |
| 14 | **Sunucu** | Son çağrı, sonra susar |
| Sınava 100 / 30 gün | **Sunucu** | Sessizlikte bile gider (tek istisna) |

Sunucu tarafı için `pg_cron` + `pg_net` açılır ve `send-push` saatlik çalışır. Her kullanıcının
`last_active` ve `last_push_at` değerine bakılır; merdivenin hangi basamağında olduğu
hesaplanır. Yeni kolon gerekir: `profiles.last_push_at` ve `push_ignored_count`.

### C) Hemen düzeltilecek hatalar (motordan bağımsız)

1. **Görev hatırlatması her gün tekrarlıyor** → yalnız bugüne tek sefer; metin "Eklediğin 2 durak açık".
2. **Deneme hatırlatması sabit Perşembe** → tek seferlik ve "bu hafta deneme yoksa" koşullu.
3. **Günlük üst sınır yok** → kurmadan önce o güne kurulu bildirim sayılır.
4. **Sunucu push hiç çalışmıyor** → cron kurulumu (Codex).
5. Ölü kod: `PERSONAL_RECORD` popup tipi, `getWeekly` (XP'li metin).

### Kim ne yapar
- **Claude:** yerel motor (kurallar, A tablosu tetikleri, C1–C3, C5), testler.
- **Codex:** `pg_cron` + `pg_net`, `send-push` merdiveni, `last_push_at` migration (Claude canlıya uygular).
- **Ant:** keşif popup'ının görünümü (var olan `NudgePopup` üstüne tek buton).

**Tahmini süre:** C maddeleri yarım gün. A + B 1,5–2 gün.
**Öneri:** C maddeleri yayından önce (5 Ekim), A + B v1.0.1'de.

---

## 3. Seri (streak): öneriler

Bugün seri yalnız ana sayfanın üstündeki takvim çipinde ("12 GÜN") ve akşam bildiriminde var.
Kaybetmenin bir bedeli, korumanın bir yolu, kazanmanın bir anı yok.

1. **Görünür yap:** ana sayfada tarihin altında 7 noktalık hafta şeridi ve "12 gün üst üste". Kutusuz, Ders analizi desenine uygun.
2. **Haftalık seri (asıl öneri):** günlük yerine "haftada 5 gün". YKS öğrencisinin okul sınavı, hastalık ve bayram günleri var. Günlük seri bir kez kırılınca öğrenci bırakıyor, haftalık seri affediyor. Sayaç "8 hafta üst üste" olur.
3. **Dondurma:** haftada 1 otomatik koruma, rota donukken seri de donar (mantık zaten var).
4. **An:** günün ilk durağı tamamlanınca var olan "durak tamamlandı" imzasına seri +1 eklenir. Konfeti yok.
5. **Paylaşım:** 7 / 30 / 100 günde Story kartı (Kademe A hazır).
6. **Grup serisi (v1.0.1):** grubun hepsi bugün çalıştıysa grup serisi +1. Sosyal sorumluluk, retention'ın en güçlü kolu.
7. **Bildirim:** seri uyarısı yalnız seri ≥ 3 iken ve öğrencinin kendi saatinde.

---

## 4. Kullanıcı içeriği güvenliği (Apple Guideline 1.2)

### Bulgular (canlı)
- **Genel Lig herkese açık:** `show_in_leaderboard` varsayılanı `true`; 12 profilin 12'si açık. Ad ve fotoğraf tüm kullanıcılara görünüyor.
- **Grup adı serbest metin:** filtre yok, canlıda 5 grup var.
- **Profil adı:** yalnız uzunluk kontrolü (2–50).
- **Fotoğraf:** denetim yok; Genel Lig'de herkese görünüyor.
- **Şikâyet mekanizması hiç yok.** Tablo da arayüz de yok.
- **Engelleme** yalnız Arkadaşlar ekranında. Engellenen kişi grup ve ligde görünmeye devam ediyor (doğrulanacak).
- Mağaza metni planı "lig/sosyal v1'de yok" diyor, ama uygulamada Sosyal Hub ana sayfadan açılıyor. **Çelişki.**

Apple, kullanıcı içeriği olan uygulamadan dört şey ister: içerik filtresi, şikâyet, engelleme ve iletişim
bilgisi. Şu an yalnız iletişim bilgisi tam.

### Seçenekler
- **A (önerilen, en güvenli):** v1'de Genel Lig kapalı, `show_in_leaderboard` varsayılanı `false`.
  Gruplar ve arkadaşlar yalnız kodla kalır. Bunlara eklenir:
  - ad filtresi: sunucuda, `create_group` ve profil adı
  - grup üye satırında "Bildir / Engelle"
  - `reports` tablosu ve destek e-postası

  Bunlar 1 gün sürer (Codex DB, Ant arayüz).
- **B (en hızlı):** v1'de Sosyal Hub tamamen kapalı (silinmez, bayrakla), v1.0.1'de moderasyonla açılır.
  Mağaza metniyle de tutarlı. Yarım saat.

5 Ekim'e 4 gün var. Gruplar emek verilmiş bir özellik, ama bir inceleme reddi 1 hafta kaybettirir.
