## 1. Fix: Import silently drops channel items

- [x] 1.1 In `src/lib/exportImport.ts`, add a `"channel"` branch in `sanitizeItems` that validates `channelId` is a non-empty string and includes the item (analogous to the `"video"` and `"playlist-channel"` branches)
- [x] 1.2 Verify round-trip: add a channel to library, export, import (Replace) — channel should appear in the imported library

## 2. Fix: Loop-all hijacks channel-browse videos

- [x] 2.1 In `src/hooks/usePlayer.ts`, in `handleEnded` (video branch, loop-all path): add an `if (idx < 0) return` guard before `(idx + 1) % queueRef.current.length` so out-of-queue items do not wrap to index 0
- [x] 2.2 In `src/hooks/usePlayer.ts`, in `skipNext` (video branch, loop-all path): add the same `if (idx < 0)` guard so skip on a channel-browse video does nothing when loop-all is active
- [x] 2.3 Verify: play a channel-browse video with loop-all active, let it end — should show "← More from Channel" nudge, not jump to first library item
- [x] 2.4 Verify: play a channel-browse video with loop-all active, click skip — should do nothing

## 3. Fix: Player mode/loop not synced after Replace import

- [x] 3.1 In `src/components/PlayerArea.tsx`, add a `useEffect` that watches `settings.listenMode` and calls `toggleMode()` only when the player's current `mode` diverges from the setting (guard: `mode !== (settings.listenMode ? "listen" : "watch")`)
- [x] 3.2 In `src/hooks/usePlayer.ts`, add and return a `setLoopMode` function that sets `loopMode` state and calls `updateSettings({ loopMode: next })` in one call (analogous to `toggleLoop` but takes a target value directly)
- [x] 3.3 In `src/components/PlayerArea.tsx`, add a `useEffect` that watches `settings.loopMode` and calls `setLoopMode(settings.loopMode)` only when `loopMode` diverges from the setting
- [x] 3.4 Verify: set loop mode to "all", do a Replace import that has `loopMode: "off"` in settings — loop button should update without page refresh
- [x] 3.5 Verify: enable listen mode, do a Replace import that has `listenMode: false` — player should switch to watch mode without page refresh

## 4. Build check

- [x] 4.1 Run `npm run build` — no TypeScript errors or build failures
