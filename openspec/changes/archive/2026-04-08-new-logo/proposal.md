## Why

The current logo is a generic play triangle — a placeholder that could belong to any media app. MyVidTV deserves a mark that expresses its specific identity: personal, cinematic, dark-premium. A well-crafted logo builds trust and makes the app feel intentional rather than prototyped.

## Design Direction

**Concept: "The Viewport"**

A mark built around two ideas: the *screen* (your personal TV) and the *signal* (your curated content). 

The mark is a rounded square — a modern video viewport/frame — with a small filled circle offset inside it toward the lower-left. The circle is violet. The frame is a thin white stroke. Together they read as: *a screen with something on it. Your thing.*

```
 ┌──────────┐
 │          │
 │          │
 │  ●       │   ← violet dot = your content, your signal
 └──────────┘
     frame = screen / viewport
```

Why this works:
- **Instantly readable at 16px** (favicon) — two geometric shapes, no detail to lose
- **Not a play button** — every media app uses a triangle. This is distinctive.
- **The dot is personal** — a single point of focus. It's *your* channel.
- **Cinematic proportions** — the frame echoes a letterbox/widescreen ratio
- **Scales to the wordmark** — sits cleanly beside "MyVidTV" in the header

**Wordmark treatment:**
- "My" — light weight, `var(--text-muted)` — recedes slightly
- "Vid" — medium weight, `var(--text)` — the content
- "TV" — semibold, `var(--violet)` — the destination, the accent

The two-tone wordmark mirrors the mark's two-element composition.

## What Changes

- Replace `▶` emoji with an inline SVG mark in `Header.tsx`
- Update the wordmark rendering to use the two-tone "MyVid**TV**" treatment
- Update `src/app/icon.svg` (favicon) with the new mark
- Update `src/app/apple-icon.png` generation if applicable

## Capabilities

### New Capabilities
- `logo`: The MyVidTV brand mark and wordmark system

### Modified Capabilities
_(none — header layout unchanged, only the mark content changes)_

## Impact

- `src/components/Header.tsx` — replace emoji + plain text with SVG mark + two-tone wordmark
- `src/app/icon.svg` — new viewport mark as favicon
