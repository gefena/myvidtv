## Context

The app currently has a binary phone/desktop model. A CSS rule (`flex-direction: column !important` at `max-width: 900px`) was added to handle tablets in portrait, but it left the library panel at its fixed 320px width, producing a broken bottom-left block with dead space beside it. As a workaround, the `useIsMobile` hook was extended with `(pointer: coarse) and (orientation: landscape)` to push landscape tablets into the phone layout. The result: portrait tablets get a broken desktop layout, landscape tablets get an oversized phone layout, and rotating mid-playback crashes the app because `PlayerArea` is in different tree positions across the two layouts.

## Goals / Non-Goals

**Goals:**
- Three-way layout detection: phone, tablet, desktop.
- A tablet layout that works in both portrait and landscape without switching layouts on rotation.
- Library always visible on tablet — no sheet, no hamburger, no collapse.
- YouTube iframe never destroyed during orientation changes.
- Remove both hacks (CSS `flex-direction` override and JS landscape media query).

**Non-Goals:**
- Change phone or desktop layout behavior.
- Support stylus or keyboard input differently on tablets.
- Add any new playback functionality.
- Handle foldable devices or unusual aspect ratios.

## Decisions

### Replace `useIsMobile` with `useLayout`

Replace the boolean hook with a three-value hook returning `"phone" | "tablet" | "desktop"`.

Detection thresholds:
```
phone:   width ≤ 600px  (any orientation)
tablet:  pointer: coarse  AND  601px ≤ width ≤ 1200px
desktop: everything else
```

The landscape media query (`(pointer: coarse) and (orientation: landscape)`) is removed entirely. A tablet is a tablet in both orientations — the layout adapts internally.

The upper tablet bound of 1200px excludes large touch-enabled Windows laptops, which should get the desktop layout.

Alternative considered: keep `useIsMobile` and add a separate `useIsTablet`. Rejected because two booleans create an ambiguous state (`isMobile=false, isTablet=false` = desktop, but `isMobile=true, isTablet=true` is nonsensical). A single enum is cleaner.

### Keep `PlayerArea` in a stable tree position

The crash on rotation happens because desktop and phone layouts are separate React branches — React unmounts and remounts `PlayerArea` when switching between them, destroying the YouTube iframe.

Fix: all three layouts share the same outer flex container structure, with `PlayerArea` always as the first child:

```
<div style={{ display: "flex", flexDirection: ... }}>  ← direction varies
  <div style={{ ...playerContainerStyle }}>             ← size varies
    <PlayerArea />                                      ← NEVER MOVES
  </div>
  <LibrarySection layout={layout} />                   ← varies
</div>
```

`PlayerArea` stays in the same position in the React tree across all three layouts. Orientation changes only update `flexDirection` and container sizing — the iframe is never touched.

Alternative considered: `React.createPortal` to render `PlayerArea` outside the layout tree. Rejected as unnecessary complexity — structural stability is sufficient.

### Tablet orientation handled by CSS, not JS

In portrait, the tablet layout stacks player above library (column). In landscape, it places library beside the player (row). This orientation switch is handled by a CSS media query on the tablet container, not by JS state:

```css
.tablet-layout {
  flex-direction: column;        /* portrait default */
}
@media (orientation: landscape) {
  .tablet-layout {
    flex-direction: row;
  }
}
.tablet-library {
  width: 100%;                   /* portrait: full width */
}
@media (orientation: landscape) {
  .tablet-library {
    width: 280px;
    flex-shrink: 0;
  }
}
```

Since only CSS changes (no state update, no remount), there is no flicker and the iframe is never disturbed.

Alternative considered: tracking orientation in `useLayout` and returning `"tablet-portrait" | "tablet-landscape"`. Rejected because it adds a JS event listener and state update for something CSS handles natively and more smoothly.

### Tablet library is always visible — no sheet, no collapse

The phone layout uses a bottom sheet because screen space is limited and the library needs to be out of the way during playback. On a tablet (768px+), there is enough room to keep the library always present.

Portrait tablet: player occupies a 16:9 box at full width (~432px tall on a 768px screen), library fills the remaining height (~540px) as a scrollable panel. No sheet, no hamburger button.

Landscape tablet: library is a fixed 280px sidebar beside the player. No collapse toggle.

The library panel header (Add, Export, Import, History, Archive) is the same component used on desktop — no new UI needed.

Alternative considered: keeping the sheet but making it non-modal (always peek visible). Rejected as partial visibility creates ambiguous affordances on a device where there is space for the full panel.

### Listen mode on tablet stays in the same layout

On phone, listen mode overlays a fixed mini-bar at the bottom. On tablet, listen mode does not change the layout — the player area simply shows the audio-only treatment in place. The library remains visible beside or below. This avoids the complexity of a fixed overlay competing with the always-visible library panel.

## Risks / Trade-offs

- [Risk] `useLayout` is a new API — all consumers of `useIsMobile` need updating. → Mitigation: `useIsMobile` can be left as a thin wrapper (`useLayout() === "phone"`) during migration, removed once all callsites are updated.
- [Risk] CSS `orientation: landscape` media query fires on desktop monitors in landscape orientation (which is always). → Mitigation: The `.tablet-layout` class is only applied to the tablet layout branch, so the query only affects tablets.
- [Risk] The 1200px upper tablet bound may exclude some large iPad Pro models (1366px in landscape). → Mitigation: iPad Pro in landscape at 1366px can reasonably use the desktop layout; the desktop layout functions correctly at that width.
- [Risk] Removing the `flex-direction: column !important` CSS hack without a coordinated layout change breaks the current portrait tablet experience. → Mitigation: the CSS and JS changes must ship together in a single deployment.

## Migration Plan

1. Add `useLayout` hook (keep `useIsMobile` as a compatibility shim).
2. Update `AppShell` to use three-way layout with shared `PlayerArea` position.
3. Add tablet layout branch and CSS classes.
4. Remove `@media (max-width: 900px)` CSS hack from `globals.css`.
5. Remove `(pointer: coarse) and (orientation: landscape)` from `useIsMobile` / `useLayout`.
6. Update `PlayerArea` to handle tablet sizing (reuse phone 16:9 logic).
7. Update remaining consumers of `useIsMobile` to use `useLayout`.
8. Delete `useIsMobile` once no callsites remain.

Rollback: revert `AppShell`, `globals.css`, and `useLayout`. The previous hacks can be restored in under a minute since they are small and isolated.
