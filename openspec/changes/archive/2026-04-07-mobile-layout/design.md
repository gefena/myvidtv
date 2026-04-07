## Context

The app currently has no `<meta name="viewport">` tag, which means mobile browsers render at ~980px and scale the entire page down — all existing responsive CSS is dead code. When the viewport is fixed, a second layer of problems appears: `LibraryPanel` has a hardcoded `width: 320px` and `height: 100%`, the Framer Motion sidebar animates to `width: 320` (not full-width), and the player uses `flex: 1` which gives it undefined height in a column-flex layout. Touch targets throughout are below the 44px minimum. Hover-reveal action buttons are invisible on touch.

The fix is two-phased: (1) foundational corrections (viewport, geometry, touch targets) and (2) a purpose-built mobile layout that fits the TV-remote metaphor.

## Goals / Non-Goals

**Goals:**
- Mobile browsers render the app at device width
- On small screens (≤600px), a player-first layout with a slide-up library sheet
- Touch targets ≥44px for all interactive elements on mobile
- Library action buttons always visible on mobile (no hover-reveal)
- Safe area insets on iOS
- Desktop layout is completely unchanged

**Non-Goals:**
- Drag-to-dismiss gesture on the library sheet (v1: tap to open/close)
- Tablet-specific layout (the 900px column layout already handles this adequately)
- Native app features (pull-to-refresh, haptics, etc.)

## Decisions

### Mobile detection: JS hook + CSS breakpoint, not CSS-only

**Chosen:** A `useIsMobile` hook (`window.innerWidth ≤ 600`, with a resize listener) that returns a boolean. `AppShell` uses this to render a different JSX branch for mobile vs desktop.

**Why not CSS-only:** The mobile layout isn't just a style variation — it's a structurally different component tree (library sheet vs sidebar, different player container, different control sizing). CSS can't conditionally render JSX branches; trying to do so with `display: none` would mean rendering both trees simultaneously, which means two YouTube IFrame players, two `usePlayer` hook instances, and doubled event listeners.

**Why not `useMediaQuery` from a library:** framer-motion is already in the project but has no such hook. Adding a dependency for this is unnecessary — the hook is five lines.

**SSR note:** `window` is not available during Next.js SSR. The hook must default to `false` (desktop) on the server, then correct on the client. This is fine — the app is fully client-rendered after hydration and `hydrated` already gates rendering in `AppShell`.

### Mobile layout: player-first with slide-up library sheet

**Chosen:** Player + now-playing controls occupy the top of the screen. A "Library" tap target sits at the bottom. Tapping it slides up a `position: fixed` full-screen sheet containing the library. Tapping an item plays it and closes the sheet.

```
Watch state                 Library sheet open
┌─────────────────────┐    ┌─────────────────────┐
│ ▶ MY TV        [+]  │    │   ────              │ ← handle
├─────────────────────┤    │ Library        [×]  │
│                     │    │ [all][music][tech]  │
│   YouTube Player    │    ├─────────────────────┤
│   (16:9)            │    │ [card]              │
│                     │    │ [card]              │
├─────────────────────┤    │ [card]              │
│ progress            │    │  scrollable...      │
│ [thumb] title ⏸⏭♪  │    ├─────────────────────┤
├─────────────────────┤    │ ♪ title  ⏸ ⏭       │ ← if playing
│  ☰  Library         │    └─────────────────────┘
└─────────────────────┘
```

**Why not bottom tabs:** Switching to a library tab loses the visual continuity of the player — no sense that something is still playing. The sheet model keeps the player visible (or implied) and matches the TV-remote metaphor better.

**Why not mini player while browsing (Spotify model):** The YouTube IFrame can't be resized without disrupting playback. Shrinking it to a mini thumbnail would require destroying and recreating the player, losing position. Out of scope.

### Nothing-playing state on mobile

When no item is playing, show the library sheet pre-expanded (without animation) so the user can browse immediately. The player area shows a compact "No signal" placeholder above the sheet. This avoids an awkward empty screen on first load.

### Player container: aspect-ratio: 16/9 on mobile

**Chosen:** On mobile, the player container uses `aspectRatio: "16/9"` with `width: 100%` instead of `flex: 1`. This gives the player a defined, proportional height tied to screen width.

**Why:** `flex: 1` in a column-flex layout with `overflow: hidden` on the parent gives the player undefined height — it could be zero if siblings also want height. `aspect-ratio` is explicit and correct.

**Desktop unchanged:** Desktop keeps `flex: 1` (fills remaining space next to the library panel).

### Library sheet: Framer Motion AnimatePresence, no drag

**Chosen:** `position: fixed; inset: 0` sheet that animates `y` from `100%` to `0` via `AnimatePresence`. A close button (×) and the Library peek bar dismiss it. No drag gesture.

**Why no drag:** Drag-to-dismiss requires careful handling of scroll vs drag conflicts inside the sheet (the library list is scrollable). Getting this right is non-trivial. The tap-to-open/close pattern is sufficient and robust for v1.

**Implementation:** The sheet renders in a React portal or as a sibling to the main content in `AppShell` — it needs to sit above the player (z-index), so a portal to `document.body` avoids stacking context issues.

### Touch targets: invisible padding wrapper on progress bar

**Chosen:** Wrap the 2px progress bar `<div>` in a container with `paddingTop: 10px; paddingBottom: 10px; cursor: pointer` and handle the click on the wrapper. The visual bar stays 2px; the hit area becomes 22px. On mobile this is extended further to `paddingTop: 21px; paddingBottom: 21px` for a 44px effective target (21+21+2).

**Why:** Changing the visual height of the progress bar would alter the design. Invisible padding is the standard pattern for small-touch-target elements (see iOS HIG).

### Library action buttons: always visible on mobile

**Chosen:** On mobile, the archive/restore/delete buttons in `LibraryCard` render at full opacity and a slightly larger size, always visible. The hover-reveal pattern (`opacity: 0.3`, mouseEnter to show) stays on desktop only.

**How:** The `LibraryCard` component receives an `isMobile` boolean prop (passed from `LibraryPanel`). When true, buttons skip the hover styles and render visibly.

## Risks / Trade-offs

- **`useIsMobile` SSR default of `false`:** On very slow connections, users on mobile might see a flash of the desktop layout before hydration corrects it. Mitigated by `AppShell`'s existing `if (!hydrated) return null` — nothing renders until hydrated, so the flash window is already gated.

- **Fixed-position sheet and iOS Safari bottom bar:** `position: fixed; bottom: 0` elements overlap iOS Safari's browser chrome. Mitigated by `padding-bottom: env(safe-area-inset-bottom)` on the sheet's inner content and the listen bar.

- **Library sheet z-index:** The sheet must sit above the YouTube IFrame. YouTube iframes use `position: relative` inside their container, but can use `allowFullscreen` which creates a new stacking context. Setting `z-index: 100` on the sheet should be sufficient; the player iframe is not fullscreen during normal use.
