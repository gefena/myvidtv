## Context

MyTV has a default Next.js `favicon.ico` in `src/app/`. Next.js App Router automatically serves any `icon.svg`, `icon.png`, or `apple-icon.png` placed in the `app/` directory as the browser tab icon and Apple touch icon respectively — no `<link>` tags required. The icon needs to be legible at 16×16px (browser tab) and look good at 180×180px (iOS bookmark).

## Goals / Non-Goals

**Goals:**
- Replace the default favicon with a branded MyTV icon
- Cover the browser tab (SVG) and iOS bookmark (PNG) cases
- Keep the implementation fully self-contained — no external icon fonts or services

**Non-Goals:**
- Animated icons
- Multiple color scheme variants (dark/light favicon)
- PWA manifest or maskable icons (separate concern)

## Decisions

**Decision: SVG for the tab icon**
Next.js serves `app/icon.svg` as `<link rel="icon" type="image/svg+xml">`. SVGs are resolution-independent and render crisply at all DPI levels. Alternative (PNG) requires generating multiple sizes; SVG handles all of them automatically.

**Decision: violet play triangle on dark rounded square**
The shape is the universal "player" metaphor, matching the app's purpose. The dark background (`#0a0a0f`) matches `var(--bg)`. The violet (`#7c3aed`) matches `var(--violet)`. The rounded square (rx=20 on a 100×100 viewBox) reads as a modern app icon at small sizes without fine detail that degrades at 16px.

SVG structure:
```
viewBox="0 0 100 100"
  rect x=0 y=0 w=100 h=100 rx=20 fill=#0a0a0f   ← dark rounded square
  polygon points="38,28 38,72 72,50"  fill=#7c3aed ← centered play triangle
```

**Decision: apple-icon as a generated PNG, not a second SVG**
`app/apple-icon.png` must be a raster PNG (180×180). It's the same design as the SVG, produced once. Since there's no build-time image pipeline in this project, the PNG is created manually from the SVG and committed as a static asset.

**Decision: remove favicon.ico**
The default `favicon.ico` takes precedence in some browsers if present alongside SVG. Removing it ensures the branded SVG is always used.

## Risks / Trade-offs

- [Safari SVG favicon support] Safari added SVG favicon support in v15 (2021). Older Safari falls back to the apple-icon PNG on iOS and shows no icon on desktop — acceptable.
- [PNG generation] The apple-icon.png needs to be generated externally (browser, Inkscape, etc.) and committed. If the icon changes in the future, the PNG must be manually regenerated.

## Open Questions

_(none)_
