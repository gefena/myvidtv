## Context

Three independent bugs found during code review, each in a different file but all relating to channels and loop mode. None require new dependencies or data model changes — all are targeted local fixes.

**Bug A — Import drops channel items** (`src/lib/exportImport.ts`)  
`sanitizeItems` handles `"video"` and `"playlist-channel"` but falls through to `return []` for `"channel"`. Any exported channel items are silently dropped on import.

**Bug B — Loop-all hijacks channel-browse videos** (`src/hooks/usePlayer.ts`)  
`handleEnded` and `skipNext` both compute `idx = findIndex(currentId)` in the queue. For channel-browse videos (transient, not in queue), `idx === -1`. In the `loop === "all"` branch, `(-1 + 1) % length = 0`, resolving to the first library item. The player auto-advances to it and clears channel context.

**Bug C — Player mode/loop not synced after Replace import** (`src/components/PlayerArea.tsx`, `src/hooks/usePlayer.ts`)  
`usePlayer` initializes `mode` and `loopMode` via `useState(initialValue)` from the settings passed at mount. If `settings.listenMode` or `settings.loopMode` changes after mount (e.g. after a Replace import), `usePlayer`'s internal state doesn't react.

## Goals / Non-Goals

**Goals:**
- Channel items survive export → import round-trip intact
- Loop-all does not auto-advance or clear context when a channel-browse video ends or is skipped
- After a Replace import, the player mode and loop state visually reflect the imported settings without requiring a page refresh

**Non-Goals:**
- Changing the player's behavior for items that ARE in the queue
- Altering the export format or localStorage shape
- Any UI changes beyond what's needed to surface correct state

## Decisions

**Bug A fix — Add `"channel"` case to `sanitizeItems`**  
The sanitizer validates the required ID field for each type. For `"channel"` the required field is `channelId`. Add a branch analogous to the `"video"` branch: if `channelId` is missing or not a string, drop the item; otherwise include it. Alternative considered: strip unknown types at the context level instead — rejected because the sanitizer is the correct boundary.

**Bug B fix — Guard `idx === -1` before loop-all wrap-around**  
Add `if (idx < 0) return` / `if (idx < 0) { /* do nothing */ }` before the `(idx + 1) % length` computation in both `handleEnded` (video branch) and `skipNext`. The `loop === "off"` path already has the correct guard (`idx >= 0 ? next : null`); the `loop === "all"` path just needs the same check.

**Bug C fix — Sync settings into `usePlayer` via `useEffect` + direct setters**  
`usePlayer` initializes `mode` and `loopMode` from props at mount. To sync post-mount changes, `PlayerArea` adds two `useEffect`s that watch `settings.listenMode` and `settings.loopMode` and call setters only when the internal state diverges.

For `mode` (binary): `toggleMode()` can be called directly — one call always corrects it (watch↔listen).

For `loopMode` (three-value cycle): `toggleLoop` advances by one step and cannot reach an arbitrary target in a single call without multiple side-effecting writes to localStorage. Instead, expose a `setLoopMode` function from `usePlayer` that sets the internal state and persists to settings in one call. The sync effect then calls `setLoopMode(settings.loopMode)` when the values diverge. Alternative considered: cycle via repeated `toggleLoop` calls — rejected because it causes 1–2 unnecessary `updateSettings` / localStorage writes per import and is fragile in effects.

## Risks / Trade-offs

- **Bug C sync loop** — Both `useEffect`s must guard on divergence to avoid firing on every render. The guards `mode !== (settings.listenMode ? "listen" : "watch")` and `loopMode !== settings.loopMode` handle this. `setLoopMode` also calls `updateSettings`, so it must not be called when values already match.
- **Import of older exports** — Exports created before channel browsing shipped don't have `"channel"` items, so the new branch is a no-op for them. No migration needed.
- **Loop-all guard** — Returning early for `idx === -1` means skip does nothing on channel-browse videos regardless of loop mode. This is the correct behavior (consistent with the `loop === "off"` path) and matches user expectation.
