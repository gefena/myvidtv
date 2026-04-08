## 1. Data Model

- [x] 1.1 Add `loopMode: "off" | "one" | "all"` to `LibrarySettings` in `src/types/library.ts`
- [x] 1.2 Add `loopMode: "off"` to `DEFAULT_SETTINGS` in `src/lib/constants.ts`

## 2. Player Hook

- [x] 2.1 Accept `initialLoopMode` param in `usePlayer` and initialize state from it
- [x] 2.2 Add `loopModeRef` (kept in sync with state) to avoid stale closures in `onStateChange`
- [x] 2.3 Refactor `advanceQueue` → `handleEnded`: branch on `loopMode` — restart if `one`, wrap if `all` and at last item, else advance as before
- [x] 2.4 Add `toggleLoop` function that cycles `off → one → all → off`; call `updateSettings({ loopMode })` from `useLibrary` to persist (requires importing `useLibrary` into `usePlayer`)
- [x] 2.5 Expose `loopMode` and `toggleLoop` from `usePlayer` return value

## 3. Player UI

- [x] 3.1 Add loop toggle button to `PlayerArea` controls (after skip button)
- [x] 3.2 Button label/icon reflects mode: dimmed `↺` (off), `↺ 1` (one), `↺ ∞` (all)
- [x] 3.3 Ensure button has 44px touch target on mobile (consistent with existing control buttons)

## 4. Wiring

- [x] 4.1 Pass `settings.loopMode` as `initialLoopMode` to `usePlayer` in `AppShell`
- [x] 4.2 Connect `toggleLoop` from `usePlayer` to the loop button in `PlayerArea`
