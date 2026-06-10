# Maraton Project - Development Rules

## Expo HAS CHANGED
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Tech Stack
- Runtime: Expo SDK 54, React Native 0.81, Hermes, New Architecture
- Navigation: React Navigation (native-stack + bottom-tabs)
- State: Redux Toolkit + React Context
- Backend: Supabase (Postgres + Auth + Storage + RLS)
- Styling: Dark theme only, design tokens from src/themes/tokens.js
- Fonts: Inter (body), Space Grotesk (headings/stats)
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
9. Subject colors from src/themes/subjects.js

## State Management
- Redux: studyLog (daily logs, streak), trials (deneme sonuclari)
- Context: AuthContext (session/user), ThemeContext (colors), ExamContext (exam type/date)
- AsyncStorage: preferences, offline queue
- SecureStore: auth tokens ONLY

## Styling Rules
- Dark background: #0A0A0F
- Accent: #F5A623 (amber) for CTAs and active states
- Subject colors: Turkce=#60A5FA, Matematik=#F5A623, Fen=#34D399, Sosyal=#A78BFA
- Cards: rounded-2xl (24px), surface color #1A1A23, border #2A2A36
- Stats/numbers: Space Grotesk Bold, oversized
- Touch targets: minimum 44px, spacing minimum 8px

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
