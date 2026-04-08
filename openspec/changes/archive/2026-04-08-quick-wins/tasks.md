## 1. Data Model

- [x] 1.1 Add `lastWatchedRatio?: number` to `VideoItem` in `src/types/library.ts`
- [x] 1.2 Update `updateVideoPosition` in `LibraryContext.tsx` to compute and save `lastWatchedRatio` alongside `lastPosition`

## 2. Card Progress Bar

- [x] 2.1 Render a thin progress bar at the bottom of `LibraryCard` in `LibraryPanel.tsx` for `VideoItem` cards where `lastWatchedRatio > 0`
- [x] 2.2 Style bar using `var(--violet)` fill on `var(--border)` track, 2px height, full card width

## 3. Focus Tag

- [x] 3.1 Add `"focus"` to `PREDEFINED_TAGS` in `src/lib/constants.ts`

## 4. Vercel Analytics

- [x] 4.1 Install `@vercel/analytics` package
- [x] 4.2 Add `<Analytics />` from `@vercel/analytics/next` to `src/app/layout.tsx`
