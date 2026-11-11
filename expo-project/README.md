# PlanWithArchie - iOS Wedding Seating Chart (Expo SDK ~58.0.22)

Minimalist, touch-first iOS mobile application for creating wedding seating floor plans, seating guests at round, square, and rectangular tables, saving layout state to local storage (`AsyncStorage`) as JSON, and generating official venue layout PDFs using `expo-print` & `expo-sharing`.

## Setup & Run Instructions

1. **Install and Align Dependencies for Expo SDK 58:**
   ```bash
   npm install
   npx expo install --fix
   ```
   *(Note: Expo SDK 58 pairs with `react-native@0.88.0` and `react@19.0.0`)*

2. **Start Expo with Cleared Cache:**
   ```bash
   npx expo start -c
   ```

3. **Run on iOS:**
   - Press `i` to launch in the iOS Simulator (macOS with Xcode).
   - Or scan the QR code with your iPhone camera to open directly in the **Expo Go** app.

## Troubleshooting
If you see `Unable to resolve module react-native/unstable-internals-do-not-use`, it indicates that `react-native` was installed with an older version (< 0.88). Simply run:
```bash
npx expo install --fix
npx expo start -c
```
This aligns all dependencies with Expo SDK 58.0.22.
