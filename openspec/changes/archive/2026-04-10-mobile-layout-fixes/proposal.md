## Why

When viewing the site on a mobile device, changing the device orientation from portrait to landscape triggers the desktop layout because the device's `innerWidth` exceeds the hardcoded 600px mobile breakpoint. This causes the React component tree to shift radically, forcing the YouTube iframe to unmount and remount, which destroys the player instance and stops playback abruptly. Additionally, the use of `100vh` on the root container causes the UI to jump or hide behind the browser's dynamic chrome (address bar) when scrolling or rotating.

## What Changes

- Modify `useIsMobile` to include touch capability (`pointer: coarse`) in its heuristic, ensuring rotated mobile devices remain in the mobile layout regardless of width.
- Replace instances of `100vh` with `100dvh` (Dynamic Viewport Height) in `AppShell.tsx` and anywhere else it is used to prevent the layout from jumping or getting trapped under browser navigation bars.
- Ensure the mobile sheet layout stays persistent across device rotations without forcing an iframe remount.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mobile-layout`: Mobile devices must stay in the mobile layout even in landscape orientation to prevent iframe destruction, and the viewport height must respect dynamic browser chrome.

## Impact

- `src/hooks/useIsMobile.ts` — Updated breakpoint logic.
- `src/components/AppShell.tsx` — Viewport height CSS string updates (`100vh` to `100dvh`).
- Playback continuity on mobile devices during rotation.