# Notes App — TODO

## ✅ Complete (All Steps)

### 📦 Step 1: Install Dependencies

- [x] Install expo-sqlite, expo-file-system, async-storage, reanimated, @expo/vector-icons

### 🏗️ Step 2: Types

- [x] `src/types/note.ts` — Note interface & StorageType
- [x] `src/types/css.d.ts` — CSS module declaration

### 💾 Step 3: Storage Services

- [x] `src/services/sqlite-storage.ts` — CRUD, search, import/export, migration
- [x] `src/services/file-storage.ts` — CRUD via expo-file-system v57 class-based API
- [x] `src/services/storage-config.ts` — AsyncStorage get/set storage type
- [x] `src/services/storage-manager.ts` — orchestrator with `syncStorages()`

### 🧩 Step 4: UI Components

- [x] `src/components/themed-text.tsx`
- [x] `src/components/themed-view.tsx`
- [x] `src/components/note-card.tsx` — swipeable with gesture-handler + Reanimated
- [x] `src/components/search-bar.tsx` — debounced search with clear button
- [x] `src/components/empty-state.tsx` — icon + title + subtitle
- [x] `src/components/fab.tsx` — floating "+" button
- [x] `src/components/settings-modal.tsx` — SQLite / Files switch

### 🗺️ Step 5: Routes & Screens

- [x] `src/app/_layout.tsx` — GestureHandlerRootView + Stack
- [x] `src/app/index.tsx` — Home: list + search + FAB + swipe delete + settings modal
- [x] `src/app/create.tsx` — Create/Edit with validation
- [x] Settings handled via modal on Home screen

### 🧪 Step 6: Verify

- [x] `npx tsc --noEmit` — 0 errors
- [x] `crypto.randomUUID` replaced with React Native-compatible UUID
- [x] expo-file-system v57 API migration (class-based `Paths`, `File`, `Directory`)
- [x] `setLayoutAnimationEnabledExperimental` removed (no-op in New Architecture)
- [x] `typedRoutes` disabled to avoid type conflicts
- [x] CSS module side-effect import declaration added (`css.d.ts`)
