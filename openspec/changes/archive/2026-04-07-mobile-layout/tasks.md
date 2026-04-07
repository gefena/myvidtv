## 1. Foundational Fixes

- [x] 1.1 In `src/app/layout.tsx`, add `<meta name="viewport" content="width=device-width, initial-scale=1">` inside `<head>`
- [x] 1.2 In `src/app/globals.css`, consolidate the duplicate `@media (max-width: 600px)` and `@media (max-width: 900px)` rules; add `.safe-bottom { padding-bottom: env(safe-area-inset-bottom) }` utility

## 2. useIsMobile Hook

- [x] 2.1 Create `src/hooks/useIsMobile.ts` — returns `true` when `window.innerWidth <= 600`, defaults to `false` on SSR, updates on resize with a debounced listener

## 3. LibraryPanel — Remove Hardcoded Width

- [x] 3.1 In `src/components/LibraryPanel.tsx`, remove `width: "320px"` from the root div style (width will be controlled by the parent on both desktop and mobile)
- [x] 3.2 Add `isMobile` boolean prop to `LibraryPanel`; pass it down to `LibraryCard`
- [x] 3.3 In `LibraryCard`, when `isMobile` is true: render archive/restore/delete buttons at full opacity with `minHeight: 44px` and `minWidth: 44px`; skip the mouseEnter/mouseLeave hover handlers

## 4. PlayerArea — Touch Targets

- [x] 4.1 In `src/components/PlayerArea.tsx`, call `useIsMobile()` at the top of the component to get the `isMobile` boolean — do not receive it as a prop
- [x] 4.2 Wrap the 2px progress bar div in a touch-target wrapper; when `isMobile`, set `paddingTop: 21px; paddingBottom: 21px` on the wrapper (21+21+2 = 44px); handle the click/seek on the wrapper, not the inner bar
- [x] 4.3 In `ControlBtn`, accept an `isMobile` prop; when true, apply `padding: "12px 16px"` instead of `"4px 8px"` so buttons meet the 44px touch target minimum
- [x] 4.4 Pass `isMobile` from `PlayerArea` down to all `ControlBtn` instances
- [x] 4.5 On mobile, apply the same progress bar touch-target wrapper to the listen mode mini bar progress bar

## 5. Mobile AppShell Layout

- [x] 5.1 In `src/components/AppShell.tsx`, call `useIsMobile()` and store the result
- [x] 5.2 Add `librarySheetOpen` state (boolean, default `false`) to `AppShell`
- [x] 5.3 When `isMobile` is true and `isEmpty` is false, render the mobile layout branch:
  - Player area at top with `aspectRatio: "16/9"` container (not `flex: 1`)
  - Now-playing bar below the player (already part of `PlayerArea`)
  - A Library peek bar at the bottom: full-width button `☰ Library` that sets `librarySheetOpen = true`
- [x] 5.4 When `isMobile && isEmpty`, render the `EmptyState` as normal (no mobile-specific changes needed here)
- [x] 5.5 In `AppShell`, keep the desktop layout branch (sidebar + `motion.div` + collapse logic) unchanged, gated by `!isMobile`

## 6. Library Sheet

- [x] 6.1 In `src/components/AppShell.tsx`, render the mobile library sheet using `AnimatePresence` + `motion.div` with `initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}` and `position: fixed; inset: 0; zIndex: 100; background: var(--surface)`
- [x] 6.2 Add a drag handle bar at the top of the sheet (a centered 40×4px rounded div in `var(--border)`)
- [x] 6.3 Add a close button (×) in the sheet header that sets `librarySheetOpen = false`
- [x] 6.4 Pass `isMobile` to `LibraryPanel` inside the sheet; pass an `onSelect` that calls `setCurrentItem` then `setLibrarySheetOpen(false)` so selecting an item closes the sheet
- [x] 6.5 When no item is playing on mobile (`currentItem === null`), set `librarySheetOpen = true` as the initial state so the library is pre-expanded on first load
- [x] 6.6 Apply `paddingBottom: env(safe-area-inset-bottom)` to the sheet's inner scrollable content area

## 7. Listen Mode — Mobile

- [x] 7.1 In `src/components/AppShell.tsx`, add a `useEffect` that watches `isListen` (passed back from `PlayerArea` or read from `settings.listenMode`) and `isMobile`; when both are true, call `setLibrarySheetOpen(true)` so the library fills the screen automatically when the user switches to listen mode on mobile
- [x] 7.2 In `src/components/PlayerArea.tsx`, on the mini listen bar div, add `paddingBottom: env(safe-area-inset-bottom)` so the bar content clears the iOS home indicator

## 8. Verify

- [x] 8.1 Confirm `npm run build` passes with no TypeScript errors
- [ ] 8.2 Manually verify on a desktop viewport (≥601px) that the sidebar layout, collapse toggle, and all controls behave identically to before this change
