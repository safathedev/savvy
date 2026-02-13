# Savvy Technical Documentation

Dieses Dokument beschreibt den aktuellen technischen Stand des Savvy-Projekts:
- Tech Stack
- App-Architektur
- RevenueCat-Implementierung

Stand: Codebase in diesem Repository (Expo SDK 54, React Native 0.81, Stand Februar 2026).
**Version:** 1.0.0 (Build 2)

## 1. System Overview

Savvy ist eine mobile-first Finanz-App fuer iOS, Android und Web mit Fokus auf:
- taegliche Spar-Tipps
- lernpfadbasierte Investment Education
- Tracking von Einnahmen/Ausgaben, Zielen und geplanten Kosten
- Gamification (Streaks)
- Freemium/Paywall mit RevenueCat

Die App ist client-zentriert: Kernfunktionen laufen lokal auf dem Geraet, inklusive Persistenz via AsyncStorage. Es gibt aktuell kein eigenes Backend im Repository.

## 2. Tech Stack

### 2.1 Sprachen und Kernframeworks

- TypeScript (`.ts/.tsx`) als Primaersprache
- React 19
- React Native 0.81
- Expo SDK 54
- Expo Router 6 (file-based routing)

### 2.2 UI, Styling, Motion

- NativeWind 4 + Tailwind CSS 3
- Eigene Theme-Tokens in `constants/theme.ts`
- `react-native-reanimated` fuer Animationen
- `react-native-gesture-handler` fuer Gesten
- `expo-haptics` fuer haptisches Feedback
- `@expo/vector-icons` (Ionicons/FontAwesome)

### 2.3 Plattform- und Expo-Module

- `expo-notifications` (lokale Reminder)
- `expo-device` (Device-Checks fuer Notifications)
- `expo-sharing` und RN `Share` API
- `expo-font`, `expo-splash-screen`, `expo-status-bar`
- `expo-linear-gradient`, `expo-blur`, `expo-linking`, `expo-web-browser`

### 2.4 State, Persistenz, Daten

- Globaler App-State via React Context (`lib/app-context.tsx`)
- Lokale Persistenz via `@react-native-async-storage/async-storage`
- Statische Content-Daten in `data/*.ts` und `data/*.json`

### 2.5 Subscription und Monetization

- RevenueCat via `react-native-purchases`
- Eigene Integrationsschicht in `lib/revenuecat.ts`
- Paywall-UI in `app/paywall/index.tsx`

### 2.6 Build, Tooling, Release

- Metro Bundler (`metro.config.js`)
- Babel (`babel.config.js`) inkl. Reanimated + NativeWind
- TypeScript strict mode (`tsconfig.json`)
- EAS Build Profiles (`eas.json`)
- Expo config in `app.json` (iOS, Android, Web, Plugins)

## 3. Architektur

### 3.1 High-Level Architektur

Savvy folgt praktisch einer modularen Client-Architektur:

1. Presentation Layer
- Screens in `app/` (Expo Router)
- Wiederverwendbare UI in `components/`
- View-spezifische Hooks in `hooks/`

2. Domain/Data Layer
- Lern- und Tipp-Content in `data/`
- Domain-Helfer fuer Lernfortschritt und Unlock-Logik in `data/moms-investment-journey.ts`

3. Application State Layer
- `AppProvider` in `lib/app-context.tsx`
- zentraler Zustand fuer Profil, Tracking, Ziele, Streak, Premium, Kalender, Notifications

4. Service Layer
- RevenueCat (`lib/revenuecat.ts`)
- Notifications (`lib/notifications.ts`)
- Sharing (`lib/sharing.ts`)

5. Persistence Layer
- AsyncStorage mit zentralen Keys aus `constants/storage-keys.ts`

### 3.2 Runtime Boot Flow

Beim App-Start:

1. `app/_layout.tsx`
- startet Root Providers (`GestureHandlerRootView`, `SafeAreaProvider`, `AppProvider`, `ThemeProvider`)
- laedt Fonts
- steuert Splash Screen hide
- initialisiert RevenueCat (`initializePurchases()`)

2. `app/index.tsx`
- liest `userProfile` + `isLoading` aus Context
- redirect:
  - Onboarding abgeschlossen -> `/(tabs)`
  - sonst -> `/onboarding`

### 3.3 Routing-Struktur

Wichtige Routen:
- `app/index.tsx` (Entry Redirect)
- `app/onboarding/index.tsx`
- `app/(tabs)/index.tsx` (Home)
- `app/(tabs)/academy.tsx`
- `app/(tabs)/calendar.tsx`
- `app/(tabs)/track.tsx`
- `app/(tabs)/profile.tsx`
- `app/tip/[id].tsx`
- `app/lesson/[id].tsx`
- `app/paywall/index.tsx` (modal)

Tab Navigation ist in `app/(tabs)/_layout.tsx` definiert.

### 3.4 State und Datenfluss

Der globale Context verwaltet:
- User-Profil (Name, Ziel, Waehrung, Reminder, Onboarding-Status)
- Savings Entries (income/expense)
- Savings Goals
- Lesson Completion
- Applied Tips
- Streak Data
- Premium Status
- Notification Settings
- Kalender-Events + Custom Kategorien

Wichtige Patterns:
- Jede Mutationsfunktion schreibt Zustand + AsyncStorage
- `recordActivity()` aktualisiert Streak bei relevanten Aktionen
- Der Context normalisiert/sanitized Eingaben zentral (Betrag, IDs, Kategorien, Datumswerte)

### 3.5 Persistenzmodell

Storage Keys sind in `constants/storage-keys.ts` zentralisiert, z. B.:
- `@savvy_user_profile`
- `@savvy_savings_entries`
- `@savvy_completed_lessons`
- `@savvy_applied_tips`
- `@savvy_streak_data`
- `@savvy_premium_status`
- `@savvy_calendar_events`
- `@savvy_savings_goals`

Besonderheiten:
- Es gibt einen One-Time Reset Marker (`FRESH_RESET_MARKER`). Falls er fehlt, wird `AsyncStorage.clear()` ausgefuehrt und Marker gesetzt.
- Premium hat zusaetzlich einen `PREMIUM_RESET_MARKER`, um einen einmaligen Reset zu steuern.

### 3.6 Domain-Logik (Academy)

`data/moms-investment-journey.ts` liefert:
- mehrstufige Kursstruktur (beginner/intermediate/advanced)
- Premium-Logik (`isLessonPremium`, `isLevelPremium`)
- Unlock-Reihenfolge (`isLessonUnlocked`)
- Progress-Helper (`getLevelProgress`, `getCourseProgress`, `getFirstIncompleteLesson`)

Die Screens `academy` und `lesson/[id]` verwenden diese Helper direkt fuer Gatekeeping und Fortschrittsanzeigen.

## 4. RevenueCat Implementation

### 4.1 Zielbild

RevenueCat steuert plattformuebergreifend:
- Offerings/Pakete
- Kaufabschluss
- Entitlement-Pruefung
- Restore Purchases

Integration ist gekapselt in `lib/revenuecat.ts`.

### 4.2 Betriebsmodi: Dummy vs. Live

Schalter:
- `EXPO_PUBLIC_REVENUECAT_DUMMY`

Verhalten:
- Default ist Dummy (alles ausser exakt `"false"` gilt als Dummy aktiv)
- In Dummy Mode:
  - kein echtes SDK erforderlich
  - simulierte Kauf-/Restore-Antworten
  - `mockPremiumState` verwaltet lokalen Premium-Status fuer Tests
- In Live Mode:
  - dynamischer Import von `react-native-purchases`
  - echte API Keys pro Plattform

### 4.3 Environment Variables

Relevante Variablen:
- `EXPO_PUBLIC_REVENUECAT_DUMMY`
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID` (Default: `Savvy Pro`)

Empfohlene Konvention:
- `.env` lokal halten
- keine Keys in Git committen

### 4.4 Initialisierung

`initializePurchases()` wird beim App-Start in `app/_layout.tsx` aufgerufen.

Live-Mode Ablauf:
1. API Key je Plattform aufloesen
2. optionales Debug Log Level in `__DEV__`
3. `Purchases.configure({ apiKey })`
4. iOS optional: AdServices Attribution Token Collection

Fehler werden abgefangen, damit die App im Zweifel weiter nutzbar bleibt.

### 4.5 Offerings und Paywall

`app/paywall/index.tsx`:
- laedt Offerings via `getOfferings()`
- fallback in Dummy Mode mit lokalen Mock-Packages
- Plan-Auswahl (aktuell monthly/yearly/lifetime)
- Kauf mit `purchasePackage(...)`
- Restore mit `restorePurchases()`
- bei Erfolg: `setPremium(true)` im App Context

### 4.6 Purchase Flow (Live)

`purchasePackage()` in `lib/revenuecat.ts`:

1. optional String-ID oder `PurchasesPackage` akzeptiert
2. bei String-ID:
  - aktuelle Offering laden
  - passendes Package suchen
3. `Purchases.purchasePackage(...)`
4. Entitlement gegen `ENTITLEMENT_ID` pruefen
5. strukturierte Rueckgabe:
  - `{ success: true }` bei aktivem Entitlement
  - sonst Fehlertext

Behandelte Fehlercodes:
- `PURCHASE_CANCELLED_ERROR`
- `PRODUCT_ALREADY_PURCHASED_ERROR`

### 4.7 Restore Flow

`restorePurchases()`:
- ruft `Purchases.restorePurchases()`
- prueft Entitlement
- liefert `{ success, hasPremium, customerInfo? }`

Paywall verarbeitet Ergebnis und setzt `setPremium(true)`, falls Premium aktiv.

### 4.8 Entitlement und Premium-Gating in der App

Aktuell genutzte Gating-Punkte:
- Academy/Lesson Pfad: Premium-Lektionen locken und auf Paywall verweisen
- Track-Screen: Advanced Statistics nur fuer Premium
- Profile: Upgrade Entry Point

**Premium-Synchronisierung:**
- Premium-Status wird beim App-Start und Foreground automatisch über RevenueCat synchronisiert
- `checkSubscriptionStatus()` prüft aktive Entitlements gegen RevenueCat
- Premium wird sowohl lokal (AsyncStorage) als auch serverseitig (RevenueCat) verwaltet
- Bei Kauf/Restore: Sofortige lokale Aktualisierung + automatische Background-Sync

### 4.9 Produkt-IDs und Offering-Annahmen

Die Integration verwendet folgende Produkt-IDs (müssen exakt im RevenueCat Dashboard angelegt sein):
- **Monthly**: `savvy_monthly:p1m` - $4.99/month
- **Annual**: `savvy_annual:p1y` - $24.99/year
- **Lifetime**: `savvy_lifetime` - $35.99 one-time

**Google Play API Key:** `goog_IHFQLPCJgsqyVfavgMAiFJfewIA` (wird im RevenueCat Dashboard unter Google Play Store Settings eingetragen, NICHT in der App)

**RevenueCat SDK Keys:** Müssen in `.env` eingetragen werden:
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` - Android SDK Key aus RevenueCat Dashboard
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` - iOS SDK Key aus RevenueCat Dashboard

Entitlement-Name: `Savvy Pro` (konfiguriert über `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID`)

### 4.10 Automatische Premium-Synchronisierung

**Implementierung:** `RevenueCatSync` Component in `app/_layout.tsx`

Premium-Status wird automatisch mit RevenueCat synchronisiert:
1. **Bei App-Start**: `checkSubscriptionStatus()` prüft `customerInfo.entitlements.active["Savvy Pro"]`
2. **Bei Foreground**: Wenn App aus Background zurückkommt, erneute Synchronisation
3. **Nach Kauf/Restore**: Sofortige lokale Aktualisierung + automatische Sync

**Vorteile:**
- Premium bleibt über Geräte hinweg synchronisiert
- Ablauf von Abos wird automatisch erkannt
- Bei Neuinstallation wird Premium wiederhergestellt
- Keine manuelle "Restore Purchases" nötig (läuft automatisch)

## 5. Notifications und Engagement (technisch)

`lib/notifications.ts` implementiert:
- Permission Request inkl. Android Notification Channel
- Scheduling von taeglichem Reminder (`DAILY`)
- optionaler Streak Reminder
- Cancel/Inspect scheduled notifications

Verwendung:
- Onboarding aktiviert Reminder initial (falls Permission erlaubt)
- Profile Screen verwaltet Reminder Toggle und Zeitupdate

## 6. Build- und Deployment-Architektur

`app.json`:
- iOS Bundle ID: `com.rmb.savvy`
- Android Package: `com.rmb.savvy`
- Web Output: `static`
- Plugins: `expo-router`, `expo-notifications`, `@react-native-community/datetimepicker`
- `newArchEnabled: true`
- `experiments.typedRoutes: true`

`eas.json`:
- `development` (internal, dev client)
- `development-simulator` (iOS simulator build)
- `preview` (internal)
- `production`

## 7. Local Development

Basis:
1. `npm install`
2. `npm start`
3. optional:
   - `npm run ios`
   - `npm run android`
   - `npm run web`

RevenueCat lokal:
- Dummy-Mode aktiv lassen fuer UI-Flow Tests
- fuer echte Kaeufe: Dummy deaktivieren und API Keys setzen

## 8. Aktuelle Grenzen und empfohlene naechste Schritte

1. Entitlement Sync haerten
- Beim App-Start `checkSubscriptionStatus()` ausfuehren und `setPremium(...)` serverseitig synchronisieren.

2. Premium Locks vereinheitlichen
- Paywall nennt "Custom calendar categories" als Premium Feature; im Kalender gibt es aktuell keinen harten Lock dafuer.

3. Observability verbessern
- zentrale Logging/Analytics Events fuer Paywall Impression, Purchase Attempt, Purchase Success/Fail, Restore Outcome.

4. Optionales Backend
- fuer Cross-Device Sync, Account-gebundene Historie und serverseitige Business Rules.

---

## Relevante Referenzdateien

- `package.json`
- `app.json`
- `eas.json`
- `app/_layout.tsx`
- `app/index.tsx`
- `app/(tabs)/_layout.tsx`
- `lib/app-context.tsx`
- `constants/storage-keys.ts`
- `lib/revenuecat.ts`
- `app/paywall/index.tsx`
- `data/moms-investment-journey.ts`
- `lib/notifications.ts`
- `REVENUECAT_SETUP.md`
