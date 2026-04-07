## Why

Code review surfaced two real bugs in the YouTube player (double video load on auto-advance, broken seeking past the buffer) and two UX gaps (no progress bar in listen mode, misleading empty state when all items are archived). These are quality issues that affect everyday use.

## What Changes

- **Fix double video load on auto-advance** — remove the `AppShell.currentItem` → `PlayerArea` prop sync feedback loop that causes `loadVideoById` to be called twice when a video ends naturally
- **Fix seekTo allowSeekAhead** — change `seekTo(position, false)` to `seekTo(position, true)` so seeking past the buffered portion works correctly
- **Add progress bar to listen mode** — the mini listen bar shows title and controls but no playback progress; add a thin progress bar consistent with watch mode
- **Improve empty state when archive has items** — when `items` is empty but `archivedItems` is not, show a message pointing users to the archive rather than the generic welcome empty state

## Capabilities

### New Capabilities

- `listen-mode-progress`: Progress indicator in the listen mode mini bar

### Modified Capabilities

- `playback`: Auto-advance no longer double-loads the next video; seek works past the buffer
- `library-archive`: Empty state is archive-aware — shows an archive hint when archived items exist

## Impact

- `src/hooks/usePlayer.ts` — seekTo fix (1 line)
- `src/components/PlayerArea.tsx` — listen bar progress bar, auto-advance prop flow
- `src/components/AppShell.tsx` — remove or restructure `currentItem` prop that drives the feedback loop
- `src/components/EmptyState.tsx` — archive-aware messaging
- No new dependencies, no API changes, no localStorage shape changes
