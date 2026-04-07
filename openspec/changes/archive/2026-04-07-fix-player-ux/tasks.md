## 1. Fix seekTo allowSeekAhead

- [x] 1.1 In `src/hooks/usePlayer.ts`, change `p.seekTo(ratio * dur, false)` to `p.seekTo(ratio * dur, true)`

## 2. Fix double video load on auto-advance

- [x] 2.1 In `src/components/PlayerArea.tsx`, update the prop→player sync `useEffect` to guard against re-firing when the player's internal `currentItem` already matches the incoming prop — compare by item ID using `getItemId()` (imported from `usePlayer.ts` or duplicated inline), not reference equality

## 3. Add progress bar to listen mode mini bar

- [x] 3.1 In `src/components/PlayerArea.tsx`, add a `<div>` progress bar above the controls row in the listen mode mini bar, using the existing `progress` value and `seek` callback — same structure as the watch mode bar
- [x] 3.2 Verify the progress bar only renders when `displayItem.type === "video"` (skip for playlist-channels)

## 4. Archive-aware empty state

- [x] 4.1 In `src/components/LibraryPanel.tsx`, lift the `view` state out of `LibraryPanel` — add a `view` prop (`"library" | "archive"`) and an `onViewChange` callback so the parent can control which tab is shown
- [x] 4.2 In `src/components/AppShell.tsx`, own the `libraryView` state (`"library" | "archive"`); pass it and a setter down to `LibraryPanel` via the new props
- [x] 4.3 In `src/components/AppShell.tsx`, add a `showArchive` state flag; when true, bypass the `isEmpty` check and render the panel layout (uncollapsed, `libraryView = "archive"`) so the archive is reachable even when `items` is empty
- [x] 4.4 In `src/components/AppShell.tsx`, pass `archivedItems.length > 0` and an `onViewArchive` callback to `EmptyState`; `onViewArchive` sets `showArchive = true`
- [x] 4.5 In `src/components/EmptyState.tsx`, add `hasArchived` and `onViewArchive` props; render an archive hint and clickable link when `hasArchived` is true
