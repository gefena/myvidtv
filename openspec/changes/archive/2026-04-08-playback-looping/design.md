## Context

The YouTube IFrame Player fires `onStateChange` with `ENDED` when a video completes. `usePlayer` currently handles this via `advanceQueue`, which always moves to the next item. There is no concept of looping — the queue always advances linearly and stops at the last item.

Loop mode needs to intercept the `ENDED` event and branch on the current mode:
- **off**: current behavior (advance or stop)
- **one**: reload current video from the start
- **all**: advance, wrapping from last item back to first

Loop state must be persisted in `localStorage` so it survives page reload.

## Goals / Non-Goals

**Goals:**
- Three loop modes: off, one (single repeat), all (queue wrap)
- Loop toggle button in PlayerArea controls
- Loop state persisted in settings
- Works in both watch and listen mode

**Non-Goals:**
- Per-item loop settings (global toggle only)
- Shuffle mode (separate concern)
- Loop for playlist-channel type (YouTube manages internal playlist looping; we only control queue-level wrap for our own library items)

## Decisions

### Loop state lives in `usePlayer`, sourced from `LibrarySettings`

**Decision**: `loopMode` is stored in `LibrarySettings` (localStorage) and initialized into `usePlayer`. The hook owns `loopMode` state internally and exposes a `toggleLoop` cycling function (`off → one → all → off`).

**Alternative considered**: Store in component state in `AppShell`. Rejected — loop mode needs to survive hot reloads and page reloads, so it must be in persistent settings from the start.

### `advanceQueue` becomes `handleEnded`

**Decision**: Rename/refactor `advanceQueue` to `handleEnded`. It reads `loopMode` from a ref (not closure) to avoid stale-closure bugs — same pattern already used for `queueRef` and `currentItemRef`.

**Why a ref**: `onStateChange` is registered once when the YT player initializes. Without a ref, the handler captures the initial `loopMode` value and never sees updates.

### Loop button cycles through modes: off → one → all

**Decision**: Single button that cycles through all three modes in order. Icon/label reflects current mode (`↺ 1`, `↺ ∞`, or dimmed `↺`).

**Alternative considered**: Two separate buttons (loop-one, loop-all). Rejected — the player controls are already tight on space; a single cycle button is simpler.

### `PlaylistChannel` items always use `advanceQueue` on ENDED

**Decision**: For `playlist-channel` type items, `handleEnded` always calls the existing advance logic regardless of loop mode. YouTube manages internal playlist repeat natively; our loop wrapping is only meaningful for the library queue.

## Risks / Trade-offs

- **Stale closure in onStateChange**: Mitigated by storing `loopMode` in a ref kept in sync with state via `useEffect`, matching the existing pattern for `queueRef` / `currentItemRef`.
- **`loop-one` and playlist channels**: If a user has loop-one on and a playlist-channel is playing, we don't loop the channel — it just advances. This is acceptable and documented in Non-Goals.
