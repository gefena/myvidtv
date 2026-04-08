## 1. Library accessible in listen mode

- [x] 1.1 Remove `!settings.listenMode` guard from the Library peek button in `AppShell.tsx` so it renders in all modes
- [x] 1.2 Add `paddingBottom` to the Library peek button when in listen mode to push it above the fixed mini bar (~104px + `env(safe-area-inset-bottom)`)

## 2. Tag bar touch targets

- [x] 2.1 Add `minHeight: "44px"`, `alignItems: "flex-end"` to tag bar buttons in `LibraryPanel.tsx` — expands tap area upward while keeping text and underline visually aligned at the bottom

## 3. useIsMobile SSR fix

- [x] 3.1 Replace `useEffect` with `useLayoutEffect` for the initial `check()` call in `useIsMobile.ts` so the correct value is set before first paint
