## Why

Several real bugs were identified in a code review that cause incorrect behavior in normal use: shared YouTube URLs with playlist context silently error, the desktop empty-state is unreachable after visiting the archive, and loop-all mode silently breaks for playlist-channel items. Smaller code quality issues (double writes, missing validation, stale patterns) also surfaced.

## What Changes

- Fix `isPlaylistUrl` to not misclassify `youtu.be/ID?list=PLxxx` URLs as playlists — these are video links with playlist context
- Fix `AppShell` so returning from archive view on desktop resets `showArchive`, restoring the EmptyState when the library is actually empty
- Fix `handleEnded` in `usePlayer` to respect loop-all wrapping for playlist-channel items
- Fix import merge to avoid writing localStorage twice
- Add basic field validation on imported items to prevent malformed data from entering the library
- Replace `useLayoutEffect` + `setTimeout(0)` with plain `useEffect` in `LibraryContext`
- Remove unnecessary `setTimeout` around `setProgress(0)` in `usePlayer`
- Fix collapsed library tab icon from `◀` to `▶` (expand direction)

## Capabilities

### New Capabilities
<!-- None — these are all bug fixes to existing capabilities -->

### Modified Capabilities
- `playlist-add-flow`: URL parsing now correctly handles `youtu.be?list=` as a video, not a playlist
- `library-archive`: Returning from archive to empty library on desktop now shows EmptyState
- `playback-loop`: loop-all wrapping now applies to playlist-channel items, not only videos
- `library-export-import`: Merge import no longer double-writes; imported items are validated for required fields

## Impact

- `src/lib/oembed.ts` — `isPlaylistUrl` logic
- `src/components/AppShell.tsx` — `onViewChange` for desktop LibraryPanel
- `src/hooks/usePlayer.ts` — `handleEnded`, progress reset
- `src/contexts/LibraryContext.tsx` — `useLayoutEffect` → `useEffect`, merge import write
- `src/lib/exportImport.ts` — item field validation in `sanitizeItems`
