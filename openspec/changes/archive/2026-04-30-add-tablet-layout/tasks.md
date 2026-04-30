## 1. Layout Detection

- [x] 1.1 Create `src/hooks/useLayout.ts` returning `"phone" | "tablet" | "desktop"` using the thresholds: phone ≤ 600px, tablet = pointer:coarse AND 601–1200px, desktop otherwise. Return `"desktop"` as the SSR default (before the client-side effect runs) to avoid hydration mismatches.
- [x] 1.2 Keep `src/hooks/useIsMobile.ts` as a thin shim (`return useLayout() === "phone"`) so existing callsites continue to compile during migration.
- [x] 1.3 Verify `useLayout` returns `"tablet"` on both portrait and landscape orientations for a simulated tablet viewport, and that rotation does not change the returned value.

## 2. Stable PlayerArea Structure

- [x] 2.1 Refactor `AppShell` so that within the non-empty layout branch, `PlayerArea` is always the first child of a shared flex container, regardless of which layout mode is active.
- [x] 2.2 Confirm that switching between `"phone"`, `"tablet"`, and `"desktop"` values in React DevTools does not cause `PlayerArea` to unmount.

## 3. Tablet Layout

- [x] 3.1 Add `.tablet-layout` and `.tablet-library` CSS classes to `globals.css`: column flex by default (portrait), switching to row with `.tablet-library` fixed at 280px via `@media (orientation: landscape)`.
- [x] 3.2 Add the tablet layout branch in `AppShell`: flex container with `.tablet-layout` class, `PlayerArea` first child, `LibraryPanel` second child with `.tablet-library` class.
- [x] 3.3 Pass `layout="tablet"` (or equivalent) to `LibraryPanel` so it renders without the collapse button and with touch-appropriate row heights.
- [x] 3.4 Add `layout` prop to `PlayerArea` to handle tablet sizing (16:9 full-width in portrait, 16:9 width-driven in landscape), then pass `layout="tablet"` from AppShell.
- [x] 3.5 Remove the `librarySheetOpen` sheet and the "☰ Library" bottom bar from the tablet layout — library is always visible.
- [x] 3.6 Verify listen mode on tablet: activating listen mode shows the audio-only treatment in the player area and the library remains visible without any fixed overlay or layout shift.

## 4. Remove Existing Hacks

- [x] 4.1 Remove the `@media (max-width: 900px) { .main-content { flex-direction: column !important; } }` block from `src/app/globals.css`.

## 5. Update Remaining Consumers

- [x] 5.1 Update any components other than `AppShell` and `PlayerArea` that import `useIsMobile` directly — replace with `useLayout() === "phone"` or the appropriate layout check.
- [x] 5.2 Delete `src/hooks/useIsMobile.ts` once no callsites remain outside of tests.

## 6. Verification

- [x] 6.1 Run `npm run lint`.
- [x] 6.2 Run `npm run typecheck`.
- [x] 6.3 Run `npm run test:unit`.
- [x] 6.4 Run `npm run build`.
- [ ] 6.5 Open the app in a browser, use DevTools to emulate a tablet (e.g. iPad Air, 820×1180): confirm the tablet layout renders with the library visible below the player.
- [ ] 6.6 Rotate the emulated tablet to landscape: confirm the library moves beside the player, the video continues playing without interruption, and no "page couldn't load" error appears.
- [ ] 6.7 Emulate a phone (e.g. iPhone 14, 390×844): confirm the phone layout is unchanged.
- [ ] 6.8 Resize the browser to a desktop width (1280px+): confirm the desktop layout is unchanged.
- [ ] 6.9 Confirm the bottom-left library bug is gone: no 320px orphaned panel at portrait tablet width.
