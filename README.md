# Savvy 🌱

A money-saving and investment education app for busy mums. Built with React Native and Expo.

## Features

- **Daily Saving Tips** - 16 practical money-saving tips across 4 categories
- **Investment Basics** - 8 beginner-friendly lessons on investing
- **Savings Tracker** - Track your daily savings with categories
- **Streak System** - Duolingo-style gamification to build habits
- **Premium Subscriptions** - RevenueCat integration for monetization
- **Daily Reminders** - Notification system to keep users engaged

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router (file-based)
- **Styling**: NativeWind 4.x (Tailwind CSS)
- **State**: React Context + AsyncStorage
- **Payments**: RevenueCat (mock implementation)
- **Animations**: React Native Reanimated

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
savvy/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigator
│   ├── onboarding/        # Onboarding flow
│   ├── tip/               # Tip detail screen
│   ├── lesson/            # Lesson detail screen
│   └── paywall/           # Premium subscription
├── components/            # UI components
│   ├── ui/               # Base components
│   ├── cards/            # Card components
│   ├── celebrations/     # Success animations
│   └── layout/           # Layout helpers
├── data/                  # Static content
│   ├── savings-tips.ts   # 16 saving tips
│   └── investment-lessons.ts  # 8 lessons
├── lib/                   # Utilities
│   ├── app-context.tsx   # Global state
│   ├── notifications.ts  # Push notifications
│   └── sharing.ts        # Share functionality
├── hooks/                 # Custom hooks
└── constants/            # Theme & config
```

## Screens

| Screen | Description |
|--------|-------------|
| Onboarding | 4-step welcome flow (Headspace-inspired) |
| Home | Stats, daily tip, streak, quick actions |
| Save | 16 tips with category filtering |
| Learn | 8 lessons with progress tracking |
| Track | Savings entries with date grouping |
| Profile | Settings, stats, premium status |
| Paywall | Subscription options with trial |

## Design Inspiration

- **Headspace** - Onboarding, content cards
- **Duolingo** - Streak system, lesson path
- **Acorns** - Stats cards, green gradient
- **Monzo** - Tracker, grouped lists

## Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: "#22C55E",    // Empowerment Green
  accent: "#F59E0B",     // Savings Gold
  // ...
}
```

### Content

- Edit `data/savings-tips.ts` for saving tips
- Edit `data/investment-lessons.ts` for lessons

## Premium Setup (Production)

1. Create RevenueCat account
2. Add products in App Store Connect / Google Play Console
3. Replace mock implementation in `lib/revenuecat.ts`

```typescript
import Purchases from 'react-native-purchases';

await Purchases.configure({ apiKey: 'YOUR_API_KEY' });
```

## Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in browser
```

## License

MIT

---

Made with 💚 for mums
