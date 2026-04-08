## Why

Three small independent improvements that add polish and usefulness with minimal effort: video watch-progress visibility, analytics instrumentation, and an additional content category.

## What Changes

- **Video card progress bar** — each library card renders a thin bar showing how much of the video has been watched, using the `lastPosition` already saved in state
- **Vercel Analytics** — add `@vercel/analytics` to track page views; one component in `layout.tsx`, no config needed
- **"Focus" predefined tag** — add `focus` to `PREDEFINED_TAGS` in `constants.ts`

## Capabilities

### New Capabilities
- `card-progress`: Visual watch-progress bar on library cards

### Modified Capabilities
- `library-browser`: Cards now display a progress bar (new visual element on existing cards)

## Impact

- `src/components/LibraryPanel.tsx` — render progress bar in `LibraryCard` using `item.lastPosition`
- `src/app/layout.tsx` — add `<Analytics />` from `@vercel/analytics/next`
- `src/lib/constants.ts` — add `"focus"` to `PREDEFINED_TAGS`
- `package.json` — add `@vercel/analytics` dependency
