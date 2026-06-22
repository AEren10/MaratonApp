# Apple App Store Privacy Nutrition Labels - Maraton

> Bu dosya App Store Connect > App Privacy bolumunu doldururken birebir referans olarak kullanilir.
> Her bolum Apple'in Privacy Nutrition Label kategorileriyle eslesmistir.

---

## 1. Genel Sorular

| Soru | Cevap |
|------|-------|
| Do you or your third-party partners collect data from this app? | **Yes** |
| Does this app use data for tracking? | **No** |

> **Tracking tanimi (Apple):** Ucuncu taraf verisiyle eslestirme veya reklam aglariyla paylasim. Maraton bunu yapmaz.

---

## 2. Toplanan Veri Turleri (Data Types Collected)

### 2.1 Contact Info (Iletisim Bilgileri)

| Veri Turu | Toplanir mi? | Kullaniciya Bagli mi? | Kimlige Bagli mi? | Tracking icin mi? |
|-----------|-------------|----------------------|-------------------|-------------------|
| Name | **Evet** | **Evet** | **Evet** | Hayir |
| Email Address | **Evet** | **Evet** | **Evet** | Hayir |
| Phone Number | Hayir | - | - | - |
| Physical Address | Hayir | - | - | - |
| Other User Contact Info | Hayir | - | - | - |

**Amac (Purpose):** App Functionality

> Kullanici kaydi ve profil icin ad ve e-posta toplanir. Supabase Auth uzerinden yonetilir.

---

### 2.2 Health & Fitness
Toplanmiyor.

### 2.3 Financial Info
Toplanmiyor.

### 2.4 Location
Toplanmiyor.

### 2.5 Sensitive Info
Toplanmiyor.

### 2.6 Contacts
Toplanmiyor.

---

### 2.7 User Content (Kullanici Icerigi)

| Veri Turu | Toplanir mi? | Kullaniciya Bagli mi? | Kimlige Bagli mi? | Tracking icin mi? |
|-----------|-------------|----------------------|-------------------|-------------------|
| Photos or Videos | **Evet** | **Evet** | **Evet** | Hayir |
| Audio Data | Hayir | - | - | - |
| Gameplay Content | Hayir | - | - | - |
| Customer Support | Hayir | - | - | - |
| Other User Content | **Evet** | **Evet** | **Evet** | Hayir |

**Amac (Purpose):** App Functionality

> **Photos or Videos:** Profil avatari ve yanlis soru fotograflari. Istege bagli olarak yuklenir.
> **Other User Content:** Deneme sinavi sonuclari, yanlis soru kayitlari, calisma notlari.

---

### 2.8 Browsing History
Toplanmiyor.

### 2.9 Search History
Toplanmiyor.

---

### 2.10 Identifiers (Tanimlayicilar)

| Veri Turu | Toplanir mi? | Kullaniciya Bagli mi? | Kimlige Bagli mi? | Tracking icin mi? |
|-----------|-------------|----------------------|-------------------|-------------------|
| User ID | **Evet** | **Evet** | **Evet** | Hayir |
| Device ID | **Evet** | **Evet** | **Evet** | Hayir |

**Amac (Purpose):** App Functionality, Analytics

> **User ID:** Supabase Auth user UUID.
> **Device ID:** Sentry tarafindan crash raporlama icin toplanir. Push notification token (Expo) da bu kategoriye girer.

---

### 2.11 Purchases (Satin Alma)
Toplanmiyor.

---

### 2.12 Usage Data (Kullanim Verileri)

| Veri Turu | Toplanir mi? | Kullaniciya Bagli mi? | Kimlige Bagli mi? | Tracking icin mi? |
|-----------|-------------|----------------------|-------------------|-------------------|
| Product Interaction | **Evet** | **Evet** | **Evet** | Hayir |
| Advertising Data | Hayir | - | - | - |
| Other Usage Data | **Evet** | **Evet** | **Evet** | Hayir |

**Amac (Purpose):** App Functionality

> **Product Interaction:** Calisma loglar (study logs), streak verileri, XP kazanimlari, rozet ilerleme, gorev tamamlama, ekran gezinme.
> **Other Usage Data:** Calisma suresi istatistikleri, haftalik/aylik performans ozeti.

---

### 2.13 Diagnostics (Tanilar)

| Veri Turu | Toplanir mi? | Kullaniciya Bagli mi? | Kimlige Bagli mi? | Tracking icin mi? |
|-----------|-------------|----------------------|-------------------|-------------------|
| Crash Data | **Evet** | **Evet** | **Evet** | Hayir |
| Performance Data | **Evet** | **Evet** | **Evet** | Hayir |
| Other Diagnostic Data | Hayir | - | - | - |

**Amac (Purpose):** App Functionality, Analytics

> Sentry SDK crash ve performans verilerini toplar. Bu veriler Sentry sunucularina gonderilir ancak reklam veya tracking amacli kullanilmaz.

---

## 3. App Store Connect Form Ozeti

App Store Connect'te her veri turu icin sunlar secilecek:

### Contact Info - Name
- **Collection:** Yes
- **Linked to User:** Yes (kullanici profiline bagli)
- **Used for Tracking:** No
- **Purpose:** App Functionality

### Contact Info - Email Address
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### User Content - Photos or Videos
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### User Content - Other User Content
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### Identifiers - User ID
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### Identifiers - Device ID
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality, Analytics

### Usage Data - Product Interaction
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### Usage Data - Other Usage Data
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality

### Diagnostics - Crash Data
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality, Analytics

### Diagnostics - Performance Data
- **Collection:** Yes
- **Linked to User:** Yes
- **Used for Tracking:** No
- **Purpose:** App Functionality, Analytics

---

## 4. Onemli Notlar

### "Linked to User" vs "Not Linked"
Tum veriler Supabase Auth user ID ile iliskilendirilir, dolayisiyla hepsi **Linked to User** olarak isaretlenir.

### "Used for Tracking"
Apple'in tracking tanimi: kullanicinin verisini ucuncu taraf verileriyle eslestirme veya hedefli reklam amaciyla paylasma. Maraton bunu yapmaz, tum veri turleri icin **No** secilir.

### Sentry Hakkinda
Sentry crash/diagnostic verisi toplar ve kendi sunucularina gonderir. Ancak bu Apple'in tanimindaki "tracking" degildir cunku:
- Reklam amacli kullanilmaz
- Baska sirketlerin verileriyle eslestirilmez
- Sadece uygulama stabilitesi icin kullanilir

### Hesap Silme
- Uygulama ici: Ayarlar > Hesabi Sil
- Web: `https://maraton.app/delete-account`
- Apple, iOS 16.4+ icin hesap silme ozelligini zorunlu kilar. Maraton bunu saglar.

---

## 5. Kontrol Listesi (Son Kontrol)

- [x] Contact Info: Name + Email isaretlendi
- [x] User Content: Photos + Other Content isaretlendi
- [x] Identifiers: User ID + Device ID isaretlendi
- [x] Usage Data: Product Interaction + Other Usage Data isaretlendi
- [x] Diagnostics: Crash Data + Performance Data isaretlendi
- [x] Tum veri turleri "Linked to User" olarak isaretlendi
- [x] Hicbir veri "Used for Tracking" olarak isaretlenmedi
- [x] Location, Health, Financial, Contacts toplanmiyor
- [x] Reklam verisi toplanmiyor
- [x] Hesap silme mekanizmasi mevcut ve belgelendi
