# Finsave — Your Daily Money Companion

> A personal finance companion app built with Expo + React Native

`Built with Expo SDK 51 · React Native · TypeScript`

---

## Screenshots

> Add screenshots of: Home Dashboard, Transactions, Goals, Insights screens
> (Replace these placeholders with actual simulator screenshots before submission)

| Home | Transactions | Goals | Insights |
|------|-------------|-------|---------|
| _screenshot_ | _screenshot_ | _screenshot_ | _screenshot_ |

---

## Features

- **Home Dashboard** — Balance, income and expense summary cards with live data, spending chart by category, recent transactions, savings goal progress at a glance
- **Transaction Tracking** — Add, edit, delete transactions with category, amount, date and notes. Filter by type, search by text, grouped by date
- **Monthly Savings Goal** — Set a savings target, track progress with an animated bar, earn streak badges for consecutive months, celebrate achieving your goal
- **Insights** — Top spending category, week-on-week comparison, 6-month income vs expenses trend, spending breakdown by category, auto-generated insight sentences
- **Profile** — Personalised greeting, editable display name, monthly stats, app preferences
- **Offline First** — All data stored locally in SQLite. Works with zero internet connection
- **Dark Theme** — Premium obsidian dark theme throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 51 + React Native |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based, sibling stack) |
| Database | expo-sqlite v14 (legacy API) |
| State management | Zustand |
| Charts | react-native-gifted-charts |
| Icons | @expo/vector-icons (Ionicons) |
| Date utilities | date-fns |
| Preferences | AsyncStorage |
| Haptics | expo-haptics |
| UI effects | expo-blur (frosted glass tab bar) |

---

## Prerequisites

- Node.js 18 or 22 (**Node 24 not supported** — expo-sqlite breaks on Node 24's strict ESM resolution)
- npm 9+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator (Mac only)
- For Android: Android Studio + Android Emulator

---

## Getting Started

```bash
# 1. Clone the repository
git clone 
cd finsave

# 2. Use correct Node version
nvm use 22  # or: nvm install 22 && nvm use 22

# 3. Install dependencies
npm install

# 4. Run on iOS simulator
npx expo run:ios

# 5. Run on Android emulator
npx expo run:android
```

> **First launch**: The app opens with an empty ledger. To explore with realistic data, open the **Profile** tab and tap **Load demo data**.

---

## Project Structure

finsave/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root stack — DB init, loading gate
│   ├── (tabs)/                 # Tab navigator (5 tabs)
│   │   ├── index.tsx           # Home Dashboard
│   │   ├── transactions.tsx    # Transaction list
│   │   ├── goals.tsx           # Goals screen
│   │   ├── insights.tsx        # Insights screen
│   │   └── profile.tsx         # Profile screen
│   └── transaction/
│       ├── add.tsx             # Add transaction (modal)
│       └── [id].tsx            # Edit transaction (push)
├── src/
│   ├── db/
│   │   ├── database.ts         # SQLite connection + migrations
│   │   └── queries.ts          # All SQL queries (single source of truth)
│   ├── stores/                 # Zustand state stores
│   ├── hooks/                  # Business logic hooks
│   ├── components/             # Reusable UI components
│   ├── utils/                  # Helpers (formatting, categories, seed)
│   └── theme/                  # Colors, typography, spacing tokens
└── assets/                     # App icon and splash screen

---

## Design Decisions & Assumptions

1. **SQLite legacy API over async API** — expo-sqlite v14's new async API uses ESM imports that break on Node 22+ during Expo CLI startup. The legacy API (`expo-sqlite/legacy`) is stable, ships in the same package, and works on any Node version.

2. **expo-sqlite removed from app.json plugins** — the config plugin loads the main ESM entry point which throws `ERR_MODULE_NOT_FOUND` on Node 22+. Native autolinking via `expo-module.config.json` handles linking without the plugin entry.

3. **Sibling-stack navigation** — `app/transaction/` sits beside `app/(tabs)/` in the root Stack rather than nested inside tabs. This makes the tab bar automatically absent on add/edit screens without `tabBarStyle: { display: 'none' }` hacks.

4. **Demo data via Profile** — rather than seeding automatically on first launch, the app starts with an empty ledger so new users are not confused by unfamiliar data. A "Load demo data" button in the Profile tab populates the app with realistic transactions and a savings goal for evaluation and exploration purposes.

5. **Dark-only theme** — a single premium Obsidian dark palette was chosen over a light/dark toggle. This gives a more cohesive aesthetic and avoids the complexity of theming every component twice within the time constraint.

6. **Goal streak from DB records** — the streak counter counts consecutive months going backwards from the current month where a goal record exists in SQLite. This is a lightweight habit-tracking signal without extra infrastructure.

7. **Offline-first by design** — no network requests are made anywhere in the app. All data is local SQLite + AsyncStorage. Works in any network condition.

---

## Replacing the App Icon

The current icon was generated at [icon.kitchen](https://icon.kitchen):
- Text: **F**, Font: Poppins Bold, Background: `#090909`, Text color: `#7C6EFA`, Shape: Squircle

To replace:
1. Go to [icon.kitchen](https://icon.kitchen) and design your icon
2. Download the zip and extract
3. Copy `ios/AppIcon@3x.png` → `assets/images/icon.png`
4. Copy `android/res/mipmap-xxxhdpi/ic_launcher.png` → `assets/images/adaptive-icon.png`
5. Run `npx expo prebuild --clean && npx expo run:ios`

---

## Known Limitations & Future Work

**Current limitations:**
- Node 24 is not supported due to expo-sqlite ESM resolution issue (use Node 18 or 22)
- The 6-month trend chart only shows meaningful data for months with existing transactions
- No data export functionality

**What would be added with more time:**
- Push notifications for daily transaction reminders
- Data export to CSV
- Biometric lock (Face ID / fingerprint)
- Multi-currency support with live exchange rates
- Recurring transaction templates
- Budget limits per category with alerts
- Light mode theme
- Cloud sync via Supabase or Firebase
