## Why

Watching a focused playlist or a single video on repeat is a common use case (studying, background music, ambient content) but the app currently stops cold at the end of every item, breaking the TV-like passive experience the product is designed for.

## What Changes

- Add a **loop toggle** to the player controls (single video loop, tag/queue loop, or off)
- When loop is active for a single video, it restarts automatically on `ENDED`
- When loop is active for a queue (tag), it wraps around from last item back to first
- Loop state persists in `localStorage` settings
- Loop mode is independent of listen mode — works in both watch and listen

## Capabilities

### New Capabilities
- `playback-loop`: Loop controls UI and loop behavior for single-video and queue/tag looping

### Modified Capabilities
- `playback`: `usePlayer` `advanceQueue` logic changes — on ENDED, behavior depends on loop mode (restart vs. advance vs. wrap)

## Impact

- `src/hooks/usePlayer.ts` — `advanceQueue` needs loop-mode awareness; expose loop state and toggle
- `src/components/PlayerArea.tsx` — add loop toggle button to controls
- `src/types/library.ts` — add `loopMode: "off" | "one" | "all"` to `LibrarySettings`
- `src/lib/constants.ts` — add `loopMode: "off"` to `DEFAULT_SETTINGS`
- `openspec/specs/playback/spec.md` — updated behavior on ENDED event
