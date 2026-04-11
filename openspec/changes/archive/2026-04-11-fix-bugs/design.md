## Context

A code review identified several confirmed bugs and code quality issues. This design covers the targeted fixes — each is isolated to one or two files and doesn't require architectural changes. The fixes are addressed in order of impact.

## Goals / Non-Goals

**Goals:**
- Fix all 4 confirmed behavioral bugs
- Remove code quality issues that could cause silent failures
- Leave all UI/UX and feature behavior unchanged

**Non-Goals:**
- No new features
- No refactoring beyond what's needed to fix the bugs
- No changes to the localStorage schema

## Decisions

### Bug 1: `youtu.be?list=` URL misclassified as playlist

**Problem**: `isPlaylistUrl` checks for `list` param without `v` param. `youtu.be/ID?list=PLx` has no `v` param (uses pathname instead), so it passes the playlist check. Then `parsePlaylistId` returns `null` (rejects non-`youtube.com` hostnames), and the user sees "Could not parse playlist ID from URL."

**Fix**: Add a hostname check to `isPlaylistUrl` — only treat `youtube.com` URLs as playlists. `youtu.be` links are always videos regardless of query params.

```ts
// Before
return u.searchParams.has("list") && !u.searchParams.has("v");

// After
const hostname = u.hostname.replace(/^www\./, "");
return hostname === "youtube.com" && u.searchParams.has("list") && !u.searchParams.has("v");
```

**Alternative considered**: Fix in `AddFlow` by trying video fetch when playlist parse fails. Rejected — it hides the underlying classification bug and adds a network round-trip on failure.

---

### Bug 2: Desktop "← Library" doesn't restore EmptyState

**Problem**: `AppShell` tracks `showArchive` to prevent showing EmptyState when the user navigated to the archive from an empty library. On mobile, the sheet header's "← Library" button resets `showArchive`. On desktop, `LibraryPanel.onViewChange` is just `setLibraryView` — `showArchive` is never reset.

**Fix**: Pass a wrapper to `LibraryPanel.onViewChange` on desktop that resets `showArchive` when switching back to library view:

```ts
onViewChange={(next) => {
  setLibraryView(next);
  if (next === "library") setShowArchive(false);
}}
```

This matches what the mobile sheet already does.

---

### Bug 3: `loop-all` doesn't wrap for playlist-channel items

**Problem**: In `handleEnded`, the early return for `current.type !== "video"` bypasses all loop logic. Playlist-channel items always advance linearly, stopping at the last item even in `loop-all` mode.

**Fix**: Apply `loop-all` wrapping inside the playlist-channel branch before returning:

```ts
if (current.type !== "video") {
  const currentId = getItemId(current);
  const idx = queueRef.current.findIndex((i) => getItemId(i) === currentId);
  let next: LibraryItem | null;
  if (loop === "all" && queueRef.current.length > 0) {
    next = queueRef.current[(idx + 1) % queueRef.current.length];
  } else {
    next = idx >= 0 ? (queueRef.current[idx + 1] ?? null) : null;
  }
  if (next) { setCurrentItem(next); onAutoAdvance?.(next); }
  return;
}
```

`loop-one` is intentionally excluded for playlist-channel items (it applies only to videos — the YouTube playlist player handles its own internal looping).

---

### Bug 4: Import merge double-writes localStorage

**Problem**: `update()` always calls `writeStorage(next)` inside its `setState` wrapper. The import merge updater also calls `writeStorage(next)` inside itself (to capture the success boolean). The result: two identical writes per merge import.

**Fix**: Move the `saved` check outside the updater. Use a `ref` to capture the write result from `update`'s own internal write, or restructure so the merge path calls `writeStorage` only once. Simplest approach: do the write *after* `setState` by reading the resulting state:

```ts
// Compute next state without writing inside updater
// Then do a single writeStorage outside
```

Actually the cleanest fix is to not call `writeStorage` inside the merge updater — let `update`'s wrapper handle it as it normally does for all other mutations. The `saved` capture can be done via a ref set inside `update`'s setState:

```ts
let saved = true;
const savedRef = { current: true };
// Override update to capture write result — simplest: compute next inline, write once
const next = computeMerged(library, data);
const ok = writeStorage(next);
setState((prev) => ({ ...prev, library: next }));
return ok;
```

This flattens the merge path to match the replace path structure.

---

### Code quality: Import item validation

**Problem**: `sanitizeItems` only cleans thumbnails. Items with missing/wrong `type`, `tags`, `ytId` etc. enter the library and cause runtime errors (e.g., `item.tags.includes` throws if `tags` is undefined).

**Fix**: Add type checks in `sanitizeItems`: skip items that aren't objects, have no valid `type` field, or are missing their required ID field. Invalid items are dropped, not replaced.

---

### Code quality: `useLayoutEffect` + `setTimeout(0)` → `useEffect`

`useLayoutEffect` fires synchronously before paint; wrapping it in `setTimeout(0)` negates that and makes it equivalent to `useEffect`. Replace with plain `useEffect`. This also avoids React's SSR warning about `useLayoutEffect` doing nothing on the server.

---

### Code quality: `setTimeout(() => setProgress(0), 0)` removal

In `usePlayer.ts`, progress is reset with a `setTimeout` delay when `currentItem` changes. In React 18, `setProgress(0)` can be called directly — state updates batch correctly. Remove the timeout.

---

### Code quality: Collapsed library tab icon

The expand tab (when library is collapsed) shows `◀` — same as the collapse button. Change it to `▶` to distinguish the two states visually.

## Risks / Trade-offs

- [URL parsing change] Any YouTube URL with `list` param on a non-`youtube.com` domain would previously have been tried as a playlist (and failed). Now it goes through the video path. Practically, YouTube only exists on `youtube.com` and `youtu.be`, so this is zero risk.
- [Import validation] Malformed items are now silently dropped rather than imported. This is safer but means a user with a hand-edited file might lose items without explanation. A count mismatch in the ImportConfirm summary would be the only indication.
- [Double-write removal] The merge import restructuring changes how `setState` and `writeStorage` interact. The replace path is unchanged. Test that merge correctly reads the previous state after restructuring.
