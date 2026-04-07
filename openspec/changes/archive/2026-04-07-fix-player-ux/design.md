## Context

The player has two state owners for "what's playing": `AppShell.currentItem` (user-selected, passed as a prop) and `usePlayer`'s internal `currentItem` state. `PlayerArea` syncs between them via a `useEffect` that calls `play(item)` whenever the prop changes. This sync path is fine for user-initiated playback but creates a feedback loop on auto-advance — `advanceQueue` sets the internal state directly AND notifies the parent via `onAutoAdvance`, which sets the prop, which re-triggers the sync, which calls `play()` again.

The `seekTo` bug is a single argument (`false` → `true`). The listen bar and empty state changes are isolated UI additions with no architectural complexity.

## Goals / Non-Goals

**Goals:**
- Eliminate double `loadVideoById` calls during auto-advance
- Make seeking work past the buffered portion of a video
- Add a progress bar to the listen mode mini bar
- Show an archive hint in the empty state when archived items exist

**Non-Goals:**
- Refactoring the dual-state architecture wholesale (too invasive for this change)
- Adding keyboard shortcuts, volume controls, or other player features
- Changing localStorage shape

## Decisions

### Double load fix: break the feedback loop at the sync effect

**Chosen:** Guard the prop→player sync in `PlayerArea` so it does not re-fire when the item just auto-advanced to is already the player's current item.

```
useEffect(() => {
  if (currentItem && getItemId(currentItem) !== (playerCurrentItem ? getItemId(playerCurrentItem) : null)) {
    play(currentItem);
  }
}, [currentItem, play, playerCurrentItem]);
```

ID comparison (`getItemId` is already defined in `usePlayer.ts`) is used rather than reference equality — references can diverge if the `items` array is ever re-derived, which would silently break a reference guard.

**Why not:** Removing `AppShell.currentItem` prop entirely and letting the player manage all state would be the clean long-term solution, but it requires significant restructuring of how `LibraryPanel` highlights the active item and how the collapsed state is shared. Out of scope here.

**Why not:** Calling `setCurrentItem` only once (removing it from `advanceQueue` and relying on the prop path) would mean the player doesn't know what's next until the parent re-renders — introducing latency.

The guard is surgical and correct: the prop path is still used for user-initiated playback; the auto-advance path is blocked from double-firing.

### seekTo: allowSeekAhead = true

One-character fix. No architectural decision needed.

### Listen bar progress: reuse the `progress` value from usePlayer

`progress` (0–1) is already polled at 500ms intervals and passed back from `usePlayer`. The listen bar just needs to render a `<div>` with `width: \`${progress * 100}%\`` and a click handler for seeking, identical to the watch mode bar. No new state needed.

### Empty state: pass archivedItems count as a prop

`AppShell` already has access to `archivedItems` from `useLibrary`. Pass a boolean `hasArchived` to `EmptyState`. When true, render an additional line: "You have archived items. View archive →" with a callback to open the archive view.

**Why not route to archive inline:** `EmptyState` doesn't own library panel state. Passing a callback (`onViewArchive`) keeps it decoupled.

## Risks / Trade-offs

- **Guard uses ID comparison, not reference equality**: Reference equality would be fragile if `items` is ever re-derived (spreading, filtering, mapping) — objects would differ even for the same logical item. ID comparison (`getItemId`) is stable and matches how the rest of the codebase identifies items.

- **Listen bar seek click area**: The progress bar in the mini listen bar is 2px tall — a very small click target. Acceptable for now since the watch mode bar has the same design. Could be improved later with a taller hit area.
