## Why

Tablets currently receive a broken layout: in portrait they get the desktop layout with a CSS hack (`flex-direction: column`) that leaves the library panel stranded as a 320px-wide block in the bottom-left corner. In landscape they get the phone layout, which crashes the app when rotating mid-playback because `PlayerArea` is unmounted and the YouTube iframe is torn out mid-stream. There is no deliberate tablet design — only two partial workarounds that contradict each other.

## What Changes

- Replace the binary phone/desktop detection with a three-way phone/tablet/desktop split.
- Remove the `@media (max-width: 900px)` CSS hack from `globals.css`.
- Remove the `(pointer: coarse) and (orientation: landscape)` JS workaround from `useIsMobile`.
- Add a `useLayout` hook (replacing `useIsMobile`) returning `"phone" | "tablet" | "desktop"`.
- Add a tablet layout: always-visible library panel, portrait stacks player above library, landscape places library beside player — no sheet, no collapse, no hamburger.
- Keep `PlayerArea` in a stable tree position across all layout modes so the YouTube iframe is never destroyed on orientation change, fixing the playback crash.

## Capabilities

### New Capabilities
- `tablet-layout`: Defines the hybrid tablet layout — always-visible library, orientation-adaptive split, touch-optimized tap targets, stable player across orientations.

### Modified Capabilities
- `mobile-layout`: Detection logic changes — tablets no longer fall into the mobile path. The landscape media query hack is removed. Mobile layout is now phone-only.

## Impact

- `src/hooks/useIsMobile.ts`: deprecated in favour of `src/hooks/useLayout.ts`, kept as a shim during migration then deleted
- `src/app/globals.css`: remove the `@media (max-width: 900px)` block
- `src/components/AppShell.tsx`: three-way layout branch, `PlayerArea` hoisted to stable position
- All components that import `useIsMobile` updated to use `useLayout`
- No changes to product behavior on phone or desktop
- No new dependencies
