## 1. Fix URL classification bug (youtu.be + list param)

- [x] 1.1 In `src/lib/oembed.ts`, update `isPlaylistUrl` to check `hostname === "youtube.com"` before testing for `list` param — so `youtu.be/ID?list=PLx` is no longer classified as a playlist
- [x] 1.2 Verify: paste `https://youtu.be/VIDEO_ID?list=PLxxxx` into AddFlow → should fetch video metadata, not show playlist name step

## 2. Fix desktop EmptyState not restored after archive visit

- [x] 2.1 In `src/components/AppShell.tsx`, change the desktop `LibraryPanel`'s `onViewChange` prop from `setLibraryView` to a wrapper that also calls `setShowArchive(false)` when switching back to `"library"`
- [x] 2.2 Verify: start with empty library → click "view archived items" → click "← Library" in panel header → EmptyState should be displayed

## 3. Fix loop-all wrapping for playlist-channel items

- [x] 3.1 In `src/hooks/usePlayer.ts`, inside `handleEnded`, update the `current.type !== "video"` branch to apply `loop === "all"` wrap-around logic (same pattern as the video branch) before advancing
- [x] 3.2 Verify: queue contains playlist-channels, loop mode is "all", last item ends → first item in queue should begin playing

## 4. Fix import merge double-write

- [x] 4.1 In `src/contexts/LibraryContext.tsx`, restructure the merge import path to compute the merged state inline, call `writeStorage` once, then call `setState` directly — removing the `writeStorage` call from inside the updater function
- [x] 4.2 Verify: merge import still works, `saved` correctly reflects localStorage write success/failure

## 5. Add item field validation on import

- [x] 5.1 In `src/lib/exportImport.ts`, update `sanitizeItems` to drop items that fail structural checks (not an object, missing/invalid `type`, missing required ID field: `ytId` for videos, `ytPlaylistId` for playlists). Items with missing `tags` are NOT dropped — default `tags` to `[]` instead. Invalid items are silently filtered out.
- [x] 5.2 Verify: import a file with one valid and one structurally invalid item → only the valid item appears in the library

## 6. Code quality fixes

- [x] 6.1 In `src/contexts/LibraryContext.tsx`, replace `useLayoutEffect(() => { setTimeout(() => { setState(...) }, 0) }, [])` with a plain `useEffect(() => { setState(...) }, [])` — remove both the `useLayoutEffect` and the `setTimeout` wrapper (`useEffect` is already async, no setTimeout needed). Remove the `useLayoutEffect` import if unused.
- [x] 6.2 In `src/hooks/usePlayer.ts`, replace `setTimeout(() => setProgress(0), 0)` with a direct `setProgress(0)` call
- [x] 6.3 In `src/components/AppShell.tsx`, change the collapsed library tab button icon from `◀` to `▶`
