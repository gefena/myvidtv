## Why

Three bugs discovered during code review affect channel items and loop-all mode: channel library entries are silently lost on import/export, channel-browse videos are hijacked by loop-all auto-advance, and listen/loop mode settings are not reflected in the player after a Replace import.

## What Changes

- `exportImport.ts` sanitizer adds handling for `type === "channel"` items so they survive round-trip export/import
- `usePlayer.ts` `handleEnded` and `skipNext` guard against `idx === -1` (out-of-queue items) in the `loop === "all"` wrap-around path so channel-browse videos don't trigger unexpected library auto-advance
- `PlayerArea.tsx` syncs `usePlayer`'s internal `mode` and `loopMode` state when `settings.listenMode` / `settings.loopMode` change after mount (e.g. post-import)

## Capabilities

### New Capabilities

*(none — all three are bug fixes in existing behavior)*

### Modified Capabilities

- `library-export-import`: Import must preserve `channel` type items; the sanitizer currently drops them silently
- `channel-playback-context`: Loop-all must not auto-advance away from a channel-browse video (not in queue)
- `playback-loop`: Loop mode state in the player must stay in sync with persisted settings across library replace-import

## Impact

- `src/lib/exportImport.ts` — `sanitizeItems` function
- `src/hooks/usePlayer.ts` — `handleEnded` and `skipNext` callbacks
- `src/components/PlayerArea.tsx` — settings-to-player-state sync
