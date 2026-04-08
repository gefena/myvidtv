## Context

MyVidTV uses CSS custom properties for all theming. Dark mode is the default and is visually strong. Light mode was added later and has issues: pure white surfaces, and logo SVG with hardcoded white stroke that disappears on light backgrounds. The library panel has action buttons intentionally dimmed to 0.3 opacity on desktop (progressive disclosure), but this crosses into undiscoverable. Several icon choices (`×` for archive, `▶` for collapse) carry misleading affordances.

All changes are pure CSS/React — no new dependencies, no data model changes, no API impact.

## Goals / Non-Goals

**Goals:**
- Fix logo stroke to be theme-adaptive
- Soften light theme — off-white surfaces with violet tint instead of pure white
- Add micro-elevation hover to library cards (desktop)
- Add left-side accent bar to active card
- Raise action button resting opacity to a discoverable level
- Fix directional and semantic icon issues

**Non-Goals:**
- Redesigning the layout or navigation structure
- Changing dark theme tokens (already strong)
- Adding new features or interactive states
- Changing mobile behavior (mobile already shows buttons at higher opacity)

## Decisions

### Logo stroke: CSS variable via `currentColor`

**Decision**: Set the viewport-frame `<rect>` stroke to `currentColor` on the SVG element, then apply `color: var(--text-muted)` via an inline style on the `<svg>` tag.

**Why**: The stroke needs to adapt to the theme. `currentColor` inherits from the element's `color` property, which we can set via CSS variable without changing the SVG structure. Alternative was a separate dark/light SVG or a JS theme check — both are heavier.

### Light theme: violet-tinted off-white

**Decision**: Replace `--surface: #ffffff` with `#f7f6ff`, and deepen `--bg` from `#f4f4fa` to `#eeeef8`.

**Why**: Pure white kills the violet-DNA of the brand. A slight violet tint (`f7f6ff`) keeps the surface bright but coherent with the accent. Contrast ratios remain WCAG AA compliant — the tint is subtle (< 5% saturation shift).

### Card hover: translateY + box-shadow

**Decision**: On `mouseEnter`, apply `transform: translateY(-1px)` and `box-shadow: 0 4px 16px rgba(124, 58, 237, 0.12)` alongside the existing background change.

**Why**: Elevation (lift + shadow) communicates interactivity more clearly than background change alone, especially in light mode where the background contrast is low. The shadow uses the violet accent at low opacity — consistent with the brand. `translateY` is GPU-composited and has no layout cost.

### Active card: left accent bar

**Decision**: Add `borderLeft: "3px solid var(--violet)"` to the active card, and compensate with `paddingLeft: "5px"` (from `8px` to `5px`) to prevent content shift.

**Why**: The current active state is a full violet border + `var(--surface-2)` background. The full border is fine but the left-bar pattern (used by Spotify, VS Code) makes "currently selected" instantly scannable in a list. Adding it costs nothing and strengthens the pattern without removing the existing border.

### Action button opacity: 0.3 → 0.55

**Decision**: Raise the desktop resting opacity of archive (`×`/`⊟`) and tag (`# Tags`) buttons from `0.3` to `0.55`.

**Why**: 0.3 is below the threshold where users register that something is there. At 0.55 the buttons are visible as secondary actions without competing with the primary content. Mobile stays at its current higher opacity (already fine).

### Collapse icon: `▶` → `◀`

**Decision**: Change the collapse button text from `▶` to `◀`.

**Why**: The library panel is open and on the right. A right-pointing triangle suggests "expand right" — the opposite of what the button does. Left-pointing `◀` matches the direction of collapse.

### Archive action icon: `×` → `⊟`

**Decision**: Replace `×` with `⊟` (Unicode U+229F, "squared minus").

**Why**: `×` is universally "close/delete". `⊟` reads as "subtract from current view" — closer to the actual archive action semantics. Alternative was text label "Archive" but that's wider than the current icon slot.

## Risks / Trade-offs

- **`⊟` character rendering**: U+229F is in Unicode Mathematical Operators block, supported in all modern browsers but may render differently across OS fonts. → Mitigation: test on Windows/Mac/Linux before shipping. Fallback: use text "↓" if rendering is inconsistent.
- **Light theme contrast**: Tinting surfaces reduces white-on-white shimmer but could affect readability in very bright environments. → Mitigation: keep `--text: #0d0d1a` (unchanged) for strong text contrast.
- **translateY hover on slow machines**: CSS transforms are composited but some older Android devices may stutter. → Non-issue for desktop-targeted feature; mobile hover is disabled.
