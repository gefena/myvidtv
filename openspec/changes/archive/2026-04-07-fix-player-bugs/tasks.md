## 1. usePlayer hook fixes

- [x] 1.1 Add `seekTo` to the `YouTubePlayer` type declaration in `usePlayer.ts`
- [x] 1.2 Extract shared `advanceQueue()` helper inside `usePlayer` that finds the next item in `queueRef.current` by current item ID and calls `setCurrentItem(next)`
- [x] 1.3 Replace `skipNext` implementation to call `advanceQueue()` for video items (keep `nextVideo()` for playlist-channels)
- [x] 1.4 Update `onStateChange: ENDED` handler to call `advanceQueue()` instead of inlining the advance logic
- [x] 1.5 Add `initialMode` parameter to `usePlayer` (type `PlayerMode`, default `"watch"`) and use it as the `useState` initial value for `mode`
- [x] 1.6 Expose `seek(ratio: number)` from `usePlayer` that calls `playerRef.current?.seekTo(ratio * getDuration(), false)`

## 2. PlayerArea component fixes

- [x] 2.1 Delete the empty no-op `useEffect` (lines 37–39)
- [x] 2.2 Pass `settings.listenMode ? "listen" : "watch"` as `initialMode` to `usePlayer`
- [x] 2.3 Add `!isListen &&` guard to the inline now-playing bar render (`{displayItem && !isListen && (...)}`)
- [x] 2.4 Wire `seek` from `usePlayer` into the progress bar `onClick` handler (compute ratio from click position)
- [x] 2.5 Remove `cursor: "pointer"` from the progress bar wrapper if seek is not implemented, or keep it once seek is wired (per 2.4)

## 3. AppShell fix

- [x] 3.1 Wrap `onItemEnd` arrow function in `useCallback` with `[setCurrentItem]` dependency

## 4. LibraryPanel copy fix

- [x] 4.1 Change \"No videos in this channel.\" to \"No items with this tag.\"

## 5. Verification

- [x] 5.1 Confirm skip-next advances to next video item in queue (not just YT playlist navigation)
- [x] 5.2 Confirm listen mode persists after page reload
- [x] 5.3 Confirm only one control bar is visible in listen mode
- [x] 5.4 Confirm clicking the progress bar seeks the video
- [x] 5.5 Confirm empty state message shows correct copy when filtering by tag
