## Context

Desktop icon-only buttons (↺, ⊟, ♪, ↺1, ↺∞) have `aria-label` for accessibility but no visible hint for sighted users. Export/Import already use the native `title` attribute, which gives browser-native tooltips — but those are OS-styled and don't match the app's dark theme. A custom tooltip component consistent with the visual design is the right solution.

Current button inventory needing tooltips:
- `ControlBtn` in PlayerArea: Play/Pause, Skip, Loop (↺/↺1/↺∞), Listen/Watch (♪/👁)
- Card actions in LibraryPanel: Archive (⊟), Restore (↺), Delete (🗑), Tags (# Tags)
- Panel header: Collapse (◀), Archive view toggle

## Goals / Non-Goals

**Goals:**
- Themed tooltip bubble on hover for all desktop icon buttons
- Dynamic text for state-driven buttons (loop mode shows current→next, play/pause reflects state)
- Zero behaviour on mobile (isMobile guard)
- No external dependencies

**Non-Goals:**
- Tooltips on text-label buttons (+ Add, Save, Cancel, Replace library, etc.)
- Touch/mobile tooltip support
- Rich tooltip content (no icons, no multi-line descriptions)

## Decisions

**Inline `position: relative` wrapper + `position: absolute` bubble via React state.**

Each button gets a wrapping `<div style={{ position: "relative" }}>` with `onMouseEnter`/`onMouseLeave` controlling a `showTooltip` boolean. The bubble is `position: absolute; bottom: calc(100% + 6px)` centered above the button. This avoids portals, z-index battles, and complex positioning logic.

*Alternative: native `title` everywhere* — rejected because it can't be themed, has a 1s OS-controlled delay, and looks out of place in a polished dark UI.

*Alternative: CSS-only `:hover + ::after` pseudo-element* — rejected because pseudo-elements can't read React state (e.g. dynamic loop label). Would require `data-tooltip` attributes and CSS `content: attr(data-tooltip)`, which works but is harder to type-check and read.

*Alternative: a portal-based tooltip* — overkill; overflow clipping is not an issue in this layout since all buttons are within scrollable containers with sufficient space above them.

**`ControlBtn` extended, not wrapped.**
`ControlBtn` already exists in `PlayerArea.tsx`. Adding an optional `tooltip` prop there (defaulting to `label`) avoids a new wrapper at every call site.

**`LibraryPanel` card actions use a local `TooltipBtn` wrapper.**
Card action buttons don't share a common component today, so a small local wrapper (or inline tooltip div) is used rather than a shared component. Keeps the change scoped.

## Risks / Trade-offs

- [Tooltip clipped by `overflow: hidden` on parent] → Panel items list has `overflow-y: auto` but not `overflow: hidden` horizontally; player area has room above. Low risk in practice; if clipping occurs, `bottom` can be swapped for `top`.
- [Tooltip flickers on fast mouse movement] → `onMouseLeave` on the wrapper div handles this; the tooltip div itself is `pointerEvents: none` so it doesn't interfere.
