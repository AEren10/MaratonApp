# Maraton Project - Development Rules

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Tech Stack
- Runtime: Expo SDK 54, React Native 0.81, Hermes, New Architecture
- Navigation: React Navigation (native-stack + bottom-tabs)
- State: Redux Toolkit + React Context
- Backend: Supabase (Postgres + Auth + Storage + RLS)
- Styling: design tokens from src/themes/tokens.js (koyu + acik tema)
- Fonts: Archivo (arayuz), Bricolage Grotesque (editoryal baslik + kahraman sayilar)
- Animations: Reanimated 4 + Gesture Handler
- Validation: Zod (src/validations/)
- Charts: react-native-chart-kit + react-native-svg

## Architecture Rules
1. Feature-based folders: src/screens/{feature}/ with local components
2. Screen names: ONLY from src/constants/screens.js
3. Analytics events: ONLY from src/constants/analytics.js
4. Max 150 lines per component file — split if bigger
5. Business logic in src/hooks/ or src/lib/ — NOT in screen files
6. Supabase access ONLY through src/supabase/ modules
7. Every screen wrapped in ScreenErrorBoundary
8. All colors/spacing/typography from tokens.js — NO hardcoded values
9. Ders renkleri src/themes/palette.js'ten (subjects.js eski isimleri esliyor)

## State Management
- Redux: studyLog (daily logs, streak), trials (deneme sonuclari)
- Context: AuthContext (session/user), ThemeContext (colors), ExamContext (exam type/date)
- AsyncStorage: preferences, offline queue
- SecureStore: auth tokens ONLY

## Styling Rules

Kaynak: `design/extracted/tokens.md` (tasarimin kendi token referansi) ve
`src/themes/tokens.js` + `src/themes/palette.js`. Deger buradan okunur, YAZILMAZ.

- Palet TURETILMIS: uc tohumdan (`accent`, `bg`, `text`) `color-mix(in oklab)`
  ile hesaplaniyor. RN'de oklab yok -> `src/themes/colorMix.js` (tarayici
  ciktisina karsi 19/19 dogrulandi). Kullanici temasi bu yuzden mumkun.
- Marka: accent `#E5343F` (kizil). Kirmizi metin `accent-bright #FF4D57`,
  basili `accent-press #C22730`, kirmizi zemin ustu metin `accent-ink #F7F2F0`.
- Yuzey merdiveni: `bg #1C1C23` · `surface #26262F` · `elev #30303B` ·
  `void #212129` (girinti) · `track #30303B` · `line #34343F` · `border #3E3E4B`.
  **Derinlik golgeyle degil yuzey tonu + 1px kenarlikla kurulur.**
- Metin: `text #F5F2EF` · `text2 #A3A0A8` · `text3 #9794A0` (en kucuk okunur ton).
  `text4 #6B6870` YALNIZ grafik ekseni/izgara etiketi — govde metninde kullanilmaz.
  `text5 #3B3941` metin degil (hayalet rakam, pasif halka).
- Anlam: `up #34D399` yalniz artis · `down #8A8790` dusus (kirmizi DEGIL, kotu
  haber bagirmaz) · `warn #E0A93F` · `danger #F0555F` yalniz yikici aksiyon.
- Ders renkleri yalniz ders baglaminda, durum anlatmaz:
  `s-tur #74A9E8` · `s-mat #E0A570` · `s-fiz #6ECFC0` · `s-kim #E8A0C4` ·
  `s-bio #86CE92` · `s-tar #C9BE6A` · `s-cog #8B5CF6` · `s-fel #A78BFA` · `s-din #B5D97A`
- Tipografi: kahraman sayi 96px Bricolage 400 (`letter-spacing -.04em`),
  ekran basligi 22-34px Bricolage, net degeri 26px Bricolage,
  govde 13-14px Archivo (`line-height 1.55-1.65`), buton 16px Archivo 700,
  bolum etiketi 11.5px Archivo 600 (`letter-spacing .16em`, buyuk harf),
  meta 11-12.5px Archivo 500. Sayisal alanlarda `tabular-nums`.
  **Taban: 11px altinda metin YOK.**
- Geometri: kenar boslugu 22px · ekran cercevesi 390px `radius 42`
  · birincil/ikincil buton h52 r12 · ucuncul h44-46 · cip h38 r6 ·
  segment h36 r6 · kart r16-24 · panel r20 · ikon kutusu r10-12
- Bosluk kademeleri: 8 · 12 · 20 · 34 · 52 (`STEP.s1..s5`)
- Dokunma alani en az 44px; kucuk ogede seffaf katmanla buyutulur, gorsel
  boyut korunur.
- Hareket: sure 0.5-0.9 sn, bir ekranda en fazla iki animasyon turu.
  Uc imza ani: durak tamamlandi (hat cizilir, dugum oturur) · deneme kaydedildi
  (hat eski halden yeni hale gecer) · odeme basarili (dugum bir kez parlar).
  **Konfeti, rozet, ses YOK.**

## Performance Rules
- FlatList + React.memo + useCallback for ALL lists
- useNativeDriver: true for Animated API
- Reanimated for complex animations
- No console.log in production
- Cleanup all useEffect subscriptions
- Images: resize to display size, cache with limits

## File Naming
- Components: PascalCase (StudyCard.js, PlanTaskItem.js)
- Hooks: camelCase with use prefix (useStudyTimer.js)
- Utils/Lib: camelCase (planEngine.js, smartNudge.js)
- Constants: camelCase (screens.js, analytics.js)
