## Why

Several bugs in the player and library panel degrade core functionality: skip next is silently broken for video items, listen mode is never restored after a page reload, and the UI renders two control bars simultaneously in listen mode. These are regressions against stated product behavior that affect every session.

## What Changes

- **Fix `skipNext` for video items** — currently calls `nextVideo()` (a playlist-only YT API method); must instead advance through the app's queue like `onStateChange: ENDED` already does
- **Restore listen mode on mount** — `settings.listenMode` is persisted but never read back; player always resets to "watch" on page load
- **Remove duplicate controls bar in listen mode** — both the inline now-playing bar and the fixed mini listen bar render simultaneously; the inline bar must be hidden when `isListen` is true
- **Memoize `onItemEnd` in `AppShell`** — the inline arrow function creates a new reference on every render, causing `initPlayer` to rememoize and `window.onYouTubeIframeAPIReady` to be overwritten each render
- **Implement progress bar seek** — the bar has `cursor: pointer` and a click handler that does nothing; `seekTo` exists on the YT player object and just needs to be added to the type declaration and wired up
- **Fix empty state copy in `LibraryPanel`** — "No videos in this channel." appears when a tag filter has no matches; should reference tags, not channels
- **Remove dead `useEffect`** in `PlayerArea` (lines 37–39) — empty no-op with a misleading comment

## Capabilities

### New Capabilities
- `player-skip`: Skip-next correctly advances to the next queued item for all item types

### Modified Capabilities
- `playback`: Listen mode is now fully persistent (restored on mount, correct single control bar); progress bar is seekable

## Impact

- `src/hooks/usePlayer.ts` — `skipNext`, progress/seek, mode initialization
- `src/components/PlayerArea.tsx` — listen mode double-bar, `onYouTubeIframeAPIReady` effect, dead `useEffect`
- `src/components/AppShell.tsx` — memoize `onItemEnd`
- `src/components/LibraryPanel.tsx` — empty state string
