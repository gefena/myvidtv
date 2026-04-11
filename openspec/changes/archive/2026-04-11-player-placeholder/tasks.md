## 1. Update PlayerArea

- [x] 1.1 Add `onPlaceholderClick?: () => void` to `PlayerAreaProps` in `src/components/PlayerArea.tsx`
- [x] 1.2 Replace the placeholder `div` with a conditional: when `onPlaceholderClick` is provided render a `button`, otherwise render a `div` with `pointerEvents: "none"` — both show the logo icon + label
- [x] 1.3 Add the MyVidTV logo SVG (same viewport-frame + violet dot as the header) at ~32px inside the placeholder, with `opacity: 0.35` and `marginBottom: "12px"`
- [x] 1.4 Add hover state to the button variant (desktop only — skip when `isMobile`): `onMouseEnter`/`onMouseLeave` to brighten the icon opacity and add a faint violet glow (`box-shadow` or `filter`)

## 2. Wire up AppShell

- [x] 2.1 In `src/components/AppShell.tsx`, compute the placeholder handler: mobile → `() => setLibrarySheetOpen(true)`; desktop collapsed → `handleCollapseToggle`; desktop open → `undefined`
- [x] 2.2 Pass the handler as `onPlaceholderClick` to each `PlayerArea` usage in `AppShell` — they are in mutually exclusive branches of the `isMobile` ternary, so each gets its own inline handler

## 3. Verify

- [x] 3.1 Mobile: with library closed and nothing playing, tap the player area → library sheet opens
- [x] 3.2 Desktop collapsed: click the placeholder → library expands
- [x] 3.3 Desktop open: placeholder shows but has no pointer cursor and clicking does nothing
- [x] 3.4 Once an item is playing, placeholder is gone — no regression to playback UI
