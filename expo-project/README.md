# AislePlan - iOS Wedding Seating Chart (Expo SDK ~58.0.22)

Minimalist, touch-first iOS mobile application for creating wedding seating floor plans, seating guests at round, square, and rectangular tables, saving layout state to local storage (`AsyncStorage`) as JSON, and generating official venue layout PDFs using `expo-print` & `expo-sharing`.

## Quick Start with Expo SDK 58

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

3. **Run on iOS:**
   - Press `i` to launch in the iOS Simulator (macOS with Xcode).
   - Or scan the QR code with your iPhone camera to open directly in the **Expo Go** app.

## Features
- **Touch-Based Drag & Drop**: Native `PanResponder` physics for repositioning tables around the room.
- **Table Shapes**: Round, Square, and Rectangle (banquet) tables with customizable capacity.
- **Guest Management**: Add people, assign seats, and track dietary requirements (e.g. Vegetarian, Gluten-Free) and VIP status.
- **JSON Local Storage**: Saves seating layout to device storage using `@react-native-async-storage/async-storage`.
- **Venue PDF Export**: One-tap vector PDF generation with `expo-print` and native iOS Share Sheet / AirDrop via `expo-sharing`.
