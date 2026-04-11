## Context

The player area (`PlayerArea.tsx`) currently shows a black background with centered text "Select something to watch" when no item is playing. The text has `pointerEvents: "none"` — it is purely decorative. The placeholder sits inside the YouTube IFrame container div, absolutely positioned over the `#000` background.

The behavior the user needs differs by context:
- **Mobile**: library is hidden behind a sheet; the placeholder area is a large dead zone that could usefully open the sheet
- **Desktop, library collapsed**: library is hidden; placeholder could expand it
- **Desktop, library open**: library is already visible to the right; no action is needed from the placeholder

`PlayerArea` currently has no knowledge of the library panel state or mobile context — it's a self-contained playback component.

## Goals / Non-Goals

**Goals:**
- Make the placeholder interactive where it adds value (mobile, desktop collapsed)
- Improve the visual from plain text to something more fitting the cinematic aesthetic
- Keep the placeholder passive (visual-only) when the library is already visible

**Non-Goals:**
- Auto-playing content on click — too unpredictable
- Showing content suggestions inside the placeholder — out of scope
- Changing any behavior once an item is playing

## Decisions

### Prop-based callback, not internal state

`PlayerArea` gets `onPlaceholderClick?: () => void`. When provided, the placeholder renders as a button (cursor pointer, hover state). When absent, it renders as before (non-interactive).

`AppShell` decides what the callback does — `PlayerArea` stays unaware of library state.

**Alternative considered**: Pass `isMobile` and `collapsed` to `PlayerArea` and let it decide. Rejected — violates separation of concerns; `PlayerArea` shouldn't know about the library panel.

### AppShell wiring

```
Mobile                  → onPlaceholderClick={() => setLibrarySheetOpen(true)}
Desktop, collapsed      → onPlaceholderClick={handleCollapseToggle}
Desktop, open           → onPlaceholderClick={undefined}  (no prop passed)
```

The desktop open case passes no handler, keeping the placeholder passive. No extra rendering logic needed.

### Visual design

Replace the plain text with:
- The MyVidTV logo SVG icon (same as header, ~32px, muted opacity)
- Label: "Select something to watch" (unchanged text, but styled below the icon)
- When interactive (handler provided): pointer cursor, subtle violet glow on hover
- When passive: `pointerEvents: "none"` as today

The icon is inlined as an SVG — no import needed, same markup as the header's SVG.

## Risks / Trade-offs

- [Desktop open case] Passing no handler means the placeholder stays `pointerEvents: "none"`. If the library is open, the user can already see it — no regression.
- [Mobile spacer] On mobile, `PlayerArea` renders a 16:9 box at the top. The placeholder is inside that box, not the spacer below it. On mobile with nothing playing, the 16:9 box collapses to 0 height (listen mode logic), so the placeholder may not be visible at all — the library bar below is the real CTA. The click handler is still wired up for when something has played and the user is in a state where the player box is visible.
