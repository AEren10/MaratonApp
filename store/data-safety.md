# Google Play Data Safety Form - Maraton

> Bu dosya Google Play Console > Data Safety formunu doldururken birebir referans olarak kullanilir.
> Her bolum Play Console'daki sirayla eslesmistir.

---

## 1. Genel Bilgiler (Overview)

| Soru | Cevap |
|------|-------|
| Does your app collect or share any of the required user data types? | **Yes** |
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data is deleted? | **Yes** |

---

## 2. Veri Turleri (Data Types)

### 2.1 Location (Konum)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Approximate location | Hayir | - |
| Precise location | Hayir | - |

### 2.2 Personal Info (Kisisel Bilgiler)
| Veri Turu | Toplanir mi? | Paylasilir mi? | Amac | Zorunlu/Istege Bagli |
|-----------|-------------|----------------|------|---------------------|
| Name | **Evet** | Hayir | App functionality | Zorunlu |
| Email address | **Evet** | Hayir | App functionality, Account management | Zorunlu |
| User IDs | **Evet** | Hayir | App functionality, Account management | Zorunlu |
| Address | Hayir | - | - | - |
| Phone number | Hayir | - | - | - |
| Race and ethnicity | Hayir | - | - | - |
| Political or religious beliefs | Hayir | - | - | - |
| Sexual orientation | Hayir | - | - | - |
| Other info | Hayir | - | - | - |

### 2.3 Financial Info (Finansal Bilgiler)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| User payment info | Hayir | - |
| Purchase history | Hayir | - |
| Credit score | Hayir | - |
| Other financial info | Hayir | - |

### 2.4 Health and Fitness (Saglik)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Health info | Hayir | - |
| Fitness info | Hayir | - |

### 2.5 Messages (Mesajlar)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Emails | Hayir | - |
| SMS or MMS | Hayir | - |
| Other in-app messages | Hayir | - |

### 2.6 Photos and Videos (Foto/Video)
| Veri Turu | Toplanir mi? | Paylasilir mi? | Amac | Zorunlu/Istege Bagli |
|-----------|-------------|----------------|------|---------------------|
| Photos | **Evet** | Hayir | App functionality | Istege bagli |
| Videos | Hayir | - | - | - |

> **Aciklama:** Kullanici profil fotosu ve yanlis soru fotosu yukler. Fotolar Supabase Storage'da saklanir, ucuncu taraflarla paylasilmaz.

### 2.7 Audio (Ses)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Voice or sound recordings | Hayir | - |
| Music files | Hayir | - |
| Other audio files | Hayir | - |

### 2.8 Files and Docs (Dosyalar)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Files and docs | Hayir | - |

### 2.9 Calendar (Takvim)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Calendar events | Hayir | - |

### 2.10 Contacts (Rehber)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Contacts | Hayir | - |

### 2.11 App Activity (Uygulama Aktivitesi)
| Veri Turu | Toplanir mi? | Paylasilir mi? | Amac | Zorunlu/Istege Bagli |
|-----------|-------------|----------------|------|---------------------|
| App interactions | **Evet** | Hayir | App functionality, Analytics | Zorunlu |
| In-app search history | Hayir | - | - | - |
| Installed apps | Hayir | - | - | - |
| Other user-generated content | **Evet** | Hayir | App functionality | Zorunlu |
| Other actions | Hayir | - | - | - |

> **Aciklama - App interactions:** Calisma loglar (study logs), streak verileri, XP/rozet kazanimlari, gorev tamamlama durumlari.
> **Aciklama - Other user-generated content:** Deneme sinavi sonuclari (trial exam results), yanlis soru kayitlari.

### 2.12 Web Browsing (Web Gezinme)
| Veri Turu | Toplanir mi? | Paylasilir mi? |
|-----------|-------------|----------------|
| Web browsing history | Hayir | - |

### 2.13 App Info and Performance (Uygulama Bilgi/Performans)
| Veri Turu | Toplanir mi? | Paylasilir mi? | Amac | Zorunlu/Istege Bagli |
|-----------|-------------|----------------|------|---------------------|
| Crash logs | **Evet** | **Evet** | App functionality, Analytics | Zorunlu |
| Diagnostics | **Evet** | **Evet** | App functionality, Analytics | Zorunlu |
| Other app performance data | Hayir | - | - | - |

> **Aciklama:** Sentry SDK kullanilir. Crash log ve diagnostik verileri Sentry sunucularina gonderilir. Bu "paylasim" sayilir cunku Sentry ucuncu taraf servis saglayicisidir.
> **Sentry paylasim amaci:** "Service provider" olarak sec. Reklam amacli degildir.

### 2.14 Device or Other IDs (Cihaz Kimlikleri)
| Veri Turu | Toplanir mi? | Paylasilir mi? | Amac | Zorunlu/Istege Bagli |
|-----------|-------------|----------------|------|---------------------|
| Device or other IDs | **Evet** | **Evet** | App functionality, Analytics | Zorunlu |

> **Aciklama:** Expo push notification token ve Sentry device ID toplanir. Sentry'ye gonderildigi icin "paylasilir" olarak isaretlenir.

---

## 3. Veri Paylasimi Detaylari (Data Sharing Details)

### Crash logs & Diagnostics & Device IDs
| Soru | Cevap |
|------|-------|
| Is this data shared to a third party? | **Yes** (Sentry) |
| Purpose of sharing | Analytics (crash tracking) |
| Is this data shared for advertising? | **No** |

> Diger tum veri turleri icin: **Data is NOT shared with third parties.**

---

## 4. Veri Toplama Detaylari (Data Collection Details)

Her "Evet" isaretli veri turu icin asagidaki sorular sorulur:

### Name, Email, User IDs
| Soru | Cevap |
|------|-------|
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | **No** |
| Is this data required or optional? | **Required** |
| Why is this data collected? | **App functionality, Account management** |

### Photos
| Soru | Cevap |
|------|-------|
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | **No** |
| Is this data required or optional? | **Optional** |
| Why is this data collected? | **App functionality** |

### App interactions, Other user-generated content
| Soru | Cevap |
|------|-------|
| Is this data collected, shared, or both? | **Collected** |
| Is this data processed ephemerally? | **No** |
| Is this data required or optional? | **Required** |
| Why is this data collected? | **App functionality** |

### Crash logs, Diagnostics
| Soru | Cevap |
|------|-------|
| Is this data collected, shared, or both? | **Collected and shared** |
| Is this data processed ephemerally? | **No** |
| Is this data required or optional? | **Required** |
| Why is this data collected? | **App functionality, Analytics** |

### Device or other IDs
| Soru | Cevap |
|------|-------|
| Is this data collected, shared, or both? | **Collected and shared** |
| Is this data processed ephemerally? | **No** |
| Is this data required or optional? | **Required** |
| Why is this data collected? | **App functionality, Analytics** |

---

## 5. Guvenlik Uygulamalari (Security Practices)

| Soru | Cevap |
|------|-------|
| Is all of the user data collected by your app encrypted in transit? | **Yes** |
| Do you provide a way for users to request that their data is deleted? | **Yes** |
| Deletion request URL (varsa) | `https://maraton.app/delete-account` |

> Uygulama ici hesap silme secenegi de mevcuttur (Settings > Hesabi Sil).

---

## 6. Hedef Kitle & Icerik (Target Audience)

| Soru | Cevap |
|------|-------|
| Target age group | 13-17, 18+ |
| Is this app in the Families/Kids category? | **No** |
| Does the app appeal primarily to children? | **No** (YKS sinav hazirligi, lise ogrencileri hedef kitle) |

---

## 7. Kontrol Listesi (Son Kontrol)

- [x] Email, isim, user ID toplanir olarak isaretlendi
- [x] Foto istege bagli olarak isaretlendi
- [x] Study log, deneme sonuclari App Activity altinda isaretlendi
- [x] Crash log + diagnostik hem toplanir hem paylasilir (Sentry)
- [x] Device ID hem toplanir hem paylasilir (Sentry + push token)
- [x] Hicbir veri reklam amaciyla paylasilmiyor
- [x] Transit sifreleme (HTTPS/TLS) aktif
- [x] Hesap silme yolu mevcut (in-app + web)
- [x] Konum, rehber, finansal, saglik verisi toplanmiyor
- [x] Reklam SDK'si yok
