# Maraton · Token Referansı

Tek kaynak: `Maraton Uygulama.dc.html` içindeki `PALETTES.Kor` + `PAL_BASE`.
Koddaki karşılığı: `src/themes/palette.js` (renk) + `src/themes/tokens.js` (ölçü, tipografi).

## Marka

| Token | Değer | Kullanım |
|---|---|---|
| `--accent` | `#E5343F` | Rota hattı, BUGÜN düğümü, birincil buton, aktif sekme, ekleme aksiyonu. |
| `--accent-bright` | `#FF4D57` | Kırmızı metin (etiket, eyebrow, link). Zeminde 4.5:1 tutar. |
| `--accent-press` | `#C22730` | Buton basılı hali. |
| `--accent-deep` | `#A81C26` | Koyu kırmızı zemin. |
| `--accent-ink` | `#F7F2F0` | Kırmızı zemin üstündeki metin. |
| `--brand-fill` | `var(--accent)` | Birincil buton zemini. |
| `--brand-tint` | `rgba(229,52,63,.13)` | Seçili çip, sessiz kırmızı kart zemini. |
| `--accent-glow` | `rgba(229,52,63,.30)` | Kutlama anlarında parlama. |

## Yüzeyler · derinlik merdiveni

| Token | Değer |
|---|---|
| `--canvas` / `--bg` | `#1C1C23` |
| `--surface` | `#26262F` |
| `--elev` | `#30303B` |
| `--void` | `#212129` |
| `--track` | `#30303B` |
| `--line` | `#34343F` |
| `--border` | `#3E3E4B` |

Derinlik gölgeyle değil yüzey tonu + 1px kenarlıkla kurulur.

## Metin

| Token | Değer | Kullanım |
|---|---|---|
| `--text` | `#F5F2EF` | Birincil metin, net değerleri. |
| `--text2` | `#A3A0A8` | İkincil metin, açıklama. |
| `--text3` | `#9794A0` | Meta, bölüm etiketi. En küçük okunur ton. |
| `--text4` | `#6B6870` | Yalnız grafik ekseni ve ızgara etiketi. |
| `--text5` | `#3B3941` | Hayalet rakam, pasif halka. Metin değil. |

## Anlam

`--up` `#34D399` (yalnız artış) · `--down` `#8A8790` (düşüş, kırmızı değil) ·
`--warn` `#E0A93F` · `--danger` `#F0555F` (yıkıcı aksiyon)

## Rota türevleri (`--accent`'ten üretilir)

| Token | Formül |
|---|---|
| `--past` | `var(--accent)` |
| `--proj` | `accent %52 + bg` |
| `--proj-node` | `accent %44 + text2` |
| `--stop` | `accent %44 + bg` |
| `--band-edge` | `accent %32 + bg` |
| `--target-line` | `accent %22 + bg` |
| `--bar-idle` | `accent %22 + bg` |
| `--heat1…4` | `accent %18 / %40 / %62 / %82 + bg` |

## Ders renkleri

`--s-tur` `#74A9E8` · `--s-mat` `#E0A570` · `--s-fiz` `#6ECFC0` ·
`--s-kim` `#E8A0C4` · `--s-bio` `#86CE92` · `--s-tar` `#C9BE6A` ·
`--s-cog` `#8B5CF6` · `--s-fel` `#A78BFA` · `--s-din` `#B5D97A`

Ders rengi ders kimliği demek: şerit, nokta, mini rota hattı. Durum anlatmaz.

## Tipografi

| Rol | Değer |
|---|---|
| Kahraman sayı | 96px / 400 Bricolage Grotesque, `letter-spacing:-.04em` |
| Ekran başlığı | 22–34px / 400 Bricolage Grotesque |
| Net değeri | 26px / 400 Bricolage Grotesque |
| Konu adı | 15,5–16,5px / 400 Bricolage Grotesque |
| Gövde | 13–14px / 400–500 Archivo, `line-height 1.55–1.65` |
| Buton | 16px / 700 Archivo |
| Bölüm etiketi | 11,5px / 600 Archivo, `letter-spacing:.16em`, büyük harf |
| Meta | 11–12,5px / 500 Archivo |

Taban: 11px altı metin yok. Sayısal alanlarda `tabular-nums`.

## Ölçü ve geometri

- Kenar boşluğu 22px · durum çubuğu 50px · ekran çerçevesi 390px, `radius 42`
- Birincil buton h52 / r12 · ikincil h52 çerçeveli · üçüncül h44–46 çerçevesiz
- Çip h38 / r6 · segmented hücre h36 / r6, kapsayıcı 4px padding
- Kart r16–24 · panel r20 · ikon kutusu r10–12
- Dokunma alanı en az 44px; küçük öğelerde şeffaf katmanla büyütülür
- Boşluk kademeleri 8 · 12 · 20 · 34 · 52

## Hareket

`.u` yukarı süzülme · `.ln` rota çizgisi çizilir · `.pop` sayı yerine oturur ·
`.rise` sütun yerden büyür · `.grow` çubuk soldan dolar · `.glow` / `.drift`
yalnız kutlama anında. Süre 0,5–0,9 sn. Bir ekranda en fazla iki animasyon türü.

Üç imza anı: durak tamamlandı · deneme kaydedildi · ödeme başarılı.
Konfeti, rozet, ses yok.
