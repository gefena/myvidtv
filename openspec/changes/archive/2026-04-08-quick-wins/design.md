## Context

Three independent, low-risk changes bundled for efficiency. No shared state or cross-cutting concerns between them.

## Goals / Non-Goals

**Goals:**
- Render `lastPosition` as a visual progress bar on each library card
- Instrument the app with Vercel Analytics (page views only)
- Add "focus" as a predefined tag

**Non-Goals:**
- Animated progress bar updates while a video is actively playing (static on card load only)
- Custom analytics events beyond page views
- Any changes to how `lastPosition` is stored or computed

## Decisions

### Progress bar reads `lastPosition` directly from the item

`VideoItem.lastPosition` is already saved every 10s and on pause. The card just computes `lastPosition / duration` — but duration isn't stored. Instead, the player saves position as seconds and marks completion by resetting to 0 when >95% watched (see `updateVideoPosition` in `LibraryContext`).

**Decision**: Store `lastWatchedRatio` (0–1) alongside `lastPosition` on `VideoItem`, computed at save time in `updateVideoPosition`. Cards render this directly without needing duration at display time.

**Alternative considered**: Compute ratio from `lastPosition` alone without duration — not possible since we don't store duration. Fetching duration via oEmbed is not available. So the ratio must be captured at save time.

### Vercel Analytics — `@vercel/analytics/next`

**Decision**: Use the official `@vercel/analytics` package with the Next.js `<Analytics />` component placed in `layout.tsx`. Zero config, works automatically on Vercel.

### "focus" tag — append to PREDEFINED_TAGS

**Decision**: Add `"focus"` at the end of the existing array. No migration needed — existing items keep their tags, new tag just becomes available in the picker.

## Risks / Trade-offs

- **`lastWatchedRatio` requires a data model change**: `VideoItem` gets a new optional field. Existing stored items won't have it (treated as 0 — no bar shown). This is fine.
- **Progress bar only updates when position is saved** (every 10s + on pause), not in real time on the card. Acceptable — the card is a summary view, not a live indicator.
