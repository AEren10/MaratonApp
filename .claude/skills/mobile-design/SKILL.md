---
name: mobile-design
description: Mobile-first design thinking and decision-making for iOS and Android apps. Touch interaction, performance patterns, platform conventions. Teaches principles, not fixed values. Use when building React Native, Flutter, or native mobile apps.
allowed-tools: Read, Glob, Grep, Bash
---

# Mobile Design System

> **Philosophy:** Touch-first. Battery-conscious. Platform-respectful. Offline-capable.
> **Core Principle:** Mobile is NOT a small desktop. THINK mobile constraints, ASK platform choice.

---

## MANDATORY: Read Reference Files Before Working!

### Universal (Always Read)

| File | Content | Status |
|------|---------|--------|
| **[mobile-design-thinking.md](mobile-design-thinking.md)** | **ANTI-MEMORIZATION: Forces thinking, prevents AI defaults** | **CRITICAL FIRST** |
| **[touch-psychology.md](touch-psychology.md)** | **Fitts' Law, gestures, haptics, thumb zone** | **CRITICAL** |
| **[mobile-performance.md](mobile-performance.md)** | **RN performance, 60fps, memory** | **CRITICAL** |
| **[mobile-backend.md](mobile-backend.md)** | **Push notifications, offline sync, mobile API** | **CRITICAL** |
| **[mobile-testing.md](mobile-testing.md)** | **Testing pyramid, E2E, platform-specific** | **CRITICAL** |
| **[mobile-debugging.md](mobile-debugging.md)** | **Native vs JS debugging, Flipper, Logcat** | **CRITICAL** |
| [mobile-navigation.md](mobile-navigation.md) | Tab/Stack/Drawer, deep linking | Read |
| [mobile-typography.md](mobile-typography.md) | System fonts, Dynamic Type, a11y | Read |
| [mobile-color-system.md](mobile-color-system.md) | OLED, dark mode, battery-aware | Read |
| [decision-trees.md](decision-trees.md) | Framework/state/storage selection | Read |

### Platform-Specific (Read Based on Target)

| Platform | File | When to Read |
|----------|------|--------------|
| **iOS** | [platform-ios.md](platform-ios.md) | Building for iPhone/iPad |
| **Android** | [platform-android.md](platform-android.md) | Building for Android |
| **Cross-Platform** | Both above | React Native / Expo |

---

## Maraton Project Context

```
Platform:   iOS + Android (Cross-platform)
Framework:  React Native + Expo SDK 54
Navigation: Bottom tabs (5) + Native Stack
State:      Redux Toolkit (studyLog, trials) + Context (auth, theme, exam)
Backend:    Supabase (Postgres + Auth + Storage + RLS)
Offline:    AsyncStorage queue for study logs
Theme:      Dark-only, amber accent (#F5A623)
Typography: Inter (body) + Space Grotesk (headings/stats)
```

---

## AI MOBILE ANTI-PATTERNS (YASAK LISTESI)

### Performance Sins

| NEVER DO | Why | ALWAYS DO |
|----------|-----|-----------|
| ScrollView for long lists | Renders ALL items, memory explodes | FlatList / FlashList |
| Inline renderItem function | New function every render | useCallback + React.memo |
| Missing keyExtractor | Index-based keys cause bugs | Unique stable ID from data |
| Skip getItemLayout | Async layout = janky scroll | Provide when items have fixed height |
| Native driver: false | Animations blocked by JS thread | useNativeDriver: true always |
| console.log in production | Blocks JS thread | Remove before release |

### Touch/UX Sins

| NEVER DO | Why | ALWAYS DO |
|----------|-----|-----------|
| Touch target < 44px | Impossible to tap | Minimum 44pt (iOS) / 48dp (Android) |
| Spacing < 8px between targets | Accidental taps | Minimum 8-12px gap |
| No loading state | User thinks app crashed | ALWAYS show loading feedback |
| No error state | User stuck | Show error with retry option |
| No offline handling | Crash when network lost | Graceful degradation |

### Security Sins

| NEVER DO | Why | ALWAYS DO |
|----------|-----|-----------|
| Token in AsyncStorage | Easily stolen | SecureStore / Keychain |
| Hardcode API keys | Reverse engineered | Environment variables |
| Log sensitive data | Logs extractable | Never log tokens, PII |

---

## Platform Decision Matrix

```
                    UNIFY                      DIVERGE
Business Logic      Always                     -
Data Layer          Always                     -
Core Features       Always                     -
Navigation          -                          iOS: edge swipe, Android: back button
Icons               -                          SF Symbols vs Material Icons
Date Pickers        -                          Native pickers
Modals/Sheets       -                          iOS: bottom sheet vs Android: dialog
```

---

## Pre-Development Checklist

### Before Every Screen

- [ ] Touch targets >= 44-48px?
- [ ] Primary CTA in thumb zone?
- [ ] Loading state exists?
- [ ] Error state with retry exists?
- [ ] Offline handling considered?
- [ ] ScreenErrorBoundary wrapping?

### Before Release

- [ ] console.log removed?
- [ ] SecureStore for sensitive data?
- [ ] Lists optimized (memo, keyExtractor)?
- [ ] Memory cleanup on unmount?
- [ ] Tested on low-end devices?
- [ ] Accessibility labels on interactive elements?

---

> **Remember:** Mobile users are impatient, interrupted, and using imprecise fingers on small screens. Design for the WORST conditions.
