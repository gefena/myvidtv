## Context

The mark must work in two contexts:
1. **Header** — 24–28px tall, beside the wordmark, on `var(--surface)` background
2. **Favicon** — 16×16 and 32×32, on dark background

Both require extreme simplicity. The current emoji `▶` works as a placeholder but has no brand identity and renders differently across OS/browsers.

## Goals / Non-Goals

**Goals:**
- A distinctive, proprietary SVG mark for header and favicon
- Two-tone wordmark: "MyVid" normal + "TV" violet
- Consistent rendering across browsers and OS

**Non-Goals:**
- Light-mode favicon variant (dark background assumed for favicon)
- Animated logo
- Multiple logo lockup variants (horizontal only for now)

## Decisions

### The mark: rounded rect + offset circle

**SVG spec (24×24 viewBox):**

```svg
<!-- Frame: rounded rect, thin stroke, white at 80% opacity -->
<rect x="1.5" y="1.5" width="21" height="21" rx="5" ry="5"
      fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5"/>

<!-- Signal dot: solid violet circle, offset lower-left -->
<circle cx="8" cy="16" r="3.5" fill="#8b5cf6"/>
```

The circle at `cx=8, cy=16` places it in the lower-left quadrant — intentionally off-center, which feels crafted rather than mechanical.

**Favicon (100×100 viewBox for `icon.svg`):**

```svg
<rect width="100" height="100" rx="18" fill="#0a0a0f"/>
<!-- Inner frame -->
<rect x="10" y="10" width="80" height="80" rx="12"
      fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="5"/>
<!-- Signal dot -->
<circle cx="35" cy="68" r="14" fill="#8b5cf6"/>
```

### Wordmark: inline styled spans

**Decision**: Keep the wordmark as HTML text (not SVG path) so it inherits the app's font (Geist), responds to theme, and scales naturally. Two `<span>` elements:

```tsx
<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>MyVid</span>
<span style={{ color: "var(--violet)", fontWeight: 600 }}>TV</span>
```

**Alternative considered**: A single `<span>` with mixed styling via `<b>` tags. Rejected — explicit spans are cleaner and more maintainable.

### Violet color value

Use `#8b5cf6` (hardcoded) in SVG files rather than `var(--violet)` — CSS variables don't work in `icon.svg` served as a static file. In `Header.tsx` the inline SVG can use `currentColor` or hardcoded hex since it sits inside the React component.

## Risks / Trade-offs

- **Light mode**: The mark uses `rgba(255,255,255,0.8)` for the frame stroke — this looks great on dark but washes out on light. For now the header background is always `var(--surface)` which is dark-toned even in light mode (not pure white), so acceptable. Can be revisited.
- **Favicon**: `icon.svg` is a static file, cannot use CSS variables. Hardcoded dark background is intentional.
