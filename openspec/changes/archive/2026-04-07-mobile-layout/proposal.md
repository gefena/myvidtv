## Why

The app has no viewport meta tag, meaning all responsive CSS is currently inert on mobile browsers. Beyond that foundational fix, the desktop side-panel layout doesn't translate to mobile — the library panel collapses to near-zero height, touch targets are too small to use, and hover-reveal action buttons are invisible on touch devices. Mobile deserves a purpose-built layout that matches the app's "TV + remote" identity.

## What Changes

- **Add viewport meta tag** — enables responsive rendering on all mobile browsers; without this nothing else works
- **Player-first mobile layout** — on small screens (≤600px), the player takes the top portion at a fixed 16:9 aspect ratio with now-playing controls below; a "Library" peek bar at the bottom opens the library
- **Slide-up library sheet** — on mobile, the library panel becomes a fixed full-width bottom sheet that slides up over the player (AnimatePresence); tapping an item plays it and closes the sheet
- **Nothing-playing state on mobile** — when no item is selected, the library sheet is pre-expanded so the user can browse immediately instead of staring at an empty player
- **Listen mode on mobile** — player hidden, library fills full screen, mini listen bar pinned at bottom with safe-area-inset-bottom padding
- **Touch target fixes** — progress bar gets an invisible hit-area wrapper (44px); playback control buttons get larger padding; library action buttons (archive/restore/delete) always visible at full opacity on mobile, not hover-reveal
- **Safe area insets** — listen bar and library sheet handle padding respect `env(safe-area-inset-bottom)` for iPhone notch/home indicator

## Capabilities

### New Capabilities

- `mobile-layout`: Player-first layout with slide-up library sheet for small screens

### Modified Capabilities

- `playback`: Progress bar and controls require touch-accessible sizing on mobile
- `library-browser`: Library panel becomes a full-width bottom sheet on mobile; action buttons always visible (no hover-reveal)

## Impact

- `src/app/layout.tsx` — add `<meta name="viewport">`
- `src/app/globals.css` — consolidate breakpoints, add safe-area-inset-bottom utilities
- `src/hooks/useIsMobile.ts` — new hook, window resize listener with 600px breakpoint
- `src/components/AppShell.tsx` — mobile layout branch: player + peek bar + library sheet
- `src/components/PlayerArea.tsx` — 16:9 aspect-ratio container on mobile, larger touch targets for controls and progress bar
- `src/components/LibraryPanel.tsx` — remove hardcoded `width: 320px`; action buttons always visible on mobile
- No localStorage shape changes, no new external dependencies
