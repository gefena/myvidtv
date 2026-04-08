## Why

The site's visual foundation is strong in dark mode but several UI issues undermine quality: the logo is invisible in light mode (hardcoded white stroke), the light theme is too harsh (pure white surfaces), action buttons are nearly undiscoverable at 0.3 opacity on desktop, and some button labels are misleading (`×` for archive, `▶` for collapse). Addressing these together elevates the site from functional to genuinely polished.

## What Changes

- **Logo**: Adapt viewport-frame stroke to use a theme-aware color so it renders correctly in both dark and light modes
- **Light theme tokens**: Replace pure white (`#ffffff`) surfaces with a soft violet-tinted off-white; deepen background for better surface layering
- **Card hover elevation**: Add micro-lift animation (translateY + violet glow shadow) to library cards on desktop hover
- **Active card accent bar**: Add a left-side violet accent bar to the currently-playing card for instant visual recognition
- **Action button visibility**: Raise resting opacity from 0.3 → 0.6 on desktop so archive and tag buttons are discoverable without hover
- **Collapse button direction**: Fix `▶` → `◀` (panel is open, arrow should point toward closing direction)
- **Archive action icon**: Replace `×` with `↓` or `⊟` to avoid confusion with delete

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `theming`: Light theme token values changing (surface, bg, surface-2)
- `logo`: Viewport-frame stroke must be theme-adaptive, not hardcoded white

## Impact

- `src/app/globals.css` — light theme token values
- `src/components/Header.tsx` — inline SVG stroke color
- `src/components/LibraryPanel.tsx` — card hover styles, active indicator, button opacity, collapse icon, archive icon
