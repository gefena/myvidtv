## Context

The player is built around the YouTube IFrame API loaded dynamically. `usePlayer` manages the YT player instance via refs and exposes controls to `PlayerArea`. State flows: `AppShell` holds `currentItem`, passes it to `PlayerArea` as a prop, and `PlayerArea` syncs it into `usePlayer` via `play()`. Auto-advance on end is handled in `onStateChange` inside `usePlayer`, with the next item found by scanning `queueRef.current`.

Several bugs exist because: (1) `skipNext` uses `nextVideo()` (YT playlist API only), (2) mode state is not initialized from persisted settings, (3) listen mode UI has two simultaneous control bars, (4) `onItemEnd` is not memoized causing cascading rememoization.

## Goals / Non-Goals

**Goals:**
- `skipNext` works identically to `onStateChange: ENDED` advance logic for all item types
- Listen mode state is read from `settings.listenMode` on mount and stays consistent across reloads
- Exactly one control bar visible at a time (inline bar hidden in listen mode, mini bar shown)
- `window.onYouTubeIframeAPIReady` is set at most once after mount, not on every render
- Progress bar click seeks the player to the clicked position
- Empty state copy is contextually accurate

**Non-Goals:**
- Redesigning the player architecture or splitting `usePlayer`
- Adding keyboard shortcuts or other playback controls
- Playlist-level skip behavior (advancing between playlist items is handled by the YT player natively)

## Decisions

### D1: skipNext advances via queue scan, matching onStateChange logic

`skipNext` will find the current item in `queueRef.current` (by ID), take `[idx + 1]`, and call `setCurrentItem(next)`. The `useEffect` that watches `currentItem` then loads it into the player. This matches the exact path `onStateChange: ENDED` already takes — no new code paths.

Alternative considered: call `loadVideoById` / `cuePlaylist` directly in `skipNext`. Rejected: duplicates the loading logic already in the `currentItem` effect.

### D2: Listen mode initialized from settings, passed into usePlayer

`PlayerArea` receives `settings.listenMode` from `useLibrary`. `usePlayer` will accept an optional `initialMode` parameter and use it as the `useState` initial value. No effect or sync needed — initial value is sufficient since mode only changes on explicit user toggle.

Alternative considered: initialize inside `usePlayer` by calling `useLibrary` directly. Rejected: `usePlayer` is a pure playback hook; it should not know about library state.

### D3: Inline now-playing bar hidden in listen mode

Add `!isListen &&` guard to the now-playing bar render condition:
```
{displayItem && !isListen && (...)}
```
The mini listen bar already has its own `{isListen && displayItem && (...)}` guard. No layout changes needed.

### D4: onItemEnd memoized with useCallback in AppShell

Wrap `(next) => setCurrentItem(next)` with `useCallback([], [setCurrentItem])`. Since `setCurrentItem` from `useState` is stable, the callback is created once. This prevents `initPlayer` from rememoizing and `PlayerArea`'s effect from re-running.

### D5: seekTo added to YouTubePlayer type, wired to progress bar click

The local `YouTubePlayer` type declaration in `usePlayer.ts` is missing `seekTo`. Add it: `seekTo: (seconds: number, allowSeekAhead: boolean) => void`. Expose a `seek(ratio: number)` function from `usePlayer` that converts the 0–1 ratio to seconds via `getDuration()`. The progress bar `onClick` in `PlayerArea` calls `seek(ratio)`.

### D6: Empty state copy fixed in place

Single string change in `LibraryPanel.tsx`. No design decision needed.

## Risks / Trade-offs

- **[Risk] `initialMode` prop coupling** — passing `initialMode` into `usePlayer` ties the hook's initial state to the caller. Mitigation: the value is only used as `useState` initial value; it doesn't create ongoing coupling.
- **[Risk] seekTo accuracy** — YT's `seekTo` with `allowSeekAhead: true` fires network requests for live streams. Mitigation: use `allowSeekAhead: false` for VOD-appropriate seeking. Acceptable for this use case.
- **[Risk] onStateChange ENDED vs skipNext divergence** — both paths call `setCurrentItem`. If the auto-advance logic ever changes, both must be updated. Mitigation: extract a shared `advanceQueue()` helper inside `usePlayer`.

## Migration Plan

All changes are local to client-side code with no persistence schema changes. No migration needed. Existing `settings.listenMode` values in localStorage are already being stored correctly — they just weren't being read on mount.
